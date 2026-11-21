/**
 * uncertainty/app.js
 * Page autonome « Mesures et incertitudes », généralisée à toute
 * grandeur et tout domaine, construite sur les modules partagés de
 * la racine (/js/incertitudes.js, /js/compte-rendu.js, /js/utils.js).
 * Les chemins relatifs sont ../../js/ car ce dossier est
 * laboratory/uncertainty/.
 */

import { initSections } from '../../js/utils.js';
import { initSerieMesures, initIncertitudeInstrumentale, calculerStatistiques, comparerAvecReference } from '../../js/incertitudes.js';
import { genererCompteRendu } from '../../js/compte-rendu.js';

initSections();

function grandeur() {
  return document.getElementById('nom-grandeur')?.value.trim() || 'Grandeur mesurée';
}

function unite() {
  return document.getElementById('unite-grandeur')?.value.trim() || '';
}

initSerieMesures({
  boutonId: 'mesure-ajouter',
  inputId: 'mesure-valeur',
  tbodyId: 'tbody-mesures',
  resultatId: 'resultat-mesures',
  analyseId: 'analyse-mesures',
  histogrammeId: 'histogramme-mesures',
  referenceInputId: 'mesure-reference',
  erreursId: 'erreurs-mesures',
  nomGrandeur: 'moyenne',
  libelleReference: 'valeur de référence',
  unite,
});

initIncertitudeInstrumentale({
  inputValeurId: 'instr-valeur',
  inputPrecisionId: 'instr-precision',
  resultatId: 'resultat-instrumentale',
  unite,
});

// ── Compte rendu ────────────────────────────────────────────────
// Date du jour pré-remplie dans la rubrique « Identification » (modifiable).
const champDate = document.getElementById('date-eleve');
if (champDate && !champDate.value) {
  const d = new Date();
  champDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

document.getElementById('btn-imprimer')?.addEventListener('click', () => {

  const lignesMesures = [...document.querySelectorAll('#tbody-mesures tr')]
    .map((tr, i) => ({
      label: `Essai ${i + 1}`,
      valeur: tr.children[1]?.textContent || '',
    }));

  const resume = document.getElementById('resume-tp')?.value || '';

  const sections = [];

  if (lignesMesures.length) {
    sections.push({
      titre: `Série de mesures — ${grandeur()}`,
      items: lignesMesures,
    });
  }

  const valeurInstr = document.getElementById('instr-valeur')?.value;
  const precisionInstr = document.getElementById('instr-precision')?.value;

  if (valeurInstr && precisionInstr) {
    sections.push({
      titre: 'Incertitude instrumentale',
      items: [
        { label: 'Valeur mesurée', valeur: `${valeurInstr} ${unite()}` },
        { label: 'Précision constructeur', valeur: `± ${precisionInstr} ${unite()}` },
      ],
    });
  }

  const reference = parseFloat(document.getElementById('mesure-reference')?.value);
  const valeurs = [...document.querySelectorAll('#tbody-mesures tr')]
    .map(tr => parseFloat(tr.children[1]?.textContent));

  if (valeurs.length >= 2 && !Number.isNaN(reference)) {
    const stats = calculerStatistiques(valeurs);
    const res = comparerAvecReference({ valeur: stats.moyenne, reference, incertitude: stats.incertitudeA });
    sections.push({
      titre: 'Erreurs par rapport à la valeur de référence',
      items: [
        { label: 'Valeur moyenne', valeur: `${stats.moyenne.toFixed(3)} ${unite()}` },
        { label: 'Valeur de référence', valeur: `${reference} ${unite()}` },
        { label: 'Erreur absolue e₁', valeur: `${res.eAbs.toFixed(3)} ${unite()}` },
        { label: 'Erreur relative e₂', valeur: res.eRel === null ? '—' : `${res.eRel.toFixed(1)} %` },
      ],
    });
  }

  if (resume) {
    sections.push({ titre: 'Résumé', texte: resume });
  }

  genererCompteRendu({
    titre: `Mesures et incertitudes — ${grandeur()}`,
    domaine: 'Transversal',
    tp: 'Incertitudes',
    sections,
    noteFinale: false,
  });
});