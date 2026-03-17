export type NodeType = 'case' | 'topic' | 'tag';
export type LinkType = 'citation' | 'hierarchy' | 'thematic';

export interface CaseMetadata {
  citation?: string;
  court: string;
  date: string;
  judges?: string[];
  factsSummary?: string;
  keyPrinciples?: string[];
  ruling?: string;
  hkliiUrl?: string;
  tags?: string[];
  citedBy?: string[];
  genealogyLine?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  val: number;
  metadata?: CaseMetadata;
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

export interface GenealogyChain {
  id: string;
  name: string;
  description: string;
  caseIds: string[];
}

// ── Genealogy Chains ─────────────────────────────────
export const genealogyChains: GenealogyChain[] = [
  {
    id: 'gen-triable',
    name: 'Triable Issue Test',
    description: 'Evolution of the test for whether a defence raises a triable issue in summary judgment applications.',
    caseIds: ['HKCI-001', 'HKCI-002', 'HKCI-003', 'HKCI-004', 'HKCI-006', 'HKCI-017'],
  },
  {
    id: 'gen-deposit',
    name: 'Deposit Forfeiture',
    description: 'Development of principles governing deposit forfeiture clauses in land contracts.',
    caseIds: ['HKCI-007', 'HKCI-009', 'HKCI-013', 'HKCI-010', 'HKCI-011', 'HKCI-012', 'HKCI-014'],
  },
  {
    id: 'gen-cheque',
    name: 'Dishonoured Cheque',
    description: 'Legal principles around dishonoured cheques, parol evidence rule, and bills of exchange.',
    caseIds: ['HKCI-018', 'HKCI-020', 'HKCI-019', 'HKCI-017'],
  },
];

// 1. Define Topics (L1, L2, L3)
const topics: GraphNode[] = [
  { id: 'top-civil', name: 'Civil Procedure', type: 'topic', description: 'Rules and standards that courts follow when adjudicating civil lawsuits.', val: 30 },
  { id: 'top-summary', name: 'Summary Judgment (O.14)', type: 'topic', description: 'Procedure for obtaining judgment without trial when there is no arguable defence.', val: 25 },
  { id: 'top-contract', name: 'Contract Law', type: 'topic', description: 'Law governing agreements, obligations, and remedies.', val: 28 },
  { id: 'top-evidence', name: 'Evidence', type: 'topic', description: 'Rules governing the admissibility and evaluation of evidence in court proceedings.', val: 22 },

  // L3 Topics
  { id: 'l3-triable', name: 'Triable Issue', type: 'topic', description: 'Test and principles for determining if a defence raises a triable issue.', val: 20 },
  { id: 'l3-estoppel', name: 'Promissory Estoppel Defence', type: 'topic', description: 'Using promissory estoppel as a defence against summary judgment.', val: 15 },
  { id: 'l3-deposit', name: 'Deposit Forfeiture', type: 'topic', description: 'Construction of deposit forfeiture clauses and penalty rules.', val: 20 },
  { id: 'l3-time', name: 'Time of Essence', type: 'topic', description: 'Relief against forfeiture when time is of the essence.', val: 15 },
  { id: 'l3-o14a', name: 'Order 14A', type: 'topic', description: 'Disposal of case on point of law.', val: 15 },
  { id: 'l3-security', name: 'Security for Costs', type: 'topic', description: 'Principles governing security for costs on appeal.', val: 15 },
  { id: 'l3-cheque', name: 'Dishonoured Cheque', type: 'topic', description: 'Legal principles and parol evidence rule regarding dishonoured cheques.', val: 20 },
];

// 2. Define Cases (enriched metadata)
const cases: GraphNode[] = [
  {
    id: 'HKCI-001',
    name: 'The "Ladenbau" Case (1978)',
    type: 'case',
    val: 20,
    description: 'Origin Case (UK). Defendant entitled to unconditional leave to defend if there is a "fairly arguable" point. Court should not conduct "mini-trial".',
    metadata: {
      citation: '[1978] 1 All ER 1085',
      court: 'EWCA Civ',
      date: '1978',
      judges: ['Lord Denning MR', 'Lawton LJ', 'Cumming-Bruce LJ'],
      factsSummary: 'Claim for price of goods sold and delivered. Defendant argued that there was a collateral oral agreement.',
      keyPrinciples: [
        'Defendant entitled to unconditional leave to defend if a "fairly arguable" point exists.',
        'Court should not conduct a "mini-trial" on the affidavits.',
        'Credibility issues cannot be resolved at the summary judgment stage.',
      ],
      ruling: 'Leave to defend granted unconditionally.',
      tags: ['Triable Issue', 'Mini-trial Prohibition'],
      citedBy: ['HKCI-002', 'HKCI-003', 'HKCI-004'],
      genealogyLine: 'gen-triable',
    },
  },
  {
    id: 'HKCI-002',
    name: 'Ng Shou Chun v Hung Chun San [1994]',
    type: 'case',
    val: 22,
    description: 'Adopted Ladenbau test in HK: Court must consider whether assertions are "believable". Test is whether defence is "real" and "bona fide".',
    metadata: {
      citation: '[1994] 1 HKC 155',
      court: 'CA',
      date: '1994',
      judges: ['Litton VP', 'Bokhary JA', 'Liu JA'],
      factsSummary: 'Loan recovery action. Defendant claimed the monies were a gift, not a loan.',
      keyPrinciples: [
        'Adopted the Ladenbau test for Hong Kong summary judgment applications.',
        'Court must consider whether defence assertions are "believable".',
        'The test is whether the defence is "real" and "bona fide".',
      ],
      ruling: 'Unconditional leave to defend granted; defence was believable.',
      tags: ['Triable Issue', 'Mini-trial Prohibition', 'Believability Test'],
      citedBy: ['HKCI-003', 'HKCI-004', 'HKCI-006', 'HKCI-017'],
      genealogyLine: 'gen-triable',
    },
  },
  {
    id: 'HKCI-003',
    name: 'Mass International Ltd v Hillis Industries [1996]',
    type: 'case',
    val: 25,
    description: 'Restated and clarified test: Defendant must show "real or bona fide defence." Allegations must be "credible or believable".',
    metadata: {
      citation: '[1996] 2 HKC 427',
      court: 'CA',
      date: '1996',
      judges: ['Godfrey VP', 'Nazareth JA', 'Power JA'],
      factsSummary: 'Complex commercial dispute involving sale of industrial goods. Defendant raised multiple defences including set-off.',
      keyPrinciples: [
        'Restated and clarified the triable issue test.',
        'Defendant must show a "real or bona fide defence".',
        'Allegations must be "credible or believable" — not merely arguable.',
      ],
      ruling: 'Conditional leave to defend granted on part of the claim; summary judgment on balance.',
      tags: ['Triable Issue', 'Credibility Test'],
      citedBy: ['HKCI-004', 'HKCI-005', 'HKCI-006', 'HKCI-017'],
      genealogyLine: 'gen-triable',
    },
  },
  {
    id: 'HKCI-004',
    name: 'Poltoys Industrial v Fairing Industrial [1999]',
    type: 'case',
    val: 18,
    description: 'Applied Mass International. Arguable defence on any element warrants unconditional leave. Explanation must not be "so incredible".',
    metadata: {
      citation: '[1999] 2 HKC 365',
      court: 'CFI',
      date: '1999',
      judges: ['Burrell J'],
      factsSummary: 'Claim for unpaid invoices in a toy manufacturing contract. Defendant alleged quality defects.',
      keyPrinciples: [
        'Applied the Mass International test.',
        'Arguable defence on any element warrants unconditional leave.',
        'Explanation must not be "so incredible" as to be disbelieved.',
      ],
      ruling: 'Leave to defend granted unconditionally.',
      tags: ['Triable Issue', 'Arguable Defence'],
      citedBy: [],
      genealogyLine: 'gen-triable',
    },
  },
  {
    id: 'HKCI-005',
    name: 'Applied Research Council v Wireless Logic [2001]',
    type: 'case',
    val: 18,
    description: 'Reaffirmed Mass International. Promissory estoppel defence requires credible representation and detrimental reliance.',
    metadata: {
      citation: '[2001] 3 HKC 401',
      court: 'CFI',
      date: '2001',
      judges: ['Yuen J'],
      factsSummary: 'Debt claim with promissory estoppel raised as a defence. Defendant alleged creditor made oral promises to forgive debt.',
      keyPrinciples: [
        'Reaffirmed Mass International test.',
        'Promissory estoppel defence requires credible representation and detrimental reliance.',
        'Mere assertion without supporting evidence is insufficient.',
      ],
      ruling: 'Summary judgment granted; estoppel defence lacked credible evidence.',
      tags: ['Promissory Estoppel', 'Credibility'],
      citedBy: [],
      genealogyLine: 'gen-triable',
    },
  },
  {
    id: 'HKCI-006',
    name: 'Paul Y Management v Eternal Unity [2008]',
    type: 'case',
    val: 20,
    description: 'Reaffirmed test: Court shall not embark on mini-trial on affidavit evidence. Serious factual disputes = leave to defend.',
    metadata: {
      citation: '[2008] 5 HKLRD 1',
      court: 'CA',
      date: '2008',
      judges: ['Rogers VP', 'Le Pichon JA', 'Chung JA'],
      factsSummary: 'Construction contract dispute. Defendant claimed variations and extensions of time.',
      keyPrinciples: [
        'Reaffirmed no mini-trial rule.',
        'Court shall not embark on mini-trial on affidavit evidence.',
        'Serious factual disputes → leave to defend must be granted.',
      ],
      ruling: 'Master\'s order for summary judgment set aside; leave to defend granted.',
      tags: ['Triable Issue', 'Mini-trial Prohibition'],
      citedBy: ['HKCI-017'],
      genealogyLine: 'gen-triable',
    },
  },
  {
    id: 'HKCI-007',
    name: 'Workers Trust v Dojap Investments [1993]',
    type: 'case',
    val: 25,
    description: 'Privy Council landmark. Deposit (traditionally 10%) is an exception to penalty rule; larger deposits may be unenforceable.',
    metadata: {
      citation: '[1993] AC 573',
      court: 'PC',
      date: '1993',
      judges: ['Lord Browne-Wilkinson', 'Lord Jauncey', 'Lord Lowry'],
      factsSummary: 'Purchaser of land in Jamaica paid a 25% deposit. On failure to complete, vendor forfeited the deposit. Purchaser sought return.',
      keyPrinciples: [
        'Traditional 10% deposit is an exception to the penalty rule.',
        'Larger deposits (here 25%) may be struck down as penalties.',
        'Vendor must show that the larger deposit is "reasonable as earnest money".',
      ],
      ruling: 'Deposit of 25% held unreasonable; ordered to be returned to purchaser.',
      tags: ['Deposit Forfeiture', 'Penalty Rule', '10% Rule'],
      citedBy: ['HKCI-009', 'HKCI-012', 'HKCI-014'],
      genealogyLine: 'gen-deposit',
    },
  },
  {
    id: 'HKCI-008',
    name: 'Union Eagle v Golden Achievement [1995]',
    type: 'case',
    val: 25,
    description: 'Privy Council. Strict application of time of essence clauses. No relief against forfeiture for late completion in land contracts.',
    metadata: {
      citation: '[1997] AC 514',
      court: 'PC',
      date: '1995',
      judges: ['Lord Hoffmann'],
      factsSummary: 'Hong Kong property transaction. Purchaser was 10 minutes late in tendering completion money. Vendor rescinded.',
      keyPrinciples: [
        'Time of essence clauses are strictly enforced in land contracts.',
        'No equitable relief against forfeiture for late completion.',
        'Certainty in property transactions is paramount.',
      ],
      ruling: 'Vendor entitled to rescind; purchaser\'s claim for specific performance dismissed.',
      hkliiUrl: 'https://www.hklii.hk/en/cases/hkcfa/1997/3',
      tags: ['Time of Essence', 'Forfeiture', 'Certainty'],
      citedBy: ['HKCI-012', 'HKCI-014'],
      genealogyLine: 'gen-deposit',
    },
  },
  {
    id: 'HKCI-009',
    name: 'Cheer King Investment v Rich Glory [1995]',
    type: 'case',
    val: 20,
    description: 'Privy Council. Interpretation approach: Courts should give words ordinary meaning; substance over form.',
    metadata: {
      citation: '[1995] 2 HKC 481',
      court: 'PC',
      date: '1995',
      judges: ['Lord Nicholls'],
      factsSummary: 'Dispute over the construction of a deposit forfeiture clause in a provisional sale and purchase agreement.',
      keyPrinciples: [
        'Courts should give contractual words their ordinary and natural meaning.',
        'Substance over form in contractual interpretation.',
        'The label given by parties does not determine legal effect.',
      ],
      ruling: 'Clause construed according to ordinary meaning; forfeiture upheld.',
      tags: ['Deposit Forfeiture', 'Contractual Interpretation'],
      citedBy: ['HKCI-014'],
      genealogyLine: 'gen-deposit',
    },
  },
  {
    id: 'HKCI-010',
    name: 'Broad Money Development v Industrial Engineers [1999]',
    type: 'case',
    val: 18,
    description: 'Superfluous words ("as and for liquidated damages") can be ignored if clause operates as valid forfeiture provision.',
    metadata: {
      citation: '[1999] 3 HKC 96',
      court: 'CA',
      date: '1999',
      judges: ['Godfrey VP', 'Rogers JA'],
      factsSummary: 'Property purchase. Deposit clause contained the words "as and for liquidated damages". Purchaser argued this phrase had to be given effect.',
      keyPrinciples: [
        'Superfluous words can be ignored if clause operates as valid forfeiture provision.',
        '"As and for liquidated damages" treated as surplus verbiage.',
        'Standard deposit forfeiture clauses should be given commercial effect.',
      ],
      ruling: 'Words "as and for liquidated damages" treated as superfluous; forfeiture upheld.',
      tags: ['Deposit Forfeiture', 'Surplus Verbiage'],
      citedBy: ['HKCI-011', 'HKCI-014'],
      genealogyLine: 'gen-deposit',
    },
  },
  {
    id: 'HKCI-011',
    name: 'Teng Fuh Company v Keen Lloyd [1999]',
    type: 'case',
    val: 18,
    description: 'Followed Broad Money approach on deposit forfeiture clause construction.',
    metadata: {
      citation: '[1999] 4 HKC 273',
      court: 'CA',
      date: '1999',
      judges: ['Mayo VP', 'Rogers JA', 'Waung J'],
      factsSummary: 'Property transaction. Similar deposit forfeiture clause to Broad Money case.',
      keyPrinciples: [
        'Followed the Broad Money approach.',
        'Standard deposit clauses in property transactions operate as genuine pre-estimates of loss.',
      ],
      ruling: 'Deposit forfeiture upheld following Broad Money.',
      tags: ['Deposit Forfeiture'],
      citedBy: ['HKCI-014'],
      genealogyLine: 'gen-deposit',
    },
  },
  {
    id: 'HKCI-012',
    name: 'Polyset Ltd v Panhandat Ltd [2002]',
    type: 'case',
    val: 30,
    description: 'CFA Landmark. Standard deposit forfeiture clause permits vendor to forfeit deposit AND claim damages for actual loss.',
    metadata: {
      citation: '[2002] 2 HKLRD 355',
      court: 'CFA',
      date: '2002',
      judges: ['Li CJ', 'Bokhary PJ', 'Chan PJ', 'Ribeiro PJ', 'Lord Millett NPJ'],
      factsSummary: 'Property sale. After purchaser defaulted, vendor forfeited deposit and also claimed damages for difference in resale price. Issue: can vendor do both?',
      keyPrinciples: [
        'CFA landmark on deposit forfeiture.',
        'Standard deposit forfeiture clause permits vendor to forfeit deposit AND claim damages for actual loss.',
        'Deposit and damages serve different functions: earnest vs. compensation.',
        'Overruled earlier authorities that treated deposit forfeiture as exclusive remedy.',
      ],
      ruling: 'Vendor entitled to both forfeit deposit and claim damages; earlier contrary authority (Dawson) overruled.',
      hkliiUrl: 'https://www.hklii.hk/en/cases/hkcfa/2002/15',
      tags: ['Deposit Forfeiture', 'Damages', 'CFA Authority'],
      citedBy: ['HKCI-014'],
      genealogyLine: 'gen-deposit',
    },
  },
  {
    id: 'HKCI-013',
    name: 'Dawson Enterprises v Talistream [1994]',
    type: 'case',
    val: 15,
    description: 'Early HK authority identifying confusion in deposit clauses. Now considered superseded by Polyset.',
    metadata: {
      citation: '[1994] 1 HKC 550',
      court: 'CFI',
      date: '1994',
      judges: ['Kaplan J'],
      factsSummary: 'Deposit forfeiture dispute. Court held that forfeiture of deposit was the exclusive remedy.',
      keyPrinciples: [
        'Held that deposit forfeiture was exclusive remedy (vendor could not also claim damages).',
        'This position was subsequently overruled by the CFA in Polyset.',
      ],
      ruling: 'Vendor limited to deposit forfeiture only.',
      tags: ['Deposit Forfeiture', 'Superseded'],
      citedBy: ['HKCI-010', 'HKCI-012'],
      genealogyLine: 'gen-deposit',
    },
  },
  {
    id: 'HKCI-014',
    name: 'Good Form Co Ltd v Cheung Wai Han [2014]',
    type: 'case',
    val: 22,
    description: 'Important synthesis of authorities. Held that Polyset (CFA) is definitive; earlier authorities must be read in light of it.',
    metadata: {
      citation: '[2014] 4 HKLRD 311',
      court: 'DC',
      date: '2014',
      judges: ['Judge Ng'],
      factsSummary: 'Property transaction dispute involving deposit forfeiture and damages. Court reviewed all major authorities in the area.',
      keyPrinciples: [
        'Polyset (CFA) is the definitive authority on deposit forfeiture.',
        'Earlier authorities must be read in light of Polyset.',
        'Comprehensive synthesis of Workers Trust, Union Eagle, Cheer King, Broad Money, and Teng Fuh.',
      ],
      ruling: 'Applied Polyset; vendor entitled to both deposit forfeiture and damages.',
      tags: ['Deposit Forfeiture', 'Synthesis', 'Order 14A'],
      citedBy: [],
      genealogyLine: 'gen-deposit',
    },
  },
  {
    id: 'HKCI-015',
    name: 'Citibank, N.A. v KCL Chemical [2017]',
    type: 'case',
    val: 20,
    description: 'Security for costs principles on appeal. Impecuniosity and difficulty enforcing costs order are grounds.',
    metadata: {
      citation: '[2017] 2 HKLRD 852',
      court: 'CA',
      date: '2017',
      judges: ['Lam VP', 'Kwan JA', 'Poon JA'],
      factsSummary: 'Appellant sought to resist security for costs application. Court reviewed principles for ordering security for costs on appeal.',
      keyPrinciples: [
        'Impecuniosity alone is not a ground for refusing security.',
        'Difficulty enforcing costs order is a relevant factor.',
        'Court exercises discretion having regard to all circumstances.',
      ],
      ruling: 'Security for costs ordered.',
      tags: ['Security for Costs', 'Appeal'],
      citedBy: [],
    },
  },
  {
    id: 'HKCI-016',
    name: 'Chung Kau v HK Housing Authority [2004]',
    type: 'case',
    val: 25,
    description: 'Landmark CA case establishing principles for security for costs on appeal.',
    metadata: {
      citation: '[2004] 3 HKC 502',
      court: 'CA',
      date: '2004',
      judges: ['Ma CJHC', 'Le Pichon JA', 'Stone J'],
      factsSummary: 'Application for security for costs on appeal. Court set out comprehensive framework for exercising discretion.',
      keyPrinciples: [
        'Established comprehensive framework for security for costs on appeal.',
        'Merits of the appeal are a relevant consideration.',
        'Court should consider whether requiring security would stifle a meritorious appeal.',
      ],
      ruling: 'Framework for security for costs on appeal established.',
      tags: ['Security for Costs', 'Appeal Framework'],
      citedBy: ['HKCI-015'],
    },
  },
  {
    id: 'HKCI-017',
    name: 'Luks Industrial v Ocean Palace [2017]',
    type: 'case',
    val: 28,
    description: 'Comprehensive restatement of O.14 principles. Test is whether defence is "real and bona fide" not "frivolous".',
    metadata: {
      citation: '[2017] HKDC 123',
      court: 'DC',
      date: '2017',
      judges: ['Judge Lok'],
      factsSummary: 'Summary judgment application in a commercial dispute involving supply of materials. Comprehensive review of summary judgment law.',
      keyPrinciples: [
        'Comprehensive restatement of O.14 principles.',
        'Test is whether defence is "real and bona fide" not merely "frivolous".',
        'Reviewed and applied the entire Ladenbau → Ng Shou Chun → Mass International line.',
        'Court must not conduct mini-trial.',
      ],
      ruling: 'Summary judgment granted; defence was not real or bona fide.',
      hkliiUrl: 'https://www.hklii.hk/en/cases/hkdc/2017/123',
      tags: ['Triable Issue', 'O.14 Restatement', 'Mini-trial Prohibition'],
      citedBy: [],
      genealogyLine: 'gen-triable',
    },
  },
  {
    id: 'HKCI-018',
    name: 'Fielding & Platt v Selim Najjar [1969]',
    type: 'case',
    val: 20,
    description: 'Origin Case (UK). A cheque is treated as cash. Underpins special treatment of dishonoured cheque claims.',
    metadata: {
      citation: '[1969] 1 WLR 357',
      court: 'EWCA Civ',
      date: '1969',
      judges: ['Lord Denning MR', 'Winn LJ'],
      factsSummary: 'Plaintiff sued on a dishonoured cheque. Defendant sought to adduce evidence of underlying transaction.',
      keyPrinciples: [
        'A cheque is treated as cash in law.',
        'Special treatment for dishonoured cheque claims.',
        'Summary judgment appropriate where claim is on a bill of exchange.',
      ],
      ruling: 'Summary judgment for the plaintiff on the cheque.',
      tags: ['Dishonoured Cheque', 'Bills of Exchange'],
      citedBy: ['HKCI-019'],
      genealogyLine: 'gen-cheque',
    },
  },
  {
    id: 'HKCI-019',
    name: 'SY Chan Ltd v Choy Wai Bor [2001]',
    type: 'case',
    val: 22,
    description: 'Definitive HK authority on parol evidence in cheque cases: Extrinsic evidence not admissible to contradict written terms.',
    metadata: {
      citation: '[2001] 3 HKC 218',
      court: 'CA',
      date: '2001',
      judges: ['Rogers VP', 'Keith JA', 'Burrell J'],
      factsSummary: 'Claim on dishonoured cheques. Defendant sought to introduce oral evidence about the underlying purpose of the cheques.',
      keyPrinciples: [
        'Definitive HK authority on parol evidence in cheque cases.',
        'Extrinsic evidence not admissible to contradict written terms of a cheque.',
        'A cheque is a self-contained obligation.',
      ],
      ruling: 'Summary judgment for plaintiff; parol evidence inadmissible.',
      tags: ['Dishonoured Cheque', 'Parol Evidence', 'Written Terms'],
      citedBy: [],
      genealogyLine: 'gen-cheque',
    },
  },
  {
    id: 'HKCI-020',
    name: 'Great Sincere Trading v Swee Hong [1968]',
    type: 'case',
    val: 18,
    description: 'Seminal HK authority establishing parol evidence rule in cheque context.',
    metadata: {
      citation: '[1968] HKLR 427',
      court: 'HK',
      date: '1968',
      judges: ['Blair-Kerr J'],
      factsSummary: 'Claim on dishonoured cheque. Defendant argued surrounding oral agreements qualified the cheque obligation.',
      keyPrinciples: [
        'Established parol evidence rule in Hong Kong cheque context.',
        'Oral evidence cannot be used to vary or qualify a bill of exchange.',
      ],
      ruling: 'Judgment for the plaintiff; oral evidence rejected.',
      tags: ['Dishonoured Cheque', 'Parol Evidence'],
      citedBy: ['HKCI-019'],
      genealogyLine: 'gen-cheque',
    },
  },
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
  { source: 'l3-deposit', target: 'top-contract', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-time', target: 'top-contract', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-o14a', target: 'top-summary', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-security', target: 'top-civil', label: 'Sub-topic of', linkType: 'hierarchy' },
  { source: 'l3-cheque', target: 'top-evidence', label: 'Sub-topic of', linkType: 'hierarchy' },

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

// Helper functions
export function getCaseById(id: string): GraphNode | undefined {
  return cases.find(c => c.id === id);
}

export function getLinksForCase(caseId: string): GraphLink[] {
  return links.filter(l => l.source === caseId || l.target === caseId);
}

export function getCitingCases(caseId: string): { case: GraphNode; label: string }[] {
  return links
    .filter(l => l.target === caseId && l.linkType === 'citation')
    .map(l => ({ case: cases.find(c => c.id === l.source)!, label: l.label }))
    .filter(r => r.case);
}

export function getCitedCases(caseId: string): { case: GraphNode; label: string }[] {
  return links
    .filter(l => l.source === caseId && l.linkType === 'citation')
    .map(l => ({ case: cases.find(c => c.id === l.target)!, label: l.label }))
    .filter(r => r.case);
}

export function getGenealogyForCase(caseId: string): GenealogyChain | undefined {
  const caseNode = cases.find(c => c.id === caseId);
  if (!caseNode?.metadata?.genealogyLine) return undefined;
  return genealogyChains.find(g => g.id === caseNode.metadata!.genealogyLine);
}

export function getTopicHierarchy() {
  const l1Topics = topics.filter(t => ['top-civil', 'top-contract', 'top-evidence'].includes(t.id));
  return l1Topics.map(l1 => {
    const l2Children = links
      .filter(l => l.target === l1.id && l.linkType === 'hierarchy')
      .map(l => {
        const childTopic = topics.find(t => t.id === l.source);
        if (!childTopic) return null;
        const topicCases = links
          .filter(ll => ll.target === childTopic.id && ll.linkType === 'hierarchy' && ll.label === 'Belongs to')
          .map(ll => cases.find(c => c.id === ll.source))
          .filter(Boolean) as GraphNode[];
        return { topic: childTopic, cases: topicCases };
      })
      .filter(Boolean) as { topic: GraphNode; cases: GraphNode[] }[];
    return { topic: l1, children: l2Children };
  });
}

export const hkCaseLawsData: GraphData = {
  nodes: [...topics, ...cases, ...tags],
  links
};
