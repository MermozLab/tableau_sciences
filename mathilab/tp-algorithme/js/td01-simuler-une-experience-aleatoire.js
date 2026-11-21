/**
 * ============================================================
 * MATHILAB — ALGORITHMIQUE / PYTHON
 * TD01 : Simuler une expérience aléatoire (Python / PyLab)
 * mathilab/tp-algorithme/js/td01-simuler-une-experience-aleatoire.js
 * ============================================================
 * Chargé par navigation.js juste après l'injection du fragment
 * tp-algorithme/modules/td01-simuler-une-experience-aleatoire.html dans #content.
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
   CONTEXTES PROFESSIONNELS — TD01
   Une problématique par onglet (clé = id de l'onglet), rappelée
   en question 5 de « Trace écrite - Compte rendu ».
   ============================================================ */

const CONTEXTES_TD01 = {
  '2nde-remi': {
    contexte: "En atelier de réalisation mécanique, un contrôle qualité relève un taux de pièces non conformes. Simuler ce taux en Python permet de tester des milliers de contrôles virtuels en quelques secondes.",
    problematiques: {
      'modifier-simulation': "La fréquence simulée de pièces non conformes se rapproche-t-elle du taux annoncé lorsque le nombre d'essais augmente ?",
      'utiliser-simulation': "Un programme de simulation peut-il aider à prévoir le nombre de pièces non conformes attendu sur une grande série de production ?",
      'ecrire-fonction': "Quelle fonction Python permet de simuler le contrôle des pièces non conformes pour un taux et un nombre d'essais choisis ?",
      'frequence-lettre': "Comment déterminer par programme la fréquence d'une lettre dans un mot du métier, par exemple « usinage » ?",
    },
  },
  '2nde-gatl': {
    contexte: "Un service logistique suit un taux de retard de livraison. Simuler ce taux en Python permet de tester des milliers de livraisons virtuelles en quelques secondes.",
    problematiques: {
      'modifier-simulation': "La fréquence simulée de livraisons en retard se rapproche-t-elle du taux annoncé lorsque le nombre d'essais augmente ?",
      'utiliser-simulation': "Un programme de simulation peut-il aider à prévoir le nombre de livraisons en retard attendu sur une grande période ?",
      'ecrire-fonction': "Quelle fonction Python permet de simuler le contrôle des livraisons en retard pour un taux et un nombre d'essais choisis ?",
      'frequence-lettre': "Comment déterminer par programme la fréquence d'une lettre dans un mot du métier, par exemple « livraison » ?",
    },
  },
  '2nde-mcc': {
    contexte: "Un atelier de confection suit un taux de pièces nécessitant une retouche. Simuler ce taux en Python permet de tester des milliers de pièces virtuelles en quelques secondes.",
    problematiques: {
      'modifier-simulation': "La fréquence simulée de pièces à retoucher se rapproche-t-elle du taux annoncé lorsque le nombre d'essais augmente ?",
      'utiliser-simulation': "Un programme de simulation peut-il aider à prévoir le nombre de retouches attendu sur une grande série de production ?",
      'ecrire-fonction': "Quelle fonction Python permet de simuler le contrôle des pièces à retoucher pour un taux et un nombre d'essais choisis ?",
      'frequence-lettre': "Comment déterminer par programme la fréquence d'une lettre dans un mot du métier, par exemple « confection » ?",
    },
  },
};

/* ============================================================
   ACTIVITÉ PUZZLE — TD01 (sujets A / B / C)
   ============================================================ */

