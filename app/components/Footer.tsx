"use client";
import { motion, AnimatePresence, useTransform, useMotionValue } from "framer-motion";
import { div } from "framer-motion/client";
// --- COMPOSANT : MARQUEE INFINI ---
const Marquee = ({ text }: { text: string }) => {
    return (
      <div className="overflow-hidden whitespace-nowrap border-b border-gray-800 bg-black py-4">
        <motion.div 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="inline-block"
        >
          <span className="text-4xl font-black uppercase tracking-tighter text-transparent stroke-text mr-8">
              {text.repeat(10)} 
          </span>
        </motion.div>
        <style jsx>{`
          .stroke-text {
            -webkit-text-stroke: 1px #333;
            color: transparent;
          }
        `}</style>
      </div>
    );
  };
  
  // --- COMPOSANT : FOOTER GROTESQUE ---
  export default function FooterGrotesque () {
    return (
        // <div>
      <footer className="bg-black text-white relative overflow-hidden mt-32 border-t-4 border-black">
        {/* 1. LIGNE DE DÉFILEMENT TYPE "NEWS TICKER" CYBERPUNK */}
        <Marquee text=" // SYSTEM READY // MADAGASCAR STUDENT EDITION // NO API COST // GENERATIVE AI // POWERED BY GEMINI // " />
  
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-gray-900">
          
          {/* 2. TYPOGRAPHIE MASSIVE (Le côté Grotesque) */}
          <div className="md:col-span-8 flex flex-col justify-between h-full">
              <h2 className="text-[12vw] leading-[0.8] font-black tracking-tighter mix-blend-difference select-none hover:text-gray-800 transition-colors duration-500">
                  L.<br/>
                  <span className="text-gray-800">AI</span>ZA
              </h2>
              <div className="mt-12 flex gap-4 text-xs font-mono text-gray-500">
                  <span className="border border-gray-800 px-2 py-1 rounded">V.0.0.0 STABLE</span>
                  <span className="border border-gray-800 px-2 py-1 rounded">LAT: -18.8792</span>
                  <span className="border border-gray-800 px-2 py-1 rounded">LON: 47.5079</span>
              </div>
          </div>
  
          {/* 3. GRILLE D'INFORMATION BRUTALISTE */}
          <div className="md:col-span-4 flex flex-col gap-8 border-l border-gray-900 pl-8 md:pl-12">
              
              <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Architecture</h4>
                  <p className="text-2xl font-bold hover:translate-x-2 transition-transform cursor-crosshair">NEXT.JS 16</p>
                  <p className="text-2xl font-bold hover:translate-x-2 transition-transform cursor-crosshair">PYTHON SERVERLESS</p>
                  <p className="text-2xl font-bold hover:translate-x-2 transition-transform cursor-crosshair text-green-500">SUPABASE DB</p>
                  <p className="text-2xl font-bold hover:translate-x-2 transition-transform cursor-crosshair text-blue-500">GEMINI FLASH</p>
              </div>
  
              <div className="mt-auto">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Légal & Crédits</h4>
                  <p className="text-sm text-gray-400 font-mono leading-relaxed">
                      Ce système est conçu pour l'assistance académique. L'IA peut halluciner. Vérifiez vos sources.
                  </p>
              </div>
  
          </div>
        </div>
  
        {/* 4. LE BAS DE PAGE AVEC GROS CODE-BARRE DECO */}
        <div className="flex flex-col md:flex-row justify-between items-end px-6 py-6 font-mono text-xs text-gray-600 uppercase">
          <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Documentation</a>
              <a href="#" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">GitHub</a>
              <a href="#" className="hover:text-white transition-colors hover:underline decoration-red-500 underline-offset-4">Signaler un Bug</a>
          </div>
          
          <div className="text-right mt-6 md:mt-0">
              <div className="flex items-center justify-end gap-1 mb-2 opacity-50">
                  {[...Array(20)].map((_, i) => (
                      <div key={i} className={`h-8 w-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent border border-white'}`}></div>
                  ))}
              </div>
              <p>© 2026 DEV MALAGASY // SYSTEM_OVERRIDE_INITIATED</p>
          </div>
        </div>
  
        {/* 5. EFFET DE "BRUIT" SUR LE FOOTER (Optionnel) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </footer>
    //   </div>
    );
  };