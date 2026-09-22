import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) console.error("⚠️ Clé API Google manquante !");

const genAI = new GoogleGenerativeAI(apiKey || "");

// LISTE ORDONNÉE DES MODÈLES (Priorité : Stabilité > Vitesse > Intelligence brute)
const MODELS_TO_TRY = [
  "gemini-3.8-flash",    
  "gemini-3.5-flash-lite",    
  "gemini-3.1-pro-preview", 
  "gemini-3.1-flash-lite",    
  "gemini-pro-latest",    
  "gemini-flash-latest",    
  "gemini-flash-lite-latest",    
];

export async function POST(req: Request) {
  try {
    const { thesisText, instruction } = await req.json();

    if (!thesisText || !instruction) {
      return NextResponse.json({ error: "Manque texte ou instruction" }, { status: 400 });
    }

    const prompt = `
      Tu es un expert académique assistant un étudiant pour sa soutenance.
      
      CONTEXTE (EXTRAIT DU MÉMOIRE) :
      "${thesisText.substring(0, 150000)}..." (tronqué)
      
      INSTRUCTION DE L'ÉTUDIANT POUR LA PRÉSENTATION :
      "${instruction}"
      
      TA MISSION :
      Analyse le mémoire et génère le contenu des slides PowerPoint en suivant scrupuleusement l'instruction de l'étudiant ci-dessus.
      Si l'étudiant demande un plan spécifique, respecte-le. S'il est vague, propose une structure académique pertinente (Intro, Méthodes, Résultats, Conclusion).
      
      FORMAT DE SORTIE OBLIGATOIRE (JSON SEULEMENT) :
      Doit être un objet JSON valide sans Markdown, avec cette structure exacte :
      {
        "slides": [
          { 
            "titre": "Titre de la slide", 
            "points": ["Point clé 1", "Point clé 2"] 
          }
        ]
      }
    `;

    // --- BOUCLE DE TENTATIVE (RETRY LOGIC) ---
    let lastError = null;

    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`🤖 Tentative avec le modèle : ${modelName}...`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Tentative de parsing JSON pour vérifier si la réponse est valide
        const jsonString = responseText.replace(/```json|```/g, "").trim();
        const jsonData = JSON.parse(jsonString);

        // Si on arrive ici, c'est que ça a marché !
        console.log(`✅ SUCCÈS avec ${modelName}`);
        return NextResponse.json(jsonData);

      } catch (error: any) {
        console.warn(`❌ Échec avec ${modelName} :`, error.message || error);
        lastError = error;
        // On continue la boucle vers le modèle suivant...
      }
    }

    // Si on sort de la boucle, c'est que TOUS les modèles ont échoué
    console.error("💀 Tous les modèles Gemini ont échoué.");
    return NextResponse.json(
        { error: "Service surchargé. Tous les modèles IA sont occupés. Réessayez dans 1 minute.", details: lastError?.message }, 
        { status: 503 }
    );

  } catch (error) {
    console.error("Erreur serveur critique:", error);
    return NextResponse.json({ error: "Erreur interne serveur" }, { status: 500 });
  }
}