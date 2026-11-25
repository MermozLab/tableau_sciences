/**
 * mathilab/tp-geometrie/js/questions-par-onglet.js
 *
 * Module partagé des TP de géométrie : « Trace écrite et compte rendu ».
 *
 * Chaque onglet de manipulation possède son propre bloc de 5 questions
 * (.questions-bloc[data-onglet="<id de l'onglet>"]) :
 *   - questions 1 à 4 : objet du TP de l'onglet ;
 *   - question 5 : problématique de l'onglet (rappel .problematique-rappel
 *     portant data-activite="<id de l'onglet>", rempli par contexte-pro.js
 *     à partir de `problematiques` dans CONTEXTES_PRO).
 *
 * Un onglet qui possède des sous-onglets (« Activités atelier ») a un bloc
 * par sous-onglet : le bloc porte data-onglet-parent="<id de l'onglet>" et
 * data-sous="<data-atelier du sous-onglet>" ; c'est alors le sous-onglet
 * actif (.sous-btn.actif[data-atelier]) qui décide du bloc affiché.
 *
 * Ce module n'affiche que le bloc de l'onglet actif. L'impression du
 * compte-rendu (compte-rendu-geometrie.js) reprend le bloc affiché, et
 * celui d'un autre onglet seulement s'il contient des réponses.
 */

export function initQuestionsParOnglet() {

  const blocs = [...document.querySelectorAll('.questions-bloc[data-onglet]')];
  const boutons = [...document.querySelectorAll('.tabs-header .tab-btn')];

  if (!blocs.length) return;

  const sousBoutons = [...document.querySelectorAll('.sous-btn[data-atelier]')];

  // Bloc à afficher pour un onglet : celui du sous-onglet actif s'il en a un,
  // sinon celui de l'onglet lui-même, sinon le premier bloc.
  const cibleDe = (onglet) => {
    const sousActif = sousBoutons.find(b => b.classList.contains('actif') && b.closest('.tab-panel')?.id === onglet);
    if (sousActif) {
      const bloc = blocs.find(b => b.dataset.ongletParent === onglet && b.dataset.sous === sousActif.dataset.atelier);
      if (bloc) return bloc.dataset.onglet;
    }
    return blocs.some(b => b.dataset.onglet === onglet) ? onglet : blocs[0].dataset.onglet;
  };

  const synchroniser = () => {

    const actif = boutons.find(b => b.classList.contains('actif'));
    const onglet = actif ? actif.dataset.tab : blocs[0].dataset.onglet;

    const cible = cibleDe(onglet);

    blocs.forEach(bloc => {
      const visible = bloc.dataset.onglet === cible;
      bloc.hidden = !visible;
      bloc.style.display = visible ? '' : 'none';
    });
  };

  // initTabs() peut changer d'onglet par clic ou programmatiquement
  // (initOngletsParFiliere) : on suit les deux.
  [...boutons, ...sousBoutons].forEach(b => b.addEventListener('click', () => setTimeout(synchroniser, 0)));

  const observateur = new MutationObserver(synchroniser);
  [...boutons, ...sousBoutons].forEach(b => observateur.observe(b, { attributes: true, attributeFilter: ['class'] }));

  synchroniser();
}