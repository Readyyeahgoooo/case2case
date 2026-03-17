export type NodeType = 'case' | 'topic' | 'tag';
export type LinkType = 'citation' | 'hierarchy' | 'thematic';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  val: number;
  metadata?: any;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
  linkType: LinkType;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// 1. Define Topics (L1, L2, L3)
const topics: GraphNode[] = [
  { id: 'top-civil', name: 'Civil Procedure', type: 'topic', description: 'Rules and standards that courts follow when adjudicating civil lawsuits.', val: 30 },
  { id: 'top-summary', name: 'Summary Judgment (O.14)', type: 'topic', description: 'Procedure for obtaining judgment without trial when there is no arguable defence.', val: 25 },
  
  // L3 Topics
  { id: 'l3-triable', name: 'Triable Issue', type: 'topic', description: 'Test and principles for determining if a defence raises a triable issue.', val: 20 },
  { id: 'l3-estoppel', name: 'Promissory Estoppel Defence', type: 'topic', description: 'Using promissory estoppel as a defence against summary judgment.', val: 15 },
  { id: 'l3-deposit', name: 'Deposit Forfeiture', type: 'topic', description: 'Construction of deposit forfeiture clauses and penalty rules.', val: 20 },
  { id: 'l3-time', name: 'Time of Essence', type: 'topic', description: 'Relief against forfeiture when time is of the essence.', val: 15 },
  { id: 'l3-o14a', name: 'Order 14A', type: 'topic', description: 'Disposal of case on point of law.', val: 15 },
  { id: 'l3-security', name: 'Security for Costs', type: 'topic', description: 'Principles governing security for costs on appeal.', val: 15 },
  { id: 'l3-cheque', name: 'Dishonoured Cheque', type: 'topic', description: 'Legal principles and parol evidence rule regarding dishonoured cheques.', val: 20 },
];

