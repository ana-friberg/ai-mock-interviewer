export interface Question {
  id: number;
  topic: string;
  prompt: string;
  sampleAnswer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improve: string[];
}

export interface Report {
  overall: number;
  label: string;
  duration: string;
  date: string;
  role: string;
  seniority: string;
  strengths: string[];
  improve: string[];
  topics: string[];
}

export interface Session {
  id: string;
  role: string;
  seniority: string;
  date: string;
  score: number;
  duration: string;
  questions: number;
  mode: string;
}

export interface TrendPoint {
  label: string;
  score: number;
}

export const INTERVIEW_QUESTIONS: Question[] = [
  {
    id: 1,
    topic: 'Data Modeling',
    prompt: 'Walk me through the difference between a Core Data Services (CDS) view and a classic ABAP Dictionary view. In a greenfield S/4HANA project, when would you reach for each?',
    sampleAnswer: "Classic DDIC views are defined in the dictionary and resolve to a database view at activation — they're limited to inner joins and offer no associations or annotations. CDS views are defined in DDL source, pushed down to HANA, and support outer joins, expressions, aggregations, associations, and UI/OData annotations. On a greenfield S/4 project I default to CDS for almost everything — especially anything feeding Fiori or analytics — and only keep DDIC views for legacy compatibility.",
    score: 8,
    feedback: "Strong, well-structured answer. You correctly identified code pushdown and annotations as the key differentiators, and your greenfield recommendation shows good architectural judgement. To push from good to excellent, mention the CDS view stack (basic → composite → consumption) and how associations enable path expressions — that depth signals senior-level fluency.",
    strengths: ['Clear distinction on code pushdown', 'Sound greenfield recommendation'],
    improve: ['Mention the CDS view layering model'],
  },
  {
    id: 2,
    topic: 'Performance',
    prompt: "A nightly report has started timing out. You trace it to a SELECT inside a LOOP over a large internal table. Walk me through how you'd diagnose and remediate it.",
    sampleAnswer: "First I'd confirm with ST05 (SQL trace) and SAT/runtime analysis to quantify the cost and the row counts involved. The classic anti-pattern here is SELECT inside LOOP — N round trips to the database. I'd refactor to either FOR ALL ENTRIES with a non-empty, deduplicated driver table, or better, a single set-based join or a CDS view that pushes the logic to HANA. I'd also check for missing indexes and ensure we're only selecting the fields we need.",
    score: 6,
    feedback: "You named the right tools and the core fix. The answer would be stronger with concrete guardrails: FOR ALL ENTRIES requires checking the driver table is not empty (or it reads everything) and that duplicates are handled. You also didn't mention package size or the risk of OOM when materialising large result sets — interviewers probe for those production scars.",
    strengths: ['Identified SELECT-in-LOOP anti-pattern', 'Knew the diagnostic tools (ST05, SAT)'],
    improve: ['Cover FOR ALL ENTRIES empty-table pitfall', 'Address memory / package size'],
  },
  {
    id: 3,
    topic: 'Exceptions',
    prompt: 'Contrast class-based exception handling with classic SY-SUBRC checks. How do you decide which to use, and how do you design a clean exception hierarchy?',
    sampleAnswer: "SY-SUBRC is procedural — you check a return code after each statement and it's easy to forget one, so failures pass silently. Class-based exceptions (CX_ROOT hierarchy) let you raise typed, catchable exceptions with attributes and message classes, and they propagate up the call stack until handled. I model a domain root exception inheriting from CX_STATIC_CHECK, then specific subclasses, and use RAISE EXCEPTION ... MESSAGE for user-facing text. New code should be class-based; SY-SUBRC remains for DB and legacy statements that still set it.",
    score: 9,
    feedback: "Excellent answer — this is senior-level. You captured the silent-failure risk of SY-SUBRC, the value of typed exceptions with attributes, and a sensible hierarchy rooted in CX_STATIC_CHECK. The distinction between static and dynamic check exceptions came through implicitly; calling it out explicitly (and when CX_NO_CHECK is appropriate) would make it airtight.",
    strengths: ['Excellent exception hierarchy design', 'Clear migration guidance for new vs legacy code'],
    improve: ['Name static vs dynamic check explicitly'],
  },
  {
    id: 4,
    topic: 'OO ABAP',
    prompt: 'Describe the object-oriented ALV model. How does CL_SALV_TABLE differ from the older REUSE_ALV_GRID_DISPLAY function modules, and what are the trade-offs?',
    sampleAnswer: "CL_SALV_TABLE is the OO grid: you call FACTORY, get a reference, then configure columns, sorts, aggregations and events through typed objects, and DISPLAY. It's cleaner and less boilerplate than REUSE_ALV_GRID_DISPLAY, which relies on a flat field catalog and lots of parameters. The trade-off is that SALV is read-only out of the box — for editable grids you still drop down to CL_GUI_ALV_GRID. So SALV for display, GUI_ALV_GRID for editing.",
    score: 7,
    feedback: "Accurate and practical. You nailed the read-only limitation of SALV and when to fall back to CL_GUI_ALV_GRID — that's the detail many candidates miss. Consider mentioning event handling (link_click, added functions) and that SALV cleanly separates model from the container, which matters for embedding in Fiori/Web Dynpro contexts.",
    strengths: ['Knew the SALV read-only limitation', 'Practical "which to use when" framing'],
    improve: ['Touch on SALV event handling'],
  },
  {
    id: 5,
    topic: 'Integration',
    prompt: 'You need to expose a custom business object to an external system. Walk me through your options — BAPI, OData via RAP, or a classic RFC — and how you choose.',
    sampleAnswer: "For a modern S/4 system I'd lead with RAP — define a behavior on a CDS-based business object and expose it as an OData service; it gives you draft handling, ETag concurrency, and a clean REST contract for Fiori or external consumers. A BAPI (RFC-enabled function module on a BOR object) is the classic synchronous integration path and still right for SAP-to-SAP or older middleware. A bare RFC I'd reserve for tightly-coupled internal calls. The deciding factors are the consumer, the protocol they speak, and whether I need transactional/draft semantics.",
    score: 8,
    feedback: "Very strong — leading with RAP shows current knowledge, and you correctly positioned BAPI/RFC for SAP-to-SAP and legacy middleware. Your decision criteria (consumer, protocol, transactional needs) are exactly right. To round it out, mention idempotency and error propagation over OData, which interviewers love to dig into for integration roles.",
    strengths: ['Led with modern RAP / OData approach', 'Clear, criteria-driven decision framework'],
    improve: ['Mention idempotency & OData error handling'],
  },
];

