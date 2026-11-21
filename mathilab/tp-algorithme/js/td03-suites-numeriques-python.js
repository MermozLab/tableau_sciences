/**
 * ============================================================
 * MATHILAB — ALGORITHMIQUE / PYTHON
 * TD03 : Suites numériques en Python
 * mathilab/tp-algorithme/js/td03-suites-numeriques-python.js
 * ============================================================
 * Chargé par navigation.js juste après l'injection du fragment
 * tp-algorithme/modules/td03-suites-numeriques-python.html dans #content.
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
   CONTEXTES PROFESSIONNELS — TD03
   Une problématique par onglet (clé = id de l'onglet), rappelée
   en question 5 de « Trace écrite - Compte rendu ».
   ============================================================ */

const CONTEXTES_TD03 = {
  '1ere-trpm': {
    contexte: "Une machine d'usinage peut augmenter sa cadence chaque jour d'une quantité fixe (suite arithmétique) ou d'un pourcentage fixe (suite géométrique).",
    problematiques: {
      'ar-termes-somme': "Comment calculer, terme après terme, la production attendue selon le modèle d'évolution retenu ?",
      'ar-nuage-seuil': "À partir de quel rang la cadence de production dépasse-t-elle un seuil fixé, d'après le nuage de points des termes ?",
    },
  },
  '1ere-tci': {
    contexte: "Un atelier de chaudronnerie peut augmenter sa production de pièces chaque semaine d'une quantité fixe (suite arithmétique) ou d'un pourcentage fixe (suite géométrique).",
    problematiques: {
      'ar-termes-somme': "Comment calculer, terme après terme, la production attendue selon le modèle d'évolution retenu ?",
      'ar-nuage-seuil': "À partir de quel rang la production de pièces chaudronnées dépasse-t-elle un seuil fixé, d'après le nuage de points des termes ?",
    },
  },
  '1ere-mcc': {
    contexte: "Un atelier de confection peut augmenter sa production chaque semaine d'une quantité fixe (suite arithmétique) ou d'un pourcentage fixe (suite géométrique).",
    problematiques: {
      'ar-termes-somme': "Comment calculer, terme après terme, la production attendue selon le modèle d'évolution retenu ?",
      'ar-nuage-seuil': "À partir de quel rang la production de vêtements dépasse-t-elle un seuil fixé, d'après le nuage de points des termes ?",
    },
  },
  '1ere-log': {
    contexte: "Un entrepôt peut voir son volume de colis traité augmenter chaque mois d'une quantité fixe (suite arithmétique) ou d'un pourcentage fixe (suite géométrique).",
    problematiques: {
      'ar-termes-somme': "Comment calculer, terme après terme, le volume de colis attendu selon le modèle d'évolution retenu ?",
      'ar-nuage-seuil': "À partir de quel rang le volume de colis traité dépasse-t-il un seuil fixé, d'après le nuage de points des termes ?",
    },
  },
  '1ere-agora': {
    contexte: "Une structure administrative peut voir son nombre de dossiers traités augmenter chaque mois d'une quantité fixe (suite arithmétique) ou d'un pourcentage fixe (suite géométrique).",
    problematiques: {
      'ar-termes-somme': "Comment calculer, terme après terme, le nombre de dossiers traités attendu selon le modèle d'évolution retenu ?",
      'ar-nuage-seuil': "À partir de quel rang le nombre de dossiers traités dépasse-t-il un seuil fixé, d'après le nuage de points des termes ?",
    },
  },
  'tle-trpm': {
    contexte: "Une machine d'usinage peut voir sa cadence progresser à taux fixe (suite géométrique), en lien direct avec les fonctions exponentielles étudiées en Algèbre-Analyse.",
    problematiques: {
      'geo-termes-somme': "Comment calculer la production cumulée sur n jours d'une machine dont la cadence progresse à taux fixe ?",
      'geo-nuage-seuil': "À partir de quand dépasse-t-elle une capacité donnée ?",
    },
  },
  'tle-tci': {
    contexte: "Un atelier de chaudronnerie peut voir sa production progresser à taux fixe (suite géométrique), en lien direct avec les fonctions exponentielles étudiées en Algèbre-Analyse.",
    problematiques: {
      'geo-termes-somme': "Comment calculer la production cumulée sur n semaines d'un atelier dont la production progresse à taux fixe ?",
      'geo-nuage-seuil': "À partir de quand dépasse-t-elle une capacité donnée ?",
    },
  },
  'tle-mcc': {
    contexte: "Un atelier de confection peut voir sa production progresser à taux fixe (suite géométrique), en lien direct avec les fonctions exponentielles étudiées en Algèbre-Analyse.",
    problematiques: {
      'geo-termes-somme': "Comment calculer la production cumulée sur n semaines d'un atelier dont la production progresse à taux fixe ?",
      'geo-nuage-seuil': "À partir de quand dépasse-t-elle une capacité donnée ?",
    },
  },
  'tle-log': {
    contexte: "Un entrepôt peut voir son volume de colis traité progresser à taux fixe (suite géométrique), en lien direct avec les fonctions exponentielles étudiées en Algèbre-Analyse.",
    problematiques: {
      'geo-termes-somme': "Comment calculer le volume cumulé de colis traités sur n mois ?",
      'geo-nuage-seuil': "À partir de quand dépasse-t-il une capacité de stockage donnée ?",
    },
  },
  'tle-agora': {
    contexte: "Une structure administrative peut voir son nombre de dossiers traités progresser à taux fixe (suite géométrique), en lien direct avec les fonctions exponentielles étudiées en Algèbre-Analyse.",
    problematiques: {
      'geo-termes-somme': "Comment calculer le nombre cumulé de dossiers traités sur n mois ?",
      'geo-nuage-seuil': "À partir de quand dépasse-t-il une capacité de traitement donnée ?",
    },
  },
};

