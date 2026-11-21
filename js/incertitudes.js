/**
 * js/incertitudes.js
 * Module partagé — domaine transversal « Mesures et incertitudes »
 * (commun à tous les groupements de spécialités, cf. référentiel :
 * à intégrer aux TP existants plutôt qu'enseigné à part).
 *
 * Adapté du projet uncertainty/ (calculs.js, analyse_erreurs.js,
 * histogramme.js, rapport.js), généralisé à n'importe quelle
 * grandeur physique (et plus seulement U/I en électricité), et
 * restylé avec les classes déjà définies dans tp.css
 * (.tableau-resultats, .resultat-calcul, .info, .qualite-excellent /
 * .qualite-correct / .qualite-erreur) plutôt que la mise en page
 * "bloc" / canvas d'origine.
 *
 * Pensé pour s'intégrer dans un onglet de manipulation existant
 * (là où une grandeur peut être mesurée plusieurs fois dans les
 * mêmes conditions), et non comme un onglet séparé.
 */

/* ============================================================
   STATISTIQUES SUR UNE SÉRIE DE MESURES INDÉPENDANTES
   ============================================================ */

export function calculerStatistiques(valeurs) {
  if (!valeurs || !valeurs.length) return null;

  const n = valeurs.length;
  const moyenne = valeurs.reduce((a, b) => a + b, 0) / n;
  const variance = valeurs.reduce((s, v) => s + (v - moyenne) ** 2, 0) / n;
  const ecartType = Math.sqrt(variance);
  // Incertitude-type de la moyenne (type A)
  const incertitudeA = n > 1 ? ecartType / Math.sqrt(n) : null;

  return { n, moyenne, variance, ecartType, incertitudeA };
}

/**
 * Résultat exprimé avec un nombre de chiffres significatifs
 * cohérent : l'incertitude est arrondie à 1 chiffre significatif
 * (règle Bac Pro), la valeur alignée sur la même décimale.
 */
export function formaterResultat(valeur, incertitude) {
  if (!incertitude || Number.isNaN(incertitude) || incertitude === 0) {
    return `${valeur}`;
  }
  const incArrondie = parseFloat(incertitude.toPrecision(1));
  const decimales = (incArrondie.toString().split('.')[1] || '').length;
  const valArrondie = valeur.toFixed(decimales);
  return `${valArrondie} ± ${incArrondie}`;
}

/**
 * Qualité qualitative de la série, à partir de la dispersion
 * RELATIVE (écart-type / moyenne), pour rester pertinent quelle que
 * soit la grandeur et son ordre de grandeur (contrairement à un
 * seuil absolu fixe, valable seulement pour une grandeur donnée).
 */
export function evaluerQualite(stats) {
  if (!stats || !stats.moyenne) return { classe: '', texte: '—' };

  const dispersionRelative = Math.abs(stats.ecartType / stats.moyenne) * 100;

  if (dispersionRelative < 2) {
    return { classe: 'qualite-excellent', texte: 'Très bonne qualité de mesure' };
  }
  if (dispersionRelative < 8) {
    return { classe: 'qualite-correct', texte: 'Qualité moyenne' };
  }
  return { classe: 'qualite-erreur', texte: 'Mesures dispersées — envisager de refaire la série' };
}

export function genererAnalyseDispersion(stats, unite = '') {
  if (!stats) return '';
  const qualite = evaluerQualite(stats);

  return `
    <ul>
      <li>Moyenne = ${stats.moyenne.toFixed(3)} ${unite} — meilleur estimateur de la grandeur mesurée.</li>
      <li>Écart-type = ${stats.ecartType.toFixed(3)} ${unite} — estimateur de la dispersion des mesures, donc de l'incertitude expérimentale.</li>
      <li>Qualité de la série : <span class="badge ${qualite.classe}">${qualite.texte}</span></li>
    </ul>
  `;
}

/**
 * Liste de sources d'erreur possibles : un socle commun à toute
 * mesure, complété par des sources propres à la manipulation en
 * cours (fournies par l'appelant, spécifiques au domaine/TP).
 */
export function genererSourcesErreur(sourcesSupplementaires = []) {
  const sourcesBase = [
    "Résolution et précision de l'instrument de mesure",
    'Conditions de manipulation (lecture, contact, réglage)',
    'Variabilité de facteurs non contrôlés (environnement, stabilité du montage)',
  ];
  const toutes = [...sourcesBase, ...sourcesSupplementaires];
  return `<ul>${toutes.map(s => `<li>${s}</li>`).join('')}</ul>`;
}

