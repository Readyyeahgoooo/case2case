import { hkCaseLawsData, genealogyChains } from "../data/hkCaseLaws";

const OPENROUTER_API_KEY = (typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY) || '';

export interface RAGResponse {
  answer: string;
  relevantNodeIds: string[];
}

export async function queryGraphRAG(question: string): Promise<RAGResponse> {
  if (!OPENROUTER_API_KEY) {
    return {
      answer: "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your .env.local file to enable AI chat.",
      relevantNodeIds: [],
    };
  }

  // Build a rich context with structured case data
  const casesContext = hkCaseLawsData.nodes
    .filter(n => n.type === 'case')
    .map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      citation: c.metadata?.citation,
      court: c.metadata?.court,
      date: c.metadata?.date,
      judges: c.metadata?.judges,
      factsSummary: c.metadata?.factsSummary,
      keyPrinciples: c.metadata?.keyPrinciples,
      ruling: c.metadata?.ruling,
      tags: c.metadata?.tags,
      genealogyLine: c.metadata?.genealogyLine,
    }));

  const citationLinks = hkCaseLawsData.links
    .filter(l => l.linkType === 'citation')
    .map(l => `${l.source} --[${l.label}]--> ${l.target}`);

  const genealogyContext = genealogyChains.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    caseChain: g.caseIds.join(' → '),
  }));

  const systemPrompt = `You are a Hong Kong Legal AI Assistant specializing in case law analysis. You have access to a GraphRAG knowledge base of Hong Kong cases.

## Cases Database
${JSON.stringify(casesContext, null, 2)}

## Citation Network (Source --[Relationship]--> Target)
${citationLinks.join('\n')}

## Genealogy Chains (chronological development of law)
${JSON.stringify(genealogyContext, null, 2)}

## Instructions
1. Answer the user's question based ONLY on the data above.
2. When citing cases, always use their case IDs (e.g., HKCI-001) so they can be highlighted on the graph.
3. Explain the genealogy/citation trail when relevant — show how the law developed step by step.
4. For each claim, reference the specific case and its key principle.
5. Be precise, authoritative, and structured in your response.
6. If the question involves a genealogy chain, trace the evolution from the origin case to the latest case.
7. IMPORTANT: You must respond with valid JSON in this exact format:
{
  "answer": "your detailed answer here with case IDs like HKCI-001",
  "relevantNodeIds": ["HKCI-001", "HKCI-002"]
}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'HK Case Law Galaxy',
      },
      body: JSON.stringify({
        model: 'openrouter/hunter-alpha',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("No response from OpenRouter");

    const parsed = JSON.parse(text) as RAGResponse;
    return {
      answer: parsed.answer || "No answer provided.",
      relevantNodeIds: parsed.relevantNodeIds || [],
    };
  } catch (error) {
    console.error("Error querying OpenRouter:", error);
    return {
      answer: "Sorry, I encountered an error while processing your request. Please check the console for details.",
      relevantNodeIds: [],
    };
  }
}