// 2. Define Cases
const cases: GraphNode[] = [
  { id: 'HKCI-001', name: 'The "Ladenbau" Case (1978)', type: 'case', val: 20, description: 'Origin Case (UK). Defendant entitled to unconditional leave to defend if there is a "fairly arguable" point. Court should not conduct "mini-trial".', metadata: { court: 'EWCA Civ', date: '1978' } },
  { id: 'HKCI-002', name: 'Ng Shou Chun v Hung Chun San [1994]', type: 'case', val: 22, description: 'Adopted Ladenbau test in HK: Court must consider whether assertions are "believable". Test is whether defence is "real" and "bona fide".', metadata: { court: 'CA', date: '1994' } },
  { id: 'HKCI-003', name: 'Mass International Ltd v Hillis Industries [1996]', type: 'case', val: 25, description: 'Restated and clarified test: Defendant must show "real or bona fide defence." Allegations must be "credible or believable".', metadata: { court: 'CA', date: '1996' } },
  { id: 'HKCI-004', name: 'Poltoys Industrial v Fairing Industrial [1999]', type: 'case', val: 18, description: 'Applied Mass International. Arguable defence on any element warrants unconditional leave. Explanation must not be "so incredible".', metadata: { court: 'CFI', date: '1999' } },
  { id: 'HKCI-005', name: 'Applied Research Council v Wireless Logic [2001]', type: 'case', val: 18, description: 'Reaffirmed Mass International. Promissory estoppel defence requires credible representation and detrimental reliance.', metadata: { court: 'CFI', date: '2001' } },
  { id: 'HKCI-006', name: 'Paul Y Management v Eternal Unity [2008]', type: 'case', val: 20, description: 'Reaffirmed test: Court shall not embark on mini-trial on affidavit evidence. Serious factual disputes = leave to defend.', metadata: { court: 'CA', date: '2008' } },
  { id: 'HKCI-007', name: 'Workers Trust v Dojap Investments [1993]', type: 'case', val: 25, description: 'Privy Council landmark. Deposit (traditionally 10%) is an exception to penalty rule; larger deposits may be unenforceable.', metadata: { court: 'PC', date: '1993' } },
  { id: 'HKCI-008', name: 'Union Eagle v Golden Achievement [1995]', type: 'case', val: 25, description: 'Privy Council. Strict application of time of essence clauses. No relief against forfeiture for late completion in land contracts.', metadata: { court: 'PC', date: '1995' } },
  { id: 'HKCI-009', name: 'Cheer King Investment v Rich Glory [1995]', type: 'case', val: 20, description: 'Privy Council. Interpretation approach: Courts should give words ordinary meaning; substance over form.', metadata: { court: 'PC', date: '1995' } },
  { id: 'HKCI-010', name: 'Broad Money Development v Industrial Engineers [1999]', type: 'case', val: 18, description: 'Superfluous words ("as and for liquidated damages") can be ignored if clause operates as valid forfeiture provision.', metadata: { court: 'CA', date: '1999' } },
  { id: 'HKCI-011', name: 'Teng Fuh Company v Keen Lloyd [1999]', type: 'case', val: 18, description: 'Followed Broad Money approach on deposit forfeiture clause construction.', metadata: { court: 'CA', date: '1999' } },
  { id: 'HKCI-012', name: 'Polyset Ltd v Panhandat Ltd [2002]', type: 'case', val: 30, description: 'CFA Landmark. Standard deposit forfeiture clause permits vendor to forfeit deposit AND claim damages for actual loss.', metadata: { court: 'CFA', date: '2002' } },
  { id: 'HKCI-013', name: 'Dawson Enterprises v Talistream [1994]', type: 'case', val: 15, description: 'Early HK authority identifying confusion in deposit clauses. Now considered superseded by Polyset.', metadata: { court: 'CFI', date: '1994' } },
  { id: 'HKCI-014', name: 'Good Form Co Ltd v Cheung Wai Han [2014]', type: 'case', val: 22, description: 'Important synthesis of authorities. Held that Polyset (CFA) is definitive; earlier authorities must be read in light of it.', metadata: { court: 'DC', date: '2014' } },
  { id: 'HKCI-015', name: 'Citibank, N.A. v KCL Chemical [2017]', type: 'case', val: 20, description: 'Security for costs principles on appeal. Impecuniosity and difficulty enforcing costs order are grounds.', metadata: { court: 'CA', date: '2017' } },
  { id: 'HKCI-016', name: 'Chung Kau v HK Housing Authority [2004]', type: 'case', val: 25, description: 'Landmark CA case establishing principles for security for costs on appeal.', metadata: { court: 'CA', date: '2004' } },
  { id: 'HKCI-017', name: 'Luks Industrial v Ocean Palace [2017]', type: 'case', val: 28, description: 'Comprehensive restatement of O.14 principles. Test is whether defence is "real and bona fide" not "frivolous".', metadata: { court: 'DC', date: '2017' } },
  { id: 'HKCI-018', name: 'Fielding & Platt v Selim Najjar [1969]', type: 'case', val: 20, description: 'Origin Case (UK). A cheque is treated as cash. Underpins special treatment of dishonoured cheque claims.', metadata: { court: 'EWCA Civ', date: '1969' } },
  { id: 'HKCI-019', name: 'SY Chan Ltd v Choy Wai Bor [2001]', type: 'case', val: 22, description: 'Definitive HK authority on parol evidence in cheque cases: Extrinsic evidence not admissible to contradict written terms.', metadata: { court: 'CA', date: '2001' } },
  { id: 'HKCI-020', name: 'Great Sincere Trading v Swee Hong [1968]', type: 'case', val: 18, description: 'Seminal HK authority establishing parol evidence rule in cheque context.', metadata: { court: 'HK', date: '1968' } },
];

// 3. Define Tags (Thematic Nodes)
const tags: GraphNode[] = [
  { id: 'tag-triable', name: 'Triable Issue', type: 'tag', description: 'Cases discussing what constitutes a triable issue.', val: 10 },
  { id: 'tag-minitrial', name: 'Mini-trial Prohibition', type: 'tag', description: 'Rule against conducting a mini-trial on affidavits.', val: 10 },
  { id: 'tag-deposit', name: 'Deposit Forfeiture', type: 'tag', description: 'Cases involving the forfeiture of deposits.', val: 10 },
  { id: 'tag-cheque', name: 'Dishonoured Cheque', type: 'tag', description: 'Cases involving dishonoured cheques and bills of exchange.', val: 10 },
  { id: 'tag-parol', name: 'Parol Evidence', type: 'tag', description: 'Rule against extrinsic evidence contradicting written terms.', val: 10 },
];