export const REPORT: Report = {
  overall: 76,
  label: 'Solid — interview ready with a few sharp edges',
  duration: '18m 24s',
  date: 'Jun 15, 2026',
  role: 'SAP ABAP Developer',
  seniority: 'Mid-level',
  strengths: [
    'Exception design and OO ABAP fundamentals are genuinely strong — your CX hierarchy answer was senior-level.',
    'You consistently lead with modern S/4HANA patterns (CDS, RAP) rather than legacy defaults.',
    'Answers are well-structured: claim, reasoning, then a clear recommendation.',
    'Good command of diagnostic tooling (ST05, SAT) when reasoning about performance.',
  ],
  improve: [
    'Performance answers need production guardrails — FOR ALL ENTRIES empty-table pitfall, package size, memory.',
    'Occasionally stop one level short of depth; name the CDS layering model and static-vs-dynamic exceptions explicitly.',
    'Tie integration choices to idempotency and error propagation for stronger architectural signal.',
  ],
  topics: ['CDS View Layering', 'OpenSQL Performance', 'FOR ALL ENTRIES', 'RAP & OData', 'AMDP / Code Pushdown', 'ABAP Unit Testing'],
};

export const HISTORY: Session[] = [
  { id: 'h1', role: 'SAP ABAP Developer', seniority: 'Mid-level', date: 'Jun 15, 2026', score: 76, duration: '18m', questions: 5, mode: 'Practice' },
  { id: 'h2', role: 'SAP ABAP Developer', seniority: 'Mid-level', date: 'Jun 11, 2026', score: 71, duration: '16m', questions: 5, mode: 'Practice' },
  { id: 'h3', role: 'SAP Fiori / UI5 Developer', seniority: 'Mid-level', date: 'Jun 6, 2026', score: 64, duration: '21m', questions: 7, mode: 'Real' },
  { id: 'h4', role: 'SAP ABAP Developer', seniority: 'Junior', date: 'May 30, 2026', score: 68, duration: '12m', questions: 4, mode: 'Practice' },
  { id: 'h5', role: 'ABAP on HANA Consultant', seniority: 'Senior', date: 'May 24, 2026', score: 58, duration: '24m', questions: 8, mode: 'Real' },
  { id: 'h6', role: 'SAP ABAP Developer', seniority: 'Junior', date: 'May 18, 2026', score: 52, duration: '14m', questions: 4, mode: 'Practice' },
];

export const TREND: TrendPoint[] = [
  { label: 'May 18', score: 52 },
  { label: 'May 24', score: 58 },
  { label: 'May 30', score: 68 },
  { label: 'Jun 6', score: 64 },
  { label: 'Jun 11', score: 71 },
  { label: 'Jun 15', score: 76 },
];

export const ROLE_SUGGESTIONS = [
  'SAP ABAP Developer',
  'ABAP on HANA Consultant',
  'SAP Fiori / UI5 Developer',
  'SAP S/4HANA Technical Consultant',
  'SAP Integration (CPI) Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Product Manager',
];