/* ============================================================
   INCERTITUDE INSTRUMENTALE (TYPE B)
   « Déterminer l'incertitude associée à une mesure simple réalisée
   avec un instrument de mesure à partir des indications figurant
   dans sa notice d'utilisation. » (capacité 1ère/Tle)
   ============================================================ */

export function incertitudeInstrumentale(precisionConstructeur) {
  if (precisionConstructeur === null || Number.isNaN(precisionConstructeur)) return null;
  return Math.abs(precisionConstructeur);
}

export function initIncertitudeInstrumentale({
  inputValeurId,
  inputPrecisionId,
  resultatId,
  unite: uniteParam = '',
}) {
  const getUnite = () => (typeof uniteParam === 'function' ? uniteParam() : uniteParam);
  const inputValeur = document.getElementById(inputValeurId);
  const inputPrecision = document.getElementById(inputPrecisionId);
  const resultat = document.getElementById(resultatId);

  if (!inputValeur || !inputPrecision || !resultat) return;

  function calculer() {
    const valeur = parseFloat(inputValeur.value);
    const precision = parseFloat(inputPrecision.value);

    if (Number.isNaN(valeur) || Number.isNaN(precision)) {
      resultat.textContent = 'Saisir la valeur mesurée et la précision donnée par la notice de l\'instrument.';
      return;
    }

    const unite = getUnite();
    const u = incertitudeInstrumentale(precision);
    resultat.innerHTML = `
      Incertitude instrumentale : ${u} ${unite} (donnée constructeur)<br>
      <strong>Résultat exprimé : (${formaterResultat(valeur, u)}) ${unite}</strong>
    `;
  }

  inputValeur.addEventListener('input', calculer);
  inputPrecision.addEventListener('input', calculer);
}

/* ============================================================
   ERREUR ABSOLUE ET ERREUR RELATIVE
   Comparaison d'une valeur obtenue (mesurée ou calculée) à une
   valeur de référence : valeur lue sur un autre appareil, valeur
   nominale, valeur théorique, valeur tabulée.
     e₁ = |valeur − référence|              (même unité que la grandeur)
     e₂ = e₁ / |référence| × 100            (en %)
   Utilisable par tous les domaines (P = U×I vs wattmètre,
   masse pesée vs masse théorique, vitesse mesurée vs tabulée...).
   ============================================================ */

/** Erreur absolue e₁ = |valeur − référence| (null si une entrée est invalide). */
export function erreurAbsolue(valeur, reference) {
  if (!Number.isFinite(valeur) || !Number.isFinite(reference)) return null;
  return Math.abs(valeur - reference);
}

/** Erreur relative e₂ en % (null si la référence est nulle ou invalide). */
export function erreurRelativePourcent(valeur, reference) {
  const e1 = erreurAbsolue(valeur, reference);
  if (e1 === null || reference === 0) return null;
  return (e1 / Math.abs(reference)) * 100;
}

/**
 * Appréciation qualitative de l'erreur relative (mêmes seuils que
 * js/balance-erreurs.js : < 2 % / 2 – 5 % / > 5 %).
 */
export function classerErreurRelative(pourcent) {
  if (pourcent === null || Number.isNaN(pourcent)) return { classe: '', texte: '—' };
  pourcent = Number(pourcent.toFixed(6)); // évite 1,9999999 au lieu de 2 (flottants)
  if (pourcent < 2) return { classe: 'qualite-excellent', texte: 'Excellent (< 2 %)' };
  if (pourcent <= 5) return { classe: 'qualite-correct', texte: 'Acceptable (2 à 5 %)' };
  return { classe: 'qualite-erreur', texte: 'Insuffisant (> 5 %)' };
}

/**
 * Compare une valeur à sa référence.
 * @param {Object} params
 * @param {number} params.valeur
 * @param {number} params.reference
 * @param {number} [params.incertitude] - incertitude instrumentale (même unité) : si fournie,
 *                                        indique si l'écart reste dans cette incertitude
 * @returns {{eAbs:number, eRel:number|null, qualite:Object, dansIncertitude:boolean|null}|null}
 */
export function comparerAvecReference({ valeur, reference, incertitude = null }) {
  const eAbs = erreurAbsolue(valeur, reference);
  if (eAbs === null) return null;

  const eRel = erreurRelativePourcent(valeur, reference);

  return {
    eAbs,
    eRel,
    qualite: classerErreurRelative(eRel),
    dansIncertitude: incertitude === null ? null : eAbs <= Math.abs(incertitude),
  };
}

