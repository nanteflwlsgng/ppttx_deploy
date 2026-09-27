import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) console.error("⚠️ Clé API Google manquante !");

const genAI = new GoogleGenerativeAI(apiKey || "");

// Modèles ordonnés : le plus fiable et rapide en premier
const FAST_MODELS = [
  "gemini-3.5-flash-lite", // A fonctionné avec succès en 8.3s
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.1-pro-preview",
  "gemini-pro-latest",
];

// Nettoyage intelligent : préserve toute la substance du mémoire en éliminant les annexes/bibliographie
function extractSubstantiveContent(rawText: string): string {
  // Détecter et couper la bibliographie terminale pour économiser les tokens
  const biblioMatch = rawText.search(/\n\s*(bibliographie|références|references|webographie|annexes)\b/i);
  let cleaned = biblioMatch > 8000 ? rawText.slice(0, biblioMatch) : rawText;

  // On conserve jusqu'à 65 000 caractères de la recherche (couvre problématique, terrain, résultats et conclusion)
  return cleaned.slice(0, 65000).replace(/\s+/g, " ").trim();
}

export async function POST(req: Request) {
  try {
    const { thesisText, fileName } = await req.json();

    if (!thesisText) {
      return NextResponse.json({ error: "Manque le texte du mémoire" }, { status: 400 });
    }

    const researchBody = extractSubstantiveContent(thesisText);

    const prompt = `
Tu es un président de jury de soutenance de mémoire et un directeur de recherche émérite.
Ton objectif est de concevoir une soutenance académique remarquable, vivante et percutante à partir du mémoire ci-dessous.

TITRE DU FICHIER : "${fileName || "Mémoire de soutenance"}"

CORPUS DU MÉMOIRE :
"${researchBody}"

MISSION DE SOUTENANCE :
Ne fais PAS un résumé générique. Extrais la substantifique moelle du travail personnel de l'étudiant :
1. Sa problématique concrète et ce qui a motivé sa recherche.
2. Sa démarche méthodologique réelle (enquêtes, terrain, outils, échantillon).
3. Ses résultats empiriques majeurs (données concrètes, constats saillants).
4. Ses recommandations stratégiques et sa conclusion personnelle.

RÈGLE DES DIAPOSITIVES (Structure Terracotta de 7 à 9 slides) :
- "type" : doit être "cover", "agenda", "content", "two_column", ou "thanks".
- "section" : le surtitre de la slide (ex: "01 • CONTEXTE", "02 • MÉTHODOLOGIE", "03 • RÉSULTATS", "04 • DISCUSSION").
- "titre" : un titre fort et captivant.
- "points" : 3 à 4 points synthétiques avec des données tangibles issues du mémoire (évite les généralités creuses).

FORMAT STRICT (JSON PUR SANS MARKDOWN) :
{
  "slides": [
    {
      "type": "cover",
      "section": "SOUTENANCE DE MÉMOIRE",
      "titre": "Titre fort du mémoire",
      "points": ["Présentation de soutenance", "Session académique"]
    },
    {
      "type": "agenda",
      "section": "SOMMAIRE",
      "titre": "Structure de la soutenance",
      "points": [
        "01. Contexte & Problématique",
        "02. Cadre méthodologique & Démarche",
        "03. Résultats majeurs & Découvertes",
        "04. Recommandations & Conclusion"
      ]
    },
    {
      "type": "content",
      "section": "01 • CONTEXTE",
      "titre": "Contexte & Problématique centrale",
      "points": ["Constat initial et rupture observée", "La question centrale de recherche", "Objectifs visés"]
    },
    {
      "type": "content",
      "section": "02 • DÉMARCHE",
      "titre": "Méthodologie & Protocole d'enquête",
      "points": ["Démarche scientifique et protocoles", "Échantillon ou données analysées", "Biais et limites identifiés"]
    },
    {
      "type": "two_column",
      "section": "03 • RÉSULTATS",
      "titre": "Analyse des résultats clés",
      "points": [
        "Axe 1 : Premier constat empirique majeur",
        "Axe 2 : Validation des hypothèses de départ",
        "Mise en perspective des données de terrain"
      ]
    },
    {
      "type": "content",
      "section": "04 • PERSPECTIVES",
      "titre": "Recommandations & Discussion critique",
      "points": ["Recommandation opérationnelle pour le secteur", "Apports académiques", "Perspectives de recherche futures"]
    },
    {
      "type": "thanks",
      "section": "CONCLUSION",
      "titre": "Merci pour votre attention",
      "points": ["Fin de la soutenance", "Échanges et questions du jury"]
    }
  ]
}
`;

    let lastError = null;

    for (const modelName of FAST_MODELS) {
      try {
        const startTime = Date.now();
        console.log(`Analyse approfondie avec ${modelName}...`);

        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2, // Température basse pour une fidélité maximale au mémoire
          },
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonData = JSON.parse(responseText);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`OK Soutenance structurée avec ${modelName} en ${duration}s !`);

        return NextResponse.json(jsonData);
      } catch (error: any) {
        console.warn(`X! Échec avec ${modelName} (${error.message || error}), bascule vers le suivant...`);
        lastError = error;
      }
    }

    return NextResponse.json(
      { error: "Tous les modèles sont temporairement indisponibles.", details: lastError?.message },
      { status: 503 }
    );
  } catch (error) {
    console.error("Erreur serveur critique:", error);
    return NextResponse.json({ error: "Erreur interne serveur" }, { status: 500 });
  }
}