import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Debug rapide pour la clé
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) console.error("⚠️ Clé API Google manquante !");

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    // On reçoit maintenant 'instruction' au lieu de 'plan'
    const { thesisText, instruction } = await req.json();

    if (!thesisText || !instruction) {
      return NextResponse.json({ error: "Manque texte ou instruction" }, { status: 400 });
    }

    // Utilise un modèle récent
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); 

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
      Doit être un objet JSON valide sans Markdown, avec cette structure exacte pour que le script Python fonctionne :
      {
        "slides": [
          { 
            "titre": "Titre de la slide (ex: Introduction)", 
            "points": ["Point clé 1", "Point clé 2 (court et percutant)"] 
          },
          {
            "titre": "Titre de la slide suivante...",
            "points": ["..."]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Nettoyage JSON
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    
    try {
        const jsonData = JSON.parse(jsonString);
        return NextResponse.json(jsonData);
    } catch (e) {
        console.error("Erreur parsing JSON IA:", jsonString);
        return NextResponse.json({ error: "L'IA a généré un format invalide" }, { status: 500 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur IA" }, { status: 500 });
  }
}