/**
 * tp-acoustique/js/compte-rendu-acoustique.js
 *
 * Impression du compte rendu (PDF via la boîte d'impression du navigateur)
 * pour les TP d'acoustique A1 à A5.
 *
 * Ce fichier construit la configuration attendue par le module partagé
 * js/compte-rendu.js (genererCompteRendu), comme les autres domaines :
 * en-tête, identité (rubrique « Identification » de la page), identifiant
 * id=xxxxxxxx et nom de fichier MermozLab_NOM_Prenom_id=xxxxxxxx sont donc
 * identiques à ceux de tous les comptes rendus du site.
 *
 * Ce fichier est un MODULE JAVASCRIPT.
 *
 * API utilisée par tp01 à tp05 (inchangée) :
 *   initImpressionCompteRendu({ titre, tp, sectionsSupplementaires })
 *   sectionValeurs(titre, [[libellé, idÉlément, filtreRegExp?], ...])
 *   nombreFr(valeur, décimales)
 *   ajouterLigne(tbody, [cellules])
 *
 * Format d'une section (renvoyée à initImpressionCompteRendu) :
 *   { titre, valeurs: [[libellé, valeur], ...] }
 *   { titre, tableau: { entetes: [...], lignes: [[...], ...] },
 *     canvas?: <élément contenant un <svg> ou un <canvas>>, legende?: string }
 */

import { genererCompteRendu } from '../../../js/compte-rendu.js';

/* ==========================================================
   OUTILS
   ========================================================== */

const VALEURS_VIDES = new Set(['', '—', '-', '–']);

function nettoyer(texte) {
  return String(texte ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Texte d'un champ ou d'une sortie : valeur saisie, option choisie ou contenu. */
function lireElement(el) {
  if (!el) return '';

  if (el.tagName === 'SELECT') {
    const option = el.options[el.selectedIndex];
    // Une option sans valeur (« Choisir... ») compte comme non renseignée.
    return option && option.value !== '' ? option.textContent.trim() : '';
  }

  if ('value' in el && el.tagName !== 'OUTPUT' && el.tagName !== 'LI') {
    return String(el.value ?? '').trim();
  }

  return (el.textContent || '').replace(/\s+/g, ' ').trim();
}

/* ==========================================================
   FONCTIONS EXPORTÉES POUR LES TP
   ========================================================== */

/** Nombre au format français : nombreFr(2.5, 1) → « 2,5 ». */
export function nombreFr(valeur, decimales = 0) {
  const n = Number(valeur);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/** Ajoute une ligne <tr> (cellules en texte brut) à un <tbody>. */
export function ajouterLigne(tbody, cellules) {
  const tr = document.createElement('tr');
  cellules.forEach(contenu => {
    const td = document.createElement('td');
    td.textContent = String(contenu ?? '');
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
  return tr;
}

/**
 * Section « libellé : valeur » lue dans le DOM au moment de l'impression.
 * Un 3e élément facultatif (RegExp) ne retient la valeur que si elle
 * correspond (évite d'imprimer un texte d'attente).
 * Renvoie null si aucune valeur n'est renseignée.
 */
export function sectionValeurs(titre, champs) {
  const valeurs = [];

  champs.forEach(([libelle, id, filtre]) => {
    const texte = lireElement(document.getElementById(id));
    if (VALEURS_VIDES.has(texte)) return;
    if (filtre instanceof RegExp && !filtre.test(texte)) return;
    valeurs.push([libelle, texte]);
  });

  return valeurs.length ? { titre, valeurs } : null;
}

/* ==========================================================
   COLLECTE DES DONNÉES DE LA PAGE
   ========================================================== */

function blocContientReponse(bloc) {
  return [...bloc.querySelectorAll('textarea')].some(t => t.value.trim() !== '');
}

/**
 * Questions : bloc affiché + blocs des autres onglets s'ils contiennent des
 * réponses. Une section par question, au format attendu par compte-rendu.js.
 */
function construireSectionsQuestions() {
  const blocs = [...document.querySelectorAll('.questions-bloc')]
    .filter(bloc => (!bloc.hidden && bloc.style.display !== 'none') || blocContientReponse(bloc));

  return blocs.flatMap(bloc => {
    const nomBloc = bloc.dataset.ongletNom || bloc.querySelector('h4')?.textContent.trim() || '';

    return [...bloc.querySelectorAll('.questions-tp > li')].map((li, index) => {
      // La numérotation de l'écran vient d'un compteur CSS : on la reprend ici.
      const enonce = nettoyer(li.querySelector('.question-entete strong')?.textContent);
      const prefixe = blocs.length > 1 && nomBloc ? `${nomBloc} · ` : '';

      const question = {
        titre: `${prefixe}Q${index + 1}. ${enonce}`,
        notation: true,
        competence: nettoyer(li.querySelector('.cartouche')?.textContent),
        texte: (li.querySelector('textarea')?.value || '').trim(),
      };

      const rappel = nettoyer(li.querySelector('.problematique-rappel')?.textContent);
      if (rappel) {
        question.rappel = rappel;
        question.rappelEtiquette = 'Problématique';
      }

      return question;
    });
  });
}

/** Auto-évaluation des compétences (+ radar s'il a été généré). */
function construireSectionAutoEvaluation() {
  const lignes = [...document.querySelectorAll('.autoeval-table tbody tr[data-comp]')];

  if (!lignes.some(tr => tr.querySelector('input[type="radio"]:checked'))) return null;

  const section = {
    titre: 'Auto-évaluation des compétences',
    position: 'fin', // après les questions, comme à l'écran
    tableau: {
      entetes: ['Domaine', 'Sigle', 'Je suis capable de…', 'Niveau (0 à 2)'],
      lignes: lignes.map(tr => {
        const coche = tr.querySelector('input[type="radio"]:checked');
        return [
          nettoyer(tr.cells[0]?.textContent),
          tr.dataset.comp,
          nettoyer(tr.cells[2]?.textContent),
          coche ? coche.value : '—',
        ];
      }),
    },
  };

  const radar = document.getElementById('radar-resultat');
  if (radar && radar.querySelector('canvas, svg')) {
    section.canvas = radar;
    section.legende = 'Radar des compétences';
    section.echelle = 0.5; // radar imprimé à 50 % de la largeur
  }

  return section;
}

/* ==========================================================
   POINT D'ENTRÉE
   ========================================================== */

/**
 * Câble le bouton « Imprimer le compte-rendu » (#btn-imprimer).
 *
 * @param {object}   options
 * @param {string}   options.titre                  Titre du TP.
 * @param {string}   options.tp                     Repère (ex. « TP01 »).
 * @param {Function} options.sectionsSupplementaires  Renvoie les sections de
 *        mesures, évaluées au moment du clic (valeurs saisies à jour).
 */
export function initImpressionCompteRendu({ titre, tp, sectionsSupplementaires } = {}) {
  const bouton = document.getElementById('btn-imprimer');
  if (!bouton) return;

  bouton.addEventListener('click', () => {
    let propres = [];

    try {
      propres = (sectionsSupplementaires ? sectionsSupplementaires() : []).filter(Boolean);
    } catch (erreur) {
      console.error('Compte rendu : erreur dans les sections de mesures', erreur);
    }

    const sections = [
      ...propres,
      ...construireSectionsQuestions(),
      construireSectionAutoEvaluation(),
    ].filter(Boolean);

    genererCompteRendu({
      titre: titre || 'TP Acoustique',
      domaine: 'Acoustique',
      tp,
      sections,
      noteFinale: true,
    });
  });
}