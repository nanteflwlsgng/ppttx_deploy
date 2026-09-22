"use client";

import { History, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  user: any;
  view: "generator" | "history";
  historyCount: number;
  onSelectView: (view: "generator" | "history") => void;
  onResetStudio: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  view,
  historyCount,
  onSelectView,
  onResetStudio,
  onLogin,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-zinc-200/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={onResetStudio}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-semibold text-sm shadow-sm group-hover:bg-black transition-colors">
            G
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-900">
              GhostPPTX
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
              Version 2
            </span>
          </div>
        </div>

        {/* Actions Auth & Vues */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="bg-zinc-100 p-1 rounded-xl flex items-center border border-zinc-200/60 text-xs">
                <button
                  onClick={() => onSelectView("generator")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    view === "generator"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Atelier
                </button>
                <button
                  onClick={() => onSelectView("history")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    view === "history"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Historique</span>
                  {historyCount > 0 && (
                    <span className="bg-zinc-200 text-zinc-700 text-[10px] px-1.5 py-0.2 rounded-full">
                      {historyCount}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={onLogout}
                title="Déconnexion"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
<Link
  href="/login"
  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-medium shadow-sm transition-all flex items-center gap-2 active:scale-95"
>
  <span>Connexion</span>
  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
</Link>
          )}
        </div>
      </div>
    </header>
  );
}