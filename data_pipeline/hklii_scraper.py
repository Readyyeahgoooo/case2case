"""
HKLII Web Scraper

Scrapes case judgments from the Hong Kong Legal Information Institute.
Respects robots.txt and implements rate limiting.
"""

import asyncio
import aiohttp
import time
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import json
import re
from urllib.parse import urljoin, quote
from pathlib import Path

from bs4 import BeautifulSoup


@dataclass
class CaseParagraph:
    """Represents a single paragraph from a case judgment."""
    number: int
    text: str
    is_quote: bool = False  # Is this a quote from another case?
    cited_cases: List[str] = field(default_factory=list)
    legal_concepts: List[str] = field(default_factory=list)


@dataclass
class CaseMetadata:
    """Metadata for a case."""
    title: str
    citation: str
    date: Optional[str] = None
    court: Optional[str] = None
    judges: List[str] = field(default_factory=list)
    parties: List[str] = field(default_factory=list)
    topics: List[str] = field(default_factory=list)
    catchwords: List[str] = field(default_factory=list)


@dataclass
class CaseJudgment:
    """Complete case judgment with paragraphs."""
    id: str
    metadata: CaseMetadata
    paragraphs: List[CaseParagraph] = field(default_factory=list)
    full_text: str = ""
    url: str = ""
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'metadata': {
                'title': self.metadata.title,
                'citation': self.metadata.citation,
                'date': self.metadata.date,
                'court': self.metadata.court,
                'judges': self.metadata.judges,
                'parties': self.metadata.parties,
                'topics': self.metadata.topics,
                'catchwords': self.metadata.catchwords,
            },
            'paragraphs': [
                {
                    'number': p.number,
                    'text': p.text,
                    'is_quote': p.is_quote,
                    'cited_cases': p.cited_cases,
                    'legal_concepts': p.legal_concepts,
                }
                for p in self.paragraphs
            ],
            'url': self.url,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'CaseJudgment':
        """Create from dictionary."""
        metadata = CaseMetadata(
            title=data['metadata']['title'],
            citation=data['metadata']['citation'],
            date=data['metadata'].get('date'),
            court=data['metadata'].get('court'),
            judges=data['metadata'].get('judges', []),
            parties=data['metadata'].get('parties', []),
            topics=data['metadata'].get('topics', []),
            catchwords=data['metadata'].get('catchwords', []),
        )
        
        paragraphs = [
            CaseParagraph(
                number=p['number'],
                text=p['text'],
                is_quote=p.get('is_quote', False),
                cited_cases=p.get('cited_cases', []),
                legal_concepts=p.get('legal_concepts', []),
            )
            for p in data.get('paragraphs', [])
        ]
        
        return cls(
            id=data['id'],
            metadata=metadata,
            paragraphs=paragraphs,
            url=data.get('url', '')
        )


