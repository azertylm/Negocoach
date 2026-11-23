import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/status', (_req, res) => {
    const client = getGenAIClient();
    res.json({
      aiConfigured: Boolean(client),
      engine: client ? 'gemini-4-hydrogen' : 'demo-tactical-engine',
    });
  });

  app.post('/api/negotiate', async (req, res) => {
    try {
      const client = getGenAIClient();
      if (!client) {
        res.status(503).json({
          error: 'API_KEY_NOT_CONFIGURED',
          message: 'Le moteur IA serveur utilise le mode Démo Tactique autonome.',
        });
        return;
      }

      const {
        scenarioTitle,
        scenarioContext,
        personaName,
        personaDescription,
        difficulty,
        history,
        userMessage,
        currentReceptivity,
        turnNumber,
      } = req.body;

      const historyText = Array.isArray(history)
        ? history
            .map((m: { sender: string; text: string }) =>
              `${m.sender === 'user' ? 'Utilisateur' : 'Interlocuteur'}: ${m.text}`
            )
            .join('\n')
        : '';

      const prompt = `Contexte de la négociation : ${scenarioTitle} — ${scenarioContext}
Profil de l'interlocuteur que tu incarnes : ${personaName} (${personaDescription})
Niveau de difficulté : ${difficulty}
Tour actuel : ${turnNumber} / 5
Réceptivité actuelle : ${currentReceptivity}%

Historique des échanges :
${historyText}

Nouvelle réplique de l'utilisateur :
"${userMessage}"

En tant qu'interlocuteur "${personaName}" (difficulté ${difficulty}), réponds directement en français à l'utilisateur (2 à 3 phrases percutantes, naturelles, sans préambule). Évalue également l'impact tactique de sa réplique sur ta jauge de réceptivité.`;

      const response = await client.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Tu es un simulateur de négociation réaliste et exigeant pour le cabinet NégoCoach (écosystème Alphabette). Tu joues le rôle de l’interlocuteur face à l’utilisateur et tu analyses froidement sa tactique (ancrage, silence, questions calibrées, preuves factuelles vs justification émotionnelle). Réponds uniquement en JSON valide selon le schéma.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Réplique de l'interlocuteur en français (2-3 phrases max).",
              },
              receptivityDelta: {
                type: Type.INTEGER,
                description: 'Variation de réceptivité entre -18 et +22 selon la qualité tactique.',
              },
              newReceptivity: {
                type: Type.INTEGER,
                description: 'Nouvelle valeur de la jauge de réceptivité entre 5 et 98.',
              },
              statusLabel: {
                type: Type.STRING,
                description: "Court état psychologique de l'interlocuteur (ex: 'Il commence à céder sur le principe').",
              },
              tacticalNote: {
                type: Type.STRING,
                description: 'Analyse flash en 1 phrase de ce que le joueur vient de faire (bien ou mal).',
              },
              nextHint: {
                type: Type.STRING,
                description: 'Conseil du Souffleur en 1 ligne pour aider le joueur au prochain tour.',
              },
              suggestedStarter: {
                type: Type.STRING,
                description: 'Une phrase complète que le joueur peut utiliser ou adapter au tour suivant.',
              },
            },
            required: [
              'reply',
              'receptivityDelta',
              'newReceptivity',
              'statusLabel',
              'tacticalNote',
              'nextHint',
              'suggestedStarter',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Erreur lors de la génération IA';
      res.status(500).json({ error: 'GEMINI_ERROR', message: errMessage });
    }
  });

  app.post('/api/debrief', async (req, res) => {
    try {
      const client = getGenAIClient();
      if (!client) {
        res.status(503).json({
          error: 'API_KEY_NOT_CONFIGURED',
          message: 'Le débriefing utilise le moteur tactique local.',
        });
        return;
      }

      const {
        scenarioTitle,
        scenarioContext,
        personaName,
        difficulty,
        history,
        finalReceptivity,
      } = req.body;

      const historyText = Array.isArray(history)
        ? history
            .map((m: { sender: string; text: string }) =>
              `${m.sender === 'user' ? 'Utilisateur' : 'Interlocuteur'}: ${m.text}`
            )
            .join('\n')
        : '';

      const prompt = `Analyse cette session de négociation et produis le débriefing tactique final :
Scénario : ${scenarioTitle} (${scenarioContext})
Interlocuteur : ${personaName} | Difficulté : ${difficulty}
Réceptivité finale atteinte : ${finalReceptivity}%

Transcription complète :
${historyText}`;

      const response = await client.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Tu es un coach senior en négociation (méthode Harvard & Chris Voss). Génère un débriefing lucide, bienveillant et chirurgical en français avec une note sur 100, un verdict clair, 2 points forts, 2 pièges observés et 3 phrases clés prêtes à l’emploi pour le jour J.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: 'Note globale de négociation sur 100.',
              },
              verdict: {
                type: Type.STRING,
                description: "Verdict court : 'Accord obtenu', 'Compromis sous conditions', ou 'Impasse — À retravailler'.",
              },
              verdictSummary: {
                type: Type.STRING,
                description: 'Synthèse exécutive en 2 phrases sur l’issue de la négociation.',
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactement 2 points forts démontrés pendant l’échange.',
              },
              traps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactement 2 pièges dans lesquels l’utilisateur est tombé ou points de vigilance.',
              },
              cheatSheetPhrases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    context: {
                      type: Type.STRING,
                      description: 'Moment précis où utiliser la phrase (ex: Face au blocage budgétaire).',
                    },
                    phrase: {
                      type: Type.STRING,
                      description: 'La phrase exacte mot pour mot à prononcer le jour J.',
                    },
                    whyItWorks: {
                      type: Type.STRING,
                      description: 'Pourquoi ce levier psychologique fonctionne en 1 ligne.',
                    },
                  },
                  required: ['context', 'phrase', 'whyItWorks'],
                },
                description: 'Exactement 3 phrases clés pour la Carte Anti-Sèche.',
              },
            },
            required: ['score', 'verdict', 'verdictSummary', 'strengths', 'traps', 'cheatSheetPhrases'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Erreur lors du débriefing IA';
      res.status(500).json({ error: 'GEMINI_ERROR', message: errMessage });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NégoCoach server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
