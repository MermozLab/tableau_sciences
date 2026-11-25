/**
 * ============================================================
 * MATHILAB — ALGORITHMIQUE / PYTHON
 * TD05 : Géométrie : calculs et constructions
 * mathilab/tp-algorithme/js/td05-geometrie.js
 * ============================================================
 * Chargé par navigation.js juste après l'injection du fragment
 * tp-algorithme/modules/td05-geometrie.html dans #content.
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
   CONTEXTES PROFESSIONNELS — TD05
   Une problématique par onglet (clé = id de l'onglet), rappelée
   en question 5 de « Trace écrite - Compte rendu ».
   ============================================================ */

const CONTEXTES_TD05 = {
  '2nde-remi': {
    contexte: "En atelier de réalisation mécanique, contrôler qu'une pièce est d'équerre, calculer le volume de matière d'une pièce cylindrique, ou construire un plan sont des gestes courants.",
    problematiques: {
      'pythagore': "Comment vérifier par un calcul sur les côtés qu'une pièce mécanique est bien d'équerre ?",
      'aires-volumes': "Quel volume de matière contient une pièce cylindrique, et comment l'obtenir par un programme ?",
      'construction': "Comment construire avec GeoGebra le plan d'une pièce et contrôler ses dimensions et son angle ?",
    },
  },
  '2nde-gatl': {
    contexte: "En logistique, calculer le volume d'un colis ou d'un espace de stockage, ou vérifier l'agencement d'un entrepôt, font appel à des calculs d'aires et de volumes.",
    problematiques: {
      'pythagore': "Comment vérifier par un calcul sur les côtés qu'un angle de rangement est bien droit ?",
      'aires-volumes': "Comment calculer les dimensions et le volume disponibles pour optimiser le rangement d'un espace de stockage ?",
      'construction': "Comment construire avec GeoGebra un plan d'entrepôt et vérifier l'agencement des allées ?",
    },
  },
  '2nde-mcc': {
    contexte: "En atelier de confection, construire un patron ou vérifier l'équerrage d'une pièce de tissu découpée font appel à la géométrie et au théorème de Pythagore.",
    problematiques: {
      'pythagore': "Comment vérifier par un calcul sur les côtés qu'une pièce de tissu découpée est bien d'équerre ?",
      'aires-volumes': "Quelle aire de tissu faut-il prévoir pour un patron, et comment la calculer par un programme ?",
      'construction': "Comment construire avec GeoGebra un patron et vérifier ses dimensions et ses angles ?",
    },
  },
};

/* ============================================================
   ACTIVITÉ PUZZLE — TD05 (sujets A / B / C)
   ============================================================ */

/* ---------- TD05 : géométrie (2nde) ---------- */
const A5_LIB = {
  remi: "une pièce mécanique", gatl: "un espace de stockage", mcc: "une pièce de patronage",
};
const PUZZLE_TD05 = {
  params: A5_LIB,
  build: (P, N, cad) => ({
    A: { contexte: `${cad}, on cherche des triplets pythagoriciens pour vérifier l'équerrage de ${P}.`,
      problematique: `Quels triplets d'entiers (a, b, c) vérifient a² + b² = c² parmi les 100 premiers entiers ?`, questions: [
        `Exécuter le programme « Rechercher des triplets pythagoriciens » avec limite = 100.`,
        `Relever tous les triplets trouvés.`,
        `Vérifier l'un d'eux à la main (a² + b² = c²).`,
        `Compter le nombre total de triplets trouvés.`, R5] },
    B: { contexte: `${cad}, ${P} peut être modélisée par un carré ou un cylindre.`,
      problematique: `Quelle aire ou quel volume obtient-on pour ${P} avec les dimensions choisies par le groupe ?`, questions: [
        `Choisir une forme (carré ou cylindre) adaptée à ${P}.`,
        `Adapter le programme d'aires et de volumes avec des dimensions réalistes.`,
        `Exécuter le programme et relever le résultat.`,
        `Vérifier ce résultat à la main avec la formule correspondante.`, R5] },
    C: { contexte: `${cad}, on construit un triangle rectangle à partir d'un triplet pythagoricien différent, par exemple 5, 12, 13.`,
      problematique: `La relation de Pythagore est-elle vérifiée sur la construction obtenue ?`, questions: [
        `Reprendre le protocole de construction GéoGébra du triangle rectangle.`,
        `Construire le triangle avec les côtés 5, 12 et 13.`,
        `Mesurer l'angle entre les côtés 5 et 12.`,
        `Vérifier que 5² + 12² = 13².`, R5] },
  }),
};

function construirePuzzleTD05(cle) {
  const r = construireSujets(PUZZLE_TD05, cle);
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
  etape('initContextePro', () => { initContextePro({ afficherProblematique: false, filieres: FILIERES_PRO, contextes: CONTEXTES_TD05 }); });
  etape('garantirMenuFiliere', () => { garantirMenuFiliere(CONTEXTES_TD05); });
  etape('initPuzzle', () => { initPuzzle(construirePuzzleTD05); });
  etape('initPuzzleAffichage', () => { initPuzzleAffichage(); });
  etape('initOngletsParFiliere', () => { initOngletsParFiliere(); });
  etape('initSections', () => { initSections(); });
  etape('initTabs', () => { initTabs(); });
  etape('initBoutonsPyLab', () => { initBoutonsPyLab('.btn-pylab'); });
  etape('initRadarCompetences', () => { initRadarCompetences(); });
  etape('initQuestionsParOnglet', () => { initQuestionsParOnglet(); });
  etape('initNavigationTP', () => { initNavigationTP(); });
  etape('initImpressionCompteRendu', () => {
    initImpressionCompteRendu({ titre: "Géométrie : calculs et constructions", tp: 'TD05' });
  });
}
