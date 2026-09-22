"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Sparkles, 
  History, 
  LogOut, 
  RotateCcw, 
  ArrowRight, 
  Check, 
  UploadCloud, 
  X, 
  Presentation,
  Loader2,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- TYPES ---
type HistoryItem = {
  id: string;
  title: string;
  instruction: string;
  created_at: string;
  generated_json: any;
  thesis_text: string;
};

// --- COMPOSANT : STUDIO LOADER (Minimaliste & Élégant) ---
const StudioLoader = ({ fileName }: { fileName: string }) => {
  const steps = [
    "Lecture et vectorisation du document...",
    "Extraction de la problématique et des axes clés...",
    "Structuration narrative des diapositives...",
    "Mise en page et génération du fichier PowerPoint...",
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md px-6"
    >
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-2xl shadow-zinc-900/10 text-center">
        {/* Animated Icon Ring */}
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-100" />
          <div className="absolute inset-0 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
          <Presentation className="w-6 h-6 text-zinc-900" />
        </div>

        <h3 className="text-lg font-semibold text-zinc-900 tracking-tight mb-1">
          Création de votre présentation
        </h3>
        <p className="text-xs text-zinc-400 mb-6 truncate max-w-xs mx-auto">
          {fileName || "Document en cours de traitement"}
        </p>

        {/* Steps List */}
        <div className="space-y-3 text-left">
          {steps.map((text, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={idx} className="flex items-center gap-3 text-xs transition-colors">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 transition-all ${
                    isDone
                      ? "bg-zinc-900 text-white"
                      : isCurrent
                      ? "border border-zinc-900 text-zinc-900 animate-pulse"
                      : "border border-zinc-200 text-zinc-300"
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </div>
                <span
                  className={
                    isCurrent
                      ? "text-zinc-900 font-medium"
                      : isDone
                      ? "text-zinc-400 line-through"
                      : "text-zinc-300"
                  }
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-zinc-400 text-[11px]">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Veuillez patienter quelques instants...</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
export default function Home() {
  // Auth & View
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [view, setView] = useState<"generator" | "history">("generator");

  // Generator States
  const [thesisText, setThesisText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [instruction, setInstruction] = useState(
    "Analyse ce mémoire pour créer une présentation de soutenance claire, impactante et structurée en 10 à 12 slides."
  );
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initialisation Auth Supabase
  useEffect(() => {
    const cleanUrl = () => {
      if (window.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        fetchHistory(user.id);
        cleanUrl();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        fetchHistory(session.user.id);
        cleanUrl();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setHistory([]);
        setView("generator");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const logout = async () => await supabase.auth.signOut();

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from("presentations")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setThesisText(item.thesis_text);
    setInstruction(item.instruction);
    setFileName(item.title);
    setView("generator");
  };

  // 2. Traitement PDF
  const processPdfFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Veuillez sélectionner un fichier PDF valide.");
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " Mo");
    setIsParsingPdf(true);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str || "").join(" ") + "\n";
      }

      setThesisText(fullText);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la lecture du fichier PDF.");
      resetFile();
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPdfFile(e.dataTransfer.files[0]);
    }
  };

  const resetFile = () => {
    setThesisText("");
    setFileName("");
    setFileSize("");
    setPageCount(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 3. Génération Présentation
  const generatePresentation = async () => {
    if (!thesisText) return;
    setLoading(true);

    try {
      const aiRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesisText, instruction }),
      });
      if (!aiRes.ok) throw new Error("Erreur durant l'analyse IA");
      const aiData = await aiRes.json();

      if (user) {
        await supabase.from("presentations").insert({
          user_id: user.id,
          title: fileName || "Présentation Sans Titre",
          instruction: instruction,
          thesis_text: thesisText,
          generated_json: aiData,
        });
        fetchHistory(user.id);
      }

      const pptRes = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiData),
      });

      if (!pptRes.ok) throw new Error(await pptRes.text());

      const blob = await pptRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName ? fileName.replace(".pdf", "") : "Presentation"}_GhostPPTX.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Une erreur est survenue lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col justify-between selection:bg-zinc-900 selection:text-white">
      {/* --- NAVBAR --- */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-zinc-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => setView("generator")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-semibold text-sm shadow-sm group-hover:bg-black transition-colors">
              G
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-900">
                GhostPPTX
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                Studio 2.0
              </span>
            </div>
          </div>

          {/* Navigation & Profil */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="bg-zinc-100 p-1 rounded-xl flex items-center border border-zinc-200/60 text-xs">
                  <button
                    onClick={() => setView("generator")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      view === "generator"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    Atelier
                  </button>
                  <button
                    onClick={() => setView("history")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      view === "history"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Historique</span>
                    {history.length > 0 && (
                      <span className="bg-zinc-200 text-zinc-700 text-[10px] px-1.5 py-0.2 rounded-full">
                        {history.length}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={logout}
                  title="Déconnexion"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-medium shadow-sm transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Connexion</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- LOADER MODAL --- */}
      <AnimatePresence>{loading && <StudioLoader fileName={fileName} />}</AnimatePresence>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {view === "generator" ? (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Titre & Sous-titre épurés */}
              <div className="text-center max-w-xl mx-auto space-y-3">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">
                  Transformez vos mémoires en diapositives soignées.
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Déposez votre document académique ou technique au format PDF. L'intelligence artificielle en extrait la substantifique moelle pour concevoir votre soutenance.
                </p>
              </div>

              {/* CARTE STUDIO PRINCIPALE */}
              <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all">
                {/* ÉTAPE 1 : DROPZONE PDF */}
                {!thesisText ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-12 md:p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed rounded-2xl m-4 ${
                      dragActive
                        ? "border-zinc-900 bg-zinc-50/50"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/40"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) processPdfFile(f);
                      }}
                    />

                    {isParsingPdf ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-zinc-900 animate-spin" />
                        <span className="text-sm font-medium text-zinc-700">
                          Extraction du contenu du PDF en cours...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 mb-4 group-hover:scale-105 transition-transform">
                          <UploadCloud className="w-6 h-6 stroke-[1.8]" />
                        </div>
                        <h2 className="text-sm font-semibold text-zinc-900 mb-1">
                          Cliquez pour téléverser ou glissez votre fichier ici
                        </h2>
                        <p className="text-xs text-zinc-400">
                          Format accepté : document PDF (Mémoire, Rapport, Thèse)
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  /* ÉTAPE 2 : CONFIGURATION DU PROMPT & FICHIER PRÊT */
                  <div className="p-6 md:p-8 space-y-6">
                    {/* Badge Fichier Inclus */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0 shadow-xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            {fileName}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {fileSize} • {pageCount ? `${pageCount} pages` : "Document chargé"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={resetFile}
                        title="Retirer ce fichier"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Zone de Prompt personnalisable */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Directives de génération</span>
                        </label>
                        <span className="text-[11px] text-zinc-400">
                          Personnalisez les attentes
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="Ex: Structure la présentation en 10 slides avec une attention particulière portée sur la méthodologie et les recommandations stratégiques..."
                        className="w-full text-xs text-zinc-800 bg-zinc-50/50 border border-zinc-200 rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all resize-none leading-relaxed"
                      />
                    </div>

                    {/* Bouton d'action principal */}
                    <div className="pt-2 flex items-center justify-end">
                      <button
                        onClick={generatePresentation}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                      >
                        <span>Générer le PowerPoint (.pptx)</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* VUE HISTORIQUE */
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">
                    Vos présentations récentes
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Retrouvez vos documents précédemment traités et rechargez-les en un clic.
                  </p>
                </div>
                <button
                  onClick={() => setView("generator")}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                >
                  <span>Retour à l'atelier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {history.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white border border-zinc-200/80 rounded-2xl p-5 hover:border-zinc-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-sm font-semibold text-zinc-900 truncate">
                            {item.title}
                          </h3>
                          <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                            {new Date(item.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                          {item.instruction}
                        </p>
                      </div>

                      <button
                        onClick={() => loadFromHistory(item)}
                        className="w-full py-2 px-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 text-zinc-700 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Réutiliser ce document</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white border border-zinc-200/60 rounded-2xl">
                  <p className="text-xs text-zinc-400">
                    Aucune présentation enregistrée dans votre historique.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- FOOTER MINIMALISTE --- */}
      <footer className="border-t border-zinc-200/60 bg-white/50 py-6 text-center text-xs text-zinc-400">
        <p>© {new Date().getFullYear()} GhostPPTX — Conçu avec rigueur et sobriété.</p>
      </footer>
    </div>
  );
}