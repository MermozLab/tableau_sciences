/* ============================================================
   parcours-complementaire.js — Parcours complémentaire « niveau fin de 3e ».
   Ajoute à PARCOURS_DATA (js/data.js) un domaine OPTIONNEL : il n'apparaît dans
   le positionnement et dans le plan que si l'option est cochée à l'étape 1
   (voir app.js → complementaireActif()).

   À charger APRÈS data.js, sources.js et data-fiches.js.

   Champs propres à ce domaine :
     complementaire   true : domaine facultatif
     chapo            texte d'introduction affiché sous le titre du domaine
     livret           activités « papier » (constructions, dessins) : { chapo, fiches[], curieux[] }
   Champs ajoutés à un module :
     jeux             ids de jeux (js/game-complementaire.js) proposés en lien direct
   ============================================================ */
(function () {
  "use strict";

  const D = typeof PARCOURS_DATA !== "undefined" ? PARCOURS_DATA : null;
  if (!Array.isArray(D)) return;
  if (D.some((d) => d.id === "complementaire")) return;

  // Les sources (livret-3e, brochure-jeux-c3, publimath-jeux) sont déclarées dans js/sources.js.
  const S_LIVRET = "livret-3e";
  const S_BROCHURE = "brochure-jeux-c3";
  const S_PUBLI = "publimath-jeux";

  // ---------------------------------------------------------- le domaine
  D.push({
    id: "complementaire",
    label: "Parcours complémentaire — niveau fin de 3e",
    priorite: 7,
    complementaire: true,
    chapo: "À proposer en plus du parcours de base à un élève qui a besoin de consolider ou d'aller plus loin sur les notions de fin de 3e (arithmétique, équations, homothétie, trigonométrie), ou qui se remobilise mieux par le jeu et la manipulation. Les modules s'appuient sur le livret de vacances 3e, sur la brochure « Détourner et décliner un jeu de référence » et sur les jeux mathématiques de l'IREM de Toulouse. Un jeu en ligne est associé à la plupart des modules.",
    competences: [

      // ------------------------------------------------------ arithmétique
      {
        id: "cmp_arithmetique",
        label: "Arithmétique : multiples, diviseurs, nombres premiers, PGCD",
        sources: [S_BROCHURE, S_LIVRET],
        flash: "Quel nombre est divisible à la fois par 3 et par 7 ? 84, 91, 95 ou 111. (Erreur type : ne vérifier qu'un seul des deux diviseurs.)",
        items: [
          "Je connais les critères de divisibilité par 2, 3, 4, 5, 9 et 10.",
          "Je sais décider si un nombre est premier et décomposer un nombre en produit de facteurs premiers.",
          "Je sais calculer un PGCD (par décomposition ou par l'algorithme d'Euclide) et rendre une fraction irréductible."
        ],
        modules: {
          remobilisation: {
            titre: "Qui est-ce ? Retrouver un nombre par ses diviseurs",
            objectif: "Réactiver les critères de divisibilité en posant des questions fermées (oui/non) pour retrouver un nombre caché parmi 16.",
            activites: [
              "Jouer en ligne à « Qui est-ce ? » (nombres) : poser des questions « est-ce que le nombre est divisible par … ? » et barrer les nombres éliminés",
              "À l'oral, justifier chaque élimination avec le critère utilisé (chiffre des unités, somme des chiffres…)",
              "En binôme, une version papier : l'un choisit un nombre du tableau, l'autre le retrouve en posant le moins de questions possible"
            ],
            duree: "1 séance de 55 min",
            ressources: ["Jeu en ligne « Qui est-ce ? (nombres) »", "Tableau de 16 nombres imprimé", "Feutre effaçable"],
            image: "img/qui-est-ce-nombres.svg",
            imageAlt: "Tableau de seize nombres pour le jeu Qui est-ce ?",
            jeux: ["quiestce"]
          },
          consolidation: {
            titre: "Décomposer, simplifier, partager",
            objectif: "Automatiser la décomposition en facteurs premiers et le calcul d'un PGCD, puis les utiliser pour simplifier une fraction et résoudre un problème de partage.",
            activites: [
              "Décomposer en facteurs premiers une série de nombres (arbre de facteurs ou divisions successives)",
              "Calculer des PGCD par l'algorithme d'Euclide, puis rendre irréductibles des fractions",
              "Problème de partage : 84 stylos et 126 gommes à répartir en lots identiques sans reste, avec le plus grand nombre de lots possible",
              "Prolongement : concevoir une version du jeu « Qui est-ce ? » avec des multiples de 6, 7 ou 8 (les cartes ne doivent pas avoir toutes la même liste de diviseurs)"
            ],
            duree: "2 séances de 45 min",
            ressources: ["Fiche d'exercices gradués", "Calculatrice", "Jeu en ligne « Qui est-ce ? (nombres) »"],
            jeux: ["quiestce"]
          }
        }
      },

      // --------------------------------------------- calcul mental, automatismes
      {
        id: "cmp_automatismes",
        label: "Calcul mental et automatismes (priorités, relatifs, puissances, racines)",
        sources: [S_LIVRET, S_BROCHURE],
        flash: "Calculer 3 + 4 × 5 − 2. (Erreurs types : 33 en calculant de gauche à droite ; 17 est la bonne réponse, 21 en oubliant le « − 2 ».)",
        items: [
          "Je calcule mentalement avec les priorités opératoires, les parenthèses et les nombres relatifs.",
          "Je connais les carrés usuels (jusqu'à 15²) et les racines carrées exactes correspondantes.",
          "Je sais atteindre un nombre cible avec des nombres donnés et des opérations, en testant méthodiquement."
        ],
        modules: {
          remobilisation: {
            titre: "Le compte est bon : fabriquer un nombre cible",
            objectif: "Se réconcilier avec le calcul en réfléchissant à plusieurs chemins pour un même résultat, sans pénalité d'erreur.",
            activites: [
              "Jouer en ligne au « Compte est bon » : 5 nombres, une cible, les quatre opérations, chaque nombre utilisé au plus une fois",
              "Chercher plusieurs solutions pour une même cible et comparer les scores (addition et multiplication : 1 point ; soustraction : 2 points ; division : 4 points)",
              "Expliquer à l'oral pourquoi un calcul intermédiaire est utile, ou pourquoi il mène à une impasse"
            ],
            duree: "1 séance de 30 min",
            ressources: ["Jeu en ligne « Le compte est bon »", "Calculatrice facultative", "Feuille de brouillon"],
            jeux: ["compte"]
          },
          consolidation: {
            titre: "J'ai… Qui a ? : enchaîner des calculs en classe entière",
            objectif: "Sécuriser les priorités opératoires, les relatifs, les puissances et les racines carrées par un jeu de dominos en boucle, où la validation est collective.",
            activites: [
              "Jouer en ligne à « J'ai… Qui a ? » : calculer l'opération lue, trouver le domino dont le résultat est annoncé",
              "En classe entière ou en îlots : un domino par élève, distribué au hasard ; chacun continue à calculer même quand son tour est passé",
              "Concevoir sa propre boucle de 8 dominos (sans « paires croisées » : deux dominos ne doivent pas avoir le même résultat)"
            ],
            duree: "1 séance de 45 min",
            ressources: ["Jeu en ligne « J'ai… Qui a ? »", "Dominos imprimés et découpés (un par élève)", "Fiche de conception de la boucle"],
            image: "img/jai-qui-a.svg",
            imageAlt: "Trois dominos J'ai… Qui a ? enchaînés",
            jeux: ["jaiquia"]
          }
        }
      },

      // ------------------------------------------------------------ équations
      {
        id: "cmp_equations",
        label: "Équations : x des deux côtés, solutions décimales ou négatives, équation produit",
        sources: [S_LIVRET, "guide-college"],
        flash: "Quelle est la solution de 5x − 3 = 2x + 9 ? (4 ; 2 ; 12 ; 6). (Erreurs types : passer 2x de l'autre côté sans changer son signe ; oublier de diviser.)",
        coupsDePouce: [
          "Regrouper les termes en x du même côté, les nombres de l'autre côté, en changeant le signe de ce qui traverse le signe égal.",
          "Réduire chaque membre, puis diviser par le coefficient de x.",
          "Vérifier : remplacer x par la solution dans l'équation de départ et comparer les deux membres.",
          "Équation produit : un produit est nul si l'un de ses facteurs est nul, donc résoudre séparément A = 0 et B = 0."
        ],
        items: [
          "Je sais résoudre une équation du type ax + b = cx + d.",
          "Je sais vérifier une solution par substitution, même quand elle est négative ou décimale.",
          "Je sais résoudre une équation produit (A × B = 0) et reconnaître qu'elle peut avoir deux solutions."
        ],
        modules: {
          remobilisation: {
            titre: "Labyrinthe d'équations : suivre les bonnes solutions",
            objectif: "Retrouver le geste de résolution dans un jeu de parcours où la vérification est immédiate.",
            activites: [
              "Jouer en ligne au labyrinthe : résoudre l'équation de la case, puis choisir la flèche qui porte la bonne solution",
              "Quand une flèche est refusée, vérifier en remplaçant x par la valeur choisie dans l'équation",
              "Verbaliser à l'oral chaque étape de résolution avant de cliquer"
            ],
            duree: "1 séance de 30 min",
            ressources: ["Jeu en ligne « Labyrinthe d'équations »", "Feuille de brouillon"],
            image: "img/labyrinthe-plan.svg",
            imageAlt: "Plan du labyrinthe d'équations : six cases du départ à l'arrivée",
            jeux: ["labyrinthe"]
          },
          consolidation: {
            titre: "Portrait d'équations et équations produits",
            objectif: "Automatiser la résolution avec x des deux côtés et des solutions variées (négatives, décimales, fractionnaires), puis traiter les équations produits.",
            activites: [
              "Portrait d'équations (livret, mercredi) : chaque équation résolue fixe un trait du visage (yeux, oreilles, bras, bouche, nez) selon la solution trouvée",
              "Ajouter un accessoire selon la solution (positive ou négative, décimale ou entière, pas de solution ou une solution)",
              "Résoudre trois équations produits (x + 3)(2x − 1) = 0, puis écrire la phrase de conclusion « les solutions sont… »"
            ],
            duree: "2 séances de 45 min",
            ressources: ["Fiche « Portrait d'équations » (voir le livret papier ci-dessous)", "Fiche d'équations produits", "Feutres"],
            jeux: ["labyrinthe"]
          }
        }
      },

      // -------------------------------------------------- homothétie et Thalès
      {
        id: "cmp_homothetie",
        label: "Homothétie, agrandissement-réduction et Thalès",
        sources: [S_LIVRET, S_PUBLI],
        flash: "On agrandit un rectangle de rapport 3. Que devient son aire ? (× 3 ; × 6 ; × 9 ; × 27). (Erreur type : appliquer le rapport à l'aire comme à une longueur.)",
        items: [
          "Je sais construire l'image d'une figure par une homothétie de centre et de rapport donnés (rapport positif ou négatif).",
          "Je sais comment les longueurs, les aires et les angles changent dans un agrandissement ou une réduction de rapport k.",
          "Je sais reconnaître une configuration de Thalès et calculer une longueur manquante."
        ],
        modules: {
          remobilisation: {
            titre: "Construire un logo par homothéties",
            objectif: "Donner du sens à l'homothétie en construisant pas à pas une figure dont on voit les copies s'agrandir autour d'un même centre.",
            activites: [
              "Réaliser la construction guidée (fiche « Logo par homothéties », livret papier ci-dessous) : un triangle équilatéral et ses images de centre D",
              "Mesurer les distances du centre D aux sommets et vérifier qu'elles sont multipliées par le rapport",
              "Observer ce qui change avec un rapport négatif (l'image passe de l'autre côté du centre)"
            ],
            duree: "1 séance de 55 min",
            ressources: ["Règle, équerre, compas", "Fiche « Logo par homothéties »", "Feuille blanche A4"],
            image: "img/homothetie-logo.svg",
            imageAlt: "Triangle ABC et ses images par homothéties de centre D"
          },
          consolidation: {
            titre: "Rapport, aires et Thalès",
            objectif: "Relier homothétie, rapport et Thalès pour calculer longueurs et aires dans des situations d'agrandissement ou de réduction.",
            activites: [
              "Exercices gradués : image d'un triangle par une homothétie de rapport 2, 0,5 puis −1,5 sur quadrillage",
              "Calculer longueur et aire d'une figure agrandie ou réduite (le rapport s'applique aux longueurs, son carré aux aires)",
              "Problèmes de Thalès : hauteur d'un arbre ou d'un bâtiment à partir d'une ombre, plan à l'échelle"
            ],
            duree: "2 séances de 45 min",
            ressources: ["Fiche d'exercices gradués", "Papier quadrillé", "Fiche méthode Thalès"]
          }
        }
      },

      // --------------------------------------------------------- trigonométrie
      {
        id: "cmp_trigonometrie",
        label: "Trigonométrie dans le triangle rectangle (cosinus, sinus, tangente)",
        sources: [S_LIVRET],
        flash: "Dans un triangle ABC rectangle en B, l'hypoténuse mesure 10 cm et l'angle en A mesure 30°. Quelle est la longueur BC ? (5 cm ; 8,7 cm ; 17,3 cm ; 3 cm).",
        coupsDePouce: [
          "Dessiner le triangle, repérer l'angle droit puis l'angle connu.",
          "Par rapport à cet angle, nommer l'hypoténuse, le côté adjacent et le côté opposé.",
          "Choisir la relation : cosinus = adjacent ÷ hypoténuse, sinus = opposé ÷ hypoténuse, tangente = opposé ÷ adjacent.",
          "Écrire l'égalité, résoudre, arrondir au dixième et vérifier que l'hypoténuse reste le plus grand côté."
        ],
        items: [
          "Je sais nommer l'hypoténuse, le côté adjacent et le côté opposé par rapport à un angle aigu.",
          "Je sais choisir entre cosinus, sinus et tangente pour calculer une longueur.",
          "Je sais calculer la mesure d'un angle avec la calculatrice (touches cos⁻¹, sin⁻¹, tan⁻¹)."
        ],
        modules: {
          remobilisation: {
            titre: "Nommer les côtés, choisir la bonne relation",
            objectif: "Repérer adjacent, opposé et hypoténuse sans calcul, puis choisir la relation adaptée avant tout calcul.",
            activites: [
              "Colorier sur des triangles rectangles tournés dans plusieurs positions l'hypoténuse, l'adjacent et l'opposé à l'angle indiqué",
              "Pour chaque triangle, dire à voix haute « je connais …, je cherche …, donc j'utilise … »",
              "Vérifier à la calculatrice que cos, sin et tan d'un angle ne dépendent pas de la taille du triangle (tracer deux triangles semblables)"
            ],
            duree: "1 séance de 55 min",
            ressources: ["Fiche de triangles rectangles tournés", "Calculatrice en mode degrés", "Crayons de couleur"],
            image: "img/trigo-vocabulaire.svg",
            imageAlt: "Triangle ABC rectangle en B : côté adjacent, côté opposé et hypoténuse par rapport à l'angle α"
          },
          consolidation: {
            titre: "Pile de triangles : enchaîner des calculs",
            objectif: "Automatiser le choix de la relation et l'arrondi en enchaînant plusieurs triangles rectangles, où le résultat de l'un sert de donnée pour le suivant.",
            activites: [
              "Jouer en ligne à « Pile de triangles » : quatre triangles rectangles empilés, la longueur trouvée à une étape sert à la suivante",
              "Pour chaque étape, écrire la relation utilisée, le calcul et la valeur arrondie au dixième",
              "Version papier : reconstituer sur une feuille l'empilement de triangles décrit dans le livret (mardi 28 avril) et trouver la longueur demandée"
            ],
            duree: "2 séances de 45 min",
            ressources: ["Jeu en ligne « Pile de triangles »", "Calculatrice en mode degrés", "Fiche « pile de triangles » du livret"],
            image: "img/pile-triangles.svg",
            imageAlt: "Quatre triangles rectangles enchaînés : le résultat de chaque étape sert à la suivante",
            jeux: ["pile"]
          }
        }
      },

      // -------------------------------------------------- raisonner, logique
      {
        id: "cmp_raisonnement",
        label: "Raisonner : essais organisés, déduction, justification",
        sources: [S_LIVRET, S_PUBLI],
        flash: "Un code à 3 chiffres : « 5 est dans le code mais mal placé » et « 9 n'est pas dans le code ». Que peut-on dire de 9 ? (On peut l'éliminer partout.)",
        items: [
          "Je sais organiser mes essais (tableau, liste, élimination) pour résoudre une énigme.",
          "Je sais déduire de chaque indice ce qui est possible et ce qui ne l'est plus.",
          "Je sais expliquer ma démarche à l'oral ou à l'écrit, y compris quand j'ai fait une erreur."
        ],
        modules: {
          remobilisation: {
            titre: "Crack le code",
            objectif: "S'entraîner à déduire en éliminant des cas à partir d'indices, sans calcul lourd.",
            activites: [
              "Jouer en ligne à « Crack le code » : un cadenas à 3 chiffres et cinq indices du type « un chiffre est correct mais mal placé »",
              "Tester une hypothèse : le jeu indique, pour chaque indice, s'il est respecté par le code proposé",
              "Écrire les étapes du raisonnement : « comme …, alors … » (au moins quatre déductions)"
            ],
            duree: "1 séance de 30 min",
            ressources: ["Jeu en ligne « Crack le code »", "Feuille de brouillon"],
            image: "img/crack-le-code.svg",
            imageAlt: "Cadenas à trois chiffres et cinq indices à exploiter",
            jeux: ["code"]
          },
          consolidation: {
            titre: "L'étoile magique et grilles logiques",
            objectif: "Mettre en équation une contrainte (somme constante) puis tester méthodiquement les cas restants.",
            activites: [
              "Jouer en ligne à « L'étoile magique » : placer les nombres de 4 à 11 sur les 8 emplacements vides pour que chaque alignement de 4 nombres ait la même somme",
              "Commencer par chercher la somme magique (somme de 1 à 12, chaque nombre compte dans deux alignements)",
              "Prolongement : choisir un puzzle ou une grille logique dans le classeur « Jeux mathématiques » de l'IREM de Toulouse et le présenter à un camarade"
            ],
            duree: "1 à 2 séances de 45 min",
            ressources: ["Jeu en ligne « L'étoile magique »", "Classeur « Jeux mathématiques » (Publimath ITO18008)", "Feuille de brouillon"],
            image: "img/etoile-magique.svg",
            imageAlt: "Étoile à douze points : les nombres 1, 2, 3 et 12 sont placés, il reste huit emplacements à remplir",
            jeux: ["etoile"]
          }
        }
      },

      // ------------------------------------------------------------ vocabulaire
      {
        id: "cmp_vocabulaire",
        label: "Vocabulaire mathématique et communication",
        sources: [S_BROCHURE],
        flash: "Cible : « hypoténuse ». Dire en une phrase ce qu'est une hypoténuse sans prononcer « triangle », « rectangle » ni « côté ».",
        items: [
          "Je sais expliquer avec mes propres mots un terme mathématique (médiane, hypoténuse, solution, diviseur…).",
          "Je sais choisir le bon mot dans une situation (équation ou expression, multiple ou diviseur, image ou antécédent).",
          "Je sais écouter la définition d'un camarade et dire si elle est correcte ou complète."
        ],
        modules: {
          remobilisation: {
            titre: "Taboo des mathématiques",
            objectif: "Faire deviner un mot de maths en tenant compte d'une liste de mots interdits, pour réactiver le vocabulaire et en préciser le sens.",
            activites: [
              "Tirer une carte « Taboo » en ligne et faire deviner le mot cible à un camarade sans prononcer les mots interdits ni ceux de la même famille",
              "Annoncer avant de jouer combien de mots seront à deviner (éviter la précipitation) ; le chronomètre est facultatif",
              "Une fois le mot trouvé, faire deviner à l'inverse les mots interdits en lien avec le mot cible"
            ],
            duree: "1 séance de 30 min",
            ressources: ["Jeu en ligne « Taboo des mathématiques »", "Cartes imprimées (facultatif)"],
            image: "img/taboo-carte.svg",
            imageAlt: "Exemple de carte Taboo : Hypoténuse",
            jeux: ["taboo"]
          },
          consolidation: {
            titre: "Créer des cartes pour le dictionnaire de la classe",
            objectif: "Passer de la devinette à l'écriture d'une définition correcte : choisir les mots à faire deviner et construire leur liste d'interdits.",
            activites: [
              "Par groupes, chacun propose deux mots cibles issus du cahier ; les doublons sont repérés avec le professeur",
              "Pour chaque mot cible, le groupe liste les mots interdits en s'aidant du cahier, puis compare avec la liste d'un autre groupe",
              "Rédiger la définition du mot dans le dictionnaire des mathématiques de la classe (quelques lignes à la fin du cahier)"
            ],
            duree: "1 séance de 45 min",
            ressources: ["Cahier ou classeur de cours", "Fiche vierge « carte Taboo »", "Surligneurs"],
            jeux: ["taboo"]
          }
        }
      }
    ],

    // ------------------------------------------------- livret : activités papier
    livret: {
      chapo: "Activités à réaliser sur feuille ou sur cahier, sans écran. Elles complètent les jeux en ligne : à glisser en début de séance, à proposer en autonomie ou à emporter pendant les vacances. Aucun rendu n'est attendu.",
      fiches: [
        {
          titre: "Logo par homothéties",
          image: "img/homothetie-logo.svg",
          imageAlt: "Triangle ABC de centre D et ses images par homothéties de rapports 1,4 ; 2,2 ; 2,5 et −0,9, avec un cercle de rayon 6,6 cm",
          portions: "Géométrie",
          duree: "~45 min",
          etapes: [
            "Tracer un triangle équilatéral ABC de côté 5,2 cm",
            "Construire ses trois médiatrices : elles se coupent en D (on a AD = BD = CD = 3 cm)",
            "Construire les images de ABC par les homothéties de centre D et de rapports 1,4 ; 2,2 ; 2,5 puis −0,9 (appeler A'B'C' cette dernière image)",
            "Tracer par D les parallèles à (A'B'), (C'B') et (A'C'), puis le cercle de centre D et de rayon 6,6 cm",
            "Contrôle : les sommets de l'image de rapport 2,2 doivent être sur le cercle (3 × 2,2 = 6,6)"
          ]
        },
        {
          titre: "L'escalier de Penrose",
          portions: "Géométrie, perspective",
          duree: "~30 min",
          etapes: [
            "Sur du papier pointé isométrique, repérer les points de départ de la première volée de marches",
            "Reproduire les lignes verticales décalées qui rendent l'escalier « impossible »",
            "Colorier les faces dans trois teintes pour que la figure paraisse en relief",
            "Expliquer à l'oral pourquoi le dessin est possible sur le papier mais pas dans l'espace"
          ]
        },
        {
          titre: "Portrait d'équations",
          image: "img/portrait-equations.svg",
          imageAlt: "Gabarit de visage avec cinq éléments à dessiner selon la solution de chaque équation",
          portions: "Algèbre",
          duree: "~45 min",
          etapes: [
            "Dessiner un grand visage vide, sans traits",
            "Résoudre cinq équations avec x des deux côtés (ex. 5y − 10 = 3y + 4 ; 4h + 19 = −2h − 17 ; 5j + 30 = 2j − 6)",
            "Selon le signe et la valeur de chaque solution, dessiner l'élément correspondant : yeux, oreilles, bras, bouche, nez",
            "Bonus : ajouter un accessoire selon que la solution est positive, décimale, ou que l'équation n'a pas de solution"
          ]
        },
        {
          titre: "Tangram",
          image: "img/tangram.svg",
          imageAlt: "Carré ABCD découpé en sept pièces colorées",
          portions: "Géométrie, construction",
          duree: "~45 min",
          etapes: [
            "Construire un carré ABCD, tracer la diagonale [AC] et placer son milieu O",
            "Placer les milieux I, J, K, L des segments [CD], [DA], [AO] et [OC]",
            "Tracer [BO], [IJ] et [JK], puis placer le milieu M de [IJ] et tracer [MO] et [ML]",
            "Colorier, découper sur une feuille un peu épaisse, puis reconstituer des silhouettes avec les sept pièces",
            "Prolongement : calculer l'aire de chaque pièce en fraction de l'aire du carré"
          ]
        },
        {
          titre: "Pile de triangles (version papier)",
          image: "img/pile-triangles.svg",
          imageAlt: "Quatre triangles rectangles à enchaîner : le résultat de chacun sert au suivant",
          portions: "Trigonométrie, Pythagore",
          duree: "~55 min",
          etapes: [
            "Dessiner plusieurs triangles rectangles empilés, le côté trouvé dans l'un servant de donnée à l'autre",
            "À chaque étape, indiquer la relation utilisée (Pythagore, cosinus, sinus ou tangente)",
            "Arrondir au dixième et garder les valeurs non arrondies pour l'étape suivante",
            "Terminer en indiquant la longueur du côté demandé"
          ]
        },
        {
          titre: "Escape game numérique",
          portions: "Logique, calculs",
          duree: "~45 min",
          etapes: [
            "Observer les indices : équations et opérations écrites dans le décor (voir le livret, vendredi)",
            "Associer chaque résultat à une couleur et à un chiffre pour reconstituer le code",
            "Saisir le code sur le cadenas numérique (lien et QR code du livret)"
          ]
        }
      ],
      curieux: [
        "Trouver l'erreur cachée dans une « preuve » que 1 = 2 (liens vidéo dans le livret)",
        "Trouver l'erreur cachée dans une « preuve » que zéro n'est pas nul (liens vidéo dans le livret)",
        "Découvrir un critère de divisibilité par 7 (lien vidéo dans le livret)"
      ]
    }
  });
})();