/* ---------- TD01 : simuler une expérience aléatoire (2nde) ---------- */
const A1_LIB = {
  remi: { obj: 'pièces non conformes', p: 0.08 },
  gatl: { obj: 'livraisons en retard', p: 0.10 },
  mcc: { obj: 'pièces à retoucher', p: 0.12 },
};
const PUZZLE_TD01 = {
  params: A1_LIB,
  build: (P, N, cad) => {
    const code = n => `def estimer_probabilite(n, p):
    succes = 0
    for i in range(n): succes += 0   # À compléter : remplacer 0 par la condition (random.random() < p)
    return succes / n
print("Fréquence obtenue :", estimer_probabilite(${n}, ${P.p}))`;
    return {
      A: { contexte: `${cad}, un taux de ${P.obj} de ${P.p * 100} % est annoncé.`,
        problematique: `Une simulation de 2000 essais donne-t-elle une fréquence proche de ${P.p * 100} % ?`, questions: [
          `Compléter la ligne de la boucle de la fonction estimer_probabilite(n, p) pour ajouter 1 à succes quand le nombre aléatoire tiré est inférieur à p.`,
          `Exécuter le programme avec n = 2000 et p = ${P.p}.`,
          `Relever la fréquence obtenue.`,
          `Comparer cette fréquence au taux annoncé de ${P.p * 100} %.`, R5], code: code(2000) },
      B: { contexte: `${cad}, on veut savoir si augmenter la taille de l'échantillon rapproche la fréquence du taux réel de ${P.p * 100} %.`,
        problematique: `La fréquence se stabilise-t-elle davantage avec n = 20000 qu'avec n = 2000 ?`, questions: [
          `Reprendre la fonction estimer_probabilite(n, p) déjà complétée.`,
          `Exécuter le programme avec n = 20000 et p = ${P.p}.`,
          `Comparer cette fréquence à celle obtenue avec n = 2000.`,
          `Expliquer l'effet de la taille de l'échantillon sur la stabilité de la fréquence.`, R5], code: code(20000) },
      C: { contexte: `${cad}, on veut comparer plusieurs simulations indépendantes de même taille pour évaluer la fluctuation.`,
        problematique: `Les fréquences obtenues sur plusieurs simulations de n = 2000 sont-elles toutes identiques ?`, questions: [
          `Exécuter trois fois le programme avec n = 2000 et p = ${P.p}.`,
          `Relever les trois fréquences obtenues.`,
          `Calculer l'écart entre la plus petite et la plus grande fréquence.`,
          `Expliquer pourquoi ces fréquences varient d'une exécution à l'autre.`, R5], code: code(2000) },
    };
  },
};

/** Titres des fiches suivant la filière choisie (ex. « GATL — retard : fluctuation »). */
const MOT_TD01 = { remi: 'non-conformité', gatl: 'retard', mcc: 'retouche' };
const THEMES_TD01 = { A: 'estimation', B: "taille de l'échantillon", C: 'fluctuation' };

function construirePuzzleTD01(cle) {
  const r = construireSujets(PUZZLE_TD01, cle);
  if (!r) return null;
  const mot = MOT_TD01[cle.slice(cle.indexOf('-') + 1)];
  Object.keys(THEMES_TD01).forEach((L) => {
    if (r.sujets[L]) r.sujets[L].titre = `${r.filiere} — ${mot} : ${THEMES_TD01[L]}`;
  });
  return r.sujets;
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
  etape('initContextePro', () => { initContextePro({ afficherProblematique: false, filieres: FILIERES_PRO, contextes: CONTEXTES_TD01 }); });
  etape('garantirMenuFiliere', () => { garantirMenuFiliere(CONTEXTES_TD01); });
  etape('initPuzzle', () => { initPuzzle(construirePuzzleTD01); });
  etape('initPuzzleAffichage', () => { initPuzzleAffichage(); });
  etape('initOngletsParFiliere', () => { initOngletsParFiliere(); });
  etape('initSections', () => { initSections(); });
  etape('initTabs', () => { initTabs(); });
  etape('initBoutonsPyLab', () => { initBoutonsPyLab('.btn-pylab'); });
  etape('initRadarCompetences', () => { initRadarCompetences(); });
  etape('initQuestionsParOnglet', () => { initQuestionsParOnglet(); });
  etape('initNavigationTP', () => { initNavigationTP(); });
  etape('initImpressionCompteRendu', () => {
    initImpressionCompteRendu({ titre: "Simuler une expérience aléatoire (Python / PyLab)", tp: 'TD01' });
  });
}
