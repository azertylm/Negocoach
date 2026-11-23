import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Crown,
  Heart,
  BarChart2,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  MoreHorizontal,
  ArrowLeft,
  Star,
  X,
  Check,
} from 'lucide-react';

interface SuiteApp {
  id: string;
  name: string;
  desc: string;
  url: string;
  isNew?: boolean;
}

const SUITE_APPS: SuiteApp[] = [
  {
    id: 'negocoach',
    name: 'NégoCoach',
    desc: 'Simulateur d’entraînement rapide aux négociations à fort enjeu avec débriefing.',
    url: 'https://negocoach.alphabette.fr',
    isNew: true,
  },
  {
    id: 'iadebat',
    name: 'IADébat',
    desc: 'Explorez plusieurs angles d’argumentation et confrontez les points de vue.',
    url: 'https://iadebat.alphabette.fr',
    isNew: true,
  },
  {
    id: 'infoperso',
    name: 'Info Perso',
    desc: 'Tableau de bord citoyen, démarches essentielles et veille quotidienne claire.',
    url: 'https://infoperso.alphabette.fr',
    isNew: false,
  },
  {
    id: 'courrierjuste',
    name: 'CourrierJuste',
    desc: 'Rédaction assistée de courriers administratifs, mises en demeure et réclamations.',
    url: 'https://courrier.alphabette.fr',
    isNew: true,
  },
  {
    id: 'budgetclair',
    name: 'BudgetClair',
    desc: 'Diagnostic rapide de vos abonnements et optimisation de votre reste à vivre.',
    url: 'https://budget.alphabette.fr',
    isNew: false,
  },
  {
    id: ' memodroit',
    name: 'MémoDroit',
    desc: 'Vos droits essentiels (logement, travail, consommation) expliqués en français simple.',
    url: 'https://memodroit.alphabette.fr',
    isNew: false,
  },
];

interface DoubleHeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  isBigMode: boolean;
  onToggleBigMode: () => void;
  isSimpleMode: boolean;
  onToggleSimpleMode: () => void;
  showBackButton?: boolean;
  onBackToHome: () => void;
  getReadableContent: () => string;
}

