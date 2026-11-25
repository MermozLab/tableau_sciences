/**
 * ============================================================
 * MATHILAB — ALGORITHMIQUE / PYTHON
 * TD02 : Statistiques à deux variables et probabilités en Python
 * mathilab/tp-algorithme/js/td02-statistiques-probabilites-python.js
 * ============================================================
 * Chargé par navigation.js juste après l'injection du fragment
 * tp-algorithme/modules/td02-statistiques-probabilites-python.html dans #content.
 */

import FILIERES_PRO from '../../../js/filieres.js';
import { initContextePro } from '../../../js/contexte-pro.js';
import { initRadarCompetences } from '../../../js/radar.js';
import { initOngletsParFiliere } from '../../../js/onglets-filiere.js';
import { initSections, initTabs } from '../../../js/utils.js';
import { initBoutonsPyLab } from '../../../js/pylab.js';
import { initImpressionCompteRendu } from './compte-rendu-algorithme.js';
import { garantirMenuFiliere } from './filiere-select.js';
import { initQuestionsParOnglet } from './questions-par-onglet.js';
import { initPuzzleAffichage } from './puzzle-affichage.js';
import { initNavigationTP } from './nav-tp.js';
import { R5, construireSujets, initPuzzle } from './puzzle-algorithme.js';

/* ============================================================
   CONTEXTES PROFESSIONNELS — TD02
   Une problématique par onglet (clé = id de l'onglet), rappelée
   en question 5 de « Trace écrite - Compte rendu ».
   ============================================================ */

const CONTEXTES_TD02 = {
  '1ere-trpm': {
    contexte: "En atelier de réalisation mécanique, une série de mesures (dimension, temps d'usinage) peut être liée à une autre grandeur ; un contrôle qualité en deux étapes peut être représenté par un arbre pondéré.",
    problematiques: {
      'stats-1ere': "Comment ajuster une série de mesures pour prédire une valeur non mesurée ?",
      'probas-1ere': "Comment estimer le risque combiné de deux contrôles successifs ?",
    },
  },
  '1ere-tci': {
    contexte: "En chaudronnerie industrielle, une surface de tôle développée peut être liée à une dimension de pièce ; un contrôle en plusieurs étapes (soudure puis contrôle dimensionnel) peut être représenté par un arbre pondéré.",
    problematiques: {
      'stats-1ere': "Comment ajuster une série de mesures de tôlerie pour en prédire une nouvelle ?",
      'probas-1ere': "Comment estimer le risque combiné de deux contrôles successifs ?",
    },
  },
  '1ere-mcc': {
    contexte: "En atelier de confection, un temps de montage peut être lié à la complexité d'un modèle ; un contrôle qualité en deux étapes (montage puis finition) peut être représenté par un arbre pondéré.",
    problematiques: {
      'stats-1ere': "Comment ajuster une série de temps de montage pour en prédire un nouveau ?",
      'probas-1ere': "Comment estimer le risque combiné de deux contrôles successifs ?",
    },
  },
  '1ere-log': {
    contexte: "En logistique, un délai de livraison peut être lié à la distance parcourue ; un incident de livraison peut dépendre de plusieurs facteurs représentables par un arbre pondéré.",
    problematiques: {
      'stats-1ere': "Comment ajuster une série de délais de livraison pour en prédire un nouveau ?",
      'probas-1ere': "Comment estimer le risque combiné de deux incidents successifs ?",
    },
  },
  '1ere-agora': {
    contexte: "Dans une structure administrative, un délai de traitement de dossier peut être lié au nombre de dossiers en attente ; un contrôle en plusieurs étapes (saisie puis validation) peut être représenté par un arbre pondéré.",
    problematiques: {
      'stats-1ere': "Comment ajuster une série de délais de traitement pour en prédire un nouveau ?",
      'probas-1ere': "Comment estimer le risque combiné de deux contrôles successifs ?",
    },
  },
  'tle-trpm': {
    contexte: "En atelier de réalisation mécanique, une série de mesures peut ne pas suivre un modèle affine (usure d'outil, dérive thermique) ; un contrôle qualité en deux étapes peut dépendre l'une de l'autre ou non.",
    problematiques: {
      'stats-tle': "Quel modèle d'ajustement choisir lorsqu'une droite ne convient pas ?",
      'probas-tle': "Deux contrôles successifs sont-ils réellement indépendants ?",
    },
  },
  'tle-tci': {
    contexte: "En chaudronnerie industrielle, une grandeur peut évoluer de façon non affine avec les dimensions (déformation, contrainte) ; deux contrôles successifs (soudure puis étanchéité) peuvent être liés ou non.",
    problematiques: {
      'stats-tle': "Quel modèle d'ajustement choisir pour une série non affine ?",
      'probas-tle': "Deux contrôles de tôlerie sont-ils indépendants ?",
    },
  },
  'tle-mcc': {
    contexte: "En atelier de confection, un coût ou un temps de production peut évoluer de façon non affine avec la taille de série ; deux contrôles qualité successifs peuvent être liés ou non.",
    problematiques: {
      'stats-tle': "Quel modèle d'ajustement choisir pour une série non affine ?",
      'probas-tle': "Deux contrôles de confection sont-ils indépendants ?",
    },
  },
  'tle-log': {
    contexte: "En logistique, un coût de transport peut évoluer de façon non affine avec la distance (effet de seuil, tarifs dégressifs) ; deux incidents successifs sur une tournée peuvent être liés ou non.",
    problematiques: {
      'stats-tle': "Quel modèle d'ajustement choisir pour un coût de transport non affine ?",
      'probas-tle': "Deux incidents de livraison sont-ils indépendants ?",
    },
  },
  'tle-agora': {
    contexte: "Dans une structure administrative, un délai de traitement peut évoluer de façon non affine avec la charge de travail ; deux contrôles administratifs successifs peuvent être liés ou non.",
    problematiques: {
      'stats-tle': "Quel modèle d'ajustement choisir pour un délai non affine ?",
      'probas-tle': "Deux contrôles administratifs sont-ils indépendants ?",
    },
  },
};

