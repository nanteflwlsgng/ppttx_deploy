import Link from "next/link";
import { ArrowLeft, Sparkles, Cloud, ShieldCheck } from "lucide-react";
import Footer from "../components/Footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col justify-between selection:bg-zinc-900 selection:text-white">
      {/* Header minimaliste */}
      <header className="p-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-semibold text-sm shadow-sm group-hover:bg-black transition-colors">
            G
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900">
            GhostPPTX
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à l'atelier</span>
        </Link>
      </header>

      {/* Contenu Central : Carte Studio Clean */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg bg-white border border-zinc-200/80 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center space-y-8">
          
          {/* Badge statut */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Espace Membre • Déploiement en cours
          </div>

          {/* Titre & Sous-titre */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
              L'authentification arrive très prochainement.
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed max-w-md mx-auto">
              Nous finalisons l'infrastructure de synchronisation cloud et de sauvegarde de vos mémoires. En attendant, l'atelier GhostPPTX reste <strong>100% libre et gratuit sans compte</strong>.
            </p>
          </div>

          {/* Ce qui arrive bientôt (Feature preview) */}
          <div className="text-left bg-zinc-50/70 border border-zinc-200/60 rounded-2xl p-5 space-y-3.5">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">
              Ce que débloquera votre compte :
            </p>

            <div className="flex items-start gap-3">
              <Cloud className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-zinc-800">Historique persistant</p>
                <p className="text-[11px] text-zinc-500">Retrouvez toutes vos présentations générées sur n'importe quel appareil.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-zinc-800">Modèles personnalisés</p>
                <p className="text-[11px] text-zinc-500">Intégrez la charte graphique et le logo de votre université ou école, changer de theme, etc</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-zinc-800">Confidentialité renforcée</p>
                <p className="text-[11px] text-zinc-500">Chiffrement strict de vos mémoires et suppression programmable.</p>
              </div>
            </div>
          </div>

          {/* Bouton retour principal */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-medium shadow-sm transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Générer un PowerPoint sans compte</span>
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
<Footer/>
    </div>
  );
}