/* ============================================================
   ACTIVITÉ PUZZLE — TD03 (sujets A / B / C)
   ============================================================ */

/* ---------- TD03 : suites numériques en Python (1ère/Tle) ---------- */
const A3_LIB = {
  trpm: "la cadence de production", tci: "la production de pièces chaudronnées", mcc: "la production de vêtements",
  log: "le volume de colis traité", agora: "le nombre de dossiers traités",
};
const PUZZLE_TD03 = {
  params: A3_LIB,
  build: (P, N, cad) => ({
    A: { contexte: `${cad}, ${P} augmente chaque période d'une quantité fixe : u0 = 200, r = 15.`,
      problematique: `Quelle est la valeur après 15 périodes, et la somme cumulée sur ces 15 périodes ?`, questions: [
        `Adapter le programme « Termes d'une suite arithmétique » avec u0 = 200, r = 15, n_termes = 15.`,
        `Exécuter le programme et relever la liste des termes.`,
        `Relever le dernier terme (u14) et la somme cumulée affichée.`,
        `Vérifier u14 avec la formule u0 + 14 × r.`, R5] },
    B: { contexte: `${cad}, ${P} augmente chaque période de 5 % : u0 = 200, q = 1,05.`,
      problematique: `Quelle est la valeur après 15 périodes, et la somme cumulée sur ces 15 périodes ?`, questions: [
        `Adapter le programme « Termes d'une suite géométrique » avec u0 = 200, q = 1.05, n_termes = 15.`,
        `Exécuter le programme et relever la liste des termes.`,
        `Relever le dernier terme (u14) et la somme cumulée affichée.`,
        `Vérifier u14 avec la formule u0 × q^14.`, R5] },
    C: { contexte: `${cad}, on compare les deux évolutions de ${P} (fiches A et B) sur 15 périodes.`,
      problematique: `Laquelle des deux évolutions devient la plus favorable à long terme ?`, questions: [
        `Reprendre les sommes cumulées obtenues en A et en B.`,
        `Comparer les deux sommes sur 15 périodes.`,
        `Modifier n_termes pour observer l'évolution sur 25 périodes.`,
        `Expliquer pourquoi l'écart entre les deux modèles s'accentue avec le temps.`, R5] },
  }),
};

function construirePuzzleTD03(cle) {
  const r = construireSujets(PUZZLE_TD03, cle);
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
  etape('initContextePro', () => { initContextePro({ afficherProblematique: false, filieres: FILIERES_PRO, contextes: CONTEXTES_TD03 }); });
  etape('garantirMenuFiliere', () => { garantirMenuFiliere(CONTEXTES_TD03); });
  etape('initPuzzle', () => { initPuzzle(construirePuzzleTD03); });
  etape('initPuzzleAffichage', () => { initPuzzleAffichage(); });
  etape('initOngletsParFiliere', () => { initOngletsParFiliere(); });
  etape('initSections', () => { initSections(); });
  etape('initTabs', () => { initTabs(); });
  etape('initBoutonsPyLab', () => { initBoutonsPyLab('.btn-pylab'); });
  etape('initRadarCompetences', () => { initRadarCompetences(); });
  etape('initQuestionsParOnglet', () => { initQuestionsParOnglet(); });
  etape('initNavigationTP', () => { initNavigationTP(); });
  etape('initImpressionCompteRendu', () => {
    initImpressionCompteRendu({ titre: "Suites numériques en Python", tp: 'TD03' });
  });
}
