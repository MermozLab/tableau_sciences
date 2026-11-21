/**
 * js/impression-identifiee.js
 *
 * Impression d'une page (fiche, plan, aide-mémoire) avec identification de l'élève :
 *   1. une fenêtre demande Nom, Prénom, Classe et Date (date du jour pré-remplie) ;
 *   2. un bloc d'identité est ajouté en tête de la page imprimée ;
 *   3. le PDF reçoit le nom MermozLab_NOM_Prenom_id=xxxxxxxx et l'identifiant
 *      est imprimé en pied de page (id-pdf.js, comme les comptes rendus).
 *
 * Utilisation (depuis un script classique ou un module) :
 *   import('../../js/impression-identifiee.js').then(m => m.imprimerAvecIdentite());
 *
 * @param {object} [options]
 * @param {string} [options.prefixe='MermozLab']  préfixe du nom de fichier
 */

import { marquerPdf, nomFichierPdf } from './id-pdf.js';

const ID_STYLE = 'imp-id-style';
const ID_FOND = 'imp-id-fond';
const ID_BLOC = 'imp-id-bloc';
const CLE_MEMOIRE = 'mermozlab-identite-impression';

const STYLE = `
#${ID_BLOC} { display: none; }
.imp-id-fond {
  position: fixed; inset: 0; z-index: 100000; display: flex;
  align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;
  background: rgba(20, 40, 70, 0.55); font-family: Arial, Helvetica, sans-serif;
}
.imp-id-boite {
  width: 100%; max-width: 380px; box-sizing: border-box; padding: 20px;
  color: #243b73; background: #f5f9fc; border: 1px solid #d5e2ec; border-radius: 12px;
  box-shadow: 0 6px 20px rgba(20, 40, 70, 0.35); text-align: left;
}
.imp-id-boite h2 { margin: 0 0 14px; font-size: 1.15rem; color: #243b73; }
.imp-id-champ { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.imp-id-champ label { font-size: 0.85rem; font-weight: bold; color: #243b73; }
.imp-id-champ input {
  min-height: 40px; padding: 0 10px; box-sizing: border-box; width: 100%;
  color: #172033; font-size: 1rem; font-family: inherit;
  border: 1px solid #c3d3ec; border-radius: 6px; background: #e9effd;
}
.imp-id-champ input:focus { outline: 3px solid #1e90ff; outline-offset: 1px; background: #f8fcff; }
.imp-id-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; flex-wrap: wrap; }
.imp-id-actions button {
  min-height: 44px; padding: 0 20px; cursor: pointer; font-size: 0.95rem;
  font-weight: bold; font-family: inherit; border-radius: 9px; border: 2px solid #4169e1;
}
.imp-id-ok { color: #ffffff; background: #4169e1; }
.imp-id-ok:hover { background: #1e90ff; border-color: #1e90ff; }
.imp-id-annuler { color: #4169e1; background: #ffffff; }
.imp-id-annuler:hover { background: #e9effd; }
.imp-id-actions button:focus-visible { outline: 3px solid #1e90ff; outline-offset: 3px; }
@media print {
  .${ID_FOND} { display: none !important; }
  #${ID_BLOC} {
    display: flex; flex-wrap: wrap; gap: 4px 24px; margin: 0 0 8mm; padding: 6px 10px;
    font: 11pt Arial, Helvetica, sans-serif; color: #000; border: 1px solid #243b73;
    break-inside: avoid;
  }
}`;

function injecterStyle() {
  if (document.getElementById(ID_STYLE)) return;
  const style = document.createElement('style');
  style.id = ID_STYLE;
  style.textContent = STYLE;
  document.head.appendChild(style);
}

function dateDuJour() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateFr(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso;
}

function lireMemoire() {
  try {
    return JSON.parse(sessionStorage.getItem(CLE_MEMOIRE)) || {};
  } catch {
    return {};
  }
}

function ecrireMemoire(identite) {
  try {
    sessionStorage.setItem(CLE_MEMOIRE, JSON.stringify({
      nom: identite.nom, prenom: identite.prenom, classe: identite.classe,
    }));
  } catch { /* stockage indisponible : sans conséquence */ }
}

