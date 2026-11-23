export type PersonaId = 'radin' | 'passif-agressif' | 'presse' | 'juridique';
export type DifficultyId = 'realiste' | 'coriace' | 'boss-final';
export type ScenarioId = 'augmentation-10' | 'voiture-occasion' | 'hausse-tarifs' | 'litige-proprio' | 'custom';

export interface TacticalChoice {
  id: string;
  label: string;
  strategyTag: string;
  userText: string;
  receptivityDelta: number;
  interlocutorReply: Record<PersonaId, string>;
  statusLabel: string;
  tacticalNote: string;
  isTrap?: boolean;
}

export interface DemoTurn {
  turnNumber: number;
  stageTitle: string;
  souffleurHint: string;
  suggestedStarter: string;
  choices: TacticalChoice[];
}

export interface CheatSheetPhrase {
  context: string;
  phrase: string;
  whyItWorks: string;
}

export interface ScenarioPreset {
  id: ScenarioId;
  title: string;
  shortSubtitle: string;
  stakeLabel: string;
  durationLabel: string;
  isDemoFeatured?: boolean;
  contextDescription: string;
  userObjective: string;
  interlocutorRole: string;
  openingMessage: Record<PersonaId, string>;
  turns: DemoTurn[];
  defaultCheatSheet: CheatSheetPhrase[];
}

export interface PersonaProfile {
  id: PersonaId;
  name: string;
  archetype: string;
  quote: string;
  tacticalWeakness: string;
  trapToAvoid: string;
}

export interface DifficultyConfig {
  id: DifficultyId;
  name: string;
  subtitle: string;
  initialReceptivity: number;
  deltaMultiplier: number;
  approvalThreshold: number;
}

export const PERSONAS: PersonaProfile[] = [
  {
    id: 'radin',
    name: 'Le Radin',
    archetype: 'Obsédé par les coûts & le gel budgétaire',
    quote: '« Les marges sont écrasées cette année, chaque euro sorti doit être amorti deux fois. »',
    tacticalWeakness: 'Sensible au coût de l’inaction (ce qu’il perd s’il refuse votre offre).',
    trapToAvoid: 'Ne baissez jamais votre chiffre sans lui retirer une contrepartie concrète.',
  },
  {
    id: 'passif-agressif',
    name: 'Le Passif-Agressif',
    archetype: 'Culpabilisation & chantage à la loyauté',
    quote: '« Je pensais que tu étais investi pour l’aventure, pas juste pour la fiche de paie... »',
    tacticalWeakness: 'Désarçonné par l’étiquetage calme des émotions et le retour aux faits.',
    trapToAvoid: 'Ne vous excusez jamais de défendre vos intérêts et ne rentrez pas dans l’affect.',
  },
  {
    id: 'presse',
    name: 'Le Pressé',
    archetype: 'Coupe la parole & expédie en 3 minutes',
    quote: '« J’ai un comité dans 4 minutes, donne-moi ton chiffre qu’on en finisse. »',
    tacticalWeakness: 'Prêt à céder rapidement si vous lui offrez une solution clé en main sans friction.',
    trapToAvoid: 'Évitez les longs préambules historiques : attaquez par la conclusion chiffrée.',
  },
  {
    id: 'juridique',
    name: 'Le Juridique',
    archetype: 'Procédures, grilles & clauses du contrat',
    quote: '« Ce n’est tout simplement pas prévu dans la grille interne ni à l’article 4. »',
    tacticalWeakness: 'Cède face aux précédents documentés, aux avenants exceptionnels et aux normes externes.',
    trapToAvoid: 'Ne contestez pas la règle de front : demandez comment activer la clause dérogatoire.',
  },
];

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'realiste',
    name: 'Réaliste',
    subtitle: 'Fermé au départ mais réceptif aux preuves tangibles',
    initialReceptivity: 48,
    deltaMultiplier: 1.1,
    approvalThreshold: 65,
  },
  {
    id: 'coriace',
    name: 'Coriace',
    subtitle: 'Teste vos limites et exploite la moindre hésitation',
    initialReceptivity: 36,
    deltaMultiplier: 1.0,
    approvalThreshold: 70,
  },
  {
    id: 'boss-final',
    name: 'Boss Final',
    subtitle: 'Intraitable, tend des pièges rhétoriques à chaque tour',
    initialReceptivity: 24,
    deltaMultiplier: 0.85,
    approvalThreshold: 75,
  },
];