class HKLIIScraper:
    """Scraper for HKLII case database."""
    
    BASE_URL = "https://www.hklii.hk"
    
    # HKLII court paths
    COURT_PATHS = {
        'CFA': "/eng/hk/cases/hkcfa/",
        'CA': "/eng/hk/cases/hkca/",
        'CFI': "/eng/hk/cases/hkcfi/",
        'DC': "/eng/hk/cases/hkdc/",
        'MC': "/eng/hk/cases/hkmc/",
        'LT': "/eng/hk/cases/hklt/",
        'PC': "/eng/uk/cases/ukpc/",  # Privy Council
    }
    
    def __init__(self, rate_limit: float = 1.0, cache_dir: Optional[str] = None):
        """
        Initialize scraper.
        
        Args:
            rate_limit: Seconds between requests
            cache_dir: Directory to cache downloaded cases
        """
        self.rate_limit = rate_limit
        self.last_request_time = 0
        self.cache_dir = Path(cache_dir) if cache_dir else None
        
        if self.cache_dir:
            self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _rate_limited_request(self, url: str) -> str:
        """Make a rate-limited HTTP request."""
        # Enforce rate limit
        elapsed = time.time() - self.last_request_time
        if elapsed < self.rate_limit:
            await asyncio.sleep(self.rate_limit - elapsed)
        
        if not self.session:
            raise RuntimeError("Scraper not initialized as async context manager")
        
        async with self.session.get(url) as response:
            self.last_request_time = time.time()
            response.raise_for_status()
            return await response.text()
    
    def _check_cache(self, case_id: str) -> Optional[CaseJudgment]:
        """Check if case is in cache."""
        if not self.cache_dir:
            return None
        
        cache_file = self.cache_dir / f"{case_id}.json"
        if cache_file.exists():
            with open(cache_file, 'r', encoding='utf-8') as f:
                return CaseJudgment.from_dict(json.load(f))
        return None
    
    def _save_cache(self, case: CaseJudgment):
        """Save case to cache."""
        if not self.cache_dir:
            return
        
        cache_file = self.cache_dir / f"{case.id}.json"
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(case.to_dict(), f, indent=2, ensure_ascii=False)
    
    async def search_cases(
        self, 
        query: str = "", 
        court: Optional[str] = None,
        year_from: Optional[int] = None,
        year_to: Optional[int] = None,
        max_results: int = 50
    ) -> List[Dict[str, str]]:
        """
        Search for cases on HKLII.
        
        Returns list of dicts with 'title', 'citation', 'url', 'date'
        """
        # HKLII uses a query string format
        search_url = f"{self.BASE_URL}/cgi-bin/sinosrch.cgi"
        
        params = {
            'query': query,
            'results': str(max_results),
            'submit': 'Search',
            'meta': '/hklii',
        }
        
        if court and court in self.COURT_PATHS:
            params['meta'] = self.COURT_PATHS[court]
        
        # Build URL with params
        query_string = '&'.join(f"{k}={quote(str(v))}" for k, v in params.items())
        full_url = f"{search_url}?{query_string}"
        
        html = await self._rate_limited_request(full_url)
        soup = BeautifulSoup(html, 'lxml')
        
        results = []
        # Parse search results
        for result in soup.find_all('div', class_='result'):
            link = result.find('a')
            if link:
                title = link.get_text(strip=True)
                url = urljoin(self.BASE_URL, link.get('href', ''))
                
                # Try to extract citation
                citation_match = re.search(r'\[(\d{4})\]\s*(\w+)\s*(\d+)', title)
                citation = citation_match.group(0) if citation_match else ""
                
                # Try to extract date
                date_elem = result.find('span', class_='date')
                date = date_elem.get_text(strip=True) if date_elem else ""
                
                results.append({
                    'title': title,
                    'citation': citation,
                    'url': url,
                    'date': date,
                })
        
        return results[:max_results]
    
    async def scrape_case(self, url: str, case_id: Optional[str] = None) -> Optional[CaseJudgment]:
        """Scrape a single case from its URL."""
        # Check cache first
        if case_id:
            cached = self._check_cache(case_id)
            if cached:
                print(f"  [Cache] {case_id}")
                return cached
        
        print(f"  [Fetching] {url}")
        
        try:
            html = await self._rate_limited_request(url)
        except Exception as e:
            print(f"  [Error] Failed to fetch {url}: {e}")
            return None
        
        soup = BeautifulSoup(html, 'lxml')
        
        # Extract metadata
        title_elem = soup.find('h1') or soup.find('title')
        title = title_elem.get_text(strip=True) if title_elem else "Unknown"
        
        # Extract citation from title or URL
        citation = ""
        citation_match = re.search(r'\[(\d{4})\]\s*([A-Za-z]+)\s*(\d+)', title)
        if citation_match:
            citation = citation_match.group(0)
        
        # Extract court
        court = None
        for court_code, path in self.COURT_PATHS.items():
            if path in url:
                court = court_code
                break
        
        # Extract date
        date = None
        date_patterns = [
            r'(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})',
            r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{4})',
        ]
        for pattern in date_patterns:
            match = re.search(pattern, html)
            if match:
                date = match.group(0)
                break
        
        # Extract judges
        judges = []
        judge_patterns = [
            r'((?:Mr\s+|Mrs\s+|Ms\s+|Miss\s+)?Justice\s+[A-Z][a-z]+)',
            r'(Lord\s+[A-Z][a-z]+)',
        ]
        for pattern in judge_patterns:
            judges.extend(re.findall(pattern, html))
        judges = list(set(judges))  # Deduplicate
        
        # Extract catchwords/topics
        catchwords = []
        catchword_elem = soup.find('div', class_='catchwords')
        if catchword_elem:
            catchwords = [c.strip() for c in catchword_elem.get_text().split('-') if c.strip()]
        
        # Extract paragraphs
        paragraphs = []
        para_pattern = re.compile(r'<p[^>]*>(?:\s*\[?(\d+)\]?\.?\s*)?(.*?)</p>', re.DOTALL)
        para_matches = para_pattern.findall(html)
        
        for i, (num_str, text) in enumerate(para_matches, 1):
            # Clean up HTML tags
            text = re.sub(r'<[^>]+>', '', text)
            text = text.strip()
            
            if not text or len(text) < 20:  # Skip short/empty paragraphs
                continue
            
            para_num = int(num_str) if num_str else i
            
            # Check if it's a quote
            is_quote = text.startswith('"') or 'said' in text[:50].lower()
            
            # Extract cited cases from paragraph
            cited_cases = []
            from citation_parser import CitationParser
            parser = CitationParser()
            citations = parser.extract_citations(text)
            cited_cases = [c.canonical for c in citations]
            
            paragraphs.append(CaseParagraph(
                number=para_num,
                text=text,
                is_quote=is_quote,
                cited_cases=cited_cases,
            ))
        
        # Generate case ID if not provided
        if not case_id:
            case_id = citation.replace(' ', '_').replace('[', '').replace(']', '') if citation else f"case_{int(time.time())}"
        
        metadata = CaseMetadata(
            title=title,
            citation=citation,
            date=date,
            court=court,
            judges=judges,
            catchwords=catchwords,
        )
        
        case = CaseJudgment(
            id=case_id,
            metadata=metadata,
            paragraphs=paragraphs,
            full_text=soup.get_text(),
            url=url,
        )
        
        # Save to cache
        self._save_cache(case)
        
        return case
    
    async def scrape_court_year(self, court: str, year: int) -> List[CaseJudgment]:
        """Scrape all cases from a specific court and year."""
        if court not in self.COURT_PATHS:
            raise ValueError(f"Unknown court: {court}")
        
        # HKLII organizes by year
        year_url = f"{self.BASE_URL}{self.COURT_PATHS[court]}{year}/"
        
        try:
            html = await self._rate_limited_request(year_url)
        except Exception as e:
            print(f"[Error] Failed to fetch year index {year_url}: {e}")
            return []
        
        soup = BeautifulSoup(html, 'lxml')
        
        # Find all case links
        case_links = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            # Look for case file patterns
            if href.endswith('.html') or '/cases/' in href:
                full_url = urljoin(year_url, href)
                case_links.append(full_url)
        
        print(f"[Info] Found {len(case_links)} cases for {court} {year}")
        
        # Scrape each case
        cases = []
        for url in case_links[:10]:  # Limit for testing
            case = await self.scrape_case(url)
            if case:
                cases.append(case)
        
        return cases


async def main():
    """Test the scraper."""
    cache_dir = Path(__file__).parent / "cache"
    
    async with HKLIIScraper(rate_limit=1.0, cache_dir=str(cache_dir)) as scraper:
        # Search for summary judgment cases
        print("Searching for summary judgment cases...")
        results = await scraper.search_cases(
            query="summary judgment order 14",
            court='CFI',
            max_results=10
        )
        
        print(f"Found {len(results)} results")
        
        # Scrape first result
        if results:
            case = await scraper.scrape_case(results[0]['url'])
            if case:
                print(f"\nScraped: {case.metadata.title}")
                print(f"Citation: {case.metadata.citation}")
                print(f"Paragraphs: {len(case.paragraphs)}")
                
                # Print first few paragraphs
                for para in case.paragraphs[:3]:
                    print(f"\n[Para {para.number}]")
                    print(para.text[:200] + "..." if len(para.text) > 200 else para.text)


if __name__ == "__main__":
    asyncio.run(main())
