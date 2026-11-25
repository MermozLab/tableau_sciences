/**
 * ============================================================
 * MATHILAB — ALGORITHMIQUE / PYTHON
 * Activité Puzzle : rendu commun (sous-onglets Sujet A / B / C, lecture seule)
 * mathilab/tp-algorithme/js/puzzle-algorithme.js
 *
 * Chaque TD fournit une fonction construire(cle) qui renvoie
 *   { A: {contexte, problematique, questions[5], titre?, code?}, B: {...}, C: {...} }
 * (clé = « niveau-filière », ex. '1ere-trpm') ou null.
 * Les 4 premières questions font progresser, la 5e répond à la problématique.
 * Aucune zone de réponse dans les sujets : les réponses se rédigent dans
 * « Trace écrite - Compte rendu » (question 5 de l'onglet « Activités Puzzle »,
 * rappel de la problématique du sujet actif par puzzle-affichage.js).
 * Seul le programme Python (facultatif, champ `code`) reste modifiable :
 * il s'ouvre dans PyLab par le bouton « Ouvrir dans PyLab ».
 * ============================================================
 */

/** Cinquième question de chaque sujet : réponse à la problématique. */
export const R5 = 'Répondre à la problématique en vous appuyant sur vos résultats.';

const NIVEAUX = { '2nde': '2nde', '1ere': '1ère', 'tle': 'Terminale' };
const FILIERES = { remi: 'REMI', mcc: 'MCC', gatl: 'GATL', trpm: 'TRPM', tci: 'TCI', log: 'Logistique', agora: 'AGorA' };

/** Applique un modèle { params, build } à une clé « niveau-filière » → { A, B, C } ou null. */
export function construireSujets(modele, cle) {
  if (!modele || !cle) return null;
  const i = cle.indexOf('-');
  const niveau = cle.slice(0, i), filiere = cle.slice(i + 1);
  const P = modele.params ? modele.params[filiere] : undefined;
  if (!P) return null;
  const cad = `En ${NIVEAUX[niveau] || niveau} ${FILIERES[filiere] || filiere.toUpperCase()}`;
  return { sujets: modele.build(P, niveau, cad, filiere), filiere: FILIERES[filiere] || filiere.toUpperCase(), P };
}

const LETTRES = ['a', 'b', 'c'];
const MSG_ATTENTE = "Sélectionner votre filière professionnelle dans la section « Contexte professionnel » ci-dessus pour afficher les sujets.";
const MSG_ABSENT = "Aucun sujet n'est défini pour cette filière à ce niveau dans ce TD. Choisir une autre filière.";

/** Sous-onglets Sujet A / B / C : un seul écouteur délégué, indépendant du reste du TD. */
function initSousOnglets() {
  const racine = document.getElementById('activites-puzzle');
  if (!racine || racine.dataset.sousPuzzleInit === '1') return;
  racine.dataset.sousPuzzleInit = '1';

  const afficher = (id) => {
    racine.querySelectorAll('.sous-btn[data-sous]').forEach((b) => {
      const actif = b.dataset.sous === id;
      b.classList.toggle('actif', actif);
      b.setAttribute('aria-selected', actif ? 'true' : 'false');
    });
    racine.querySelectorAll('.sous-panel').forEach((p) => {
      const actif = p.id === id;
      p.classList.toggle('actif', actif);
      p.style.display = actif ? '' : 'none';
    });
  };

  racine.addEventListener('click', (e) => {
    const btn = e.target.closest('.sous-btn[data-sous]');
    if (!btn || !racine.contains(btn)) return;
    afficher(btn.dataset.sous);
  });

  const initial = racine.querySelector('.sous-btn.actif[data-sous]') || racine.querySelector('.sous-btn[data-sous]');
  if (initial) afficher(initial.dataset.sous);
}

function message(texte) {
  const info = document.getElementById('puzzle-info');
  if (!info) return;
  info.textContent = texte;
  info.hidden = !texte;
  info.style.display = texte ? '' : 'none';
}

function remplirSujet(lettre, sujet) {
  const ctx = document.getElementById(`puzzle-${lettre}-contexte`);
  const prb = document.getElementById(`puzzle-${lettre}-problematique`);
  const ol = document.getElementById(`puzzle-${lettre}-enonce`);
  const code = document.getElementById(`puzzle-${lettre}-code`);

  if (ctx) ctx.textContent = sujet ? sujet.contexte : '';

  if (prb) {
    prb.textContent = '';
    if (sujet && sujet.problematique) {
      const fort = document.createElement('strong');
      fort.textContent = 'Problématique : ';
      prb.append(fort, document.createTextNode(sujet.problematique));
    }
  }

  // Titre du sujet suivant la filière (facultatif) : fiche, en-tête, éditeur de code.
  if (sujet && sujet.titre) {
    const fiche = document.querySelector(`#puzzle-sujet-${lettre} .fiche-puzzle`);
    if (fiche) fiche.dataset.titre = sujet.titre;
    const entete = document.querySelector(`#puzzle-sujet-${lettre} .question-entete > strong`);
    if (entete) entete.textContent = `Sujet ${lettre.toUpperCase()} — ${sujet.titre}`;
    const bloc = document.querySelector(`#puzzle-sujet-${lettre} .code-exercice`);
    if (bloc) bloc.dataset.titre = sujet.titre;
  }

  // Programme Python du sujet (facultatif).
  if (code) code.value = sujet && sujet.code ? sujet.code : '';

  if (!ol) return;
  ol.replaceChildren();
  const questions = sujet && Array.isArray(sujet.questions) ? sujet.questions : [];
  questions.forEach((texte, i) => {
    const li = document.createElement('li');
    li.textContent = texte;
    if (i === questions.length - 1) li.className = 'puzzle-question-finale';
    ol.appendChild(li);
  });
}

export function initPuzzle(construire, selectId = 'select-filiere-pro') {
  initSousOnglets();

  const rendre = (cle) => {
    if (!cle) {
      LETTRES.forEach((l) => remplirSujet(l, null));
      message(MSG_ATTENTE);
      return;
    }
    let sujets = null;
    try { sujets = construire(cle); }
    catch (err) { console.error('[tp-algorithme] construction des sujets impossible :', err); }
    if (!sujets) {
      LETTRES.forEach((l) => remplirSujet(l, null));
      message(MSG_ABSENT);
      return;
    }
    LETTRES.forEach((l) => remplirSujet(l, sujets[l.toUpperCase()] || null));
    message('');
  };

  const select = document.getElementById(selectId);
  if (!select) return;
  select.addEventListener('change', () => rendre(select.value || null));
  rendre(select.value || null);
}
