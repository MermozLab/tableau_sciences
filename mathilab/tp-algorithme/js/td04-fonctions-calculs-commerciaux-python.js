/**
 * ============================================================
 * MATHILAB — ALGORITHMIQUE / PYTHON
 * TD04 : Fonctions et calculs commerciaux en Python
 * mathilab/tp-algorithme/js/td04-fonctions-calculs-commerciaux-python.js
 * ============================================================
 * Chargé par navigation.js juste après l'injection du fragment
 * tp-algorithme/modules/td04-fonctions-calculs-commerciaux-python.html dans #content.
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
   CONTEXTES PROFESSIONNELS — TD04
   Une problématique par onglet (clé = id de l'onglet), rappelée
   en question 5 de « Trace écrite - Compte rendu ».
   ============================================================ */

const CONTEXTES_TD04 = {
  '2nde-remi': {
    contexte: "En atelier de réalisation mécanique, une pièce ou un procédé peuvent se modéliser par une fonction (coût, dimension) ; un investissement ou une facture d'achat de matière nécessite un calcul d'intérêt ou de remise.",
    problematiques: {
      'fonctions-2nde': "Comment automatiser, en Python, la recherche d'un optimum de production ?",
      'commercial-2nde': "Comment automatiser, en Python, le calcul d'un coût financier ?",
    },
  },
  '2nde-gatl': {
    contexte: "En logistique, un coût de tournée ou un délai peuvent se modéliser par une fonction ; le financement d'un véhicule ou d'un entrepôt nécessite un calcul d'intérêt ou de remise sur facture.",
    problematiques: {
      'fonctions-2nde': "Comment automatiser, en Python, la recherche d'un coût minimal ?",
      'commercial-2nde': "Comment automatiser, en Python, le calcul d'un financement ?",
    },
  },
  '2nde-mcc': {
    contexte: "En atelier de confection, un coût de production ou un temps de montage peuvent se modéliser par une fonction ; l'achat de matériel ou de tissu nécessite un calcul d'intérêt ou de remise.",
    problematiques: {
      'fonctions-2nde': "Comment automatiser, en Python, la recherche d'un optimum de production ?",
      'commercial-2nde': "Comment automatiser, en Python, le calcul d'un coût financier ?",
    },
  },
  '1ere-trpm': {
    contexte: "En usinage, un coût de production non factorisé peut nécessiter une résolution par balayage ; un placement à intérêts simples peut financer un outillage.",
    problematiques: {
      'balayage-1ere': "Comment résoudre par balayage une équation de coût qui ne se factorise pas ?",
      'tangente-1ere': "Que représente la pente de la tangente à la courbe du coût de production en un point, et comment la visualiser avec GeoGebra ?",
      'commercial-1ere': "Quel capital obtient-on après plusieurs périodes de placement à intérêts simples ?",
    },
  },
  '1ere-tci': {
    contexte: "En chaudronnerie, une équation liée à une dimension de pièce peut ne pas se factoriser simplement ; un placement à intérêts simples peut financer un équipement.",
    problematiques: {
      'balayage-1ere': "Comment résoudre par balayage une équation de dimensionnement qui ne se factorise pas ?",
      'tangente-1ere': "Que représente la pente de la tangente à la courbe de la déformation d'une pièce en un point, et comment la visualiser avec GeoGebra ?",
      'commercial-1ere': "Quel capital obtient-on après plusieurs périodes de placement à intérêts simples ?",
    },
  },
  '1ere-mcc': {
    contexte: "En confection, un coût de production non factorisé peut nécessiter une résolution par balayage ; un placement à intérêts simples peut financer du matériel.",
    problematiques: {
      'balayage-1ere': "Comment résoudre par balayage une équation de coût qui ne se factorise pas ?",
      'tangente-1ere': "Que représente la pente de la tangente à la courbe du coût de production d'un vêtement en un point, et comment la visualiser avec GeoGebra ?",
      'commercial-1ere': "Quel capital obtient-on après plusieurs périodes de placement à intérêts simples ?",
    },
  },
  '1ere-log': {
    contexte: "En logistique, un coût de tournée non factorisé peut nécessiter une résolution par balayage ; un placement à intérêts simples peut financer un véhicule.",
    problematiques: {
      'balayage-1ere': "Comment résoudre par balayage une équation de coût de tournée qui ne se factorise pas ?",
      'tangente-1ere': "Que représente la pente de la tangente à la courbe du coût d'une tournée en un point, et comment la visualiser avec GeoGebra ?",
      'commercial-1ere': "Quel capital obtient-on après plusieurs périodes de placement à intérêts simples ?",
    },
  },
  '1ere-agora': {
    contexte: "Dans une structure administrative, un coût de gestion non factorisé peut nécessiter une résolution par balayage ; un placement à intérêts simples peut financer un équipement de bureau.",
    problematiques: {
      'balayage-1ere': "Comment résoudre par balayage une équation de coût de gestion qui ne se factorise pas ?",
      'tangente-1ere': "Que représente la pente de la tangente à la courbe du coût de gestion en un point, et comment la visualiser avec GeoGebra ?",
      'commercial-1ere': "Quel capital obtient-on après plusieurs périodes de placement à intérêts simples ?",
    },
  },
  'tle-trpm': {
    contexte: "En usinage, un coût de production de degré 3 (avec extremum local) peut nécessiter une résolution par balayage ; un emprunt à intérêts composés peut financer un outillage.",
    problematiques: {
      'balayage-tle': "Comment trouver par balayage les racines d'une fonction de degré 3 ?",
      'commercial-tle': "Quel est le coût total d'un crédit finançant un équipement ?",
    },
  },
  'tle-tci': {
    contexte: "En chaudronnerie, une équation de degré 3 (contrainte, déformation) peut nécessiter une résolution par balayage ; un emprunt à intérêts composés peut financer un équipement.",
    problematiques: {
      'balayage-tle': "Comment trouver par balayage les racines d'une fonction de degré 3 ?",
      'commercial-tle': "Quel est le coût total d'un crédit finançant un équipement ?",
    },
  },
  'tle-mcc': {
    contexte: "En confection, un coût de production de degré 3 peut nécessiter une résolution par balayage ; un emprunt à intérêts composés peut financer du matériel.",
    problematiques: {
      'balayage-tle': "Comment trouver par balayage les racines d'une fonction de degré 3 ?",
      'commercial-tle': "Quel est le coût total d'un crédit finançant du matériel ?",
    },
  },
  'tle-log': {
    contexte: "En logistique, un coût de tournée de degré 3 peut nécessiter une résolution par balayage ; un emprunt à intérêts composés peut financer un véhicule.",
    problematiques: {
      'balayage-tle': "Comment trouver par balayage les racines d'une fonction de degré 3 ?",
      'commercial-tle': "Quel est le coût total d'un crédit finançant un véhicule ?",
    },
  },
  'tle-agora': {
    contexte: "Dans une structure administrative, un coût de gestion de degré 3 peut nécessiter une résolution par balayage ; un emprunt à intérêts composés peut financer un équipement.",
    problematiques: {
      'balayage-tle': "Comment trouver par balayage les racines d'une fonction de degré 3 ?",
      'commercial-tle': "Quel est le coût total d'un crédit finançant un équipement ?",
    },
  },
};