export const SCENARIOS: ScenarioPreset[] = [
  {
    id: 'augmentation-10',
    title: 'Demander une augmentation de 10%',
    shortSubtitle: 'Entretien annuel face à votre direction',
    stakeLabel: '+4 200 € / an',
    durationLabel: '4 tours · Démo & IA',
    isDemoFeatured: true,
    contextDescription:
      'Vous avez repris le portefeuille d’un collègue parti il y a 8 mois et augmenté la rétention client de 18%. Vous visez +10% sur votre fixe.',
    userObjective: 'Obtenir +10% sur le salaire fixe (ou +8% fixe + prime garantie écrite).',
    interlocutorRole: 'Directeur / Directrice de département',
    openingMessage: {
      radin:
        "Écoute, je vois très bien ton travail cette année, mais la direction financière a verrouillé toutes les enveloppes à 2% maximum. Dix pour cent, c'est hors sol.",
      'passif-agressif':
        "Tu commences l'entretien par parler d'argent ? Vu la période tendue pour l'équipe, je pensais qu'on parlerait d'abord de solidarité collective...",
      presse:
        "J'ai dix minutes avant mon point COMEX. Tu veux parler de ta rémunération ? Annonce directement ce que tu as en tête, mais sache que le budget est ultra-serré.",
      juridique:
        "Selon la grille RH validée par le CSE en janvier, ton échelon plafonne les revalorisations annuelles à 3,5%. Je n'ai légalement pas la main pour 10%.",
    },
    turns: [
      {
        turnNumber: 1,
        stageTitle: 'Tour 1 / 4 — Poser l’ancrage sur la valeur créée',
        souffleurHint:
          'Ne parlez pas de l’inflation ni de vos charges personnelles : ancrez sur le gain chiffré apporté à l’entreprise.',
        suggestedStarter:
          'Depuis 8 mois, j’ai absorbé le portefeuille grand compte avec +18% de rétention, soit 65 000 € sécurisés. Comment aligner mon fixe de +10% sur ce nouveau périmètre ?',
        choices: [
          {
            id: 'aug-t1-factuel',
            label: 'Ancrage factuel + Question calibrée',
            strategyTag: 'Méthode Voss',
            userText:
              "Depuis 8 mois, j'ai absorbé le portefeuille grand compte avec +18% de rétention, soit 65 000 € de marge sécurisée. Comment peut-on aligner mon fixe de +10% sur ce périmètre réel ?",
            receptivityDelta: 16,
            interlocutorReply: {
              radin:
                "Les 65 000 € de rétention sont réels, je ne le nie pas. Mais un portefeuille sécurisé une année ne garantit pas l'année prochaine, alors qu'un salaire fixe, c'est permanent.",
              'passif-agressif':
                "Certes, les chiffres du portefeuille sont bons, même si toute l'équipe support t'a bien aidé. Mais de là à réclamer 10% d'un coup, tu nous mets le couteau sous la gorge.",
              presse:
                "Ok, l'argument des 65 000 € de rétention tient la route. Mais 10% sur le fixe maintenant, la DAF va me le retoquer en trente secondes.",
              juridique:
                "L'élargissement de ton périmètre depuis 8 mois est documenté, c'est vrai. Mais un changement de rémunération de 10% exige une requalification de poste hors grille standard.",
            },
            statusLabel: 'Écoute attentive — l’argument chiffré a porté',
            tacticalNote:
              'Excellent ancrage : vous avez lié les 10% à un ROI mesurable (65 000 €) et terminé par une question en « Comment ».',
          },
          {
            id: 'aug-t1-mou',
            label: 'Invoquer le coût de la vie et sa fatigue',
            strategyTag: 'Piège émotionnel',
            isTrap: true,
            userText:
              "Avec l'inflation actuelle et toutes les heures supplémentaires que je fais depuis 8 mois sans compter, j'ai vraiment besoin de ces 10% pour m'y retrouver financièrement.",
            receptivityDelta: -12,
            interlocutorReply: {
              radin:
                "Tout le monde subit l'inflation, moi le premier. L'entreprise ne peut pas indexer les salaires fixes sur le coût de la vie de chacun.",
              'passif-agressif':
                "Si tu comptes tes heures maintenant, c'est décevant. On a tous fait des efforts cette année sans réclamer 10%.",
              presse:
                "Si ton seul argument c'est l'inflation, on perd notre temps. Tout le monde a les mêmes contraintes.",
              juridique:
                "L'indice d'inflation est déjà pris en compte dans l'accord collectif annuel de 2%. Je ne peux rien débloquer sur un critère personnel.",
            },
            statusLabel: 'L’interlocuteur se braque — argument perçu comme personnel',
            tacticalNote:
              'Piège classique : justifier une hausse de salaire par ses besoins personnels au lieu de la valeur économique créée.',
          },
          {
            id: 'aug-t1-comparaison',
            label: 'Comparer avec le marché externe',
            strategyTag: 'Pression marché',
            userText:
              "Sur le marché actuel, un profil qui gère ce volume de comptes est payé 12% de plus. Je préfère évoluer ici, mais mon salaire actuel est décroché.",
            receptivityDelta: 8,
            interlocutorReply: {
              radin:
                "Les offres affichées sur LinkedIn gonflent toujours les chiffres. Et changer d'entreprise comporte aussi un risque pour toi.",
              'passif-agressif':
                "Ah, donc tu regardes déjà ailleurs ? C'est une menace déguisée ou tu as vraiment envie de rester avec nous ?",
              presse:
                "Je connais les prix du marché, pas besoin de me faire un dessin. Mais mon enveloppe interne reste bloquée à court terme.",
              juridique:
                "Les études de rémunération externes n'ont pas de valeur contraignante tant que la DRH n'a pas révisé la bande salariale du poste.",
            },
            statusLabel: 'Sur la défensive — craint un départ mais résiste',
            tacticalNote:
              'Le benchmark marché crée de l’urgence, mais attention à ne pas le formuler comme un ultimatum.',
          },
        ],
      },
      {
        turnNumber: 2,
        stageTitle: 'Tour 2 / 4 — Contourner le blocage de la grille / du budget',
        souffleurHint:
          'Comparez le coût de votre augmentation au coût réel d’un recrutement externe pour remplacer votre double périmètre.',
        suggestedStarter:
          'Remplacer ce double périmètre coûterait un cabinet de recrutement et 6 mois de perte client. Si le plafond annuel bloque, quel levier de requalification peut-on activer ?',
        choices: [
          {
            id: 'aug-t2-cout-inaction',
            label: 'Chiffrer le coût du remplacement + Requalification',
            strategyTag: 'Levier d’asymétrie',
            userText:
              "Je comprends la contrainte de la grille standard. Mais recruter quelqu'un pour reprendre le portefeuille repris il y a 8 mois coûterait 45 000 € charges comprises. En requalifiant officiellement mon poste en Responsable Comptes Clés, les +10% deviennent une économie nette pour le budget.",
            receptivityDelta: 18,
            interlocutorReply: {
              radin:
                "Vu sous l'angle de l'économie d'un recrutement complet, ton calcul n'est pas faux... Cela dit, 10% d'un coup dès ce mois-ci reste lourd en trésorerie.",
              'passif-agressif':
                "Tu as bien préparé tes calculs... C'est vrai qu'on n'a pas remplacé le départ d'il y a 8 mois grâce à toi. Mais la DRH va tiquer sur le pourcentage.",
              presse:
                "L'argument du poste non remplacé et de la requalification me donne une vraie munition pour convaincre la DAF. Mais ils vont me demander un compromis.",
              juridique:
                "Effectivement, un avenant de changement d'intitulé de poste en Responsable Comptes Clés permet juridiquement de sortir du plafond des 3,5%.",
            },
            statusLabel: 'Verrou psychologique sauté — cherche une porte de sortie',
            tacticalNote:
              'Coup de maître : vous avez donné à votre interlocuteur l’argument rationnel dont il a besoin pour justifier l’écart auprès de sa propre hiérarchie.',
          },
          {
            id: 'aug-t2-concession-rapide',
            label: 'Couper la poire en deux immédiatement (5%)',
            strategyTag: 'Concession prématurée',
            isTrap: true,
            userText:
              "Bon, si 10% c'est vraiment impossible pour le budget, coupons la poire en deux à 5% et n'en parlons plus.",
            receptivityDelta: -8,
            interlocutorReply: {
              radin:
                "Si tu passes de 10% à 5% en deux minutes, c'est que 3% te conviendront très bien avec une petite prime aléatoire.",
              'passif-agressif':
                "Tu vois, quand tu veux être raisonnable ! Du coup, restons sur les 3% prévus pour tout le monde, ce sera plus équitable.",
              presse:
                "Parfait, tu baisses déjà à 5%. Je vais demander 3,5% aux RH et on boucle le dossier.",
              juridique:
                "5% dépasse encore la grille de 3,5%. Puisque tu es prêt à baisser, alignons-nous simplement sur le plafond réglementaire de 3,5%.",
            },
            statusLabel: 'Perte de crédibilité — flaire une faiblesse',
            tacticalNote:
              'Ne négociez jamais contre vous-même ! Céder 50% de votre demande dès la première objection détruit votre ancrage.',
          },
          {
            id: 'aug-t2-question-calibree',
            label: 'Poser une question calibrée à la DRH',
            strategyTag: 'Empathie tactique',
            userText:
              "On dirait que vous reconnaissez la performance mais que vos mains sont liées par la règle standard. Qu'est-ce qu'il nous faudrait présenter ensemble à la direction pour débloquer cette enveloppe exceptionnelle ?",
            receptivityDelta: 12,
            interlocutorReply: {
              radin:
                "Pour que la direction financière lâche du lest, il leur faut un engagement de chiffre d'affaires supplémentaire sur les deux prochains trimestres.",
              'passif-agressif':
                "Enfin tu te mets un peu à ma place ! Si je dois me battre pour toi là-haut, il me faut des garanties solides sur le trimestre à venir.",
              presse:
                "Ce qu'il me faut pour le COMEX, c'est un deal en deux temps qui ne plombe pas mon budget du premier semestre.",
              juridique:
                "Pour passer en commission dérogatoire, il faut adosser la hausse à de nouveaux objectifs contractuels mesurables.",
            },
            statusLabel: 'Passage en mode allié — co-construction possible',
            tacticalNote:
              'Bien joué : l’étiquetage (« On dirait que... ») désamorce l’opposition frontale et transforme l’interlocuteur en partenaire.',
          },
        ],
      },
      {
        turnNumber: 3,
        stageTitle: 'Tour 3 / 4 — Structurer un accord créatif à haute valeur',
        souffleurHint:
          'Proposez deux options équivalentes pour vous (ex: 10% fixe immédiat OU 7% immédiat + 3% garantis par écrit à 6 mois).',
        suggestedStarter:
          'Pour faciliter le passage budgétaire, je vous propose deux options : +10% sur le fixe dès ce mois-ci, ou +7% immédiat + 3% automatiques inscrits à l’avenant dans 6 mois.',
        choices: [
          {
            id: 'aug-t3-double-option',
            label: 'Offrir un choix entre 2 options gagnantes (10% ou 7%+3%)',
            strategyTag: 'Double option',
            userText:
              "Pour faciliter la validation budgétaire, je vous propose deux options : soit +10% sur le fixe avec requalification immédiate, soit +7% dès ce mois-ci et +3% additionnels inscrits par écrit dans l'avenant au 1er semestre.",
            receptivityDelta: 17,
            interlocutorReply: {
              radin:
                "L'étalement en 7% maintenant et 3% au semestre prochain lisse l'impact sur ma trésorerie. Là, on parle le même langage.",
              'passif-agressif':
                "L'option en deux paliers montre que tu tiens compte de mes contraintes. C'est déjà beaucoup plus constructif.",
              presse:
                "7% tout de suite + 3% à 6 mois sur avenant, je peux le faire signer dès cet après-midi sans passer par trois comités.",
              juridique:
                "Une clause de révision programmée de +7% puis +3% à 6 mois dans l'avenant de requalification respecte parfaitement le cadre RH.",
            },
            statusLabel: 'Il commence à céder — accord à portée de main',
            tacticalNote:
              'La technique de la double option déplace la question de « Oui ou Non » vers « Quelle modalité choisissons-nous ? ».',
          },
          {
            id: 'aug-t3-prime-floue',
            label: 'Accepter une promesse orale pour l’an prochain',
            strategyTag: 'Piège du report',
            isTrap: true,
            userText:
              "Si on fait un petit geste maintenant et que vous me promettez à l'oral qu'on rattrapera les 10% l'année prochaine, ça me va.",
            receptivityDelta: -10,
            interlocutorReply: {
              radin:
                "Marché conclu ! On part sur 2,5% cette année et on en reparle tranquillement dans douze mois selon la conjoncture.",
              'passif-agressif':
                "Tu sais bien que tu peux me faire confiance ! On verra l'an prochain si l'ambiance et les budgets le permettent.",
              presse:
                "Top, on acte 3% aujourd'hui et on réévalue l'an prochain. Dossier suivant !",
              juridique:
                "Un engagement oral n'a aucune valeur juridique, donc nous actons simplement l'augmentation standard de 3% pour cet exercice.",
            },
            statusLabel: 'Satisfait à vos dépens — promesse non engageante',
            tacticalNote:
              'Attention : une promesse orale à 12 mois en négociation salariale équivaut presque toujours à un refus déguisé.',
          },
          {
            id: 'aug-t3-maintien-ferme',
            label: 'Maintenir 10% sec sans aménagement',
            strategyTag: 'Bras de fer',
            userText:
              "La valeur est déjà délivrée depuis 8 mois. Je maintiens ma demande de 10% intégralement sur le salaire fixe dès le mois prochain.",
            receptivityDelta: 4,
            interlocutorReply: {
              radin:
                "Tu es dur en affaires. 10% sec dès le mois prochain, ça me force à couper ailleurs dans le budget du service.",
              'passif-agressif':
                "Aucune souplesse... Je vais voir ce que je peux faire, mais tu ne me facilites vraiment pas la tâche.",
              presse:
                "C'est raide. Si je demande 10% sec au COMEX, il me faut un engagement fort de ta part en face.",
              juridique:
                "10% en une seule tranche exige la signature conjointe du DRH et de la direction générale.",
            },
            statusLabel: 'Sous haute tension — respecte la fermeté mais cherche une garantie',
            tacticalNote:
              'La fermeté maintient votre ancrage haut, mais offrir une souplesse de calendrier facilite souvent la signature.',
          },
        ],
      },
      {
        turnNumber: 4,
        stageTitle: 'Tour 4 / 4 — Verrouiller l’engagement par écrit',
        souffleurHint:
          'Ne quittez pas la pièce sur un accord flou : fixez la date précise de réception de l’avenant écrit.',
        suggestedStarter:
          'Parfait. Je vous envoie le récapitulatif chiffré aujourd’hui à 16h pour que l’avenant soit émis par les RH avant vendredi.',
        choices: [
          {
            id: 'aug-t4-verrouillage',
            label: 'Verrouiller l’écrit et la date de signature',
            strategyTag: 'Closing chirurgical',
            userText:
              "Merci pour cette écoute. Je vous envoie dès 16h le mail récapitulatif avec les chiffres du portefeuille et la formule retenue, afin que les RH émettent l'avenant écrit d'ici vendredi. Cela vous convient ?",
            receptivityDelta: 15,
            interlocutorReply: {
              radin:
                "Envoie-moi ton récapitulatif à 16h avec le chiffrage des 65 000 € de rétention. Je valide l'avenant avec la DAF d'ici vendredi.",
              'passif-agressif':
                "Tu ne laisses rien au hasard... Très bien, envoie le mail cet après-midi, je ferai suivre aux RH pour signature vendredi.",
              presse:
                "Carré, rapide, efficace. Envoie le mail à 16h, je mets mon tampon dessus avant ce soir et les RH t'éditent l'avenant pour vendredi.",
              juridique:
                "Procédure impeccable. Avec ton mail récapitulatif aujourd'hui, je transmets la demande d'avenant à la DRH pour émission vendredi.",
            },
            statusLabel: 'Accord verrouillé — échéance écrite acceptée',
            tacticalNote:
              'Closing exemplaire : vous prenez l’initiative de l’écrit (« je vous envoie le récapitulatif à 16h ») et ancrez une date butoir précise.',
          },
          {
            id: 'aug-t4-attente',
            label: 'Laisser l’interlocuteur revenir vers vous quand il aura le temps',
            strategyTag: 'Closing passif',
            isTrap: true,
            userText:
              "Super, merci beaucoup ! Je vous laisse voir avec les RH quand vous aurez un moment et revenir vers moi.",
            receptivityDelta: -6,
            interlocutorReply: {
              radin:
                "Oui, je regarderai ça le mois prochain après la clôture trimestrielle, rien ne presse.",
              'passif-agressif':
                "Oui, laisse-moi gérer ça à mon rythme sans me relancer tous les deux jours.",
              presse:
                "Ok, j'essaie d'y penser la semaine prochaine si je ne suis pas sous l'eau.",
              juridique:
                "Sans dossier écrit transmis avant la clôture de paie du 15, cela basculera au trimestre suivant.",
            },
            statusLabel: 'Risque d’enlisement — aucune date butoir fixée',
            tacticalNote:
              'Erreur de fin de match : sans trace écrite envoyée par vous dans la journée et sans date précise, l’accord risque de traîner des mois.',
          },
          {
            id: 'aug-t4-contrepartie',
            label: 'Acter l’accord en confirmant l’objectif du trimestre',
            strategyTag: 'Gagnant-Gagnant',
            userText:
              "C'est noté. On acte cet avenant sur la paie de ce mois-ci, et de mon côté je m'engage à former le nouveau junior sur la méthode de rétention d'ici la fin du trimestre.",
            receptivityDelta: 13,
            interlocutorReply: {
              radin:
                "Si tu formes le junior en prime, je m'y retrouve largement. Je fais préparer l'avenant pour la paie de ce mois-ci.",
              'passif-agressif':
                "Voilà l'esprit d'équipe que j'aime voir ! Avec cet engagement, je valide ton avenant dès cette semaine.",
              presse:
                "Deal ! Tu formes le junior, je signe ton avenant pour la paie du mois. Merci.",
              juridique:
                "Nous inscrivons le tutorat dans la fiche de poste révisée et l'avenant financier part en signature dès demain.",
            },
            statusLabel: 'Accord scellé avec valeur ajoutée mutuelle',
            tacticalNote:
              'Offrir une contrepartie non financière de dernière minute permet à votre interlocuteur de sauver la face et de repartir gagnant.',
          },
        ],
      },
    ],
    defaultCheatSheet: [
      {
        context: 'Pour ouvrir sans parler de vos besoins personnels',
        phrase:
          '« Depuis 8 mois, mon périmètre réel a généré [X € / +Y%] de résultat concret. Comment peut-on aligner ma rémunération fixe de +10% sur cette nouvelle responsabilité ? »',
        whyItWorks:
          'Ancre immédiatement la discussion sur le retour sur investissement de l’entreprise et oblige l’interlocuteur à résoudre le problème avec vous.',
      },
      {
        context: 'Face à l’excuse du budget gelé ou de la grille RH',
        phrase:
          '« Je comprends la règle de la grille standard. Quel levier de requalification de poste ou d’avenant pouvons-nous activer ensemble, sachant que remplacer ce périmètre coûterait bien plus cher ? »',
        whyItWorks:
          'Valide la contrainte de l’interlocuteur sans céder sur le montant, tout en rappelant subtilement le coût financier d’un départ.',
      },
      {
        context: 'Pour débloquer la signature et verrouiller l’écrit',
        phrase:
          '« Pour faciliter votre arbitrage budgétaire, préférons-nous +10% immédiat ou +7% ce mois-ci et +3% inscrits à l’avenant dans 6 mois ? Je vous envoie le récapitulatif à 16h pour validation vendredi. »',
        whyItWorks:
          'La double option enferme dans un choix positif et la prise en charge du mail récapitulatif empêche tout enlisement.',
      },
    ],
  },
  {
    id: 'voiture-occasion',
    title: 'Négocier une voiture d’occasion',
    shortSubtitle: 'Faire baisser le prix de 14 500 € à 12 800 €',
    stakeLabel: '1 700 € d’économie',
    durationLabel: '4 tours · Démo & IA',
    isDemoFeatured: true,
    contextDescription:
      'Vous êtes devant le véhicule affiché à 14 500 €. L’annonce est en ligne depuis 5 semaines, les pneus avant sont à 70% d’usure et la révision des 90 000 km approche.',
    userObjective: 'Conclure l’achat autour de 12 800 € – 13 100 € (ou révision + pneus neufs inclus).',
    interlocutorRole: 'Vendeur du véhicule (Particulier ou Marchand)',
    openingMessage: {
      radin:
        "Je vous préviens tout de suite : à 14 500 €, elle est déjà placée au centime près. J'ai eu trois appels ce matin, je ne la braderai pas.",
      'passif-agressif':
        "Je l'ai bichonnée pendant quatre ans cette voiture. Si vous êtes venu pour marchander comme un marchand de tapis, ça va me faire mal au cœur de vous la laisser.",
      presse:
        "Vous avez fait le tour et l'essai routier s'est bien passé. J'ai un autre acheteur qui vient à 18h, donc à 14 500 € on fait les papiers maintenant ?",
      juridique:
        "Le contrôle technique affiche zéro défaut majeur et la cote officielle est à 14 600 €. Mon prix de 14 500 € est strictement aligné sur le barème.",
    },
    turns: [
      {
        turnNumber: 1,
        stageTitle: 'Tour 1 / 4 — Chiffrer les frais immédiats sans dénigrer le véhicule',
        souffleurHint:
          'Ne critiquez jamais la voiture (« elle est trop chère ») : validez son état général puis chiffrez froidement les frais à venir.',
        suggestedStarter:
          'Le véhicule est propre et l’essai est concluant. En revanche, j’ai budgété 1 150 € de frais immédiats : deux pneus avant, la grosse révision des 90 000 km et le coup sur le pare-chocs.',
        choices: [
          {
            id: 'car-t1-factuel',
            label: 'Valider le véhicule + Chiffrer les 3 frais objectifs (1 150 €)',
            strategyTag: 'Audit factuel',
            userText:
              "La voiture a été bien suivie à l'intérieur et l'essai est propre. En revanche, j'ai relevé trois frais immédiats : les deux pneus avant proches du témoin (320 €), la grosse révision des 90 000 km dans 2 000 km (580 €) et la reprise du pare-chocs arrière (250 €), soit 1 150 € à sortir dès le mois prochain.",
            receptivityDelta: 17,
            interlocutorReply: {
              radin:
                "C'est une voiture d'occasion, pas une voiture neuve sortie de concession ! Les pneus peuvent encore faire 5 000 km.",
              'passif-agressif':
                "Au moins vous reconnaissez qu'elle est propre... Mais bon, compter la révision qui n'est que dans 2 000 km, vous cherchez vraiment la petite bête.",
              presse:
                "Ok, la révision des 90 000 km approche et les pneus avant ont roulé, je suis transparent là-dessus. Quelle est votre offre concrète ?",
              juridique:
                "Les pneus ne sont pas en contre-visite au contrôle technique, donc légalement ils sont conformes. Même si je conviens que l'échéance des 90 000 km arrive.",
            },
            statusLabel: 'Déstabilisé par la précision des devis — écoute votre offre',
            tacticalNote:
              'Parfait : complimenter d’abord le soin du propriétaire évite qu’il ne se braque, puis l’addition précise (320 + 580 + 250 €) prépare votre baisse de prix.',
          },
          {
            id: 'car-t1-denigrement',
            label: 'Critiquer la voiture et dire qu’elle est invendable',
            strategyTag: 'Attaque frontale',
            isTrap: true,
            userText:
              "Franchement à 14 500 € elle est beaucoup trop chère, ça fait 5 semaines qu'elle traîne sur Leboncoin et personne n'en veut avec ces pneus usés.",
            receptivityDelta: -15,
            interlocutorReply: {
              radin:
                "Si elle ne vous plaît pas et qu'elle est trop chère, allez en acheter une autre ailleurs ! Je ne suis pas pris à la gorge.",
              'passif-agressif':
                "Sympa le respect... Si elle est si mauvaise que ça, pourquoi vous avez demandé à l'essayer pendant vingt minutes ?",
              presse:
                "Écoutez, je n'ai pas de temps à perdre avec quelqu'un qui dénigre le véhicule. L'essai est terminé.",
              juridique:
                "Mon prix est conforme à la cote argus certifiée. Je n'ai aucune obligation de baisser face à des remarques subjectives.",
            },
            statusLabel: 'Braquage immédiat — ego du vendeur touché',
            tacticalNote:
              'Erreur fatale en achat auto : dénigrer frontalement le bien blesse l’ego du vendeur qui préférera refuser de vous vendre, même au bon prix.',
          },
          {
            id: 'car-t1-question',
            label: 'Demander directement quel est son dernier prix',
            strategyTag: 'Erreur classique',
            isTrap: true,
            userText:
              "La voiture m'intéresse bien. Quel est votre tout dernier prix si je vous la prends rapidement ?",
            receptivityDelta: -6,
            interlocutorReply: {
              radin:
                "Mon dernier prix ? 14 400 €, je vous offre le plein d'essence qui est dedans et pas un centime de moins.",
              'passif-agressif':
                "Je déteste cette question... J'ai déjà mis un prix juste à 14 500 €, je peux enlever 100 € par principe mais c'est tout.",
              presse:
                "14 300 € si on signe dans dix minutes, sinon elle reste à 14 500 €.",
              juridique:
                "Le prix affiché de 14 500 € est déjà le prix net calculé après décote kilométrique.",
            },
            statusLabel: 'En position de force — ne lâche qu’une miette symbolique',
            tacticalNote:
              'Ne demandez jamais « Quel est votre dernier prix ? » : vous forcez le vendeur à s’ancrer sur son prix affiché.',
          },
        ],
      },
      {
        turnNumber: 2,
        stageTitle: 'Tour 2 / 4 — Poser un ancrage précis avec paiement sécurisé immédiat',
        souffleurHint:
          'Utilisez un chiffre non rond (ex: 12 650 €) adossé à la garantie d’une vente certaine et sans tracas aujourd’hui.',
        suggestedStarter:
          'En déduisant les 1 150 € de remise à niveau et la décote des annonces similaires vendues ce mois-ci, mon budget disponible par virement instantané aujourd’hui est de 12 650 €.',
        choices: [
          {
            id: 'car-t2-ancrage-precis',
            label: 'Ancrer à 12 650 € (chiffre précis) + Virement instantané',
            strategyTag: 'Ancrage d’Ackerman',
            userText:
              "En tenant compte des 1 150 € d'entretien immédiat et des modèles équivalents vendus autour de 13 800 € ce mois-ci, je peux vous régler 12 650 € par virement bancaire instantané aujourd'hui même, sans condition suspensive de crédit.",
            receptivityDelta: 16,
            interlocutorReply: {
              radin:
                "12 650 € ?! Vous me coupez presque 1 900 €, c'est impossible. Par contre, un virement instantané sans attendre une banque, ça m'évite des semaines de visites... mais pas en dessous de 13 600 €.",
              'passif-agressif':
                "12 650 € c'est dur à entendre... Après, c'est vrai que vous êtes sérieux et que vous avez les fonds tout de suite, contrairement aux curieux du week-end. Mais faites un effort vers 13 500 €.",
              presse:
                "Le paiement par virement instantané aujourd'hui, ça m'arrange énormément pour solder mon dossier. Mais 12 650 € c'est trop bas, montez à 13 500 € et on en parle.",
              juridique:
                "Votre calcul déduit l'intégralité de l'usure à neuf. Cela dit, l'absence de délai de financement sécurise la transaction. Ma contre-proposition est à 13 600 €.",
            },
            statusLabel: 'Le vendeur vient de baisser de 900 € d’un coup !',
            tacticalNote:
              'L’ancrage précis (12 650 € au lieu de 12 500 €) donne l’impression d’un calcul scientifique, et le paiement instantané fait lâcher 900 € au vendeur.',
          },
          {
            id: 'car-t2-ancrage-timide',
            label: 'Proposer 13 900 € timidement',
            strategyTag: 'Ancrage trop haut',
            userText:
              "Est-ce que 13 900 € ça pourrait vous convenir vu qu'il y a la révision à faire ?",
            receptivityDelta: 4,
            interlocutorReply: {
              radin:
                "Si vous êtes déjà à 13 900 €, faisons 14 200 € et l'affaire est pliée.",
              'passif-agressif':
                "13 900 € c'est presque raisonnable, mais rajoutez 250 € pour atteindre 14 150 € et je vous laisse les tapis de sol.",
              presse:
                "Allez, 14 100 € et on remplit le certificat de cession tout de suite.",
              juridique:
                "À 14 150 €, nous partageons le coût de la révision à 50/50. C'est équitable.",
            },
            statusLabel: 'Confiant — sait qu’il va vendre au-dessus de 14 000 €',
            tacticalNote:
              'En ancrant votre première offre à 13 900 €, vous ne pourrez plus jamais redescendre à votre objectif de 12 800 €.',
          },
          {
            id: 'car-t2-bluff-agressif',
            label: 'Offrir 10 500 € en cash tout de suite',
            strategyTag: 'Offre insultante',
            isTrap: true,
            userText:
              "Je vous en donne 10 500 € tout de suite, c'est à prendre ou à laisser.",
            receptivityDelta: -18,
            interlocutorReply: {
              radin:
                "10 500 € ? Même un concessionnaire en reprise sèche m'en donne 12 200 € sans discuter. Bonne journée monsieur.",
              'passif-agressif':
                "C'est une blague ? Je préfère encore la garder au garage que de la donner à 10 500 €.",
              presse:
                "On arrête là, 10 500 € c'est une perte de temps pour nous deux.",
              juridique:
                "Une offre inférieure de 30% à la valeur vénale + paiement espèces hors plafond légal : je décline.",
            },
            statusLabel: 'Rupture des négociations — offre hors zone de crédibilité',
            tacticalNote:
              'Un ancrage trop extrême (en dessous de la valeur de reprise garage) détruit votre crédibilité d’acheteur sérieux.',
          },
        ],
      },
      {
        turnNumber: 3,
        stageTitle: 'Tour 3 / 4 — Utiliser le silence et le palier psychologique',
        souffleurHint:
          'Face à sa contre-offre à 13 500/13 600 €, exprimez une difficulté sincère et proposez un palier précis à 12 950 €.',
        suggestedStarter:
          'Vous avez fait un vrai pas vers moi. Le souci, c’est qu’avec la carte grise et l’atelier la semaine prochaine, mon plafond absolu tout compris m’oblige à m’arrêter à 12 950 €.',
        choices: [
          {
            id: 'car-t3-plafond-12950',
            label: 'Reconnaître son geste + Poser son plafond précis à 12 950 €',
            strategyTag: 'Convergence Ackerman',
            userText:
              "Je vois que vous faites un vrai pas vers moi à 13 500 €. Le souci, c'est qu'en ajoutant la carte grise de 380 € et le passage au garage la semaine prochaine, mon plafond bancaire débloqué pour l'opération m'oblige à m'arrêter à 12 950 € net vendeur.",
            receptivityDelta: 16,
            interlocutorReply: {
              radin:
                "Vous me serrez jusqu'au dernier euro... 12 950 € c'est vraiment mon plancher psychologique. Si on arrondit à 13 000 € tout rond, vous repartez avec ce soir.",
              'passif-agressif':
                "Vous savez y faire... J'aime bien votre franchise et je vois que vous prendrez soin de la voiture. À 13 000 € compte rond, je cède.",
              presse:
                "12 950 € par virement instantané maintenant, ça m'évite de refaire trois visites ce week-end. Allez, 13 000 € tout rond et je vous donne les barres de toit avec.",
              juridique:
                "Votre décompte incluant les taxes d'immatriculation et la révision est cohérent. À 13 000 € net vendeur, j'accepte la transaction.",
            },
            statusLabel: 'Cède sur le prix — accord à 1 500 € sous le prix affiché',
            tacticalNote:
              'Remarquable : invoquer une contrainte externe objective (plafond débloqué + carte grise) permet au vendeur de céder sans perdre la face.',
          },
          {
            id: 'car-t3-accepter-13500',
            label: 'Accepter tout de suite sa contre-offre à 13 500 €',
            strategyTag: 'Précipitation',
            userText:
              "Ok, va pour 13 500 €, c'est déjà 1 000 € de moins que l'annonce !",
            receptivityDelta: 8,
            interlocutorReply: {
              radin:
                "Vendu à 13 500 € ! (Il sourit, soulagé que vous n'ayez pas poussé jusqu'à 13 000 €).",
              'passif-agressif':
                "Très bien, 13 500 € ça me va, on n'en parle plus.",
              presse:
                "Impeccable, 13 500 €, on signe !",
              juridique:
                "Entendu pour 13 500 €, je prépare le certificat de cession.",
            },
            statusLabel: 'Vendeur ravi — il lui restait 500 € de marge de baisse',
            tacticalNote:
              'Vous avez économisé 1 000 €, mais la première contre-offre d’un vendeur n’est jamais son vrai prix plancher : vous avez laissé 500 € sur la table.',
          },
          {
            id: 'car-t3-menace-partir',
            label: 'Se braquer sur 12 650 € en menaçant de partir',
            strategyTag: 'Quitte ou double',
            userText:
              "Non, je ne rajouterai pas un seul euro au-dessus de 12 650 €. Sinon je vais voir l'autre annonce en ville.",
            receptivityDelta: -5,
            interlocutorReply: {
              radin:
                "Si vous ne faites aucun pas de votre côté alors que j'ai baissé de 900 €, allez voir l'autre annonce.",
              'passif-agressif':
                "J'ai fait l'effort de baisser de presque 1 000 € et vous restez campé sur votre chiffre ? Ce n'est pas correct.",
              presse:
                "J'ai fait la moitié du chemin. Faites au moins un effort à 13 100 € ou je garde mon rendez-vous de 18h.",
              juridique:
                "Une négociation implique des concessions réciproques. Sans mouvement de votre part, mon offre à 13 600 € tombe.",
            },
            statusLabel: 'Crispation — attend un geste de réciprocité symbolique',
            tacticalNote:
              'En négociation, l’autre partie a besoin de sentir que vous avez fait un effort final (même de 250 €) pour valider l’accord.',
          },
        ],
      },
      {
        turnNumber: 4,
        stageTitle: 'Tour 4 / 4 — Conclure avec le "Grignotage" final (Nibble)',
        souffleurHint:
          'Avant de valider son chiffre rond de 13 000 €, demandez un dernier élément concret (deuxième clé, jeu de roues hiver, plein, ou 12 900 €).',
        suggestedStarter:
          'On tope à 12 900 € par virement immédiat maintenant, avec le double des clés, le carnet de factures complet et les barres de toit incluses.',
        choices: [
          {
            id: 'car-t4-closing-12900',
            label: 'Toper à 12 900 € + accessoires / factures et virement immédiat',
            strategyTag: 'Closing + Grignotage',
            userText:
              "Faisons 12 900 € tout compris par virement instantané maintenant, avec le carnet de factures complet, le double des clés et les accessoires dans le coffre, et on remplit le certificat ANTS tout de suite.",
            receptivityDelta: 15,
            interlocutorReply: {
              radin:
                "12 900 €... Vous êtes redoutable. Allez, pour 100 € je ne vais pas tout recommencer. Sortez votre téléphone pour le virement instantané, je sors les papiers.",
              'passif-agressif':
                "Vous aurez eu le dernier mot pour 100 € ! Mais au moins la vente est réglée proprement aujourd'hui. On signe à 12 900 €.",
              presse:
                "Vendu à 12 900 € ! J'annule mon rendez-vous de 18h et on valide la cession sur l'ANTS maintenant.",
              juridique:
                "Accord conclu à 12 900 € paiement immédiat. Toutes les factures d'entretien et la seconde clé sont dans le dossier.",
            },
            statusLabel: 'Accord conclu à 12 900 € — 1 600 € gagnés !',
            tacticalNote:
              'Exécution clinique : en associant les 100 € finaux à l’action immédiate (« on remplit le certificat tout de suite »), le vendeur cède par soulagement.',
          },
          {
            id: 'car-t4-delai-reflexion',
            label: 'Demander 48h de réflexion après avoir négocié le prix',
            strategyTag: 'Perte de levier',
            isTrap: true,
            userText:
              "Ok pour 13 000 €, mais laissez-moi réfléchir jusqu'à lundi avant de vous faire le virement.",
            receptivityDelta: -10,
            interlocutorReply: {
              radin:
                "Ah non ! Le prix à 13 000 € c'était uniquement pour un paiement aujourd'hui. D'ici lundi, si quelqu'un me propose 13 800 €, elle part.",
              'passif-agressif':
                "Vous me faites baisser mon prix pendant vingt minutes pour finalement me dire que vous hésitez encore ?",
              presse:
                "Hors de question, j'ai un acheteur à 18h. Sans virement ni acompte maintenant, le prix repasse à 14 500 €.",
              juridique:
                "Une offre verbale sans versement d'acompte ni signature ne réserve pas le véhicule jusqu'à lundi.",
            },
            statusLabel: 'Remise annulée — votre principal levier était la rapidité',
            tacticalNote:
              'Votre levier majeur était la certitude d’un paiement immédiat : si vous retirez la rapidité, le vendeur retire sa remise.',
          },
          {
            id: 'car-t4-valider-13000',
            label: 'Valider 13 000 € sous réserve de vérification du non-gage',
            strategyTag: 'Closing sécurisé',
            userText:
              "Marché conclu à 13 000 €. On vérifie ensemble le certificat de situation administrative (non-gage) de moins de 15 jours et je lance le virement instantané devant vous.",
            receptivityDelta: 13,
            interlocutorReply: {
              radin:
                "Le certificat de non-gage est imprimé juste là. À 13 000 €, vous faites une sacrée affaire.",
              'passif-agressif':
                "Tout est en règle évidemment. Allons signer les papiers à 13 000 €.",
              presse:
                "Le non-gage a été téléchargé ce matin. Virement, code de cession ANTS et elle est à vous pour 13 000 € !",
              juridique:
                "Le certificat de situation administrative vierge est dans la pochette. Procédons au virement de 13 000 €.",
            },
            statusLabel: 'Accord sécurisé à 13 000 € — 1 500 € d’économie',
            tacticalNote:
              'Solide et prudent : 1 500 € d’économie obtenus tout en vérifiant la conformité administrative finale.',
          },
        ],
      },
    ],
    defaultCheatSheet: [
      {
        context: 'Après l’essai routier, avant d’annoncer votre prix',
        phrase:
          '« Le véhicule est sain et bien suivi. En revanche, j’ai chiffré [X €] de frais immédiats (pneus avant + révision des 90 000 km) que je devrai régler dès le mois prochain. »',
        whyItWorks:
          'Complimenter l’entretien ménage la susceptibilité du vendeur, tandis que les coûts d’atelier précis rendent la baisse de prix mathématique.',
      },
      {
        context: 'Pour poser votre premier ancrage bas sans braquer',
        phrase:
          '« En déduisant ces frais de remise à niveau, je peux vous régler 12 650 € par virement bancaire instantané aujourd’hui même, sans délai de crédit bancaire. »',
        whyItWorks:
          'Un chiffre non rond (12 650 €) paraît calculé au centime près, et le paiement instantané élimine l’incertitude du vendeur.',
      },
      {
        context: 'Pour verrouiller le dernier palier (convergence d’Ackerman)',
        phrase:
          '« Vous avez fait un vrai pas vers moi. Avec la carte grise et l’atelier, mon plafond débloqué s’arrête à 12 900 € tout compris : si ça vous va, je lance le virement devant vous maintenant. »',
        whyItWorks:
          'Associer les derniers 100 € à la signature immédiate pousse le vendeur à conclure plutôt que de repartir dans des semaines de visites.',
      },
    ],
  },
  {
    id: 'hausse-tarifs',
    title: 'Hausse de tarifs client (+15%)',
    shortSubtitle: 'Faire accepter une revalorisation à un client historique',
    stakeLabel: '+15% de TJM / forfait',
    durationLabel: '4 tours · Démo & IA',
    contextDescription:
      'Vos tarifs n’ont pas bougé depuis 2 ans alors que le périmètre livré au client a augmenté de 25%. Vous devez passer votre prestation de 800 €/j à 920 €/j (+15%).',
    userObjective: 'Faire signer le renouvellement à +15% (ou +10% à périmètre réduit).',
    interlocutorRole: 'Directeur des Achats / Client historique',
    openingMessage: {
      radin:
        "Plus 15% sur ton tarif journalier ?! Tu plaisantes, nos propres budgets achats sont réduits de 10% cette année. Si tu touches aux prix, on lance un appel d'offres.",
      'passif-agressif':
        "Après deux ans de fidélité où on t'a donné de la visibilité tous les mois, c'est comme ça que tu nous remercies ? Avec +15% d'augmentation ?",
      presse:
        "J'ai ton devis de renouvellement sous les yeux. +15%, ça ne passera jamais au contrôle de gestion. Renvoie-moi le contrat à l'ancien tarif qu'on signe aujourd'hui.",
      juridique:
        "L'indice Syntec de révision prévu à notre contrat-cadre plafonne la hausse annuelle à 3,2%. Une hausse de 15% est hors clause contractuelle.",
    },
    turns: [
      {
        turnNumber: 1,
        stageTitle: 'Tour 1 / 4 — Dissocier l’inflation de l’élargissement du périmètre livré',
        souffleurHint:
          'Montrez que le tarif n’augmente pas à périmètre constant : vous facturez enfin les livrables ajoutés gratuitement depuis 18 mois.',
        suggestedStarter:
          'Il ne s’agit pas d’une hausse d’indice à périmètre égal : depuis 18 mois, nous avons intégré la maintenance corrective et le reporting hebdomadaire (+25% de volume) sans réviser le tarif de 2024.',
        choices: [
          {
            id: 'tarif-t1-perimetre',
            label: 'Démontrer les +25% de périmètre absorbés depuis 18 mois',
            strategyTag: 'Valeur délivrée',
            userText:
              "Je comprends votre vigilance budgétaire. Mais il ne s'agit pas d'une simple hausse tarifaire : depuis 18 mois, nous avons absorbé le support niveau 2 et les livrables urgents (+25% de temps) au tarif gelé de 2024. Les 920 € régularisent ce périmètre réel.",
            receptivityDelta: 16,
            interlocutorReply: {
              radin:
                "C'est vrai que tu as pris le support niveau 2 au fil de l'eau... Mais mon enveloppe budgétaire annuelle, elle, n'a pas augmenté de 15%.",
              'passif-agressif':
                "On pensait que ces petits coups de main faisaient partie de notre relation de partenariat, pas que tu nous les facturerais après coup...",
              presse:
                "Ok, tu fais plus que le périmètre initial, les équipes me le disent. Mais mon DAF bloque tout dépassement facial de +15%.",
              juridique:
                "Effectivement, si le périmètre fonctionnel a évolué de 25%, nous ne sommes plus dans une simple indexation Syntec mais dans un avenant de périmètre.",
            },
            statusLabel: 'Reconnaît l’élargissement du service — discute désormais la forme',
            tacticalNote:
              'Très fort : vous avez déplacé le débat de « vous êtes plus cher » vers « vous consommez 25% de service en plus ».',
          },
          {
            id: 'tarif-t1-excuse',
            label: 'S’excuser et dire que vos charges ont augmenté',
            strategyTag: 'Justification faible',
            isTrap: true,
            userText:
              "Je suis désolé mais mes propres charges, mes logiciels et mes impôts ont explosé cette année, je suis obligé d'augmenter de 15%.",
            receptivityDelta: -12,
            interlocutorReply: {
              radin:
                "Tes charges internes ne sont pas mon problème. Si tu ne sais pas maîtriser tes coûts, je trouverai un prestataire moins gourmand.",
              'passif-agressif':
                "Et nos charges à nous, tu crois qu'elles n'ont pas augmenté ? Pourtant on ne te baisse pas ton volume.",
              presse:
                "Je me fiche de ta comptabilité interne, j'achète un résultat au prix du marché.",
              juridique:
                "L'augmentation des frais généraux du prestataire n'est pas un motif recevable de révision tarifaire en cours de contrat.",
            },
            statusLabel: 'Braqué — refuse de payer vos frais de structure',
            tacticalNote:
              'Un client n’achète jamais vos charges : il achète sa propre tranquillité et la valeur que vous lui rapportez.',
          },
          {
            id: 'tarif-t1-risque',
            label: 'Rappeler le coût de transition vers un nouveau prestataire',
            strategyTag: 'Coût de changement',
            userText:
              "Lancer un appel d'offres et former un nouveau prestataire sur votre architecture mobiliserait vos équipes pendant 3 mois, avec un risque direct sur la mise en production de juin.",
            receptivityDelta: 11,
            interlocutorReply: {
              radin:
                "Personne n'est irremplaçable... même si je reconnais qu'on n'a aucune envie de perdre trois mois avant la livraison de juin.",
              'passif-agressif':
                "Tu joues sur le fait qu'on a la livraison de juin pour nous coincer ? C'est limite comme méthode...",
              presse:
                "C'est bien pour ça que je te parle au lieu de résilier : je ne veux pas mettre en péril la sortie de juin. Mais trouve-moi une solution budgétaire.",
              juridique:
                "Le coût de réversibilité interne est en effet estimé à 45 jours-hommes par la DSI.",
            },
            statusLabel: 'Conscient de sa dépendance — cherche un compromis honorable',
            tacticalNote:
              'Rappeler le coût de changement (switching cost) est puissant, mais faites-le sous l’angle de la sécurisation de son projet.',
          },
        ],
      },
      {
        turnNumber: 2,
        stageTitle: 'Tour 2 / 4 — Proposer la matrice Prix / Périmètre',
        souffleurHint:
          'Ne baissez jamais votre tarif sans retirer une brique du service : proposez +15% tout inclus OU +5% en retirant les urgences hors délai.',
        suggestedStarter:
          'Si votre enveloppe globale est plafonnée, nous pouvons soit passer à 920 €/j avec support prioritaire inclus, soit rester à 840 €/j en revenant au périmètre strict hors urgences.',
        choices: [
          {
            id: 'tarif-t2-matrice',
            label: 'Proposer 2 options liées au périmètre (+15% complet ou +5% réduit)',
            strategyTag: 'Trade-off Prix/Scope',
            userText:
              "Vous avez le contrôle total sur votre budget : Option A à 920 €/j (+15%) en conservant la réactivité sous 4h et le support niveau 2 ; ou Option B à 840 €/j (+5%) en retirant le support niveau 2 et les demandes hors sprint.",
            receptivityDelta: 18,
            interlocutorReply: {
              radin:
                "Ah non, si tu retires le support niveau 2 et les demandes urgentes, mes équipes internes vont exploser... Ça me coûterait plus cher en interne.",
              'passif-agressif':
                "On ne peut pas revenir en arrière sur la réactivité sous 4h, les équipes y sont habituées maintenant...",
              presse:
                "Impossible de retirer le support niveau 2 avant le lancement de juin. Je préfère payer le vrai prix du service complet que de dégrader la réactivité.",
              juridique:
                "La distinction entre l'Option A (SLA 4h + Niveau 2) et l'Option B justifie juridiquement l'écart tarifaire devant les Achats.",
            },
            statusLabel: 'Effet d’aversion à la perte activé — veut garder l’Option A',
            tacticalNote:
              'Brillant : grâce à l’aversion à la perte, le client refuse lui-même la réduction de périmètre et légitime votre hausse de 15%.',
          },
          {
            id: 'tarif-t2-rabais-sec',
            label: 'Baisser le prix à +7% tout en gardant tout le périmètre',
            strategyTag: 'Concession gratuite',
            isTrap: true,
            userText:
              "Bon, pour vous faire plaisir, on garde exactement tout le service actuel et je réduis ma hausse de 15% à 7%.",
            receptivityDelta: -8,
            interlocutorReply: {
              radin:
                "Tu vois que tes 15% étaient gonflés ! Allez, faisons +3% pour le même service et on signe.",
              'passif-agressif':
                "Donc tu essayais bien de nous surfacturer... Restons sur l'ancien tarif, ce sera plus honnête.",
              presse:
                "Si tu divises par deux en trente secondes, c'est qu'on peut fermer à +3%.",
              juridique:
                "Cette baisse immédiate sans modification de livrable confirme que l'indice Syntec de 3,2% suffit.",
            },
            statusLabel: 'Crédibilité tarifaire entamée — pousse pour 0%',
            tacticalNote:
              'Baisser son prix tout en maintenant 100% du périmètre prouve au client que votre hausse initiale était du bluff.',
          },
          {
            id: 'tarif-t2-engagement-volume',
            label: 'Conditionner un tarif à +11% à un volume annuel garanti',
            strategyTag: 'Contrepartie volume',
            userText:
              "Je ne peux pas baisser sous 920 €/j sur des commandes au mois le mois. En revanche, si vous vous engagez par contrat sur 120 jours fermes cette année, je bloque le tarif à 890 €/j (+11%).",
            receptivityDelta: 15,
            interlocutorReply: {
              radin:
                "Un engagement de volume de 120 jours contre une remise de 30 €/j ? Là, j'ai une économie chiffrable à présenter à ma direction.",
              'passif-agressif':
                "Au moins tu valorises notre fidélité sur l'année ! Sur un engagement annuel, 890 € devient défendable.",
              presse:
                "On a de toute façon besoin de toi toute l'année. Engager 120 jours pour ramener le tarif à 890 €/j, je signe.",
              juridique:
                "Une grille dégressive liée à un engagement ferme de 120 jours annuels est parfaitement conforme à notre politique achats.",
            },
            statusLabel: 'Très réceptif — échange tarif contre visibilité garantie',
            tacticalNote:
              'La règle d’or du B2B : « Si vous me donnez de la visibilité garantie sur le volume, je vous donne un geste sur le taux unitaire ».',
          },
        ],
      },
      {
        turnNumber: 3,
        stageTitle: 'Tour 3 / 4 — Protéger la trésorerie et les conditions de paiement',
        souffleurHint:
          'Utilisez les délais de règlement (30 jours au lieu de 60) ou un acompte trimestriel comme monnaie d’échange.',
        suggestedStarter:
          'Nous partons sur l’Option A sécurisée, et je bloque ce tarif pendant 18 mois sans nouvelle révision si nous passons le règlement à 30 jours fin de mois.',
        choices: [
          {
            id: 'tarif-t3-stabilite-18mois',
            label: 'Offrir un gel tarifaire de 18 mois contre validation du nouveau taux',
            strategyTag: 'Sécurité budgétaire',
            userText:
              "Si nous validons ce nouveau tarif aujourd'hui, j'inscris au contrat une clause de stabilité qui garantit zéro nouvelle hausse pendant les 18 prochains mois, jusqu'à fin 2027.",
            receptivityDelta: 15,
            interlocutorReply: {
              radin:
                "Zéro hausse supplémentaire garantie jusqu'à fin 2027 ? Ça me protège sur deux exercices budgétaires. C'est un vrai argument.",
              'passif-agressif':
                "Ça me rassure, au moins on n'aura pas cette conversation tendue tous les six mois.",
              presse:
                "Une visibilité budgétaire figée sur 18 mois, le contrôle de gestion adore ça.",
              juridique:
                "La clause de blocage tarifaire sur 18 mois compense favorablement la revalorisation initiale dans le rapport d'audit achats.",
            },
            statusLabel: 'Convaincu — achète la prévisibilité sur 18 mois',
            tacticalNote:
              'Offrir de la prévisibilité à moyen terme (clause de stabilité 18 mois) coûte très peu mais rassure énormément un acheteur.',
          },
          {
            id: 'tarif-t3-facturation-retard',
            label: 'Reporter l’application de la hausse de 6 mois gratuitement',
            strategyTag: 'Perte sèche',
            isTrap: true,
            userText:
              "Si vous voulez, on laisse l'ancien tarif pendant encore 6 mois et on ne passe au nouveau tarif qu'en fin d'année.",
            receptivityDelta: -6,
            interlocutorReply: {
              radin:
                "Parfait, 6 mois gratuits à l'ancien prix, et dans 6 mois on rediscutera pour voir si on prolonge !",
              'passif-agressif':
                "Bon, on garde l'ancien prix jusqu'en fin d'année alors.",
              presse:
                "Ok, donc rien ne change pendant 6 mois, on verra plus tard.",
              juridique:
                "Nous prorogeons donc le contrat actuel sans modification pendant un semestre.",
            },
            statusLabel: 'Vient de gagner 6 mois à l’ancien tarif sans engagement',
            tacticalNote:
              'Reporter de 6 mois revient à perdre 50% de votre hausse annuelle et vous obligera à tout renégocier dans 6 mois.',
          },
          {
            id: 'tarif-t3-paiement-30j',
            label: 'Échanger 2% de remise finale contre un paiement à 30 jours nets',
            strategyTag: 'Optimisation Cash',
            userText:
              "Pour faciliter votre signature interne, j'accorde 2% d'escompte commercial sur le nouveau tarif si la comptabilité passe nos factures en règlement à 30 jours nets au lieu de 60 jours.",
            receptivityDelta: 13,
            interlocutorReply: {
              radin:
                "2% d'escompte pour un paiement à 30 jours, notre trésorerie est excédentaire donc ça me fait baisser la facture faciale !",
              'passif-agressif':
                "C'est gagnant-gagnant, j'obtiens un geste et tu es payé plus vite.",
              presse:
                "Je valide le 30 jours nets avec la compta contre les 2% d'escompte.",
              juridique:
                "L'escompte pour règlement anticipé à 30 jours nets est un mécanisme standard que je peux signer immédiatement.",
            },
            statusLabel: 'Accord trouvé — chacun obtient un gain mesurable',
            tacticalNote:
              'Échanger une micro-remise (2%) contre une division par deux de vos délais de paiement améliore fortement votre trésorerie.',
          },
        ],
      },
      {
        turnNumber: 4,
        stageTitle: 'Tour 4 / 4 — Acter le nouveau bon de commande',
        souffleurHint:
          'Envoyez l’avenant prêt à signer par voie électronique dans l’heure pour éviter toute réouverture du dossier.',
        suggestedStarter:
          'C’est entendu. Je mets à jour l’avenant avec le SLA 4h et la garantie 18 mois et je vous l’envoie via signature électronique avant midi.',
        choices: [
          {
            id: 'tarif-t4-closing',
            label: 'Envoyer l’avenant en signature électronique avant midi',
            strategyTag: 'Closing B2B',
            userText:
              "Parfait, nous sommes alignés. Je mets à jour l'avenant avec le périmètre complet (SLA 4h + Niveau 2) et la clause de stabilité 18 mois, et je vous l'envoie en signature électronique avant midi pour prise d'effet le 1er du mois.",
            receptivityDelta: 14,
            interlocutorReply: {
              radin:
                "Envoie le lien DocuSign avant midi. Avec la garantie 18 mois et le support niveau 2 verrouillé, je le valide.",
              'passif-agressif':
                "Merci d'avoir pris le temps d'expliquer les choses clairement. Envoie l'avenant, je le signe avant ce soir.",
              presse:
                "Envoie le DocuSign avant midi, je clique dessus entre deux réunions et on continue de bosser.",
              juridique:
                "Dès réception du lien de signature électronique avec l'annexe SLA mise à jour, j'appose le visa des Achats.",
            },
            statusLabel: 'Contrat renouvelé au nouveau tarif — relation préservée',
            tacticalNote:
              'Vous avez défendu vos marges avec professionnalisme sans jamais dégrader la relation commerciale.',
          },
          {
            id: 'tarif-t4-flou',
            label: 'Attendre que le service achats rédige l’avenant',
            strategyTag: 'Perte de contrôle',
            isTrap: true,
            userText:
              "Super, je laisse votre service juridique rédiger le nouvel avenant quand ils auront le temps.",
            receptivityDelta: -7,
            interlocutorReply: {
              radin:
                "Notre service juridique a 6 semaines de délai, en attendant tu factures à l'ancien tarif bien sûr.",
              'passif-agressif':
                "On verra quand le juridique aura une minute...",
              presse:
                "Le juridique est débordé, ça prendra bien un mois ou deux.",
              juridique:
                "Tant que notre direction juridique n'a pas émis le document, le tarif antérieur demeure seul applicable.",
            },
            statusLabel: 'Retard d’application — vous perdez 1 à 2 mois de hausse',
            tacticalNote:
              'Celui qui tient la plume tient l’accord : fournissez toujours vous-même l’avenant prêt à signer le jour même.',
          },
        ],
      },
    ],
    defaultCheatSheet: [
      {
        context: 'Pour annoncer la hausse sans parler de vos propres coûts',
        phrase:
          '« Il ne s’agit pas d’une hausse à périmètre constant : depuis 18 mois, nous avons intégré [Livrable X et Support Y] (+25% de volume) au tarif gelé de 2024. Ce nouveau tarif régularise le périmètre réel. »',
        whyItWorks:
          'Remplace la perception d’une hausse arbitraire par la régularisation légitime d’une valeur déjà consommée par le client.',
      },
      {
        context: 'Face au refus budgétaire (« C’est trop cher »)',
        phrase:
          '« Vous gardez la maîtrise de votre budget : préférons-nous l’Option A à +15% avec réactivité sous 4h et support inclus, ou l’Option B à +5% en retirant les demandes urgentes hors sprint ? »',
        whyItWorks:
          'Active l’aversion à la perte : le client réalise que perdre votre réactivité lui coûterait beaucoup plus cher en interne.',
      },
      {
        context: 'Pour verrouiller la signature le jour même',
        phrase:
          '« Si nous signons cet avenant cette semaine, j’inclus une clause de garantie tarifaire qui fige ce prix pendant les 18 prochains mois. Je vous envoie le lien de signature avant midi. »',
        whyItWorks:
          'Donne à l’acheteur une victoire concrète (stabilité budgétaire sur 18 mois) qu’il peut valoriser auprès de sa direction.',
      },
    ],
  },
  {
    id: 'litige-proprio',
    title: 'Litige propriétaire / banque',
    shortSubtitle: 'Obtenir une prise en charge ou un remboursement de frais',
    stakeLabel: '850 € en jeu',
    durationLabel: '4 tours · Démo & IA',
    contextDescription:
      'Une fuite sur la colonne vétuste (ou des frais bancaires d’incident injustifiés) vous coûte 850 €. Votre interlocuteur tente de rejeter la responsabilité sur vous.',
    userObjective: 'Obtenir la prise en charge à 100% (ou remboursement intégral des 850 € sous 7 jours).',
    interlocutorRole: 'Gestionnaire Locatif / Conseiller Bancaire',
    openingMessage: {
      radin:
        "850 € de remboursement ? N'y comptez pas, c'est de l'entretien courant à votre charge. Nous ne débourserons pas un centime sur ce dossier.",
      'passif-agressif':
        "Depuis trois ans vous n'avez jamais eu de souci, et là au moindre incident vous nous réclamez 850 € avec un ton revendicatif... Ce n'est pas très élégant.",
      presse:
        "J'ai trente dossiers en attente aujourd'hui. Votre demande de prise en charge des 850 € a été refusée par le système, je ne peux rien faire de plus.",
      juridique:
        "Conformément aux conditions générales signées à l'ouverture, ces frais de 850 € relèvent de la responsabilité de l'occupant / titulaire. Le dossier est clos.",
    },
    turns: [
      {
        turnNumber: 1,
        stageTitle: 'Tour 1 / 4 — Opposer la preuve matérielle et la qualification légale',
        souffleurHint:
          'Restez d’un calme olympien : citez le constat technique ou le texte de référence qui exclut l’entretien courant.',
        suggestedStarter:
          'J’entends votre position initiale. Cependant, le rapport écrit du technicien établit que la défaillance provient de la vétusté structurelle (décret de 1987 / plafonnement légal), ce qui relève intégralement de votre prise en charge.',
        choices: [
          {
            id: 'lit-t1-preuve',
            label: 'Citer calmement le rapport technique écrit + le cadre légal',
            strategyTag: 'Preuve irréfutable',
            userText:
              "Je comprends que votre procédure standard classe cela en entretien courant. Cependant, l'attestation écrite du technicien établit formellement une rupture par vétusté structurelle. Selon le décret n°87-712 (et la jurisprudence constante), la vétusté incombe à 100% au bailleur.",
            receptivityDelta: 18,
            interlocutorReply: {
              radin:
                "Vous avez fait rédiger une attestation de vétusté par le technicien ? Bon... même s'il y a de la vétusté, 850 € c'est un devis gonflé.",
              'passif-agressif':
                "Vous sortez tout de suite les décrets et les attestations... On peut quand même discuter entre gens de bonne compagnie sans sortir le code civil.",
              presse:
                "Attendez, vous avez une attestation écrite qui mentionne explicitement la vétusté structurelle ? Transmettez-la-moi, ça change la qualification du dossier.",
              juridique:
                "Si vous disposez d'un constat contradictoire attestant de la vétusté au sens de l'article 1755 du Code civil, l'exception d'entretien courant tombe effectivement.",
            },
            statusLabel: 'Argument d’autorité accepté — recule sur le principe',
            tacticalNote:
              'Imparable : face à un refus bureaucratique, l’alliance d’une preuve technique écrite et de la référence légale exacte brise le refus automatique.',
          },
          {
            id: 'lit-t1-colere',
            label: 'S’énerver et crier au scandale / à l’escroquerie',
            strategyTag: 'Perte de sang-froid',
            isTrap: true,
            userText:
              "C'est du vol pur et simple ! Vous êtes des escrocs, je paie rubis sur l'ongle depuis 3 ans et vous refusez de payer 850 € ?!",
            receptivityDelta: -15,
            interlocutorReply: {
              radin:
                "Sur ce ton-là, vous n'obtiendrez strictement rien de ma part. Envoyez un courrier si ça vous chante.",
              'passif-agressif':
                "Eh bien voilà, des insultes maintenant ! Je note votre agressivité dans le dossier client et je mets fin à l'échange.",
              presse:
                "Je ne me fais pas crier dessus au téléphone. Rappelez quand vous serez calme.",
              juridique:
                "Tout propos injurieux entraîne la suspension immédiate du traitement amiable de votre réclamation.",
            },
            statusLabel: 'Refus total — utilise votre colère comme prétexte pour fermer le dossier',
            tacticalNote:
              'En litige, celui qui s’énerve perd : vous offrez à votre interlocuteur l’excuse idéale pour clore l’échange sans traiter le fond.',
          },
          {
            id: 'lit-t1-historique',
            label: 'Valoriser votre profil « zéro incident depuis 3 ans »',
            strategyTag: 'Capital confiance',
            userText:
              "En 36 mois d'historique chez vous, je n'ai eu aucun retard de paiement et aucun sinistre. Comment peut-on résoudre équitablement cet incident de 850 € qui ne dépend pas de mon usage ?",
            receptivityDelta: 11,
            interlocutorReply: {
              radin:
                "C'est vrai que votre compte n'a jamais posé de problème en trois ans... Mais 850 € d'un coup, je n'ai pas l'autorisation de le valider seul.",
              'passif-agressif':
                "Reconnaître que tout s'est bien passé pendant 3 ans, c'est déjà plus agréable. Voyons ce qu'on peut faire exceptionnellement.",
              presse:
                "Je vois votre score client : 36 mois sans incident. J'ai une marge de geste commercial, mais pas forcément sur 100%.",
              juridique:
                "Votre antériorité sans incident nous autorise à instruire une demande de prise en charge à titre commercial dérogatoire.",
            },
            statusLabel: 'Sensible à votre historique irréprochable',
            tacticalNote:
              'Votre historique « 36 mois zéro incident » est un actif financier : un bon locataire ou un bon client bancaire coûte cher à remplacer.',
          },
        ],
      },
      {
        turnNumber: 2,
        stageTitle: 'Tour 2 / 4 — Comparer le coût amiable au coût d’escalade',
        souffleurHint:
          'Montrez calmement qu’un règlement amiable aujourd’hui lui évite une procédure (Commission de conciliation / Médiateur) beaucoup plus coûteuse.',
        suggestedStarter:
          'Nous avons tous les deux intérêt à clore ce dossier aujourd’hui : une saisine de la Commission de conciliation (ou du Médiateur) immobiliserait du temps de gestion et aggraverait le coût.',
        choices: [
          {
            id: 'lit-t2-pont-or',
            label: 'Offrir un « pont d’or » amiable vs coût de médiation/expertise',
            strategyTag: 'Coût d’escalade',
            userText:
              "Je préfère cent fois un règlement amiable avec vous aujourd'hui. Car si nous devons passer par une expertise contradictoire et la Commission départementale de conciliation (ou le Médiateur), les frais de dossier et d'immobilisation dépasseront largement les 850 €.",
            receptivityDelta: 17,
            interlocutorReply: {
              radin:
                "C'est sûr que si on déclenche une expertise contradictoire, rien que le déplacement de l'expert me coûte 450 €... On a intérêt à s'entendre en direct.",
              'passif-agressif':
                "Pas besoin d'aller jusqu'au médiateur alors qu'on peut régler ça entre nous intelligemment...",
              presse:
                "Surtout pas de dossier médiateur, ça me prend quatre heures de rapport interne ! Réglons ça maintenant.",
              juridique:
                "Au vu de l'attestation de vétusté, le risque de condamnation en commission de conciliation est élevé. Une transaction amiable directe est préférable.",
            },
            statusLabel: 'Veut éviter l’escalade administrative à tout prix',
            tacticalNote:
              'Pour un gestionnaire, un dossier envoyé au Médiateur ou en Commission dégrade ses indicateurs internes et lui coûte des heures de paperasse.',
          },
          {
            id: 'lit-t2-50-50',
            label: 'Proposer tout de suite de payer la moitié (425 €) de votre poche',
            strategyTag: 'Abandon de droit',
            isTrap: true,
            userText:
              "Bon, si vous prenez la moitié à votre charge, je veux bien payer 425 € de ma poche pour qu'on en finisse.",
            receptivityDelta: -6,
            interlocutorReply: {
              radin:
                "Si vous acceptez de payer 425 €, c'est que vous êtes un peu responsable ! Disons que je prends 250 € et vous payez 600 €.",
              'passif-agressif':
                "C'est raisonnable de participer. On va regarder pour prendre 300 € de notre côté.",
              presse:
                "Ok, 50/50 à 425 €, je le saisis tout de suite et vous renoncez à toute réclamation.",
              juridique:
                "En proposant une prise en charge à 50%, vous reconnaissez implicitement un partage de responsabilité.",
            },
            statusLabel: 'Profite de votre concession alors que la loi était à 100% de votre côté',
            tacticalNote:
              'Lorsque la preuve technique et le droit sont à 100% de votre côté (vétusté), proposer 50/50 trop tôt vous fait perdre 425 €.',
          },
        ],
      },
      {
        turnNumber: 3,
        stageTitle: 'Tour 3 / 4 — Faciliter la modalité de remboursement',
        souffleurHint:
          'Donnez-lui une modalité simple à exécuter dans son logiciel (imputation sur la prochaine échéance ou virement de régularisation).',
        suggestedStarter:
          'Pour simplifier votre écriture comptable, préférez-vous procéder par virement de 850 € cette semaine ou par déduction directe sur l’échéance du mois prochain ?',
        choices: [
          {
            id: 'lit-t3-double-modalite',
            label: 'Proposer le choix entre virement direct ou déduction sur prochaine échéance',
            strategyTag: 'Facilitation exécutive',
            userText:
              "Pour simplifier le traitement dans votre logiciel comptable, quelle formule vous arrange le plus pour les 850 € : un virement de remboursement sous 7 jours, ou une déduction directe par avoir sur l'échéance du mois prochain ?",
            receptivityDelta: 16,
            interlocutorReply: {
              radin:
                "Une déduction par avoir sur l'échéance du mois prochain m'évite de sortir du cash de la trésorerie aujourd'hui ! Ça, je peux le valider.",
              'passif-agressif':
                "Merci de penser à ma gestion comptable. L'avoir sur la prochaine échéance est beaucoup plus simple pour moi.",
              presse:
                "L'avoir de 850 € ou l'écriture de rétrocession directe, je peux la passer en deux clics sans double signature.",
              juridique:
                "Une compensation conventionnelle par émission d'un avoir de 850 € sur la prochaine quittance est juridiquement irréprochable.",
            },
            statusLabel: 'Modalité adoptée — prise en charge à 100% validée',
            tacticalNote:
              'Génial : proposer un « avoir sur la prochaine échéance » lève souvent le blocage de décaissement en trésorerie.',
          },
          {
            id: 'lit-t3-blocage-loyer',
            label: 'Menacer de bloquer vos paiements unilatéralement sans accord',
            strategyTag: 'Faute juridique',
            isTrap: true,
            userText:
              "De toute façon, si vous ne me remboursez pas demain matin, je bloque tous mes prochains prélèvements moi-même !",
            receptivityDelta: -14,
            interlocutorReply: {
              radin:
                "Essayez donc de bloquer votre échéance sans accord écrit, je vous applique immédiatement 10% de pénalités de retard !",
              'passif-agressif':
                "Ah, le retour des menaces... Faites ça et vous passerez directement au service contentieux.",
              presse:
                "Si vous rejetez le prélèvement, le système déclenche des frais d'impayés automatiques.",
              juridique:
                "Nul ne peut se faire justice à soi-même : la retenue unilatérale sans accord écrit ni autorisation judiciaire constitue un défaut de paiement fautif.",
            },
            statusLabel: 'Contentieux déclenché — vous vous mettez en tort juridique',
            tacticalNote:
              'Attention : en droit français, suspendre unilatéralement son loyer sans accord écrit ou consignation judiciaire vous met immédiatement en tort.',
          },
        ],
      },
      {
        turnNumber: 4,
        stageTitle: 'Tour 4 / 4 — Obtenir la confirmation écrite séance tenante',
        souffleurHint:
          'Demandez un email de confirmation de l’avoir de 850 € avant de raccrocher ou de quitter le bureau.',
        suggestedStarter:
          'Parfait pour l’avoir de 850 €. Pouvez-vous m’envoyer le mail de confirmation de cette régularisation maintenant pendant que nous sommes ensemble ?',
        choices: [
          {
            id: 'lit-t4-mail-direct',
            label: 'Obtenir le mail de confirmation des 850 € en direct',
            strategyTag: 'Preuve écrite immédiate',
            userText:
              "C'est parfait pour cette régularisation intégrale de 850 €. Pour que notre dossier soit bien clos des deux côtés, pouvez-vous m'envoyer le mail de confirmation de cet avoir maintenant pendant que nous sommes en ligne ?",
            receptivityDelta: 15,
            interlocutorReply: {
              radin:
                "Je vous tape le mail de confirmation de l'avoir de 850 € tout de suite... Voilà, c'est envoyé. Au moins on n'a pas de frais d'expert.",
              'passif-agressif':
                "Voilà, je viens de vous envoyer la confirmation par mail. Comme quoi, en discutant calmement, on trouve toujours une issue !",
              presse:
                "C'est saisi et le mail de confirmation de 850 € vient de partir dans votre boîte. Dossier clôturé !",
              juridique:
                "Je viens de générer et d'expédier la notification écrite d'avoir de 850 € valant clôture amiable du sinistre.",
            },
            statusLabel: 'Remboursement de 850 € obtenu par écrit !',
            tacticalNote:
              'Sans écrit, rien n’est acquis : demander l’envoi du mail de confirmation pendant l’appel verrouille définitivement votre victoire.',
          },
          {
            id: 'lit-t4-confiance-orale',
            label: 'Raccrocher sans demander de trace écrite',
            strategyTag: 'Oubli de preuve',
            isTrap: true,
            userText:
              "Super, merci beaucoup pour votre parole, je verrai bien ça sur le relevé du mois prochain. Au revoir !",
            receptivityDelta: -5,
            interlocutorReply: {
              radin:
                "Oui, au revoir ! (Et si la comptabilité oublie de passer l'avoir le mois prochain, il faudra tout recommencer...).",
              'passif-agressif':
                "Au revoir, bonne journée.",
              presse:
                "Salut ! (Passe immédiatement à un autre appel avant d'avoir validé l'écriture).",
              juridique:
                "Au revoir. (Aucune trace écrite n'est enregistrée dans votre espace client).",
            },
            statusLabel: 'Accord fragile — aucune preuve écrite entre vos mains',
            tacticalNote:
              'Dans une administration, une banque ou une régie immobilière, un accord téléphonique non confirmé par mail dans la minute disparaît une fois sur deux.',
          },
        ],
      },
    ],
    defaultCheatSheet: [
      {
        context: 'Pour renverser le refus automatique du début',
        phrase:
          '« Je comprends votre procédure standard. Cependant, l’attestation technique écrite établit une cause liée à la vétusté (décret n°87-712 / article 1755 du Code civil), qui relève à 100% d’une prise en charge de votre part. »',
        whyItWorks:
          'Allie empathie procédurale et preuve juridique précise, ce qui oblige l’interlocuteur à sortir de sa réponse-type.',
      },
      {
        context: 'Pour rendre l’accord amiable plus attractif que le refus',
        phrase:
          '« En 36 mois sans aucun incident, je privilégie un accord direct aujourd’hui. Une saisine de la Commission de conciliation ou du Médiateur engendrerait des coûts de gestion bien supérieurs aux 850 €. »',
        whyItWorks:
          'Fait réaliser au gestionnaire que vous dire « Oui » lui économise un dossier contentieux chronophage.',
      },
      {
        context: 'Pour faciliter le remboursement et verrouiller la preuve',
        phrase:
          '« Préférez-vous procéder par virement sous 7 jours ou par avoir déduit de ma prochaine échéance ? Pouvez-vous m’envoyer l’email de confirmation pendant que nous sommes en ligne ? »',
        whyItWorks:
          'L’avoir comptable contourne les blocages de trésorerie et le mail en direct verrouille juridiquement la décision.',
      },
    ],
  },
];