/**
 * Bloc HTML « erreur absolue / erreur relative » (classes tp.css existantes).
 * @param {Object} res            - résultat de comparerAvecReference()
 * @param {Object} options
 * @param {string} [options.unite]
 * @param {string} [options.nomGrandeur]   - ex. « P »
 * @param {string} [options.libelleReference] - ex. « P lue au wattmètre »
 * @param {(v:number,d?:number)=>string} [options.formatNombre] - mise en forme (virgule française...)
 */
export function genererBlocErreurs(res, options = {}) {
  if (!res) return '';

  const {
    unite = '',
    nomGrandeur = 'valeur',
    libelleReference = 'valeur de référence',
    libelleIncertitude = 'instrumentale',
    formatNombre = (v, d = 2) => Number(v).toFixed(d),
  } = options;

  const eRelTexte = res.eRel === null ? '—' : `${formatNombre(res.eRel, 1)} %`;

  const verdictIncertitude = res.dansIncertitude === null
    ? ''
    : `<li>${res.dansIncertitude
        ? `L'écart reste dans l'incertitude ${libelleIncertitude}.`
        : `L'écart dépasse l'incertitude ${libelleIncertitude} : chercher une autre source d'erreur.`}</li>`;

  return `
    <ul>
      <li>Erreur absolue : e₁ = |${nomGrandeur} calculée − ${libelleReference}| = <strong>${formatNombre(res.eAbs, 2)} ${unite}</strong></li>
      <li>Erreur relative : e₂ = e₁ / ${libelleReference} × 100 = <strong>${eRelTexte}</strong>
          — <span class="badge ${res.qualite.classe}">${res.qualite.texte}</span></li>
      ${verdictIncertitude}
    </ul>
  `;
}

/* ============================================================
   HISTOGRAMME (SVG, cohérent avec radar.js / graphique.js —
   couleur par défaut définie dans tp.css, recolorée par domaine)
   ============================================================ */

export function dessinerHistogramme(conteneurId, valeurs, options = {}) {
  const conteneur = document.getElementById(conteneurId);
  if (!conteneur) return;

  const { unite = '', nClasses = 5, largeur = 420, hauteur = 200 } = options;

  if (valeurs.length < 2) {
    conteneur.innerHTML = '<p class="info">Ajouter au moins 2 mesures pour afficher l\'histogramme.</p>';
    return;
  }

  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  const etendue = max - min || 1;
  const largeurClasse = etendue / nClasses;

  const classes = Array.from({ length: nClasses }, (_, i) => ({
    debut: min + i * largeurClasse,
    effectif: 0,
  }));

  valeurs.forEach(v => {
    let idx = Math.floor((v - min) / largeurClasse);
    if (idx >= nClasses) idx = nClasses - 1;
    if (idx < 0) idx = 0;
    classes[idx].effectif += 1;
  });

  const effectifMax = Math.max(...classes.map(c => c.effectif), 1);

  const marge = { haut: 14, bas: 34, gauche: 28, droite: 14 };
  const largeurUtile = largeur - marge.gauche - marge.droite;
  const hauteurUtile = hauteur - marge.haut - marge.bas;
  const largeurBarre = largeurUtile / nClasses;

  const barres = classes.map((c, i) => {
    const h = (c.effectif / effectifMax) * hauteurUtile;
    const x = marge.gauche + i * largeurBarre;
    const y = marge.haut + (hauteurUtile - h);
    return `
      <rect class="histogramme-barre" x="${x + 2}" y="${y}" width="${largeurBarre - 4}" height="${h}" />
      <text class="histogramme-effectif" x="${x + largeurBarre / 2}" y="${y - 4}" text-anchor="middle">${c.effectif}</text>
      <text class="histogramme-label" x="${x + largeurBarre / 2}" y="${hauteur - marge.bas + 14}" text-anchor="middle">${c.debut.toFixed(1)}</text>
    `;
  }).join('');

  conteneur.innerHTML = `
    <svg class="histogramme-svg" viewBox="0 0 ${largeur} ${hauteur}" width="100%" style="max-width:${largeur}px;display:block;margin:0 auto;">
      <line class="histogramme-axe" x1="${marge.gauche}" y1="${marge.haut}" x2="${marge.gauche}" y2="${hauteur - marge.bas}" />
      <line class="histogramme-axe" x1="${marge.gauche}" y1="${hauteur - marge.bas}" x2="${largeur - marge.droite}" y2="${hauteur - marge.bas}" />
      ${barres}
      <text class="histogramme-label" x="${largeur / 2}" y="${hauteur - 4}" text-anchor="middle">Mesure (${unite})</text>
    </svg>
  `;
}