/* ============================================================
   ACTIVITÉ PUZZLE — TD04 (sujets A / B / C)
   ============================================================ */

/* ---------- TD04 : fonctions et calculs commerciaux en Python (2nde/1ère/Tle) ---------- */
const A4_LIB = {
  remi: "un procédé d'usinage", gatl: "une tournée de livraison", mcc: "un procédé de confection",
  trpm: "un procédé d'usinage", tci: "un procédé de chaudronnerie", log: "une tournée logistique", agora: "un traitement de dossiers",
};
const PUZZLE_TD04 = {
  params: A4_LIB,
  build: (P, N, cad) => {
    if (N === '2nde') return {
      A: { contexte: `${cad}, ${P} est modélisé par une fonction Python simple f(x).`,
        problematique: `Comment programmer et évaluer cette fonction pour différentes valeurs de x ?`, questions: [
          `Écrire une fonction Python f(x) modélisant la situation.`,
          `Tester f(x) pour trois valeurs de x différentes.`,
          `Représenter les résultats dans un tableau.`,
          `Identifier la valeur de x qui donne le résultat le plus favorable.`, R5] },
      B: { contexte: `${cad}, un investissement lié à ${P} rapporte un intérêt simple annuel.`,
        problematique: `Quel capital final obtient-on après plusieurs années de placement à intérêt simple ?`, questions: [
          `Écrire une fonction Python calculant le capital final avec un intérêt simple.`,
          `Tester cette fonction avec un capital et un taux choisis par le groupe.`,
          `Faire varier la durée du placement.`,
          `Comparer les résultats obtenus pour ces différentes durées.`, R5] },
      C: { contexte: `${cad}, on combine une fonction de coût pour ${P} et un calcul de remise commerciale.`,
        problematique: `Comment automatiser, en un seul programme, le calcul d'un coût optimal et d'une remise ?`, questions: [
          `Écrire une fonction calculant le coût selon x.`,
          `Ajouter une fonction calculant le prix après une remise en pourcentage.`,
          `Combiner les deux fonctions dans un même programme.`,
          `Tester le programme complet avec des valeurs choisies par le groupe.`, R5] },
    };
    if (N === '1ere') return {
      A: { contexte: `${cad}, un coût lié à ${P} est donné par une équation qui ne se factorise pas simplement.`,
        problematique: `Comment résoudre cette équation par balayage en Python ?`, questions: [
          `Reprendre le programme « Résoudre f(x) = g(x) par balayage ».`,
          `Adapter les fonctions f et g à la situation du groupe.`,
          `Exécuter le programme et relever la ou les solutions approchées.`,
          `Vérifier la solution en calculant f(x) et g(x) pour cette valeur.`, R5] },
      B: { contexte: `${cad}, on étudie la fonction de coût liée à ${P} avec GéoGébra, notamment sa tangente.`,
        problematique: `Que représente la pente de la tangente en un point de la courbe ?`, questions: [
          `Suivre le protocole de l'onglet « Tangente (GeoGebra) » avec f(x) = −0,5x² + 3x.`,
          `Tracer la tangente en un point choisi.`,
          `Relever le coefficient directeur de la tangente.`,
          `Interpréter ce coefficient dans la situation (vitesse de variation du coût).`, R5] },
      C: { contexte: `${cad}, un placement à intérêts simples finance un investissement lié à ${P}.`,
        problematique: `Quel capital obtient-on après plusieurs périodes de placement ?`, questions: [
          `Écrire une fonction Python calculant le capital avec intérêt simple.`,
          `Exécuter cette fonction avec un capital et un taux choisis.`,
          `Faire varier la durée du placement.`,
          `Comparer les capitaux obtenus pour ces différentes durées.`, R5] },
    };
    return {
      A: { contexte: `${cad}, un coût lié à ${P} est donné par une équation du troisième degré qui ne se factorise pas simplement.`,
        problematique: `Comment résoudre cette équation par balayage en Python ?`, questions: [
          `Reprendre le programme « Résoudre f(x) = g(x) par balayage » (niveau Tle).`,
          `Adapter les fonctions f et g à la situation du groupe.`,
          `Exécuter le programme et relever la ou les solutions approchées.`,
          `Vérifier la solution en calculant f(x) et g(x) pour cette valeur.`, R5] },
      B: { contexte: `${cad}, un placement à intérêts composés finance un investissement lié à ${P}.`,
        problematique: `Quel capital obtient-on après plusieurs périodes, avec deux taux différents ?`, questions: [
          `Écrire une fonction Python calculant le capital avec intérêts composés.`,
          `Exécuter cette fonction avec un premier taux.`,
          `Exécuter cette fonction avec un second taux, capital et durée identiques.`,
          `Comparer les deux capitaux finaux obtenus.`, R5] },
      C: { contexte: `${cad}, on combine résolution par balayage et calcul d'intérêts composés pour un même projet lié à ${P}.`,
        problematique: `Comment un même programme peut-il combiner ces deux outils pour aider une décision d'investissement ?`, questions: [
          `Reprendre les deux fonctions Python des fiches A et B.`,
          `Les intégrer dans un même programme.`,
          `Exécuter le programme complet avec des valeurs choisies par le groupe.`,
          `Discuter de la décision d'investissement suggérée par les résultats.`, R5] },
    };
  },
};

function construirePuzzleTD04(cle) {
  const r = construireSujets(PUZZLE_TD04, cle);
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
  etape('initContextePro', () => { initContextePro({ afficherProblematique: false, filieres: FILIERES_PRO, contextes: CONTEXTES_TD04 }); });
  etape('garantirMenuFiliere', () => { garantirMenuFiliere(CONTEXTES_TD04); });
  etape('initPuzzle', () => { initPuzzle(construirePuzzleTD04); });
  etape('initPuzzleAffichage', () => { initPuzzleAffichage(); });
  etape('initOngletsParFiliere', () => { initOngletsParFiliere(); });
  etape('initSections', () => { initSections(); });
  etape('initTabs', () => { initTabs(); });
  etape('initBoutonsPyLab', () => { initBoutonsPyLab('.btn-pylab'); });
  etape('initRadarCompetences', () => { initRadarCompetences(); });
  etape('initQuestionsParOnglet', () => { initQuestionsParOnglet(); });
  etape('initNavigationTP', () => { initNavigationTP(); });
  etape('initImpressionCompteRendu', () => {
    initImpressionCompteRendu({ titre: "Fonctions et calculs commerciaux en Python", tp: 'TD04' });
  });
}