export function getStatusLabelForReceptivity(receptivity: number): string {
  if (receptivity < 25) return 'Hostile — L’interlocuteur se braque complètement';
  if (receptivity < 42) return 'Fermé — Campe sur ses positions et teste vos limites';
  if (receptivity < 58) return 'Écoute prudente — Attend des preuves chiffrées';
  if (receptivity < 74) return 'Réceptif — Commence à chercher un terrain d’entente';
  return 'Favorable — Prêt à céder si vous verrouillez l’écrit';
}

export interface FreeTextEvaluationResult {
  reply: string;
  receptivityDelta: number;
  newReceptivity: number;
  statusLabel: string;
  tacticalNote: string;
  nextHint: string;
  suggestedStarter: string;
}

/**
 * Analyseur rhétorique local pour les réponses libres (clavier ou micro) en Mode Démo ou hors-ligne
 */
export function evaluateFreeTextTurn(params: {
  userMessage: string;
  scenario: ScenarioPreset;
  persona: PersonaProfile;
  difficulty: DifficultyConfig;
  currentReceptivity: number;
  turnNumber: number;
}): FreeTextEvaluationResult {
  const { userMessage, scenario, persona, difficulty, currentReceptivity, turnNumber } = params;
  const text = userMessage.toLowerCase();

  let rawScore = 6; // base positive engagement
  const notes: string[] = [];

  // 1. Check for numbers / concrete quantification
  const hasNumbers = /\d+/.test(text) || /%|€|euros|mois|jours|ans/.test(text);
  if (hasNumbers) {
    rawScore += 7;
    notes.push('excellent usage de données chiffrées');
  }

  // 2. Check for calibrated questions ("comment", "qu'est-ce qui", "quelle option")
  const hasCalibratedQuestion =
    /comment|qu'est-ce qui|quelle option|préférez-vous|que faudrait-il/.test(text) || text.includes('?');
  if (hasCalibratedQuestion) {
    rawScore += 6;
    notes.push('question calibrée qui implique l’interlocuteur');
  }

  // 3. Check for structural negotiation keywords (avenant, écrit, option, contrepartie, virement, preuve)
  const hasTacticalMarkers =
    /avenant|écrit|option|virement|preuve|rapport|décret|périmètre|rétention|facture|garantie|vendredi|aujourd'hui/.test(
      text
    );
  if (hasTacticalMarkers) {
    rawScore += 5;
    notes.push('ancrage concret orienté solution');
  }

  // 4. Check for weak / apologetic traps
  const hasWeakApologies =
    /désolé|excusez|s'il vous plaît|pitié|besoin d'argent|inflation|loyer personnel|coupé la poire/.test(text);
  if (hasWeakApologies) {
    rawScore -= 14;
    notes.push('attention à ne pas vous justifier par vos besoins personnels');
  }

  // 5. Check for aggressive / insulting traps
  const hasAggression = /arnaque|escroc|vol|honteux|marchand de tapis|ridicule|ultimatum/.test(text);
  if (hasAggression) {
    rawScore -= 18;
    notes.push('l’attaque frontale braque immédiatement l’ego de l’interlocuteur');
  }

  // Short lazy reply check
  if (userMessage.trim().length < 18) {
    rawScore -= 8;
    notes.push('réponse trop brève face à un interlocuteur exigeant');
  }

  const adjustedDelta = Math.round(
    rawScore * (rawScore >= 0 ? difficulty.deltaMultiplier : 2 - difficulty.deltaMultiplier)
  );
  const clampedDelta = Math.max(-18, Math.min(22, adjustedDelta));
  const newReceptivity = Math.max(8, Math.min(96, currentReceptivity + clampedDelta));

  // Pick matching reply from current turn in scenario preset if available
  const turnIndex = Math.min(turnNumber - 1, scenario.turns.length - 1);
  const currentTurnObj = scenario.turns[turnIndex];
  const nextTurnObj = scenario.turns[Math.min(turnIndex + 1, scenario.turns.length - 1)];

  let replyText = '';
  if (currentTurnObj) {
    const chosenChoice =
      clampedDelta >= 12
        ? currentTurnObj.choices[0]
        : clampedDelta < 0
        ? currentTurnObj.choices.find((c) => c.isTrap) || currentTurnObj.choices[1]
        : currentTurnObj.choices[currentTurnObj.choices.length - 1];
    replyText = chosenChoice.interlocutorReply[persona.id];
  } else {
    replyText =
      clampedDelta >= 10
        ? `Votre point est précis. En tenant compte de cet élément, je peux envisager une ouverture si nous verrouillons les conditions par écrit.`
        : `Cet argument ne suffit pas à me faire déroger à ma ligne. Qu'avez-vous de concret et chiffré à me proposer ?`;
  }

  const statusLabel = getStatusLabelForReceptivity(newReceptivity);
  const tacticalNote =
    notes.length > 0
      ? `Analyse tactique : ${notes.join(' · ')}.`
      : clampedDelta >= 0
      ? 'Analyse tactique : posture calme et maintenue, continuez à chiffrer vos demandes.'
      : 'Analyse tactique : votre formulation a laissé une brèche à votre interlocuteur.';

  return {
    reply: replyText,
    receptivityDelta: clampedDelta,
    newReceptivity,
    statusLabel,
    tacticalNote,
    nextHint:
      nextTurnObj?.souffleurHint ||
      'Verrouillez maintenant un accord écrit avec une échéance précise (date + heure).',
    suggestedStarter:
      nextTurnObj?.suggestedStarter ||
      'Je vous envoie le récapitulatif écrit aujourd’hui à 16h pour validation finale d’ici vendredi.',
  };
}

