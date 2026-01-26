"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useTransform, useMotionValue } from "framer-motion";
import { Upload, Cpu, Zap, CheckCircle, BrainCircuit, LogIn, History, LogOut, RotateCcw, LayoutTemplate, Presentation, MonitorCog } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FooterGrotesque from "./components/Footer"

// --- TYPES ---
type HistoryItem = {
    id: string;
    title: string;
    instruction: string;
    created_at: string;
    generated_json: any;
    thesis_text: string;
};

// --- COMPOSANT : LE HYPER-LOADER (Inchangé car parfait) ---
const HyperLoader = ({ thesisText }: { thesisText: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [statusMsg, setStatusMsg] = useState("INITIALISATION DU NOYAU");
  
  useEffect(() => {
    const snippets = thesisText.split(" ").filter(w => w.length > 5);
    const techWords = ["TOKENIZATION", "VECTOR_EMBEDDING", "SYNAPTIC_PARSING", "NEURAL_HANDSHAKE", "SEMANTIC_EXTRACTION"];
    
    const interval = setInterval(() => {
      const randomSnippet = snippets[Math.floor(Math.random() * snippets.length)] || "DATA";
      const randomTech = techWords[Math.floor(Math.random() * techWords.length)];
      setDisplayText(`${randomTech} :: 0x${Math.floor(Math.random()*99999).toString(16)} >> ${randomSnippet.toUpperCase()}`);
    }, 50);

    const statusInterval = setInterval(() => {
        const msgs = ["LECTURE PROFONDE", "STRUCTURATION DES SLIDES", "OPTIMISATION DU NLP", "GÉNÉRATION DES POINTS CLÉS", "FUSION DES CONCEPTS"];
        setStatusMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 800);

    return () => { clearInterval(interval); clearInterval(statusInterval); };
  }, [thesisText]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="relative">
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-32 h-32 border-4 border-t-black border-r-gray-300 border-b-black border-l-gray-300 rounded-full" />
        <motion.div animate={{ rotate: -360, scale: [1, 0.8, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-2 border-2 border-dashed border-gray-400 rounded-full" />
        <Cpu className="absolute inset-0 m-auto w-12 h-12 text-black animate-pulse" />
      </div>
      <h2 className="mt-8 text-4xl font-black tracking-tighter text-black uppercase">{statusMsg}</h2>
      <p className="font-mono text-sm text-gray-500 mt-2">PROCESS_ID: {Math.floor(Math.random() * 10000)}</p>
      <div className="mt-8 w-full max-w-2xl h-16 overflow-hidden relative border-t border-b border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10" />
        <p className="font-mono text-xs text-gray-400 whitespace-nowrap overflow-hidden text-center w-full px-4">{Array(5).fill(displayText).join(" // ")}</p>
      </div>
      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 8 }} className="absolute bottom-0 left-0 h-2 bg-black" />
    </motion.div>
  );
};

// --- LE MAIN COMPONENT ---
export default function Home() {
  // États App & Auth
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [view, setView] = useState<"generator" | "history">("generator");

  // États Générateur
  const [step, setStep] = useState(1);
  const [thesisText, setThesisText] = useState("");
  const [instruction, setInstruction] = useState(
    "Analyse ce mémoire pour créer une présentation de soutenance structurée."
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [fileName, setFileName] = useState("");

  // Window & Parallax
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // --- 1. INITIALISATION & AUTHENTIFICATION ---
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Nettoyage de l'URL (Enlever le #access_token=... après login Google)
    const cleanUrl = () => {
        if (window.location.hash.includes("access_token")) {
            window.history.replaceState(null, "", window.location.pathname);
        }
    };

    // Vérifier la session active
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            setUser(user);
            fetchHistory(user.id);
            cleanUrl();
        }
    });

    // Écouter les changements d'état (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            setUser(session.user);
            fetchHistory(session.user.id);
            cleanUrl();
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setHistory([]);
            setView("generator");
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleMouseMove({ clientX, clientY }: React.MouseEvent) {
    mouseX.set(clientX);
    mouseY.set(clientY);
  }

  // --- 2. LOGIQUE SUPABASE (LOGIN / DB) ---
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin } // Redirection propre vers la racine
    });
  };

  const logout = async () => await supabase.auth.signOut();

  const fetchHistory = async (userId: string) => {
      const { data } = await supabase.from('presentations').select('*').order('created_at', { ascending: false });
      if (data) setHistory(data);
  };

  const loadFromHistory = (item: HistoryItem) => {
      setThesisText(item.thesis_text);
      setInstruction(item.instruction);
      setFileName(item.title);
      setStep(2);
      setView("generator");
      setStatus("Données historiques rechargées.");
  };

  // --- 3. LOGIQUE METIER (UPLOAD & GENERATE) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("Chargement du moteur neuronal...");
    
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      setStatus("Extraction des vecteurs sémantiques...");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str || "").join(" ") + "\n";
      }

      setThesisText(fullText);
      setStatus("Mémoire ingéré avec succès.");
      setStep(2);
    } catch (error) {
      console.error(error);
      setStatus("Échec critique de lecture.");
    }
  };

  const generatePresentation = async () => {
    if (!thesisText) return;
    setLoading(true);

    try {
      // A. Analyse IA
      const aiRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesisText, instruction }),
      });
      if (!aiRes.ok) throw new Error("Erreur IA");
      const aiData = await aiRes.json();

      // B. Sauvegarde DB (Si connecté)
      if (user) {
          await supabase.from('presentations').insert({
              user_id: user.id,
              title: fileName || "Présentation GenAI",
              instruction: instruction,
              thesis_text: thesisText,
              generated_json: aiData
          });
          fetchHistory(user.id);
      }

      // C. Génération Python
      const pptRes = await fetch("/api", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiData),
      });

      if (!pptRes.ok) throw new Error(await pptRes.text());

      // D. Téléchargement
      const blob = await pptRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Soutenance_${new Date().getTime()}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onMouseMove={handleMouseMove} className="relative min-h-screen bg-white overflow-hidden text-black font-sans selection:bg-black selection:text-white">
      
      {/* --- NAVBAR FURTIVE --- */}
      <nav className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center bg-gradient-to-b from-white via-white/80 to-transparent">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView("generator")}>
            <Presentation className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            <span className="font-bold tracking-widest text-sm uppercase">PRES V0.0</span>
            {/* <img src="/logo.png" className="w-40 h-20 rounded-lg bg-black" alt="logo" /> */}
        </div>

        <div className="flex items-center gap-4">
            {user ? (
                <>
                    <button 
                        onClick={() => setView(view === "history" ? "generator" : "history")}
                        className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border border-transparent hover:border-black transition-all flex items-center gap-2 ${view === "history" ? "bg-black text-white" : ""}`}
                    >
                        {view === "history" ? <LayoutTemplate className="w-3 h-3"/> : <History className="w-3 h-3"/>}
                        {view === "history" ? "Générateur" : "Historique"}
                    </button>
                    <button onClick={logout} className="text-xs font-bold uppercase text-red-500 hover:text-red-700 flex items-center gap-1">
                        <LogOut className="w-3 h-3" /> Exit
                    </button>
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                        {user.email[0].toUpperCase()}
                    </div>
                </>
            ) : (
                <button onClick={loginWithGoogle} className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                    <LogIn className="w-3 h-3" /> Connexion
                </button>
            )}
        </div>
      </nav>

      {/* --- BACKGROUND PARALLAX --- */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-gray-100 to-gray-200 rounded-full blur-3xl opacity-60 pointer-events-none"
        style={{ x: useTransform(mouseX, [0, windowSize.width || 1000], [20, -20]), y: useTransform(mouseY, [0, windowSize.height || 800], [20, -20]) }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tl from-gray-200 to-white rounded-full blur-3xl opacity-60 pointer-events-none"
        style={{ x: useTransform(mouseX, [0, windowSize.width || 1000], [-20, 20]), y: useTransform(mouseY, [0, windowSize.height || 800], [-20, 20]) }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* --- LOADING SCREEN --- */}
      <AnimatePresence>{loading && <HyperLoader thesisText={thesisText} />}</AnimatePresence>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32 min-h-screen flex flex-col justify-center">
        
        {/* HEADER */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="mb-16">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.9]">
                PPTX<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-800">GENERATOR</span>
                <span className="text-xl md:text-2xl font-mono block mt-4 tracking-widest text-gray-500">
                    {view === "history" ? "DATABASE ARCHIVE" : "GHOST EDITION v0.0"}
                </span>
            </h1>
        </motion.div>

        {/* --- CONTENU DYNAMIQUE (GÉNÉRATEUR ou HISTORIQUE) --- */}
        <AnimatePresence mode="wait">
            
            {/* VUE 1 : HISTORIQUE */}
            {view === "history" ? (
                <motion.div 
                    key="history"
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {history.map((item, idx) => (
                      <motion.div 
  key={item.id} 
  initial={{ opacity: 0, y: 20 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ delay: idx * 0.1 }}
  className="group relative border border-gray-200 bg-white/40 backdrop-blur-md p-6 hover:border-black transition-all cursor-default flex flex-col justify-between h-full"
>
  <div>
    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <span className="text-[10px] font-mono border border-black px-1">
        ID: {item.id.substring(0,4)}
      </span>
    </div>
    <h3 className="font-bold text-lg mb-2 truncate uppercase">{item.title}</h3>
    <p className="text-xs text-gray-400 font-mono mb-4">
      {new Date(item.created_at).toLocaleDateString()}
    </p>
    <p className="text-sm text-gray-600 line-clamp-3 mb-6 italic border-l-2 border-gray-200 pl-3">
      "{item.instruction}"
    </p>
  </div>

  <button 
    onClick={() => loadFromHistory(item)}
    className="w-full py-3 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 flex items-center justify-center gap-2"
  >
    <RotateCcw className="w-3 h-3" /> Relancer le noyau
  </button>
</motion.div>

                    ))}
                    {history.length === 0 && <p className="text-gray-400 font-mono">Aucune donnée archivée dans le système.</p>}
                </motion.div>
            ) : (
                
                /* VUE 2 : GÉNÉRATEUR (DEFAULT) */
                <motion.div 
                    key="generator"
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    className="grid md:grid-cols-2 gap-12 items-start"
                >
                    {/* Colonne Gauche */}
                    <div className="space-y-8">
                        <div className="p-8 border border-gray-200 bg-white/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-black group-hover:h-1/2 transition-all duration-500" />
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                <MonitorCog className="w-5 h-5"/> État du Système
                            </h3>
                            <p className={`text-4xl font-mono font-bold ${thesisText ? "text-green-600" : "text-gray-300"}`}>
                                {thesisText ? "PRÊT À GÉNÉRER" : "EN ATTENTE"}
                            </p>
                            <p className="mt-4 text-sm text-gray-500 font-mono">{status || "En attente de données..."}</p>
                            {fileName && <p className="text-xs font-mono mt-1 text-black border-b border-black inline-block">{fileName}</p>}
                        </div>

                        {step >= 2 && (
                            <div className="relative group">
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1 text-gray-400">Prompt de Commande IA</label>
                                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                                <textarea
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                    className="relative w-full p-6 bg-white border-2 border-transparent focus:border-black outline-none font-mono text-sm shadow-xl min-h-[200px] resize-none transition-all"
                                />
                                <Zap className="absolute bottom-4 right-4 text-yellow-500 w-5 h-5 animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* Colonne Droite */}
                    <div className="space-y-6">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`relative p-12 border-2 border-dashed ${thesisText ? 'border-green-500 bg-green-50/30' : 'border-gray-300 hover:border-black'} transition-all cursor-pointer group`}>
                            <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            <div className="text-center relative z-10 pointer-events-none">
                                {thesisText ? <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" /> : <Upload className="w-16 h-16 mx-auto text-gray-300 group-hover:text-black transition-colors mb-4" />}
                                <h3 className="text-2xl font-bold uppercase">{thesisText ? "Mémoire Chargé" : "Uploader PDF"}</h3>
                                <p className="text-gray-500 mt-2 font-mono text-xs uppercase">Glisser-déposer ou cliquer</p>
                            </div>
                        </motion.div>

                        {step >= 2 && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generatePresentation} className="w-full py-8 bg-black text-white text-2xl font-black uppercase tracking-tighter hover:bg-gray-900 shadow-2xl relative overflow-hidden group">
                                <span className="relative z-10 flex items-center justify-center gap-4">Lancer la Séquence <Zap className="fill-white"/></span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
      <FooterGrotesque/>
    </div>
  );
}