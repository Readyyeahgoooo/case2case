"""
HKLII Citation Parser and Normalizer

Handles various citation formats and creates canonical forms for genealogy tracking.
"""

import re
from dataclasses import dataclass
from typing import Optional, List, Tuple
from enum import Enum


class Court(Enum):
    CFA = "CFA"  # Court of Final Appeal
    CA = "CA"    # Court of Appeal
    CFI = "CFI"  # Court of First Instance
    DC = "DC"    # District Court
    MC = "MC"    # Magistrates Court
    PC = "PC"    # Privy Council
    EWCA_CIV = "EWCA Civ"  # England & Wales Court of Appeal (Civil)
    EWCA_CRIM = "EWCA Crim"
    UKSC = "UKSC"  # UK Supreme Court
    HL = "HL"      # House of Lords


@dataclass
class Citation:
    """Represents a parsed and normalized citation."""
    year: int
    court: Optional[Court]
    number: Optional[str]
    volume: Optional[int] = None
    reporter: Optional[str] = None
    page: Optional[int] = None
    raw: str = ""
    canonical: str = ""
    
    def __post_init__(self):
        if not self.canonical:
            self.canonical = self._generate_canonical()
    
    def _generate_canonical(self) -> str:
        """Generate canonical form for matching."""
        parts = [str(self.year)]
        if self.court:
            parts.append(self.court.value)
        if self.number:
            parts.append(self.number)
        return "-".join(parts)