export interface DebriefReport {
  score: number;
  verdict: string;
  verdictSummary: string;
  strengths: string[];
  traps: string[];
  cheatSheetPhrases: CheatSheetPhrase[];
}

export function buildLocalDebriefReport(params: {
  scenario: ScenarioPreset;
  customContext?: string;
  persona: PersonaProfile;
  difficulty: DifficultyConfig;
  finalReceptivity: number;
  history: { sender: 'user' | 'interlocutor'; text: string; delta?: number; isTrap?: boolean }[];
}): DebriefReport {
  const { scenario, customContext, persona, difficulty, finalReceptivity, history } = params;
  const userMessages = history.filter((m) => m.sender === 'user');
  const trapsHit = userMessages.filter((m) => (m.delta !== undefined && m.delta < 0) || m.isTrap);
  const strongMoves = userMessages.filter((m) => m.delta !== undefined && m.delta >= 12);

  const score = Math.min(
    98,
    Math.max(
      28,
      Math.round(finalReceptivity * 0.85 + strongMoves.length * 6 - trapsHit.length * 7)
    )
  );

  let verdict = 'Compromis sous conditions';
  let verdictSummary = `Face au profil « ${persona.name} » (niveau ${difficulty.name}), vous avez amené la réceptivité à ${finalReceptivity}%. La porte est ouverte, mais il faudra verrouiller l'échéance par écrit dès le jour J pour éviter tout report.`;

  if (finalReceptivity >= difficulty.approvalThreshold) {
    verdict = 'Accord obtenu';
    verdictSummary = `Excellente maîtrise tactique face à « ${persona.name} » (${difficulty.name}) avec ${finalReceptivity}% de réceptivité finale. Vous avez su ancrer sur des faits chiffrés, résister à la pression et sécuriser un engagement concret.`;
  } else if (finalReceptivity < 45) {
    verdict = 'Impasse — À retravailler';
    verdictSummary = `Avec ${finalReceptivity}% de réceptivité finale face à « ${persona.name} », l'interlocuteur a gardé l'ascendant. En éliminant les justifications personnelles et en chiffrant le coût de l'inaction, vous inverserez le rapport de force.`;
  }

  const strengths: string[] = [];
  if (strongMoves.length >= 2) {
    strengths.push(
      'Ancrage factuel solide : vous avez appuyé votre demande sur des chiffres vérifiables plutôt que sur de l’affect.'
    );
    strengths.push(
      'Gestion de l’impasse : vous avez su proposer des options structurées (double choix / contrepartie) pour débloquer la décision.'
    );
  } else if (strongMoves.length === 1) {
    strengths.push(
      'Capacité à poser un argument chiffré pertinent qui a forcé l’interlocuteur à sortir de son refus de principe.'
    );
    strengths.push(
      `Sang-froid maintenu face aux tactiques de déstabilisation du profil « ${persona.name} ».`
    );
  } else {
    strengths.push(
      'Vous êtes allé au bout de la confrontation sans abandonner la discussion dès la première objection.'
    );
    strengths.push(
      'Identification claire de votre objectif initial dès l’ouverture de l’échange.'
    );
  }

  const traps: string[] = [];
  if (trapsHit.length > 0) {
    traps.push(
      `Piège détecté (${trapsHit.length}x) : concession trop rapide ou justification personnelle qui a donné une prise directe à « ${persona.name} ».`
    );
    traps.push(
      `Rappel face au profil « ${persona.name} » : ${persona.trapToAvoid}`
    );
  } else {
    traps.push(
      `Vigilance jour J face à « ${persona.name} » : ${persona.trapToAvoid}`
    );
    traps.push(
      'Attention au relâchement de fin d’entretien : ne quittez jamais la table sans avoir fixé qui envoie l’écrit et à quelle date.'
    );
  }

  const cheatSheetPhrases: CheatSheetPhrase[] =
    scenario.id === 'custom' && customContext
      ? [
          {
            context: `Ouverture & Ancrage (${customContext.slice(0, 42)}...)`,
            phrase:
              '« Au vu des éléments factuels et de la valeur concrète engagée sur ce dossier, comment pouvons-nous construire un accord équilibré autour de mon objectif ? »',
            whyItWorks:
              'Pose votre demande avec calme et transfère la charge de la résolution à votre interlocuteur via une question en « Comment ».',
          },
          {
            context: `Contrer le blocage de « ${persona.name} »`,
            phrase:
              '« Je comprends votre contrainte interne. Pour vous faciliter la validation, préférons-nous l’Option A (intégrale immédiate) ou l’Option B (en deux paliers inscrits par écrit) ? »',
            whyItWorks:
              'Remplace un affrontement binaire (Oui/Non) par un arbitrage de modalités où les deux options vous font gagner.',
          },
          {
            context: 'Closing & Verrouillage écrit le jour J',
            phrase:
              '« Parfait, nous sommes alignés. Je vous envoie le mail récapitulatif aujourd’hui avant 17h afin que nous puissions valider l’écrit définitif d’ici vendredi. »',
            whyItWorks:
              'Prendre l’initiative du compte-rendu écrit empêche l’interlocuteur de revenir sur ses concessions à froid.',
          },
        ]
      : scenario.defaultCheatSheet;

  return {
    score,
    verdict,
    verdictSummary,
    strengths,
    traps,
    cheatSheetPhrases,
  };
}
