/* ============================================================
   MLDS — registre des sources (fiches Eduscol, guides, mémoire).
   Utilisé par les ateliers, le générateur de parcours et sources.html.
   Les références viennent des documents fournis avec le projet.
   ============================================================ */
(function () {
  "use strict";

  const EDUSCOL = "Ministère de l'Éducation nationale et de la Jeunesse, Eduscol. Mathématiques, voie professionnelle, 2de, « Accompagnement renforcé »";

  const SOURCES = {
    "eduscol-ar-eq": {
      court: "Eduscol, AR 2de pro : « Résoudre un problème du premier degré » (déc. 2022)",
      complet: EDUSCOL + " : « Résoudre un problème du premier degré ». Décembre 2022.",
      fichier: "fiche-actioncalcul-algebrique2propdf-93798.pdf",
      repris: "Le problème des vestes (équation 34x − 60 = 2 830, prix initial 85 €), la question flash de la baguette, les situations « prime proportionnelle à l'ancienneté », « rectangle de périmètre 40 cm » et « parc d'attractions », le protocole de résolution et les pistes de différenciation."
    },
    "eduscol-ar-geo": {
      court: "Eduscol, AR 2de pro : « Reconnaître des figures usuelles et déterminer l'aire des surfaces associées » (déc. 2022)",
      complet: EDUSCOL + " : « Reconnaître des figures usuelles et déterminer l'aire des surfaces associées ». Décembre 2022.",
      fichier: "fiche-actiongeometrie2propdf-93807.pdf",
      repris: "Le pan de toiture végétalisé (cotes manquantes par le théorème de Pythagore, aire d'un rectangle auquel on retire un coin), les questions flash sur les aires et les conversions, le protocole de résolution."
    },
    "eduscol-ar-nombres": {
      court: "Eduscol, AR 2de pro : « Manipuler les nombres rationnels en écriture fractionnaire » (déc. 2022)",
      complet: EDUSCOL + " : « Manipuler les nombres rationnels en écriture fractionnaire ». Décembre 2022.",
      fichier: "fiche-actionnombres-et-calculs2-propdf-93813.pdf",
      repris: "La cocotte en origami (32 triangles, fractions de la tête, de la patte, de la queue et de la partie non coloriée), l'addition de fractions, le cocktail, l'écriture scientifique, la comparaison de distances, le protocole de résolution."
    },
    "eduscol-ar-ogd": {
      court: "Eduscol, AR 2de pro : « Décoder un texte par analyse fréquentielle » (déc. 2022)",
      complet: EDUSCOL + " : « Décoder un texte par analyse fréquentielle ». Décembre 2022.",
      fichier: "fiche-actionogd2propdf-93825.pdf",
      repris: "Le décodage d'un message chiffré par le chiffre de César, le calcul de fréquences (urne, céréales), la médiane de salaires, la fréquence « plus de 12 h », la moyenne d'une série lue sur un diagramme en bâtons."
    },
    "guide-cm": {
      court: "MENJS-DGESCO, « La résolution de problèmes mathématiques au cours moyen » (Les guides fondamentaux pour enseigner), ch. II p. 42, ch. III p. 65, ch. IV p. 107",
      complet: "Ministère de l'Éducation nationale, de la Jeunesse et des Sports, DGESCO. « La résolution de problèmes mathématiques au cours moyen », collection Les guides fondamentaux pour enseigner.",
      fichier: "guide-resolution-de-problemes-cours-moyen-90990.pdf",
      repris: "Le modèle en quatre phases (comprendre, modéliser, calculer, répondre, p. 42), les trois curseurs pour adapter un problème (structure, texte, champ numérique, p. 65), les schémas en barres et les tableaux (p. 107)."
    },
    "guide-college": {
      court: "MENJS-DGESCO, « La résolution de problèmes mathématiques au collège » (Les guides fondamentaux pour enseigner), p. 62 et ch. VII",
      complet: "Ministère de l'Éducation nationale, de la Jeunesse et des Sports, DGESCO. « La résolution de problèmes mathématiques au collège », collection Les guides fondamentaux pour enseigner.",
      fichier: "guide-resolution-de-problemes-mathematiques-au-college-73914.pdf",
      repris: "Le modèle en barres (p. 62) et les démarches pour enseigner la résolution de problèmes, dont les problèmes qui se modélisent par une équation (ch. VII, p. 177 et suivantes)."
    },
    "gigant": {
      court: "GIGANT, Gauthier, mémoire MEEF, INSPE de Besançon, 2021, « Le décrochage scolaire : maintenir l'intérêt des décrocheurs en mathématiques »",
      complet: "GIGANT, Gauthier. « Le décrochage scolaire : maintenir l'intérêt des décrocheurs en mathématiques ». Mémoire MEEF, INSPE de Besançon, 2021 (dumas-03810176, archive HAL).",
      fichier: "",
      repris: "L'esprit du défi collectif du plan de travail (travail en groupe, manipulation, pas de correction rouge/vert)."
    },
    "livret-3e": {
      court: "Équipe de mathématiques du collège MTA, « Livret de vacances mathématiques — 3ème » (avril)",
      complet: "Équipe de mathématiques du collège MTA. « Livret de vacances mathématiques — 3ème ». Œuvre collective de professeurs de mathématiques, partagée pendant le confinement d'avril.",
      fichier: "livret_de_vacances_-_3eme.pdf",
      repris: "L'idée des activités du lundi au vendredi : le compte est bon, l'escalier de Penrose, « Crack le code », le labyrinthe d'équations, la construction par homothéties (logo), l'étoile magique, la pile de triangles, le portrait d'équations, le tangram, l'escape game et les défis « pour les plus curieux ». Les jeux en ligne sont réécrits avec des données propres à ce module."
    },
    "brochure-jeux-c3": {
      court: "Cauche, Diallo, Rabreaud, Renault, « Détourner et décliner un jeu de référence… en classe entière » (Jouons ensemble aux mathématiques au cycle 3, p. 9 à 18)",
      complet: "CAUCHE Richard, DIALLO Virginie, RABREAUD Marine, RENAULT Caecilia. « Détourner et décliner un jeu de référence… en classe entière », in « Jouons ensemble aux mathématiques au cycle 3 », Académie de Créteil, pages 9 à 18.",
      fichier: "maths19_broc_ok2_1detournerdecliner.pdf",
      repris: "Les trois jeux de référence : « J'ai… Qui a ? » (dominos en boucle), « Taboo » (mot cible et mots interdits à deux niveaux) et « Qui est-ce ? » (tableau de 16 nombres, critères de divisibilité), avec leurs points de vigilance. Le contenu des cartes est créé pour le niveau fin de 3e."
    },
    "publimath-jeux": {
      court: "IREM de Toulouse, groupe Jeux mathématiques, « Jeux mathématiques » (2018), Publimath ITO18003",
      complet: "IREM de Toulouse, groupe Jeux mathématiques, avec l'IRES de Toulouse et la Maison pour la science en Midi-Pyrénées. « Jeux mathématiques », 2018. Classeur de fiches (matériel, conseils de fabrication, fiches d'activités, corrigés). Cycles 3 et 4 : activités numériques (ITO18007), activités planes (ITO18008, « Puzzles géométriques » et « Grilles logiques »), activités dans l'espace (ITO18009).",
      fichier: "",
      repris: "Le classement des jeux (numérique, plan, espace) et le principe d'activités par manipulation, observation et raisonnement, utilisés pour les pistes de prolongement. Les fiches elles-mêmes (PDF sur la Bibliothèque numérique des IREM et de l'APMEP) ne sont pas reprises : à consulter pour d'autres puzzles et grilles logiques."
    }
  };

  function lien(id) {
    const s = SOURCES[id];
    if (!s) return "";
    const a = document.createElement("a");
    a.href = "sources.html#" + id;
    a.textContent = s.court;
    return a.outerHTML;
  }

  /** « Source : … » en HTML, avec un lien vers la page des sources. */
  function citer(ids) {
    const liste = (ids || []).filter((id) => SOURCES[id]);
    if (!liste.length) return "";
    return '<i class="fa-solid fa-book-open" aria-hidden="true"></i> ' +
      (liste.length > 1 ? "Sources : " : "Source : ") + liste.map(lien).join(" ; ");
  }

  /** Texte brut (export .md, impression). */
  function citerTexte(ids) {
    return (ids || []).filter((id) => SOURCES[id]).map((id) => SOURCES[id].complet).join(" — ");
  }

  window.SOURCES = SOURCES;
  window.citerSources = citer;
  window.citerSourcesTexte = citerTexte;
})();