/** Fenêtre de saisie. Renvoie l'identité, ou null si l'élève annule. */
function demanderIdentite() {
  return new Promise(resolve => {
    document.getElementById(ID_FOND)?.remove();
    const memoire = lireMemoire();
    const precedent = document.activeElement;

    const fond = document.createElement('div');
    fond.id = ID_FOND;
    fond.className = ID_FOND;

    const boite = document.createElement('form');
    boite.className = 'imp-id-boite';
    boite.setAttribute('role', 'dialog');
    boite.setAttribute('aria-modal', 'true');
    boite.setAttribute('aria-labelledby', 'imp-id-titre');
    boite.noValidate = false;

    const titre = document.createElement('h2');
    titre.id = 'imp-id-titre';
    titre.textContent = 'Identification';
    boite.appendChild(titre);

    const champs = [
      ['nom', 'Nom', 'text', memoire.nom || '', true, 'family-name'],
      ['prenom', 'Prénom', 'text', memoire.prenom || '', true, 'given-name'],
      ['classe', 'Classe', 'text', memoire.classe || '', false, 'off'],
      ['date', 'Date', 'date', dateDuJour(), false, 'off'],
    ];
    const saisies = {};
    champs.forEach(([cle, libelle, type, valeur, requis, auto]) => {
      const bloc = document.createElement('div');
      bloc.className = 'imp-id-champ';
      const label = document.createElement('label');
      label.htmlFor = `imp-id-${cle}`;
      label.textContent = libelle;
      const input = document.createElement('input');
      input.id = `imp-id-${cle}`;
      input.type = type;
      input.value = valeur;
      input.required = requis;
      input.autocomplete = auto;
      input.spellcheck = false;
      saisies[cle] = input;
      bloc.append(label, input);
      boite.appendChild(bloc);
    });

    const actions = document.createElement('div');
    actions.className = 'imp-id-actions';
    const annuler = document.createElement('button');
    annuler.type = 'button';
    annuler.className = 'imp-id-annuler';
    annuler.textContent = 'Annuler';
    const ok = document.createElement('button');
    ok.type = 'submit';
    ok.className = 'imp-id-ok';
    ok.textContent = 'Imprimer en PDF';
    actions.append(annuler, ok);
    boite.appendChild(actions);

    const fermer = resultat => {
      document.removeEventListener('keydown', surTouche, true);
      fond.remove();
      if (precedent && typeof precedent.focus === 'function') precedent.focus();
      resolve(resultat);
    };
    const surTouche = ev => { if (ev.key === 'Escape') fermer(null); };

    annuler.addEventListener('click', () => fermer(null));
    fond.addEventListener('mousedown', ev => { if (ev.target === fond) fermer(null); });
    boite.addEventListener('submit', ev => {
      ev.preventDefault();
      const identite = {
        nom: saisies.nom.value.trim(),
        prenom: saisies.prenom.value.trim(),
        classe: saisies.classe.value.trim(),
        date: saisies.date.value || dateDuJour(),
      };
      fermer(identite);
    });

    document.addEventListener('keydown', surTouche, true);
    fond.appendChild(boite);
    document.body.appendChild(fond);
    (saisies.nom.value ? saisies.prenom.value ? saisies.classe : saisies.prenom : saisies.nom).focus();
  });
}

/** Bloc d'identité imprimé en tête de page (invisible à l'écran). */
function poserBloc(identite) {
  let bloc = document.getElementById(ID_BLOC);
  if (!bloc) {
    bloc = document.createElement('div');
    bloc.id = ID_BLOC;
    document.body.prepend(bloc);
  }
  bloc.replaceChildren();
  [
    ['Nom', identite.nom],
    ['Prénom', identite.prenom],
    ['Classe', identite.classe],
    ['Date', dateFr(identite.date)],
  ].forEach(([libelle, valeur]) => {
    const span = document.createElement('span');
    const fort = document.createElement('strong');
    fort.textContent = `${libelle} : `;
    span.append(fort, valeur || '………………');
    bloc.appendChild(span);
  });
  return bloc;
}

export async function imprimerAvecIdentite({ prefixe = 'MermozLab' } = {}) {
  injecterStyle();

  const identite = await demanderIdentite();
  if (!identite) return false;

  ecrireMemoire(identite);
  const bloc = poserBloc(identite);
  window.addEventListener('afterprint', () => bloc.remove(), { once: true });

  // Titre du PDF : MermozLab_NOM_Prenom_id=xxxxxxxx (+ identifiant en pied de page)
  marquerPdf(document, nomFichierPdf([prefixe, identite.nom, identite.prenom]), document.body);

  // Court délai : le moteur de rendu termine la mise en page avant l'impression.
  setTimeout(() => window.print(), 150);
  return true;
}