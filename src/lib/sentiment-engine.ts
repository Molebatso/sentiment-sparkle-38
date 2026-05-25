// @ts-ignore - no types
import Sentiment from "sentiment";

const sentiment = new Sentiment();

export type SentimentLabel = "positive" | "negative" | "neutral";
export type Emotion = "Joy" | "Trust" | "Anger" | "Sadness" | "Fear" | "Surprise" | "Frustration";
export type Industry =
  | "Healthcare"
  | "Finance"
  | "Education"
  | "E-commerce"
  | "Recruitment"
  | "Customer Service"
  | "General";

export interface AnalysisResult {
  id: string;
  text: string;
  sentiment: SentimentLabel;
  score: number; // normalized -1..1
  confidence: number; // 0..1
  emotion: Emotion;
  keywords: string[];
  industry: Industry;
  recommendation: string;
  timestamp: number;
}

const EMOTION_LEXICON: Record<Emotion, string[]> = {
  Joy: ["happy", "love", "great", "awesome", "delight", "wonderful", "amazing", "excellent", "fantastic", "pleased", "enjoy", "perfect", "best", "brilliant", "glad"],
  Trust: ["reliable", "trust", "honest", "secure", "safe", "confident", "dependable", "credible", "loyal", "consistent", "professional"],
  Anger: ["angry", "furious", "hate", "rage", "mad", "outraged", "annoyed", "irritated", "hostile", "resent"],
  Sadness: ["sad", "unhappy", "depressed", "miserable", "disappointed", "sorrow", "grief", "regret", "heartbroken", "down"],
  Fear: ["afraid", "scared", "worried", "anxious", "nervous", "fear", "panic", "concerned", "uneasy", "terrified"],
  Surprise: ["surprised", "shocked", "astonished", "amazed", "unexpected", "stunned", "wow", "unbelievable"],
  Frustration: ["frustrated", "stuck", "broken", "slow", "useless", "confusing", "difficult", "annoying", "fail", "buggy", "crash", "lag", "glitch", "complicated"],
};

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall", "can", "need", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his", "its", "our", "their", "this", "that", "these", "those", "of", "in", "on", "at", "to", "for", "with", "by", "from", "as", "into", "about", "so", "if", "than", "then", "very", "just", "not", "no", "yes", "too", "also", "out", "up", "down", "over", "under", "more", "most", "some", "any", "all",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function detectEmotion(tokens: string[]): Emotion {
  const counts: Record<Emotion, number> = {
    Joy: 0, Trust: 0, Anger: 0, Sadness: 0, Fear: 0, Surprise: 0, Frustration: 0,
  };
  const setTokens = new Set(tokens);
  (Object.keys(EMOTION_LEXICON) as Emotion[]).forEach((emo) => {
    for (const w of EMOTION_LEXICON[emo]) if (setTokens.has(w)) counts[emo]++;
  });
  let best: Emotion = "Trust";
  let max = 0;
  (Object.keys(counts) as Emotion[]).forEach((e) => {
    if (counts[e] > max) { max = counts[e]; best = e; }
  });
  return max === 0 ? "Trust" : best;
}

function extractKeywords(tokens: string[], limit = 5): string[] {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    if (t.length < 3 || STOPWORDS.has(t)) continue;
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([w]) => w);
}

const RECS: Record<Industry, Record<SentimentLabel, string>> = {
  Healthcare: {
    positive: "Reinforce care quality messaging in patient communications and share testimonials.",
    negative: "Audit patient touchpoints; prioritize wait-time reduction and empathetic staff training.",
    neutral: "Survey patients for unmet needs and tighten follow-up protocols.",
  },
  Finance: {
    positive: "Spotlight reliability and security in marketing; expand premium tiers.",
    negative: "Prioritize performance fixes and clearer UX to recover satisfaction.",
    neutral: "Run targeted education campaigns about fees and product benefits.",
  },
  Education: {
    positive: "Use feedback as case studies; expand the highest-rated curriculum modules.",
    negative: "Review content pacing and instructor support; add live Q&A sessions.",
    neutral: "Introduce interactive elements and personalized learning paths.",
  },
  "E-commerce": {
    positive: "Encourage user-generated reviews and launch a loyalty program.",
    negative: "Investigate shipping, returns, and product-quality friction immediately.",
    neutral: "Refine product descriptions and add comparison tools.",
  },
  Recruitment: {
    positive: "Promote the candidate experience publicly to strengthen employer brand.",
    negative: "Streamline application steps and improve recruiter response times.",
    neutral: "Personalize outreach and provide clearer role expectations.",
  },
  "Customer Service": {
    positive: "Recognize top-performing agents and document successful playbooks.",
    negative: "Reduce response times, expand self-service docs, and retrain on tone.",
    neutral: "Deploy proactive check-ins and CSAT follow-up surveys.",
  },
  General: {
    positive: "Amplify positive themes across marketing and product roadmaps.",
    negative: "Triage top complaints and assign ownership within 48 hours.",
    neutral: "Probe for deeper feedback via targeted follow-up questions.",
  },
};

export function analyze(text: string, industry: Industry = "General"): AnalysisResult {
  const result = sentiment.analyze(text);
  const tokens = tokenize(text);
  // Normalize comparative to -1..1
  const normalized = Math.max(-1, Math.min(1, result.comparative));
  let label: SentimentLabel = "neutral";
  if (normalized > 0.05) label = "positive";
  else if (normalized < -0.05) label = "negative";

  const emotion = detectEmotion(tokens);
  const keywords = extractKeywords(tokens);
  const confidence = Math.min(1, Math.abs(normalized) * 2 + 0.4);

  const baseRec = RECS[industry][label];
  const recommendation = `${baseRec} (Dominant tone: ${emotion}${keywords.length ? `; key themes: ${keywords.slice(0, 3).join(", ")}` : ""}.)`;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    sentiment: label,
    score: Number(normalized.toFixed(3)),
    confidence: Number(confidence.toFixed(2)),
    emotion,
    keywords,
    industry,
    recommendation,
    timestamp: Date.now(),
  };
}

export function analyzeBatch(texts: string[], industry: Industry = "General"): AnalysisResult[] {
  return texts.map((t) => analyze(t, industry));
}

export function toCsv(results: AnalysisResult[]): string {
  const header = ["timestamp", "industry", "sentiment", "score", "confidence", "emotion", "keywords", "text"];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = results.map((r) =>
    [
      new Date(r.timestamp).toISOString(),
      r.industry,
      r.sentiment,
      r.score.toString(),
      r.confidence.toString(),
      r.emotion,
      r.keywords.join("|"),
      r.text.replace(/\s+/g, " "),
    ].map(esc).join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
