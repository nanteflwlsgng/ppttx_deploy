import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) console.error("Clé API Google manquante !");

const genAI = new GoogleGenerativeAI(apiKey || "");

// Modèles stables
const FAST_MODELS = [
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

    // Troncature intelligente à 45 000 caractères (suffisant pour capturer tout le plan et le fond)
    const cleanedText = thesisText.slice(0, 45000);

    const prompt = `
Tu es un expert académique assistant un étudiant pour préparer sa soutenance de mémoire.

DIRECTIVES DE L'ÉTUDIANT :
"${instruction}"

EXTRAIT ANALYTIQUE DU DOCUMENT :
"${cleanedText}"

MISSION :
Conçois une présentation PowerPoint percutante adaptée à une soutenance professionnelle.
Pour chaque diapositive :
- "titre" : Court, percutant et évocateur (ex: "Problématique & Enjeux", "Méthodologie retenue").
- "points" : Liste de 3 à 5 points synthétiques, directs et sans fioritures (idéal pour la colonne de gauche).

RÈGLE ABSOLUE :
Réponds UNIQUEMENT sous forme d'un objet JSON strict respectant cette structure exacte :
{
  "slides": [
    {
      "titre": "Titre de la slide",
      "points": ["Point clé 1", "Point clé 2", "Point clé 3"]
    }
  ]
}
`;

    let lastError = null;

    for (const modelName of FAST_MODELS) {
      try {
        const startTime = Date.now();
        console.log(`⚡ Tentative accélérée avec ${modelName}...`);

        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3, // Moins d'hallucinations, réponse plus rapide et structurée
          },
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonData = JSON.parse(responseText);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ SUCCÈS avec ${modelName} en ${duration}s !`);

        return NextResponse.json(jsonData);
      } catch (error: any) {
        console.warn(`⚠️ Échec avec ${modelName} (${error.message || error}), bascule vers le suivant...`);
        lastError = error;
      }
    }

    return NextResponse.json(
      { error: "Tous les modèles rapides sont temporairement indisponibles.", details: lastError?.message },
      { status: 503 }
    );
  } catch (error) {
    console.error("Erreur serveur critique:", error);
    return NextResponse.json({ error: "Erreur interne serveur" }, { status: 500 });
  }
}