class CitationParser:
    """Parse various HKLII citation formats."""
    
    # Patterns for different citation formats
    PATTERNS = {
        'neutral': re.compile(
            r'\[(\d{4})\]\s*(HKCA|HKCFI|HKDC|HKMC|CFA|UKSC|PC)\s*(\d+)',
            re.IGNORECASE
        ),
        'neutral_alt': re.compile(
            r'(\d{4})\s+(HKCA|HKCFI|HKDC|HKMC|CFA|UKSC|PC)\s+(\d+)',
            re.IGNORECASE
        ),
        'law_reports': re.compile(
            r'\[(\d{4})\]\s*(\d+)\s*HKLRD\s*(\d+)',
            re.IGNORECASE
        ),
        'law_reports_alt': re.compile(
            r'(\d{4})\s+HKLRD\s+(\d+)',
            re.IGNORECASE
        ),
        'english_neutral': re.compile(
            r'\[(\d{4})\]\s*(EWCA Civ|EWCA Crim|EWHC)\s*(\d+)',
            re.IGNORECASE
        ),
        'old_hk': re.compile(
            r'(\d{4})\s+HK(?:C|LR|CU|LRD)\s+(\d+)',
            re.IGNORECASE
        ),
        'weekly_law': re.compile(
            r'(\d+)\s+WLUK\s+(\d+)',
            re.IGNORECASE
        ),
        'unreported': re.compile(
            r'(HKCFI|HKCA|HKDC|HKMC|CFA)\s+(\d+)\s+of\s+(\d{4})',
            re.IGNORECASE
        ),
    }
    
    COURT_MAP = {
        'CFA': Court.CFA,
        'CA': Court.CA,
        'HKCA': Court.CA,
        'CFI': Court.CFI,
        'HKCFI': Court.CFI,
        'DC': Court.DC,
        'HKDC': Court.DC,
        'MC': Court.MC,
        'HKMC': Court.MC,
        'PC': Court.PC,
        'EWCA CIV': Court.EWCA_CIV,
        'EWCA Civ': Court.EWCA_CIV,
        'EWCA CRIM': Court.EWCA_CRIM,
        'UKSC': Court.UKSC,
        'HL': Court.HL,
    }
    
    def parse(self, text: str) -> Optional[Citation]:
        """Parse a citation from text."""
        text = text.strip()
        
        # Try neutral citation first
        match = self.PATTERNS['neutral'].search(text)
        if match:
            year, court_str, number = match.groups()
            return Citation(
                year=int(year),
                court=self.COURT_MAP.get(court_str.upper()),
                number=number,
                raw=text
            )
        
        # Try alternative neutral
        match = self.PATTERNS['neutral_alt'].search(text)
        if match:
            year, court_str, number = match.groups()
            return Citation(
                year=int(year),
                court=self.COURT_MAP.get(court_str.upper()),
                number=number,
                raw=text
            )
        
        # Try law reports
        match = self.PATTERNS['law_reports'].search(text)
        if match:
            year, volume, page = match.groups()
            return Citation(
                year=int(year),
                volume=int(volume),
                reporter="HKLRD",
                page=int(page),
                raw=text
            )
        
        # Try English citations
        match = self.PATTERNS['english_neutral'].search(text)
        if match:
            year, court_str, number = match.groups()
            return Citation(
                year=int(year),
                court=self.COURT_MAP.get(court_str.upper()),
                number=number,
                raw=text
            )
        
        # Try old HK format
        match = self.PATTERNS['old_hk'].search(text)
        if match:
            year, page = match.groups()
            return Citation(
                year=int(year),
                page=int(page),
                raw=text
            )
        
        # Try unreported
        match = self.PATTERNS['unreported'].search(text)
        if match:
            court_str, number, year = match.groups()
            return Citation(
                year=int(year),
                court=self.COURT_MAP.get(court_str.upper()),
                number=number,
                raw=text
            )
        
        return None
    
    def extract_citations(self, text: str) -> List[Citation]:
        """Extract all citations from a text block."""
        citations = []
        
        # Look for patterns like [YYYY] COURT N or Case Name [YYYY] COURT N
        patterns = [
            r'([A-Z][^\[]+)?\s*\[(\d{4})\]\s*(HKCA|HKCFI|HKDC|HKMC|CFA|UKSC|PC|EWCA Civ|EWCA Crim)\s*(\d+)',
            r'([A-Z][^v]+v[^\[]+)?\s*\[(\d{4})\]\s*(\d+)\s*HKLRD\s*(\d+)',
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                citation_text = match.group(0)
                parsed = self.parse(citation_text)
                if parsed and parsed not in citations:
                    citations.append(parsed)
        
        return citations
    
    def normalize_case_name(self, name: str) -> str:
        """Normalize a case name for matching."""
        # Remove common suffixes
        name = re.sub(r'\s*\(\s*(?:No\.?\s*\d+|unreported)\s*\)', '', name, flags=re.IGNORECASE)
        # Remove parties after the first v
        name = re.sub(r'\s+and\s+others?$', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s+\&\s+ors\.?$', '', name, flags=re.IGNORECASE)
        # Standardize abbreviations
        name = re.sub(r'\bLimited\b', 'Ltd', name, flags=re.IGNORECASE)
        name = re.sub(r'\bCompany\b', 'Co', name, flags=re.IGNORECASE)
        name = re.sub(r'\bIncorporated\b', 'Inc', name, flags=re.IGNORECASE)
        # Remove extra whitespace
        name = ' '.join(name.split())
        return name.strip().lower()


class CitationGenealogy:
    """Track citation relationships and build genealogy trees."""
    
    def __init__(self):
        self.citations: dict[str, Citation] = {}
        self.edges: List[Tuple[str, str, dict]] = []  # (from_id, to_id, metadata)
        self.case_lookup: dict[str, str] = {}  # canonical -> case_id
    
    def add_case(self, case_id: str, citation: Citation):
        """Add a case with its citation."""
        self.citations[case_id] = citation
        self.case_lookup[citation.canonical] = case_id
    
    def add_citation_edge(self, from_id: str, citation_text: str, context: str = ""):
        """Add a citation edge from one case to another."""
        parser = CitationParser()
        target_citation = parser.parse(citation_text)
        
        if target_citation and target_citation.canonical in self.case_lookup:
            target_id = self.case_lookup[target_citation.canonical]
            self.edges.append((from_id, target_id, {
                'context': context,
                'citation_raw': citation_text,
                'relationship': self._classify_relationship(context)
            }))
    
    def _classify_relationship(self, context: str) -> str:
        """Classify the citation relationship type."""
        context_lower = context.lower()
        
        if any(word in context_lower for word in ['applied', 'apply', 'applying']):
            return 'applied'
        elif any(word in context_lower for word in ['distinguished', 'distinguish']):
            return 'distinguished'
        elif any(word in context_lower for word in ['overruled', 'overrule']):
            return 'overruled'
        elif any(word in context_lower for word in ['followed', 'follow']):
            return 'followed'
        elif any(word in context_lower for word in ['considered', 'consider']):
            return 'considered'
        elif any(word in context_lower for word in ['referred', 'refer']):
            return 'referred'
        else:
            return 'cited'
    
    def get_upstream(self, case_id: str, depth: int = 3) -> List[List[str]]:
        """Get citation ancestors (what cases this case cites)."""
        upstream = []
        current_level = [case_id]
        
        for _ in range(depth):
            next_level = []
            for cid in current_level:
                parents = [e[1] for e in self.edges if e[0] == cid]
                next_level.extend(parents)
            if next_level:
                upstream.append(next_level)
                current_level = next_level
            else:
                break
        
        return upstream
    
    def get_downstream(self, case_id: str, depth: int = 3) -> List[List[str]]:
        """Get citation descendants (what cases cite this case)."""
        downstream = []
        current_level = [case_id]
        
        for _ in range(depth):
            next_level = []
            for cid in current_level:
                children = [e[0] for e in self.edges if e[1] == cid]
                next_level.extend(children)
            if next_level:
                downstream.append(next_level)
                current_level = next_level
            else:
                break
        
        return downstream
    
    def get_genealogy_path(self, from_id: str, to_id: str) -> Optional[List[str]]:
        """Find a path from one case to another in the citation graph."""
        # BFS to find shortest path
        from collections import deque
        
        queue = deque([(from_id, [from_id])])
        visited = {from_id}
        
        while queue:
            current, path = queue.popleft()
            
            if current == to_id:
                return path
            
            # Find all cases cited by current
            neighbors = [e[1] for e in self.edges if e[0] == current]
            for neighbor in neighbors:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))
        
        return None


if __name__ == "__main__":
    # Test the parser
    parser = CitationParser()
    
    test_citations = [
        "[2020] HKCA 123",
        "Ng Shou Chun v Hung Chun San [1994] 1 HKC 155",
        "[1996] 1 HKC 434",
        "Mass International Ltd v Hillis Industries Ltd [1996] 1 HKC 434",
        "(1978) 7 WLUK 52",
        "Luks Industrial Co Ltd v Ocean Palace International Holdings Ltd [2017] HKDC 60",
    ]
    
    print("Testing Citation Parser:")
    print("=" * 60)
    for cite in test_citations:
        result = parser.parse(cite)
        if result:
            print(f"✓ {cite}")
            print(f"  → Canonical: {result.canonical}")
            print(f"  → Year: {result.year}, Court: {result.court}, Number: {result.number}")
        else:
            print(f"✗ {cite} - Could not parse")
        print()
