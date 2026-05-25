import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import JSZip from "jszip";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Sparkles,
  Brain,
  Download,
  FileCode2,
  Trash2,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  Search,
  FileText,
  Mic,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast, Toaster } from "sonner";
import {
  analyze,
  analyzeBatch,
  toCsv,
  type AnalysisResult,
  type Industry,
} from "@/lib/sentiment-engine";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

export const Route = createFileRoute("/")({ component: Index });

const INDUSTRIES: Industry[] = [
  "General",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Recruitment",
  "Customer Service",
];

const STORAGE_KEY = "nexus.ai.history.v1";

function Index() {
  const [text, setText] = useState("");
  const [industry, setIndustry] = useState<Industry>("General");
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [latest, setLatest] = useState<AnalysisResult | null>(null);
  const [mode, setMode] = useState<"single" | "batch">("single");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 500)));
    } catch {}
  }, [history]);

  function runAnalysis() {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Enter some text to analyze.");
      return;
    }
    if (mode === "batch") {
      const lines = trimmed.split(/\n+/).map((l) => l.trim()).filter(Boolean);
      const results = analyzeBatch(lines, industry);
      setHistory((h) => [...results, ...h]);
      setLatest(results[0] ?? null);
      toast.success(`Analyzed ${results.length} entries.`);
    } else {
      const r = analyze(trimmed, industry);
      setHistory((h) => [r, ...h]);
      setLatest(r);
      toast.success("Analysis complete.");
    }
  }

  function clearHistory() {
    setHistory([]);
    setLatest(null);
    toast.success("History cleared.");
  }

  function downloadCsv() {
    if (history.length === 0) {
      toast.error("No data to export.");
      return;
    }
    const csv = toCsv(history);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-ai-analysis-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadSourceZip() {
    const zip = new JSZip();
    zip.file(
      "README.md",
      `# NEXUS.ai\n\nPrivacy-first AI sentiment + emotion + recommendation engine.\n\nGenerated bundle stub — clone the live repository for full source.\n`,
    );
    zip.file(
      "package.json",
      JSON.stringify({ name: "nexus-ai", version: "1.0.0", private: true }, null, 2),
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexus-ai-source.zip";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Source bundle downloaded.");
  }

  const stats = useMemo(() => {
    const total = history.length;
    const pos = history.filter((h) => h.sentiment === "positive").length;
    const neg = history.filter((h) => h.sentiment === "negative").length;
    const neu = history.filter((h) => h.sentiment === "neutral").length;
    const avgConf =
      total === 0 ? 0 : history.reduce((s, h) => s + h.confidence, 0) / total;
    const emotions: Record<string, number> = {};
    history.forEach((h) => (emotions[h.emotion] = (emotions[h.emotion] ?? 0) + 1));
    return { total, pos, neg, neu, avgConf, emotions };
  }, [history]);

  const doughnut = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        data: [stats.pos, stats.neg, stats.neu],
        backgroundColor: ["#22d3ee", "#f43f5e", "#a78bfa"],
        borderWidth: 0,
      },
    ],
  };

  const emotionBar = {
    labels: Object.keys(stats.emotions),
    datasets: [
      {
        label: "Mentions",
        data: Object.values(stats.emotions),
        backgroundColor: "#22d3ee",
        borderRadius: 6,
      },
    ],
  };

  const trend = {
    labels: history.slice(0, 30).reverse().map((_, i) => `#${i + 1}`),
    datasets: [
      {
        label: "Score",
        data: history.slice(0, 30).reverse().map((h) => h.score),
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34,211,238,0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    plugins: { legend: { labels: { color: "#cbd5e1" } } },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.1)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.1)" } },
    },
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Toaster theme="dark" position="top-right" />

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl sticky top-0 z-40 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Brain className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">NEXUS<span className="text-cyan-400">.ai</span></h1>
              <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Industry Solution</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={downloadCsv} className="border-white/10 bg-white/5 hover:bg-white/10">
              <Download className="w-4 h-4 mr-1" /> CSV
            </Button>
            <Button size="sm" onClick={downloadSourceZip} className="bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90">
              <FileCode2 className="w-4 h-4 mr-1" /> Source ZIP
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/15">
            <Sparkles className="w-3 h-3 mr-1" /> Week 4 AI Bootcamp Capstone
          </Badge>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent leading-tight">
            Turn customer voice<br />into business action.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-slate-400 text-base sm:text-lg">
            End-to-end NLP, emotion detection, and industry-tuned recommendations — running entirely in your browser. Zero data sent to servers.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-3xl mx-auto">
          {[
            { icon: Activity, label: "Analyses", value: stats.total },
            { icon: Zap, label: "Positive", value: stats.pos },
            { icon: Layers, label: "Emotions", value: Object.keys(stats.emotions).length },
            { icon: ShieldCheck, label: "Avg Conf.", value: `${Math.round(stats.avgConf * 100)}%` },
          ].map((s, i) => (
            <Card key={i} className="bg-white/5 border-white/10 p-4 backdrop-blur">
              <s.icon className="w-4 h-4 text-cyan-400 mb-1" />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Analyzer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "batch")} className="flex-1">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="single">Single</TabsTrigger>
                <TabsTrigger value="batch">Batch (one per line)</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={industry} onValueChange={(v) => setIndustry(v as Industry)}>
              <SelectTrigger className="sm:w-56 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === "single" ? "Paste customer feedback, a review, or any text…" : "One entry per line — analyze hundreds at once…"}
            className="min-h-[140px] bg-slate-950/50 border-white/10 text-slate-100 placeholder:text-slate-500 resize-y"
          />

          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={runAnalysis} className="bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 font-semibold">
              <Brain className="w-4 h-4 mr-1" /> Analyze
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => setText("")} className="border-white/10 bg-white/5">
              Clear input
            </Button>
            <Button variant="outline" onClick={clearHistory} className="border-white/10 bg-white/5 ml-auto">
              <Trash2 className="w-4 h-4 mr-1" /> Clear history
            </Button>
          </div>
        </Card>

        {/* Latest result */}
        <AnimatePresence>
          {latest && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <Card className="bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-transparent border-cyan-500/20 p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={
                    latest.sentiment === "positive" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" :
                    latest.sentiment === "negative" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                    "bg-violet-500/20 text-violet-300 border-violet-500/30"
                  }>
                    {latest.sentiment.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="border-white/10">{latest.emotion}</Badge>
                  <Badge variant="outline" className="border-white/10">{latest.industry}</Badge>
                  <Badge variant="outline" className="border-white/10">{Math.round(latest.confidence * 100)}% confidence</Badge>
                  <Badge variant="outline" className="border-white/10">score {latest.score}</Badge>
                </div>
                <p className="text-slate-300 italic">"{latest.text.slice(0, 240)}{latest.text.length > 240 ? "…" : ""}"</p>
                <div className="mt-4 p-4 rounded-lg bg-slate-950/60 border border-white/5">
                  <div className="text-xs uppercase tracking-wider text-cyan-400 mb-1">Recommendation</div>
                  <p className="text-slate-200">{latest.recommendation}</p>
                </div>
                {latest.keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {latest.keywords.map((k) => (
                      <span key={k} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">#{k}</span>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Dashboard */}
      {history.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <h3 className="text-2xl font-bold mb-4">Live Analytics</h3>
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10 p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Sentiment Distribution</h4>
              <div className="h-56"><Doughnut data={doughnut} options={{ plugins: { legend: { labels: { color: "#cbd5e1" } } } }} /></div>
            </Card>
            <Card className="bg-white/5 border-white/10 p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Emotion Breakdown</h4>
              <div className="h-56"><Bar data={emotionBar} options={chartOptions} /></div>
            </Card>
            <Card className="bg-white/5 border-white/10 p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Sentiment Trend</h4>
              <div className="h-56"><Line data={trend} options={chartOptions} /></div>
            </Card>
          </div>

          <h3 className="text-2xl font-bold mt-10 mb-4">History</h3>
          <div className="grid gap-3">
            {history.slice(0, 20).map((h) => (
              <Card key={h.id} className="bg-white/5 border-white/10 p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={
                    h.sentiment === "positive" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" :
                    h.sentiment === "negative" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                    "bg-violet-500/20 text-violet-300 border-violet-500/30"
                  }>{h.sentiment}</Badge>
                  <Badge variant="outline" className="border-white/10">{h.emotion}</Badge>
                  <Badge variant="outline" className="border-white/10">{h.industry}</Badge>
                  <span className="text-xs text-slate-500 ml-auto">{new Date(h.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2">{h.text}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        NEXUS.ai · Created by Molebatso Maesela · Week 4 AI Bootcamp Capstone
      </footer>
    </div>
  );
}