/* ============================================================
   COMPOSANT COMPLET — À BRANCHER DANS UN ONGLET EXISTANT
   ============================================================ */

/**
 * @param {Object} params
 * @param {string} params.boutonId        - Bouton "+ Ajouter la mesure"
 * @param {string} params.inputId         - Champ de saisie de la mesure
 * @param {string} params.tbodyId         - Corps du tableau des mesures
 * @param {string} [params.resultatId]    - Résultat exprimé (valeur ± incertitude)
 * @param {string} [params.analyseId]     - Analyse de dispersion + qualité
 * @param {string} [params.histogrammeId] - Conteneur de l'histogramme
 * @param {string} [params.unite]
 * @param {string[]} [params.sourcesErreur] - Sources d'erreur propres à la manipulation
 */
export function initSerieMesures({
  boutonId,
  inputId,
  tbodyId,
  resultatId,
  analyseId,
  histogrammeId,
  referenceInputId,
  erreursId,
  nomGrandeur = 'valeur moyenne',
  libelleReference = 'valeur de référence',
  unite: uniteParam = '',
  sourcesErreur = [],
}) {
  // L'unité peut être une chaîne ou une fonction (relue à chaque calcul,
  // utile quand l'élève la saisit après le chargement de la page).
  const getUnite = () => (typeof uniteParam === 'function' ? uniteParam() : uniteParam);
  const bouton = document.getElementById(boutonId);
  const input = document.getElementById(inputId);
  const tbody = document.getElementById(tbodyId);
  const resultat = resultatId ? document.getElementById(resultatId) : null;
  const analyse = analyseId ? document.getElementById(analyseId) : null;
  const inputReference = referenceInputId ? document.getElementById(referenceInputId) : null;
  const zoneErreurs = erreursId ? document.getElementById(erreursId) : null;

  if (!bouton || !input || !tbody) return;

  const valeurs = [];

  if (inputReference) inputReference.addEventListener('input', redessiner);

  bouton.addEventListener('click', () => {
    const v = parseFloat(input.value);
    if (Number.isNaN(v)) return;

    valeurs.push(v);
    redessiner();

    input.value = '';
    input.focus();
  });

  function redessiner() {
    const unite = getUnite();

    tbody.innerHTML = valeurs
      .map((v, i) => `<tr><td>${i + 1}</td><td>${v} ${unite}</td></tr>`)
      .join('');

    if (histogrammeId) dessinerHistogramme(histogrammeId, valeurs, { unite });

    const stats = valeurs.length >= 2 ? calculerStatistiques(valeurs) : null;

    if (resultat) {
      resultat.innerHTML = stats
        ? `<strong>Résultat exprimé : (${formaterResultat(stats.moyenne, stats.incertitudeA)}) ${unite}</strong>`
        : 'Ajouter au moins deux mesures indépendantes pour calculer la moyenne et l\'écart-type.';
    }

    if (analyse) {
      analyse.innerHTML = stats
        ? genererAnalyseDispersion(stats, unite) + genererSourcesErreur(sourcesErreur)
        : '';
    }

    if (zoneErreurs) {
      zoneErreurs.innerHTML = genererErreursSerie(stats, inputReference, { unite, nomGrandeur, libelleReference });
    }
  }
}

/**
 * Erreurs e₁ et e₂ de la valeur moyenne d'une série par rapport à une
 * valeur de référence saisie. L'incertitude-type de la moyenne (type A)
 * sert de repère : e₁ ≤ u signifie que la référence est compatible avec la série.
 */
function genererErreursSerie(stats, inputReference, options) {
  const reference = inputReference ? parseFloat(inputReference.value) : NaN;

  if (!stats) return '';
  if (Number.isNaN(reference)) {
    return inputReference
      ? "Saisir une valeur de référence (valeur nominale, théorique ou tabulée) pour calculer l'erreur absolue et l'erreur relative de la moyenne."
      : '';
  }

  const res = comparerAvecReference({
    valeur: stats.moyenne,
    reference,
    incertitude: stats.incertitudeA,
  });

  return genererBlocErreurs(res, {
    ...options,
    libelleIncertitude: 'de la série (type A)',
  });
}