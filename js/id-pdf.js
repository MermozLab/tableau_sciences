// id-pdf.js : identifiant unique par PDF, partagé par tous les comptes rendus

/** 8 caractères hexadécimaux, nouveau à chaque génération. */
export function genererIdPdf() {
  const octets = new Uint8Array(4);
  crypto.getRandomValues(octets);
  return Array.from(octets, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Nom de fichier PDF : éléments joints par « _ », sans accents ni caractères
 * spéciaux. Ex. ['MermozLab', 'DUPONT', 'Élodie'] → « MermozLab_DUPONT_Elodie ».
 * (l'identifiant « _id=xxxxxxxx » est ajouté ensuite par marquerPdf).
 */
export function nomFichierPdf(elements) {
  return elements
    .filter(Boolean)
    .join('_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Marque le contenu qui va être imprimé en PDF.
 * @param {Document}    doc     document imprimé (document, ou iframe.contentDocument)
 * @param {string}      titre   titre du compte rendu (ex. "CR-E01-Puissance")
 * @param {HTMLElement} parent  élément qui reste visible à l'impression
 *                              (ex. #cr-print-container) ; par défaut doc.body
 * @returns {string} l'identifiant, au format "id=a3f9c2e1"
 */
export function marquerPdf(doc, titre = 'Compte-rendu', parent = doc.body) {
  const id = 'id=' + genererIdPdf();

  // 1. Pied de page visible : un élément fixe est répété sur chaque page imprimée
  if (!doc.getElementById('id-pdf-style')) {
    const style = doc.createElement('style');
    style.id = 'id-pdf-style';
    style.textContent = `
      #id-pdf-pied { display: none; }
      @media print {
        .id-pdf-parent { padding-bottom: 12mm; }
        #id-pdf-pied {
          display: block; position: fixed; bottom: 4mm; right: 10mm;
          font: 8pt/1 monospace; color: #555; z-index: 9999;
        }
      }`;
    doc.head.appendChild(style);
  }
  parent.classList.add('id-pdf-parent');
  let pied = doc.getElementById('id-pdf-pied');
  if (!pied) {
    pied = doc.createElement('div');
    pied.id = 'id-pdf-pied';
  }
  parent.appendChild(pied);
  pied.textContent = id;

  // 2. Titre du PDF (métadonnée) et nom de fichier proposé :
  //    le navigateur reprend le titre de la page à l'impression
  const titreComplet = `${titre}_${id}`;
  const poserTitre = (d, w) => {
    const ancien = d.title;
    d.title = titreComplet;
    w.addEventListener('afterprint', () => { d.title = ancien; }, { once: true });
  };
  poserTitre(doc, doc.defaultView || window);
  if (doc !== document) poserTitre(document, window);   // cas de l'iframe

  // Les TD/TP sont affichés dans des iframes imbriquées (page d'accueil Mermoz Lab →
  // hub du domaine → TD) : selon le navigateur, le nom de fichier proposé est le titre
  // de la page de plus haut niveau (« Mermoz Lab » → Mermoz_Lab.pdf). On pose donc aussi
  // le titre sur chaque page parente de même origine ; il est restauré après l'impression.
  try {
    let fenetre = window;
    while (fenetre.parent && fenetre.parent !== fenetre) {
      fenetre = fenetre.parent;
      poserTitre(fenetre.document, fenetre);   // lève une exception si autre origine
    }
  } catch (err) {
    /* page parente d'une autre origine : on s'arrête là */
  }

  return id;
}