/* ============================================================
   ACTIVITÉ PUZZLE — TD02 (sujets A / B / C)
   ============================================================ */

/* ---------- TD02 : statistiques et probabilités en Python (1ère/Tle) ---------- */
const A2_LIB = {
  trpm: "le temps d'usinage", tci: "la surface de tôle développée", mcc: "le temps de montage",
  log: "le délai de livraison", agora: "le délai de traitement d'un dossier",
};
const PUZZLE_TD02 = {
  params: A2_LIB,
  build: (P, N, cad) => ({
    A: { contexte: `${cad}, on dispose d'une série de mesures liant deux grandeurs, dont ${P}.`,
      problematique: `Quelle droite ajuste au mieux ces mesures, et quelle prévision peut-on en tirer ?`, questions: [
        `Reprendre les listes x et y du programme « Droite d'ajustement ».`,
        `Exécuter le programme pour obtenir les coefficients a et b de la droite y = ax + b.`,
        `Utiliser la droite pour estimer y pour une nouvelle valeur de x.`,
        `Discuter si cette estimation est une interpolation ou une extrapolation.`, R5] },
    B: { contexte: `${cad}, deux évènements A et B sont associés à deux contrôles indépendants, avec p_a = 0,4 et p_b = 0,3.`,
      problematique: `Quelles sont les probabilités P(A∪B) et P(A∩B) ?`, questions: [
        `Exécuter le programme de simulation avec p_a = 0,4 et p_b = 0,3.`,
        `Relever les fréquences simulées de A∪B et de A∩B.`,
        `Comparer ces fréquences à la formule P(A∪B) = P(A) + P(B) − P(A∩B).`,
        `Conclure sur la formule vérifiée par la simulation.`, R5] },
    C: { contexte: `${cad}, un arbre pondéré modélise deux contrôles successifs avec p_b_si_a = 0,9 et p_b_si_non_a = 0,5.`,
      problematique: `Les évènements A et B sont-ils indépendants ?`, questions: [
        `Exécuter le programme « Simuler un arbre pondéré » avec ces valeurs.`,
        `Relever P(A et B) simulée.`,
        `Calculer P(A) × P(B) et le comparer à P(A et B).`,
        `Modifier p_b_si_a et p_b_si_non_a pour qu'elles soient égales : que devient l'indépendance ?`, R5] },
  }),
};

function construirePuzzleTD02(cle) {
  const r = construireSujets(PUZZLE_TD02, cle);
  return r ? r.sujets : null;
}

/* ============================================================
   INITIALISATION — point d'entrée appelé par navigation.js
   ============================================================ */

/** Une étape en erreur n'empêche jamais les suivantes. */
function etape(nom, fn) {
  try { fn(); }
  catch (err) { console.error(`[tp-algorithme] étape « ${nom} » en erreur :`, err); }
}

export function init() {
  etape('initContextePro', () => { initContextePro({ afficherProblematique: false, filieres: FILIERES_PRO, contextes: CONTEXTES_TD02 }); });
  etape('garantirMenuFiliere', () => { garantirMenuFiliere(CONTEXTES_TD02); });
  etape('initPuzzle', () => { initPuzzle(construirePuzzleTD02); });
  etape('initPuzzleAffichage', () => { initPuzzleAffichage(); });
  etape('initOngletsParFiliere', () => { initOngletsParFiliere(); });
  etape('initSections', () => { initSections(); });
  etape('initTabs', () => { initTabs(); });
  etape('initBoutonsPyLab', () => { initBoutonsPyLab('.btn-pylab'); });
  etape('initRadarCompetences', () => { initRadarCompetences(); });
  etape('initQuestionsParOnglet', () => { initQuestionsParOnglet(); });
  etape('initNavigationTP', () => { initNavigationTP(); });
  etape('initImpressionCompteRendu', () => {
    initImpressionCompteRendu({ titre: "Statistiques à deux variables et probabilités en Python", tp: 'TD02' });
  });
}