// 4. Define Links
const links: GraphLink[] = [
  // Hierarchy Links (Topic -> Topic)
  { source: 'top-summary', target: 'top-civil', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-triable', target: 'top-summary', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-estoppel', target: 'top-summary', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-deposit', target: 'top-summary', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-time', target: 'top-summary', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-o14a', target: 'top-summary', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-security', target: 'top-summary', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-cheque', target: 'top-summary', label: 'Sub-topic of', linkType: 'hierarchy' },

  // Hierarchy Links (Case -> L3 Topic)
  { source: 'HKCI-001', target: 'l3-triable', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-002', target: 'l3-triable', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-003', target: 'l3-triable', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-004', target: 'l3-triable', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-005', target: 'l3-estoppel', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-006', target: 'l3-triable', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-007', target: 'l3-deposit', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-008', target: 'l3-time', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-009', target: 'l3-deposit', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-010', target: 'l3-deposit', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-011', target: 'l3-deposit', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-012', target: 'l3-deposit', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-013', target: 'l3-deposit', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-014', target: 'l3-o14a', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-015', target: 'l3-security', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-016', target: 'l3-security', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-017', target: 'l3-cheque', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-018', target: 'l3-cheque', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-019', target: 'l3-cheque', label: 'Belongs to', linkType: 'hierarchy' },
  { source: 'HKCI-020', target: 'l3-cheque', label: 'Belongs to', linkType: 'hierarchy' },

  // Citation Links (Solid Lines - Genealogy)
  { source: 'HKCI-002', target: 'HKCI-001', label: 'Adopts', linkType: 'citation' },
  { source: 'HKCI-003', target: 'HKCI-002', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-003', target: 'HKCI-001', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-004', target: 'HKCI-003', label: 'Applies', linkType: 'citation' },
  { source: 'HKCI-004', target: 'HKCI-002', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-005', target: 'HKCI-003', label: 'Reaffirms', linkType: 'citation' },
  { source: 'HKCI-006', target: 'HKCI-002', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-006', target: 'HKCI-003', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-009', target: 'HKCI-007', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-010', target: 'HKCI-013', label: 'Distinguishes', linkType: 'citation' },
  { source: 'HKCI-011', target: 'HKCI-010', label: 'Follows', linkType: 'citation' },
  { source: 'HKCI-012', target: 'HKCI-007', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-012', target: 'HKCI-008', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-012', target: 'HKCI-013', label: 'Overrules', linkType: 'citation' },
  { source: 'HKCI-014', target: 'HKCI-012', label: 'Synthesizes', linkType: 'citation' },
  { source: 'HKCI-014', target: 'HKCI-007', label: 'Synthesizes', linkType: 'citation' },
  { source: 'HKCI-014', target: 'HKCI-008', label: 'Synthesizes', linkType: 'citation' },
  { source: 'HKCI-014', target: 'HKCI-009', label: 'Synthesizes', linkType: 'citation' },
  { source: 'HKCI-014', target: 'HKCI-010', label: 'Synthesizes', linkType: 'citation' },
  { source: 'HKCI-014', target: 'HKCI-011', label: 'Synthesizes', linkType: 'citation' },
  { source: 'HKCI-015', target: 'HKCI-016', label: 'Applies', linkType: 'citation' },
  { source: 'HKCI-017', target: 'HKCI-002', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-017', target: 'HKCI-006', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-019', target: 'HKCI-018', label: 'Cites', linkType: 'citation' },
  { source: 'HKCI-019', target: 'HKCI-020', label: 'Cites', linkType: 'citation' },

  // Thematic Links (Blurred Lines - Tags)
  { source: 'HKCI-001', target: 'tag-triable', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-002', target: 'tag-triable', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-003', target: 'tag-triable', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-004', target: 'tag-triable', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-006', target: 'tag-triable', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-017', target: 'tag-triable', label: 'Tagged', linkType: 'thematic' },
  
  { source: 'HKCI-001', target: 'tag-minitrial', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-006', target: 'tag-minitrial', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-017', target: 'tag-minitrial', label: 'Tagged', linkType: 'thematic' },

  { source: 'HKCI-007', target: 'tag-deposit', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-009', target: 'tag-deposit', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-010', target: 'tag-deposit', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-011', target: 'tag-deposit', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-012', target: 'tag-deposit', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-013', target: 'tag-deposit', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-014', target: 'tag-deposit', label: 'Tagged', linkType: 'thematic' },

  { source: 'HKCI-017', target: 'tag-cheque', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-018', target: 'tag-cheque', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-019', target: 'tag-cheque', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-020', target: 'tag-cheque', label: 'Tagged', linkType: 'thematic' },

  { source: 'HKCI-019', target: 'tag-parol', label: 'Tagged', linkType: 'thematic' },
  { source: 'HKCI-020', target: 'tag-parol', label: 'Tagged', linkType: 'thematic' },
];

export const hkCaseLawsData: GraphData = {
  nodes: [...topics, ...cases, ...tags],
  links
};
