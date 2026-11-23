import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Sliders,
  Mic,
  MicOff,
  Send,
  Lightbulb,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Printer,
  RotateCcw,
  ArrowRight,
  Target,
  Award,
  FileText,
  X,
  Trash2,
} from 'lucide-react';
import { DoubleHeader } from './components/DoubleHeader';
import {
  SCENARIOS,
  PERSONAS,
  DIFFICULTIES,
  ScenarioId,
  PersonaId,
  DifficultyId,
  TacticalChoice,
  evaluateFreeTextTurn,
  buildLocalDebriefReport,
  getStatusLabelForReceptivity,
  DebriefReport,
} from './data/negotiationData';

interface ChatMessage {
  id: string;
  sender: 'interlocutor' | 'user';
  text: string;
  turnNumber: number;
  receptivityAfter?: number;
  delta?: number;
  tacticalNote?: string;
  strategyTag?: string;
  isTrap?: boolean;
}

type AppPhase = 'setup' | 'chat' | 'debrief';
type EngineMode = 'demo' | 'ai';

export default function App() {
  // Accessibility & Theme states controlled by Alphabette DoubleHeader
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('alphabette_theme');
      return saved ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });
  const [isBigMode, setIsBigMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alphabette_big_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(false);

  // Configuration Express (3 clics)
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('augmentation-10');
  const [customSituation, setCustomSituation] = useState<string>('');
  const [customObjective, setCustomObjective] = useState<string>('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>('radin');
  const [selectedDifficultyId, setSelectedDifficultyId] = useState<DifficultyId>('coriace');

  // Engine & Settings modal
  const [engineMode, setEngineMode] = useState<EngineMode>('demo');
  const [serverAiAvailable, setServerAiAvailable] = useState<boolean>(false);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState<boolean>(false);
  const [showTacticalNotes, setShowTacticalNotes] = useState<boolean>(true);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Active negotiation state
  const [phase, setPhase] = useState<AppPhase>('setup');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [receptivity, setReceptivity] = useState<number>(36);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const [statusLabel, setStatusLabel] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Souffleur (Hint) state
  const [souffleurOpen, setSouffleurOpen] = useState<boolean>(false);
  const [dynamicHint, setDynamicHint] = useState<string>('');
  const [dynamicStarter, setDynamicStarter] = useState<string>('');

  // Voice Recognition (Web Speech API)
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Debriefing & Cheat Sheet
  const [debriefReport, setDebriefReport] = useState<DebriefReport | null>(null);
  const [isDebriefLoading, setIsDebriefLoading] = useState<boolean>(false);
  const [copiedCheatSheet, setCopiedCheatSheet] = useState<boolean>(false);
  const [copiedPhraseIndex, setCopiedPhraseIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('alphabette_theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  // Persist BIG mode
  useEffect(() => {
    try {
      localStorage.setItem('alphabette_big_mode', String(isBigMode));
    } catch {
      // ignore
    }
  }, [isBigMode]);

  // Check server AI capability on mount
  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.aiConfigured) {
          setServerAiAvailable(true);
        }
      })
      .catch(() => {
        setServerAiAvailable(false);
      });
  }, []);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (phase === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, phase, souffleurOpen]);

  const currentScenario =
    SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];
  const currentPersona =
    PERSONAS.find((p) => p.id === selectedPersonaId) || PERSONAS[0];
  const currentDifficulty =
    DIFFICULTIES.find((d) => d.id === selectedDifficultyId) || DIFFICULTIES[1];

  const activeTurnData =
    currentScenario.turns[Math.min(currentTurn - 1, currentScenario.turns.length - 1)];

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.02;
    window.speechSynthesis.speak(utterance);
  };

  // Start a negotiation session
  const startSimulation = (overrideScenarioId?: ScenarioId) => {
    const targetScenarioId = overrideScenarioId || selectedScenarioId;
    if (overrideScenarioId) {
      setSelectedScenarioId(overrideScenarioId);
    }
    const scenarioObj = SCENARIOS.find((s) => s.id === targetScenarioId) || SCENARIOS[0];
    const initReceptivity = currentDifficulty.initialReceptivity;

    let openingText = scenarioObj.openingMessage[currentPersona.id];
    if (targetScenarioId === 'custom' && customSituation.trim()) {
      openingText = `J'ai bien noté votre demande concernant « ${customSituation.trim()} ». Mais soyons clairs : dans le contexte actuel, mes marges de manœuvre sont quasi nulles. Qu'avez-vous de concret à m'apporter ?`;
    }

    const firstTurn = scenarioObj.turns[0];
    setReceptivity(initReceptivity);
    setLastDelta(null);
    setStatusLabel(getStatusLabelForReceptivity(initReceptivity));
    setCurrentTurn(1);
    setSouffleurOpen(false);
    setDynamicHint(firstTurn?.souffleurHint || 'Ancrez votre demande sur des éléments factuels et chiffrés.');
    setDynamicStarter(firstTurn?.suggestedStarter || '');
    setUserInput('');
    setDebriefReport(null);

    const initialMsg: ChatMessage = {
      id: `msg-init-${Date.now()}`,
      sender: 'interlocutor',
      text: openingText,
      turnNumber: 1,
      receptivityAfter: initReceptivity,
    };

    setMessages([initialMsg]);
    setPhase('chat');

    if (autoSpeakReplies) {
      speakText(openingText);
    }
  };

  // Handle playing a structured tactical choice (Demo 4-turn quick card)
  const handleSelectTacticalChoice = (choice: TacticalChoice) => {
    if (isGenerating) return;

    const scaledDelta = Math.round(
      choice.receptivityDelta *
        (choice.receptivityDelta >= 0
          ? currentDifficulty.deltaMultiplier
          : 2 - currentDifficulty.deltaMultiplier)
    );
    const nextReceptivity = Math.max(5, Math.min(98, receptivity + scaledDelta));
    const replyText = choice.interlocutorReply[currentPersona.id];

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: choice.userText,
      turnNumber: currentTurn,
      receptivityAfter: nextReceptivity,
      delta: scaledDelta,
      tacticalNote: choice.tacticalNote,
      strategyTag: choice.strategyTag,
      isTrap: choice.isTrap,
    };

    const interlocutorMsg: ChatMessage = {
      id: `inter-${Date.now() + 1}`,
      sender: 'interlocutor',
      text: replyText,
      turnNumber: currentTurn,
      receptivityAfter: nextReceptivity,
    };

    const updatedHistory = [...messages, userMsg, interlocutorMsg];
    setMessages(updatedHistory);
    setReceptivity(nextReceptivity);
    setLastDelta(scaledDelta);
    setStatusLabel(choice.statusLabel);
    setSouffleurOpen(false);
    setUserInput('');

    if (autoSpeakReplies) {
      speakText(replyText);
    }

    const nextTurnNum = currentTurn + 1;
    const nextTurnObj = currentScenario.turns[nextTurnNum - 1];
    if (nextTurnObj) {
      setDynamicHint(nextTurnObj.souffleurHint);
      setDynamicStarter(nextTurnObj.suggestedStarter);
    }

    setCurrentTurn(nextTurnNum);
  };

  // Handle free text submission (keyboard or voice)
  const handleSendFreeMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = userInput.trim();
    if (!trimmed || isGenerating) return;

    setIsGenerating(true);
    setSouffleurOpen(false);

    const scenarioTitle =
      selectedScenarioId === 'custom' && customSituation.trim()
        ? customSituation.trim()
        : currentScenario.title;
    const scenarioContext =
      selectedScenarioId === 'custom' && customObjective.trim()
        ? `Objectif : ${customObjective.trim()}`
        : currentScenario.contextDescription;

    // Try server-side Gemini AI if EngineMode is 'ai' and available; otherwise use local tactical analyzer
    if (engineMode === 'ai' && serverAiAvailable) {
      try {
        const res = await fetch('/api/negotiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenarioTitle,
            scenarioContext,
            personaName: currentPersona.name,
            personaDescription: `${currentPersona.archetype}. ${currentPersona.quote}`,
            difficulty: currentDifficulty.name,
            history: messages.map((m) => ({ sender: m.sender, text: m.text })),
            userMessage: trimmed,
            currentReceptivity: receptivity,
            turnNumber: currentTurn,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const nextRec = Math.max(5, Math.min(98, Number(data.newReceptivity) || receptivity));
          const delta = Number(data.receptivityDelta) || nextRec - receptivity;

          const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: trimmed,
            turnNumber: currentTurn,
            receptivityAfter: nextRec,
            delta,
            tacticalNote: data.tacticalNote,
            strategyTag: 'Réponse libre IA',
            isTrap: delta < 0,
          };

          const interMsg: ChatMessage = {
            id: `inter-${Date.now() + 1}`,
            sender: 'interlocutor',
            text: data.reply,
            turnNumber: currentTurn,
            receptivityAfter: nextRec,
          };

          setMessages((prev) => [...prev, userMsg, interMsg]);
          setReceptivity(nextRec);
          setLastDelta(delta);
          setStatusLabel(data.statusLabel || getStatusLabelForReceptivity(nextRec));
          if (data.nextHint) setDynamicHint(data.nextHint);
          if (data.suggestedStarter) setDynamicStarter(data.suggestedStarter);
          setCurrentTurn((prev) => prev + 1);
          setUserInput('');
          if (autoSpeakReplies && data.reply) {
            speakText(data.reply);
          }
          setIsGenerating(false);
          return;
        }
      } catch {
        // Fallback smoothly to deterministic tactical engine
      }
    }

    // Local Tactical Engine evaluation
    const evaluated = evaluateFreeTextTurn({
      userMessage: trimmed,
      scenario: currentScenario,
      persona: currentPersona,
      difficulty: currentDifficulty,
      currentReceptivity: receptivity,
      turnNumber: currentTurn,
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      turnNumber: currentTurn,
      receptivityAfter: evaluated.newReceptivity,
      delta: evaluated.receptivityDelta,
      tacticalNote: evaluated.tacticalNote,
      strategyTag: 'Réponse libre',
      isTrap: evaluated.receptivityDelta < 0,
    };

    const interMsg: ChatMessage = {
      id: `inter-${Date.now() + 1}`,
      sender: 'interlocutor',
      text: evaluated.reply,
      turnNumber: currentTurn,
      receptivityAfter: evaluated.newReceptivity,
    };

    setMessages((prev) => [...prev, userMsg, interMsg]);
    setReceptivity(evaluated.newReceptivity);
    setLastDelta(evaluated.receptivityDelta);
    setStatusLabel(evaluated.statusLabel);
    setDynamicHint(evaluated.nextHint);
    setDynamicStarter(evaluated.suggestedStarter);
    setCurrentTurn((prev) => prev + 1);
    setUserInput('');
    setIsGenerating(false);

    if (autoSpeakReplies) {
      speakText(evaluated.reply);
    }
  };

  // Trigger tactical debriefing
  const handleFinishAndDebrief = async () => {
    setIsDebriefLoading(true);
    setPhase('debrief');

    const localReport = buildLocalDebriefReport({
      scenario: currentScenario,
      customContext: customSituation.trim() || undefined,
      persona: currentPersona,
      difficulty: currentDifficulty,
      finalReceptivity: receptivity,
      history: messages,
    });

    if (engineMode === 'ai' && serverAiAvailable && messages.length >= 3) {
      try {
        const res = await fetch('/api/debrief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenarioTitle:
              selectedScenarioId === 'custom' && customSituation.trim()
                ? customSituation.trim()
                : currentScenario.title,
            scenarioContext: currentScenario.contextDescription,
            personaName: currentPersona.name,
            difficulty: currentDifficulty.name,
            history: messages.map((m) => ({ sender: m.sender, text: m.text })),
            finalReceptivity: receptivity,
          }),
        });
        if (res.ok) {
          const aiDebrief = await res.json();
          if (aiDebrief && typeof aiDebrief.score === 'number') {
            setDebriefReport(aiDebrief);
            setIsDebriefLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to local report
      }
    }

    setDebriefReport(localReport);
    setIsDebriefLoading(false);
  };

  // Voice training (Web Speech API)
  const handleToggleVoiceInput = () => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    if (!SpeechRecognitionAPI) {
      // Provide simulated voice dictation fallback so the user can test oral phrasing immediately
      const fallbackPhrase =
        dynamicStarter ||
        activeTurnData?.suggestedStarter ||
        'Au vu des résultats chiffrés obtenus sur ce dossier, comment pouvons-nous formaliser cet accord par écrit ?';
      setUserInput(fallbackPhrase);
      setVoiceFeedback(
        'Dictée vocale assistée : phrase tactique transcrite dans le champ (votre navigateur restreint l’API micro directe).'
      );
      setTimeout(() => setVoiceFeedback(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('Micro actif — Parlez naturellement comme face à votre interlocuteur...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setUserInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setVoiceFeedback('Réponse vocale transcrite avec succès.');
          setTimeout(() => setVoiceFeedback(null), 3000);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        const fallbackPhrase =
          dynamicStarter ||
          activeTurnData?.suggestedStarter ||
          'En nous appuyant sur ces chiffres concrets, quelle option préférez-vous retenir ?';
        setUserInput((prev) => prev || fallbackPhrase);
        setVoiceFeedback(
          'Accès micro bloqué par le cadre navigateur — Amorce orale insérée pour continuer l’entraînement.'
        );
        setTimeout(() => setVoiceFeedback(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Copy Cheat Sheet to Clipboard
  const handleCopyCheatSheet = () => {
    if (!debriefReport) return;
    const content = [
      `FICHE ANTI-SÈCHE NÉGOCOACH — ${currentScenario.title.toUpperCase()}`,
      `Profil affronté : ${currentPersona.name} (${currentDifficulty.name})`,
      `Note : ${debriefReport.score}/100 · Verdict : ${debriefReport.verdict}`,
      '',
      '--- LES 3 PHRASES CLÉS À RESSORTIR LE JOUR J ---',
      ...debriefReport.cheatSheetPhrases.map(
        (item, idx) =>
          `${idx + 1}. [${item.context}]\n   ${item.phrase}\n   Pourquoi ça marche : ${item.whyItWorks}`
      ),
      '',
      '--- POINTS FORTS ---',
      ...debriefReport.strengths.map((s) => `+ ${s}`),
      '',
      '--- PIÈGES À ÉVITER ---',
      ...debriefReport.traps.map((t) => `! ${t}`),
    ].join('\n');

    navigator.clipboard?.writeText(content);
    setCopiedCheatSheet(true);
    setTimeout(() => setCopiedCheatSheet(false), 3000);
  };

  const handleDownloadCheatSheet = () => {
    if (!debriefReport) return;
    const content = [
      `================================================================`,
      `CARTE ANTI-SÈCHE NÉGOCOACH (ALPHABETTE)`,
      `Scénario : ${currentScenario.title}`,
      `Interlocuteur : ${currentPersona.name} · Difficulté : ${currentDifficulty.name}`,
      `Score obtenu : ${debriefReport.score}/100 — ${debriefReport.verdict}`,
      `================================================================`,
      '',
      `SYNTHÈSE :`,
      debriefReport.verdictSummary,
      '',
      `LES 3 MEILLEURES PHRASES POUR LE JOUR J :`,
      ...debriefReport.cheatSheetPhrases.map(
        (p, i) =>
          `\n0${i + 1}. ${p.context}\n    ${p.phrase}\n    Levier : ${p.whyItWorks}`
      ),
      '',
      `VOS 2 POINTS FORTS :`,
      ...debriefReport.strengths.map((s) => `- ${s}`),
      '',
      `LES 2 PIÈGES À DÉJOUER :`,
      ...debriefReport.traps.map((t) => `- ${t}`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Carte-Anti-Seche-NegoCoach.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Text content provider for DoubleHeader text-to-speech button
  const getReadablePageContent = (): string => {
    if (phase === 'setup') {
      return `NégoCoach, simulateur d'entraînement rapide à la négociation. Scénario sélectionné : ${currentScenario.title}. Profil de l'interlocuteur : ${currentPersona.name}. Difficulté : ${currentDifficulty.name}. Cliquez sur Lancer la simulation pour démarrer.`;
    }
    if (phase === 'chat') {
      const lastMsg = messages[messages.length - 1];
      return `Négociation en cours. Réceptivité actuelle de l'interlocuteur : ${receptivity} pour cent. ${statusLabel}. Dernière réplique : ${
        lastMsg ? lastMsg.text : ''
      }. Conseil du souffleur : ${dynamicHint}`;
    }
    if (phase === 'debrief' && debriefReport) {
      return `Débriefing tactique NégoCoach. Note obtenue : ${debriefReport.score} sur 100. Verdict : ${debriefReport.verdict}. ${debriefReport.verdictSummary}. Première phrase clé de votre carte anti-sèche : ${debriefReport.cheatSheetPhrases[0]?.phrase || ''}`;
    }
    return 'NégoCoach, simulateur de négociation.';
  };

  const completedUserTurns = messages.filter((m) => m.sender === 'user').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* RÈGLE OBLIGATOIRE : Double Barre Alphabette (Style Info Perso) */}
      <DoubleHeader
        isDark={isDark}
        onToggleDark={() => setIsDark((prev) => !prev)}
        isBigMode={isBigMode}
        onToggleBigMode={() => setIsBigMode((prev) => !prev)}
        isSimpleMode={isSimpleMode}
        onToggleSimpleMode={() => setIsSimpleMode((prev) => !prev)}
        showBackButton={phase !== 'setup'}
        onBackToHome={() => setPhase('setup')}
        getReadableContent={getReadablePageContent}
      />

      {/* CORPS PRINCIPAL — Isolé pour le mode BIG */}
      <main
        className={`flex-1 w-full max-w-[1160px] mx-auto px-4 sm:px-6 py-6 sm:py-8 ${
          isBigMode ? 'nego-big-mode' : ''
        }`}
      >
        {/* Bandeau supérieur discret du cabinet de conseil */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-200 dark:border-slate-800/80 no-print">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Confidentialité totale : zéro compte, zéro stockage serveur
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Moteur actif :{' '}
              <strong className="text-slate-900 dark:text-slate-200">
                {engineMode === 'demo'
                  ? 'Mode Démo Tactique (4 tours · Sans clé)'
                  : serverAiAvailable
                  ? 'IA Temps Réel (Gemini)'
                  : 'Mode Tactique Autonome'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Boutons d'accès direct aux 2 scénarios Démo obligatoires */}
            {phase !== 'setup' && (
              <button
                type="button"
                onClick={() => setPhase('setup')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-colors"
              >
                Changer de scénario
              </button>
            )}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500/50 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Paramètres & Mode</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            VUE 1 : CONFIGURATION EXPRESS EN 3 CLICS
        =================================================================== */}
        {phase === 'setup' && (
          <div className="space-y-8">
            {/* En-tête éditorial sobre */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide">
                  Préparation tactique en 5 minutes
                </p>
                <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance nego-text-scale-xl">
                  Entraînez-vous face à un interlocuteur coriace avant le jour J.
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed nego-text-scale-base">
                  Configurez votre situation en 3 clics, testez vos arguments face à un profil
                  psychologique réaliste et repartez avec votre <strong>Carte Anti-Sèche</strong>.
                </p>
              </div>

              {/* Accès instantané 1-clic aux 2 scénarios Démo obligatoires */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedScenarioId('augmentation-10');
                    startSimulation('augmentation-10');
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600/10 dark:bg-emerald-500/10 border border-emerald-600/30 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-600/20 cursor-pointer transition-colors whitespace-nowrap"
                >
                  ▶ Démo 1 : Augmentation +10%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedScenarioId('voiture-occasion');
                    startSimulation('voiture-occasion');
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 cursor-pointer transition-colors whitespace-nowrap"
                >
                  ▶ Démo 2 : Voiture d’occasion
                </button>
              </div>
            </div>

            {/* ÉTAPE 1 : CHOIX DU SCÉNARIO (4 presets + 1 champ libre) */}
            <section aria-labelledby="step-1-heading" className="space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2
                  id="step-1-heading"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white nego-text-scale-lg"
                >
                  01. Choisissez votre terrain de négociation
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  4 scénarios calibrés + 1 mode libre
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SCENARIOS.map((scen) => {
                  const isSelected = selectedScenarioId === scen.id;
                  return (
                    <button
                      key={scen.id}
                      type="button"
                      onClick={() => setSelectedScenarioId(scen.id)}
                      className={`text-left p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Unboxed clean metadata line (Zero-Pill Discipline) */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {scen.stakeLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{scen.durationLabel}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug nego-text-scale-base">
                          {scen.title}
                        </h3>
                        {!isSimpleMode && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {scen.contextDescription}
                          </p>
                        )}
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Face à : {scen.interlocutorRole}</span>
                        {isSelected && (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            Sélectionné ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* 5e carte : Champ libre "Ta situation" */}
                <div
                  onClick={() => setSelectedScenarioId('custom')}
                  className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    selectedScenarioId === 'custom'
                      ? 'bg-white dark:bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                      : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        Sur-mesure
                      </span>
                      <span>·</span>
                      <span>Cas personnel</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Ta situation (Champ libre)
                    </h3>
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={customSituation}
                        onFocus={() => setSelectedScenarioId('custom')}
                        onChange={(e) => {
                          setSelectedScenarioId('custom');
                          setCustomSituation(e.target.value);
                        }}
                        placeholder="Ex: Négocier une rupture conventionnelle..."
                        aria-label="Décris ta situation de négociation"
                        className="w-full px-3 py-2 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-2 focus:outline-amber-500"
                      />
                      <input
                        type="text"
                        value={customObjective}
                        onFocus={() => setSelectedScenarioId('custom')}
                        onChange={(e) => {
                          setSelectedScenarioId('custom');
                          setCustomObjective(e.target.value);
                        }}
                        placeholder="Ton objectif chiffré (ex: 6 000 € d'indemnité)"
                        aria-label="Ton objectif chiffré"
                        className="w-full px-3 py-2 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-2 focus:outline-amber-500"
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>S’adapte à votre contexte</span>
                    {selectedScenarioId === 'custom' && (
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        Sélectionné ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ÉTAPE 2 : PROFIL DE L'INTERLOCUTEUR */}
            <section aria-labelledby="step-2-heading" className="space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2
                  id="step-2-heading"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white nego-text-scale-lg"
                >
                  02. Choisissez le profil psychologique en face de vous
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Adapte les objections et les pièges rhétoriques
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PERSONAS.map((pers) => {
                  const isSelected = selectedPersonaId === pers.id;
                  return (
                    <button
                      key={pers.id}
                      type="button"
                      onClick={() => setSelectedPersonaId(pers.id)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {pers.name}
                          </h3>
                          {isSelected && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              Actif ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                          {pers.archetype}
                        </p>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400 pt-1">
                          {pers.quote}
                        </p>
                      </div>
                      {!isSimpleMode && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-300">Point faible :</strong>{' '}
                          {pers.tacticalWeakness}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ÉTAPE 3 : NIVEAU DE DIFFICULTÉ & LANCEMENT */}
            <section
              aria-labelledby="step-3-heading"
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <h2
                  id="step-3-heading"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white nego-text-scale-lg"
                >
                  03. Niveau de résistance de l’interlocuteur
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {DIFFICULTIES.map((diff) => {
                    const isSelected = selectedDifficultyId === diff.id;
                    return (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => setSelectedDifficultyId(diff.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-emerald-950/60 border-slate-900 dark:border-emerald-500 text-white'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">{diff.name}</span>
                          <span className="text-xs font-mono-tabular opacity-80">
                            Départ {diff.initialReceptivity}%
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {diff.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => startSimulation()}
                  className="px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2.5 cursor-pointer transition-all whitespace-nowrap"
                >
                  <span>Entrer dans la négociation</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400 text-center lg:text-right">
                  Objectif : atteindre {currentDifficulty.approvalThreshold}% de réceptivité en 4 tours
                </span>
              </div>
            </section>
          </div>
        )}

        {/* ===================================================================
            VUE 2 : SALLE DE NÉGOCIATION & JAUGE DE RÉCEPTIVITÉ EN DIRECT
        =================================================================== */}
        {phase === 'chat' && (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* BARRE SUPÉRIEURE DU CHAT : Jauge de Réceptivité en direct (0 à 100%) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                    {selectedScenarioId === 'custom' && customSituation.trim()
                      ? customSituation.trim()
                      : currentScenario.title}
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                    · Face à <strong>{currentPersona.name}</strong> ({currentDifficulty.name})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoSpeakReplies((prev) => !prev)}
                    aria-pressed={autoSpeakReplies}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                      autoSpeakReplies
                        ? 'bg-emerald-600/15 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {autoSpeakReplies ? (
                      <Volume2 className="w-3.5 h-3.5" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5" />
                    )}
                    <span>Voix auto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinishAndDebrief}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Terminer & Débriefer
                  </button>
                </div>
              </div>

              {/* Jauge de Réceptivité 0-100% */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Jauge de Réceptivité :
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-tabular">
                    {lastDelta !== null && (
                      <span
                        className={`text-xs font-bold ${
                          lastDelta >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {lastDelta >= 0 ? `+${lastDelta}%` : `${lastDelta}%`}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {receptivity}%
                    </span>
                  </div>
                </div>

                <div className="relative h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      receptivity >= currentDifficulty.approvalThreshold
                        ? 'bg-emerald-500'
                        : receptivity >= 42
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${receptivity}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular">
                  <span>0% (Rupture)</span>
                  <span>Tour {Math.min(currentTurn, 4)} / 4</span>
                  <span>Seuil d’accord : {currentDifficulty.approvalThreshold}%</span>
                </div>
              </div>
            </div>

            {/* FIL DE DISCUSSION */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 max-h-[460px] overflow-y-auto">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
                      <span className="font-semibold">
                        {isUser ? 'Vous' : `${currentPersona.name} (${currentScenario.interlocutorRole})`}
                      </span>
                      {msg.strategyTag && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            {msg.strategyTag}
                          </span>
                        </>
                      )}
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          aria-label="Écouter cette réplique"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          title="Écouter la réplique"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div
                      className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed nego-text-scale-base ${
                        isUser
                          ? 'bg-emerald-700 text-white rounded-br-xs'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/70 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Note d'analyse tactique sous le message de l'utilisateur */}
                    {isUser && showTacticalNotes && msg.tacticalNote && (
                      <div className="max-w-[85%] sm:max-w-[75%] text-xs text-slate-600 dark:text-slate-400 px-2 py-1 flex items-start gap-1.5">
                        {msg.delta !== undefined && msg.delta >= 0 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <span>{msg.tacticalNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {isGenerating && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
                  <span>{currentPersona.name} prépare sa contre-attaque...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* BOUTON SOUFFLEUR TACTIQUE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSouffleurOpen((prev) => !prev)}
                  aria-expanded={souffleurOpen}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    {souffleurOpen
                      ? 'Masquer le Souffleur tactique'
                      : 'Vous séchez ? Ouvrir le Souffleur tactique (1 ligne)'}
                  </span>
                </button>

                {completedUserTurns >= 4 && (
                  <button
                    type="button"
                    onClick={handleFinishAndDebrief}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer animate-bounce"
                  >
                    <Award className="w-4 h-4" />
                    <span>Voir mon Débriefing & ma Carte Anti-Sèche →</span>
                  </button>
                )}
              </div>

              {souffleurOpen && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-800 dark:text-slate-200 text-xs sm:text-sm space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-relaxed">
                      <strong className="text-amber-700 dark:text-amber-400">
                        Conseil du Souffleur :
                      </strong>{' '}
                      {dynamicHint}
                    </p>
                  </div>
                  {dynamicStarter && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-500/20">
                      <span className="text-xs italic text-slate-600 dark:text-slate-300">
                        Amorce suggérée : « {dynamicStarter} »
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUserInput(dynamicStarter);
                          setSouffleurOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400 shrink-0"
                      >
                        Utiliser cette phrase
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* OPTIONS TACTIQUES RAPIDES (Mode Démo 4 tours — Jouables en 1 clic) */}
            {currentTurn <= currentScenario.turns.length && selectedScenarioId !== 'custom' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeTurnData.stageTitle} — Réponses tactiques en 1 clic :
                  </span>
                  <span>Ou répondez librement au micro / clavier ci-dessous</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {activeTurnData.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSelectTacticalChoice(choice)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 text-left flex flex-col justify-between gap-2 cursor-pointer transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {choice.label}
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          « {choice.userText} »
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Jouer cette réplique →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ZONE DE SAISIE LIBRE + ENTRAÎNEMENT VOCAL (Web Speech API) */}
            <form
              onSubmit={handleSendFreeMessage}
              className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
            >
              {voiceFeedback && (
                <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg">
                  🎙️ {voiceFeedback}
                </div>
              )}

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  aria-pressed={isListening}
                  aria-label="Activer le microphone pour répondre à l'oral"
                  title="Répondre à l'oral (Web Speech API)"
                  className={`h-11 px-3.5 rounded-xl border flex items-center gap-1.5 font-semibold text-xs sm:text-sm shrink-0 cursor-pointer transition-all ${
                    isListening
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="hidden sm:inline">Vocal</span>
                    </>
                  )}
                </button>

                <textarea
                  rows={2}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendFreeMessage();
                    }
                  }}
                  placeholder="Formulez votre argument chiffré ou dictez votre réponse au micro..."
                  aria-label="Votre réplique de négociation"
                  className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-2 focus:outline-emerald-500 resize-none"
                />

                <button
                  type="submit"
                  disabled={!userInput.trim() || isGenerating}
                  className="h-11 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                >
                  <span>Répondre</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================================================================
            VUE 3 : DÉBRIEFING TACTIQUE & CARTE ANTI-SÈCHE JOUR J
        =================================================================== */}
        {phase === 'debrief' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {isDebriefLoading || !debriefReport ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Analyse tactique de vos échanges en cours...
                </p>
              </div>
            ) : (
              <>
                {/* BLOC 1 : NOTE /100 & VERDICT */}
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Rapport de débriefing NégoCoach</span>
                      <span>·</span>
                      <span>{currentScenario.title}</span>
                      <span>·</span>
                      <span>Face à {currentPersona.name}</span>
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      Verdict :{' '}
                      <span
                        className={
                          debriefReport.verdict.includes('Accord')
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : debriefReport.verdict.includes('Compromis')
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {debriefReport.verdict}
                      </span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {debriefReport.verdictSummary}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shrink-0 min-w-[160px]">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Note de négociation
                    </div>
                    <div className="text-4xl sm:text-5xl font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400 mt-1">
                      {debriefReport.score}
                      <span className="text-lg text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono-tabular">
                      Réceptivité finale : {receptivity}%
                    </div>
                  </div>
                </div>

                {/* BLOC 2 : 2 POINTS FORTS & 2 PIÈGES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 2 Points forts */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <h2>2 Points forts démontrés</h2>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                      {debriefReport.strengths.slice(0, 2).map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 leading-relaxed"
                        >
                          <strong className="text-emerald-700 dark:text-emerald-400">
                            0{idx + 1}.
                          </strong>{' '}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 2 Pièges observés / Zones de vigilance */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <h2>2 Pièges & Points de vigilance</h2>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                      {debriefReport.traps.slice(0, 2).map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 leading-relaxed"
                        >
                          <strong className="text-amber-700 dark:text-amber-400">
                            0{idx + 1}.
                          </strong>{' '}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* BLOC 3 : CARTE ANTI-SÈCHE JOUR J (3 meilleures phrases copiables/exportables) */}
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-lg">
                        <FileText className="w-5 h-5 shrink-0" />
                        <h2>Votre Carte Anti-Sèche pour le Jour J</h2>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        Gardez ces 3 formulations sous les yeux pendant votre véritable entretien.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 no-print">
                      <button
                        type="button"
                        onClick={handleCopyCheatSheet}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedCheatSheet ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Fiche copiée !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copier la fiche</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadCheatSheet}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exporter (.txt)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Imprimer</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {debriefReport.cheatSheetPhrases.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                            0{index + 1}. {item.context}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(item.phrase);
                              setCopiedPhraseIndex(index);
                              setTimeout(() => setCopiedPhraseIndex(null), 2000);
                            }}
                            className="text-xs font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer no-print"
                          >
                            {copiedPhraseIndex === index ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier la phrase</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                          {item.phrase}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Pourquoi ça marche :</strong> {item.whyItWorks}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOUTONS D'ACTION FINAUX */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 no-print">
                  <button
                    type="button"
                    onClick={() => startSimulation()}
                    className="px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Rejouer ce scénario pour améliorer mon score</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhase('setup')}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Tester un autre profil ou scénario</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* PIED DE PAGE DISCRET OBLIGATOIRE */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 py-5 px-4 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 no-print">
        <p>
          Propulsé par{' '}
          <a
            href="https://alphabette.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-700 dark:text-slate-200 hover:underline"
          >
            Alphabette
          </a>{' '}
          — Envie d’explorer plusieurs points de vue ? Découvre{' '}
          <a
            href="https://iadebat.alphabette.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            IADébat
          </a>
          .
        </p>
      </footer>

      {/* MODALE PARAMÈTRES & MOTEUR DE SIMULATION */}
      {settingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 id="settings-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Paramètres de simulation
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Fermer les paramètres"
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Mode de moteur conversationnel
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setEngineMode('demo')}
                    className={`p-3 rounded-xl border text-left cursor-pointer ${
                      engineMode === 'demo'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-white">
                      Mode Démo Tactique (Sans clé API · 100% autonome)
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      4 tours scénarisés avec choix tactiques + analyseur rhétorique local instantané.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEngineMode('ai')}
                    className={`p-3 rounded-xl border text-left cursor-pointer ${
                      engineMode === 'ai'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-white">
                      Mode IA Dynamique (Serveur Gemini)
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Génération en direct via le serveur sécurisé avec bascule automatique sur le moteur tactique.
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-300">
                    Lecture vocale automatique des répliques
                  </span>
                  <input
                    type="checkbox"
                    checked={autoSpeakReplies}
                    onChange={(e) => setAutoSpeakReplies(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-300">
                    Afficher les notes d’analyse sous chaque tour
                  </span>
                  <input
                    type="checkbox"
                    checked={showTacticalNotes}
                    onChange={(e) => setShowTacticalNotes(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Zéro donnée envoyée ou conservée sur serveur.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.clear();
                    } catch {
                      // ignore
                    }
                    setMessages([]);
                    setPhase('setup');
                    setSettingsOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purger la session locale</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold cursor-pointer hover:bg-emerald-500"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