export const DoubleHeader: React.FC<DoubleHeaderProps> = ({
  isDark,
  onToggleDark,
  isBigMode,
  onToggleBigMode,
  isSimpleMode,
  onToggleSimpleMode,
  showBackButton = false,
  onBackToHome,
  getReadableContent,
}) => {
  const [activeModal, setActiveModal] = useState<
    null | 'all-apps' | 'new-apps' | 'subscription' | 'donate' | 'install' | 'feedback' | 'language'
  >(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alphabette_negocoach_pinned') === 'true';
    } catch {
      return false;
    }
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('alphabette_suite_favorites');
      return saved ? JSON.parse(saved) : ['negocoach', 'iadebat'];
    } catch {
      return ['negocoach', 'iadebat'];
    }
  });
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedLang, setSelectedLang] = useState<'FR' | 'EN' | 'ES'>('FR');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const toggleFavorite = (appId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId];
      try {
        localStorage.setItem('alphabette_suite_favorites', JSON.stringify(next));
      } catch {
        // ignore storage error
      }
      return next;
    });
  };

  const togglePinApp = () => {
    const next = !isPinned;
    setIsPinned(next);
    try {
      localStorage.setItem('alphabette_negocoach_pinned', String(next));
    } catch {
      // ignore
    }
    showToast(next ? '⭐ NégoCoach a été épinglé en favori.' : 'Épinglage retiré.');
    setMenuOpen(false);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      showToast('La synthèse vocale n’est pas supportée sur ce navigateur.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = getReadableContent();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full no-print select-none shadow-sm">
        {/* 1. BARRE SUPÉRIEURE (Top Bar Écosystème) — Dimensions fixes en px */}
        <div className="bg-[#182334] dark:bg-[#0b1220] text-white h-[46px] sm:h-[50px] px-[10px] sm:px-[16px] flex items-center justify-between gap-[6px] flex-nowrap border-b border-white/10">
          {/* Bloc de gauche */}
          <div className="flex items-center gap-[6px] sm:gap-[10px] min-w-0 flex-nowrap">
            {/* 1. Logo + Nom alphabette */}
            <a
              href="https://alphabette.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[6px] shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 rounded-[8px] py-[2px]"
              aria-label="Portail principal alphabette.fr"
            >
              <span className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] rounded-[8px] bg-[#3355d1] flex items-center justify-center text-white font-bold text-[15px] sm:text-[16px] leading-none shadow-xs">
                a
              </span>
              <span className="font-bold lowercase text-[15px] sm:text-[17px] tracking-tight text-white">
                alphabette
              </span>
            </a>

            {/* 2. Bouton .eu */}
            <a
              href="https://alphabette.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[12px] sm:text-[13px] font-semibold text-white shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
              aria-label="Laboratoire européen alphabette.eu"
              title="Laboratoire alphabette.eu"
            >
              .eu
            </a>

            {/* 3. Bouton Toutes les applis */}
            <button
              type="button"
              onClick={() => setActiveModal('all-apps')}
              aria-label="Toutes les applis de la suite Alphabette"
              className="w-[34px] h-[34px] sm:w-auto sm:h-[36px] sm:px-[10px] rounded-[9px] sm:rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center gap-[6px] text-white shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <LayoutGrid className="w-[17px] h-[17px] shrink-0" />
              <span className="hidden sm:inline text-[12.5px] font-medium whitespace-nowrap">
                Toutes les applis
              </span>
            </button>

            {/* 4. Bouton NEW */}
            <button
              type="button"
              onClick={() => setActiveModal('new-apps')}
              aria-label="Voir les nouveautés de la suite Alphabette"
              className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <span className="rounded-[4px] bg-gradient-to-r from-sky-200 to-sky-400 text-[#0f172a] text-[9px] font-extrabold uppercase px-[4px] py-[1.5px] leading-none tracking-tight">
                NEW
              </span>
            </button>
          </div>

          {/* Bloc de droite : 5. Bouton Abonnement */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setActiveModal('subscription')}
              aria-label="Informations sur l'abonnement Alphabette"
              className="h-[34px] sm:h-[36px] px-[10px] sm:px-[14px] rounded-full bg-white/10 hover:bg-white/15 border-[1.5px] border-[#f59e0b] flex items-center gap-[5px] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <Crown className="w-[14px] h-[14px] text-[#f59e0b] shrink-0" />
              <span className="text-[12.5px] sm:text-[13.5px] font-bold text-[#fbbf24] whitespace-nowrap">
                Abonnement
              </span>
            </button>
          </div>
        </div>

        {/* 2. BARRE INFÉRIEURE (Barre d’Application & Accessibilité) — Dimensions fixes en px */}
        <div className="bg-[#ffffff] dark:bg-[#0f172a] border-b border-[#e2e8f0] dark:border-[#334155] h-[54px] sm:h-[58px] px-[10px] sm:px-[16px] flex items-center justify-between gap-[6px] flex-nowrap">
          {/* Bloc de gauche : Application active */}
          <div className="min-w-0 flex-1 flex items-center gap-[6px] sm:gap-[8px]">
            {showBackButton && (
              <button
                type="button"
                onClick={onBackToHome}
                aria-label="Retour à la configuration de négociation"
                className="w-[34px] h-[34px] rounded-full bg-[#f1f5f9] dark:bg-[#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] flex items-center justify-center text-[#334155] dark:text-[#e2e8f0] shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500"
              >
                <ArrowLeft className="w-[16px] h-[16px]" />
              </button>
            )}
            <button
              type="button"
              onClick={onBackToHome}
              className="min-w-0 text-left flex flex-col justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 rounded-[4px]"
              aria-label="NégoCoach — Retour à l'accueil"
            >
              <div className="flex items-center gap-[5px] min-w-0">
                <span className="font-bold text-[#3f51b5] dark:text-[#ffffff] text-[14.5px] sm:text-[20px] tracking-tight truncate leading-tight">
                  NégoCoach
                </span>
                {isPinned && (
                  <Star
                    className="w-[13px] h-[13px] text-[#f59e0b] fill-[#f59e0b] shrink-0"
                    aria-label="Application épinglée"
                  />
                )}
              </div>
              <span className="text-[9px] sm:text-[10.5px] uppercase tracking-[0.04em] text-[#64748b] dark:text-[#94a3b8] truncate leading-tight">
                SIMULATEUR DE NÉGOCIATION
              </span>
            </button>
          </div>

          {/* Bloc de droite : 5 boutons d'action stricts */}
          <div className="flex items-center gap-[4px] sm:gap-[7px] shrink-0">
            {/* 1. Bouton Don */}
            <button
              type="button"
              onClick={() => setActiveModal('donate')}
              aria-label="Soutenir le projet Alphabette par un don"
              className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] sm:rounded-[11px] bg-[#db2777] hover:bg-[#be185d] flex items-center justify-center text-white shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-pink-500"
            >
              <Heart className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] fill-white text-white" />
            </button>

            {/* 2. Bouton BIG */}
            <button
              type="button"
              onClick={onToggleBigMode}
              aria-pressed={isBigMode}
              aria-label="Activer ou désactiver le mode grand texte BIG"
              className={`h-[34px] sm:h-[38px] px-[8px] sm:px-[11px] rounded-[10px] sm:rounded-[11px] flex items-center gap-[4px] text-white font-bold shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                isBigMode
                  ? 'bg-[#312e81] ring-2 ring-[#818cf8]'
                  : 'bg-[#4338ca] hover:bg-[#3730a3]'
              }`}
            >
              <BarChart2 className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px] shrink-0" />
              <span className="text-[12px] sm:text-[14px] font-bold tracking-tight leading-none">
                BIG
              </span>
            </button>

            {/* 3. Bouton Mode Nuit / Jour */}
            <button
              type="button"
              onClick={onToggleDark}
              aria-label={isDark ? 'Passer en mode jour (clair)' : 'Passer en mode nuit (sombre)'}
              className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-[#f1f5f9] dark:bg-[#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] border border-[#e2e8f0] dark:border-[#334155] flex items-center justify-center shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              {isDark ? (
                <Sun className="w-[17px] h-[17px] text-[#fbbf24]" />
              ) : (
                <Moon className="w-[17px] h-[17px] text-[#334155]" />
              )}
            </button>

            {/* 4. Bouton Lecture à haute voix */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              aria-pressed={isSpeaking}
              aria-label={
                isSpeaking
                  ? 'Arrêter la lecture à haute voix'
                  : 'Lire le contenu principal à haute voix'
              }
              className={`w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                isSpeaking
                  ? 'bg-[#047857] border-[#059669] text-white'
                  : 'bg-[#f1f5f9] dark:bg-[#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] border-[#e2e8f0] dark:border-[#334155] text-[#334155] dark:text-[#e2e8f0]'
              }`}
            >
              {isSpeaking ? (
                <VolumeX className="w-[17px] h-[17px]" />
              ) : (
                <Volume2 className="w-[17px] h-[17px]" />
              )}
            </button>

            {/* 5. Bouton Plus d'options (...) */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Plus d'options et paramètres d'accessibilité"
                className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-[#f1f5f9] dark:bg-[#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] border border-[#e2e8f0] dark:border-[#334155] flex items-center justify-center text-[#334155] dark:text-[#e2e8f0] shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500"
              >
                <MoreHorizontal className="w-[17px] h-[17px]" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Menu d'options Alphabette"
                  className="absolute right-0 mt-[8px] w-[260px] rounded-[12px] bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#334155] shadow-xl py-[6px] z-50 text-[14px] text-[#0f172a] dark:text-[#f8fafc]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={togglePinApp}
                    className="w-full px-[14px] py-[10px] text-left hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>⭐ Épingler cette appli</span>
                    {isPinned && <Check className="w-[15px] h-[15px] text-emerald-500" />}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('subscription');
                    }}
                    className="w-full px-[14px] py-[10px] text-left hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>👤 Mon inscription</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onToggleSimpleMode();
                      setMenuOpen(false);
                      showToast(
                        !isSimpleMode
                          ? '🧘 Mode simple activé : interface épurée et confort agrandi.'
                          : 'Mode standard rétabli.'
                      );
                    }}
                    className="w-full px-[14px] py-[10px] text-left hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>🧘 Mode simple</span>
                    {isSimpleMode && <Check className="w-[15px] h-[15px] text-emerald-500" />}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('install');
                    }}
                    className="w-full px-[14px] py-[10px] text-left hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>📱 Installer sur mon téléphone</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setFeedbackSent(false);
                      setActiveModal('feedback');
                    }}
                    className="w-full px-[14px] py-[10px] text-left hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>💬 Donner mon avis</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      window.print();
                    }}
                    className="w-full px-[14px] py-[10px] text-left hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>🖨️ Imprimer</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('language');
                    }}
                    className="w-full px-[14px] py-[10px] text-left hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>🌐 Langue</span>
                    <span className="text-[12px] font-bold text-[#64748b] dark:text-[#94a3b8]">
                      {selectedLang}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Toast de confirmation non-intrusif */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-[20px] right-[20px] z-50 bg-[#0f172a] text-white border border-[#334155] px-[16px] py-[10px] rounded-[10px] shadow-lg text-[14px] font-medium"
        >
          {toastMessage}
        </div>
      )}

      {/* MODALE : Toutes les applis */}
      {activeModal === 'all-apps' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-all-apps-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-[16px]"
        >
          <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#334155] rounded-[16px] max-w-[480px] w-full p-[20px] shadow-2xl text-[#0f172a] dark:text-[#f8fafc]">
            <div className="flex items-center justify-between pb-[12px] border-b border-[#e2e8f0] dark:border-[#1e293b]">
              <h2 id="modal-all-apps-title" className="text-[18px] font-bold">
                Toutes les applis Alphabette
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Fermer la fenêtre"
                className="w-[32px] h-[32px] rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-center cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8] mt-[10px] mb-[14px]">
              Cliquez sur l’étoile à droite d’une application pour la conserver dans vos favoris.
            </p>
            <div className="space-y-[8px] max-h-[320px] overflow-y-auto pr-[4px]">
              {SUITE_APPS.map((app) => {
                const isFav = favorites.includes(app.id);
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-[12px] p-[12px] rounded-[10px] bg-[#f8fafc] dark:bg-[#1e293b]/60 border border-[#e2e8f0] dark:border-[#334155]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-[8px]">
                        <span className="font-bold text-[15px]">{app.name}</span>
                        {app.isNew && (
                          <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                            · Nouveauté
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8] mt-[2px]">
                        {app.desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(app.id)}
                      aria-label={
                        isFav ? `Retirer ${app.name} des favoris` : `Ajouter ${app.name} aux favoris`
                      }
                      className="text-[20px] px-[6px] py-[4px] cursor-pointer shrink-0"
                    >
                      {isFav ? '⭐' : '☆'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-[16px] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-[16px] py-[8px] rounded-[8px] bg-[#182334] dark:bg-[#1e293b] text-white text-[14px] font-semibold cursor-pointer hover:opacity-90"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : Nouveautés (NEW) */}
      {activeModal === 'new-apps' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-new-apps-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-[16px]"
        >
          <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#334155] rounded-[16px] max-w-[460px] w-full p-[20px] shadow-2xl text-[#0f172a] dark:text-[#f8fafc]">
            <div className="flex items-center justify-between pb-[12px] border-b border-[#e2e8f0] dark:border-[#1e293b]">
              <h2 id="modal-new-apps-title" className="text-[18px] font-bold">
                Nouveautés de la suite Alphabette
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Fermer la fenêtre"
                className="w-[32px] h-[32px] rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-center cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            <div className="space-y-[10px] mt-[14px]">
              {SUITE_APPS.filter((a) => a.isNew).map((app) => {
                const isFav = favorites.includes(app.id);
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-[12px] p-[12px] rounded-[10px] bg-[#f8fafc] dark:bg-[#1e293b]/60 border border-[#e2e8f0] dark:border-[#334155]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[15px]">{app.name}</div>
                      <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8] mt-[2px]">
                        {app.desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(app.id)}
                      aria-label={
                        isFav ? `Retirer ${app.name} des favoris` : `Ajouter ${app.name} aux favoris`
                      }
                      className="text-[20px] px-[6px] py-[4px] cursor-pointer shrink-0"
                    >
                      {isFav ? '⭐' : '☆'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-[16px] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-[16px] py-[8px] rounded-[8px] bg-[#182334] dark:bg-[#1e293b] text-white text-[14px] font-semibold cursor-pointer hover:opacity-90"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : Abonnement (7 mai — 15 € / 40 €) */}
      {activeModal === 'subscription' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sub-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-[16px]"
        >
          <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#334155] rounded-[16px] max-w-[460px] w-full p-[22px] shadow-2xl text-[#0f172a] dark:text-[#f8fafc]">
            <div className="flex items-center justify-between pb-[12px] border-b border-[#e2e8f0] dark:border-[#1e293b]">
              <div className="flex items-center gap-[8px]">
                <Crown className="w-[20px] h-[20px] text-[#f59e0b]" />
                <h2 id="modal-sub-title" className="text-[18px] font-bold">
                  Abonnement Écosystème Alphabette
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Fermer la fenêtre"
                className="w-[32px] h-[32px] rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-center cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            <div className="mt-[14px] space-y-[12px] text-[14px] leading-relaxed">
              <p className="font-semibold text-[#0f172a] dark:text-white">
                Lancement de l’abonnement payant le 7 mai au tarif de 15 € / an pour une appli, ou
                40 € / an pour toutes les applis.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] pt-[4px]">
                <div className="p-[14px] rounded-[12px] bg-[#f8fafc] dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155]">
                  <div className="text-[12px] text-[#64748b] dark:text-[#94a3b8]">Formule Solo</div>
                  <div className="text-[22px] font-bold text-[#0f172a] dark:text-white mt-[2px]">
                    15 € <span className="text-[13px] font-normal">/ an</span>
                  </div>
                  <p className="text-[12.5px] text-[#64748b] dark:text-[#94a3b8] mt-[4px]">
                    Accès complet à 1 application au choix pendant 12 mois.
                  </p>
                </div>
                <div className="p-[14px] rounded-[12px] bg-amber-500/10 border border-[#f59e0b]">
                  <div className="text-[12px] font-semibold text-amber-600 dark:text-amber-400">
                    Pass Intégral Suite
                  </div>
                  <div className="text-[22px] font-bold text-[#0f172a] dark:text-white mt-[2px]">
                    40 € <span className="text-[13px] font-normal">/ an</span>
                  </div>
                  <p className="text-[12.5px] text-[#64748b] dark:text-[#94a3b8] mt-[4px]">
                    Accès illimité aux 15 applications web & mobiles Alphabette.
                  </p>
                </div>
              </div>
              <p className="text-[12.5px] text-[#64748b] dark:text-[#94a3b8]">
                Un seul compte unifié (Single Sign-On) pour l’ensemble de vos outils sur le web et
                Google Play, sans publicité ni revente de données.
              </p>
            </div>
            <div className="mt-[18px] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-[16px] py-[8px] rounded-[8px] bg-[#f59e0b] text-[#0f172a] text-[14px] font-bold cursor-pointer hover:bg-[#d97706]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : Don / Soutien */}
      {activeModal === 'donate' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-donate-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-[16px]"
        >
          <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#334155] rounded-[16px] max-w-[420px] w-full p-[20px] shadow-2xl text-[#0f172a] dark:text-[#f8fafc]">
            <div className="flex items-center justify-between pb-[12px] border-b border-[#e2e8f0] dark:border-[#1e293b]">
              <div className="flex items-center gap-[8px]">
                <Heart className="w-[18px] h-[18px] text-[#db2777] fill-[#db2777]" />
                <h2 id="modal-donate-title" className="text-[18px] font-bold">
                  Soutenir l’écosystème Alphabette
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Fermer la fenêtre"
                className="w-[32px] h-[32px] rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-center cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            <p className="text-[14px] text-[#475569] dark:text-[#cbd5e1] mt-[12px] leading-relaxed">
              NégoCoach est conçu dans une démarche d’intérêt citoyen : zéro traçage publicitaire,
              zéro stockage serveur de vos conversations privées. Votre soutien finance
              l’hébergement souverain en Europe.
            </p>
            <div className="mt-[16px] flex items-center justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-[14px] py-[8px] rounded-[8px] border border-[#cbd5e1] dark:border-[#334155] text-[14px] font-medium cursor-pointer"
              >
                Fermer
              </button>
              <a
                href="https://alphabette.fr"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveModal(null)}
                className="px-[16px] py-[8px] rounded-[8px] bg-[#db2777] text-white text-[14px] font-bold hover:bg-[#be185d]"
              >
                Faire un don sur alphabette.fr
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : Installer sur mon téléphone */}
      {activeModal === 'install' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-install-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-[16px]"
        >
          <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#334155] rounded-[16px] max-w-[420px] w-full p-[20px] shadow-2xl text-[#0f172a] dark:text-[#f8fafc]">
            <div className="flex items-center justify-between pb-[12px] border-b border-[#e2e8f0] dark:border-[#1e293b]">
              <h2 id="modal-install-title" className="text-[18px] font-bold">
                📱 Installer NégoCoach
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Fermer la fenêtre"
                className="w-[32px] h-[32px] rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-center cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            <div className="mt-[12px] space-y-[10px] text-[14px] text-[#475569] dark:text-[#cbd5e1]">
              <p>
                <strong>Sur Android (Chrome) :</strong> Appuyez sur le menu ⋮ en haut à droite de
                votre navigateur puis sélectionnez <em>« Ajouter à l’écran d’accueil »</em>.
              </p>
              <p>
                <strong>Sur iPhone (Safari) :</strong> Appuyez sur l’icône Partager en bas de
                l’écran puis choisissez <em>« Sur l’écran d’accueil »</em>.
              </p>
            </div>
            <div className="mt-[16px] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-[16px] py-[8px] rounded-[8px] bg-[#182334] dark:bg-[#1e293b] text-white text-[14px] font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : Donner mon avis */}
      {activeModal === 'feedback' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-feedback-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-[16px]"
        >
          <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#334155] rounded-[16px] max-w-[420px] w-full p-[20px] shadow-2xl text-[#0f172a] dark:text-[#f8fafc]">
            <div className="flex items-center justify-between pb-[12px] border-b border-[#e2e8f0] dark:border-[#1e293b]">
              <h2 id="modal-feedback-title" className="text-[18px] font-bold">
                💬 Donner mon avis
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Fermer la fenêtre"
                className="w-[32px] h-[32px] rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-center cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            {feedbackSent ? (
              <div className="py-[18px] text-center space-y-[10px]">
                <p className="text-[15px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Merci pour votre retour ! Il aide l’équipe Alphabette à enrichir les scénarios de
                  négociation.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-[16px] py-[8px] rounded-[8px] bg-[#182334] text-white text-[14px] font-semibold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFeedbackSent(true);
                  setFeedbackText('');
                }}
                className="mt-[12px] space-y-[12px]"
              >
                <label className="block text-[13px] text-[#64748b] dark:text-[#94a3b8]">
                  Un scénario à suggérer ou une amélioration tactique ?
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Ex: Ajouter un scénario de négociation de rupture conventionnelle..."
                  className="w-full rounded-[10px] border border-[#cbd5e1] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] p-[10px] text-[14px] focus:outline-2 focus:outline-emerald-500"
                  required
                />
                <div className="flex justify-end gap-[8px]">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-[14px] py-[8px] rounded-[8px] border border-[#cbd5e1] dark:border-[#334155] text-[14px] cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-[16px] py-[8px] rounded-[8px] bg-emerald-600 hover:bg-emerald-500 text-white text-[14px] font-semibold cursor-pointer"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODALE : Langue */}
      {activeModal === 'language' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-lang-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-[16px]"
        >
          <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#334155] rounded-[16px] max-w-[360px] w-full p-[20px] shadow-2xl text-[#0f172a] dark:text-[#f8fafc]">
            <div className="flex items-center justify-between pb-[12px] border-b border-[#e2e8f0] dark:border-[#1e293b]">
              <h2 id="modal-lang-title" className="text-[18px] font-bold">
                🌐 Langue de l’interface
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Fermer la fenêtre"
                className="w-[32px] h-[32px] rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] flex items-center justify-center cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            <div className="mt-[12px] space-y-[8px]">
              {(['FR', 'EN', 'ES'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang);
                    setActiveModal(null);
                    showToast(`Langue active : ${lang} (Scénarios en français)`);
                  }}
                  className={`w-full p-[12px] rounded-[10px] border text-left flex items-center justify-between cursor-pointer ${
                    selectedLang === lang
                      ? 'border-emerald-500 bg-emerald-500/10 font-bold'
                      : 'border-[#e2e8f0] dark:border-[#334155]'
                  }`}
                >
                  <span>
                    {lang === 'FR'
                      ? 'Français (FR) — Recommandé'
                      : lang === 'EN'
                      ? 'English (EN)'
                      : 'Español (ES)'}
                  </span>
                  {selectedLang === lang && <Check className="w-[16px] h-[16px] text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
