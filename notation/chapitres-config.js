/* ==========================================================================
   /notation — Moyenne par chapitre : configuration
   Chapitres générés à partir de /mathilab (19 TD) et /laboratory (33 TP) :
   un chapitre = un TD ou un TP ; ses « onglets » = les onglets (data-tab) du module.
   Mise à jour : si un onglet est ajouté/renommé dans un module, adapter la liste
   "onglets" du chapitre concerné (ou demander la régénération).
   ========================================================================== */
window.CHAPITRES_CONFIG = {
  supabase: {
    url: 'https://obsqakmhtvfuwnoxoksr.supabase.co',
    key: 'sb_publishable_6FzuHhDBYOOSiAR9J-CiCA_KBfcyfhu'
  },

  /* Même clé de session que analyse.js : une seule connexion pour toutes les pages /notation */
  storageKey: 'notation-auth',

  /* Compétences cotées 0/1/2 dans notation_reponses.competence */
  competences: [
    { code: 'APP', nom: "S'approprier" },
    { code: 'ANA', nom: 'Analyser' },
    { code: 'REA', nom: 'Réaliser' },
    { code: 'VAL', nom: 'Valider' },
    { code: 'COM', nom: 'Communiquer' }
  ],

  /* Passage de la moyenne des cotations (0 à 2) au niveau de maîtrise */
  seuils: { tbm: 1.6, satisfaisante: 1.2, fragile: 0.8 },

  /* Légende des niveaux (identique à la grille d'évaluation) */
  niveaux: [
    { v: '4', label: 'Très bonne maîtrise' },
    { v: '3', label: 'Maîtrise satisfaisante' },
    { v: '2', label: 'Maîtrise fragile' },
    { v: '1', label: 'Maîtrise insuffisante' },
    { v: 'A', label: 'Absent' },
    { v: 'N', label: 'Non évalué' },
    { v: 'D', label: 'Dispensé' }
  ],

  /* Automatismes PlayLab rattachés aux chapitres (comme PlayMaths : meilleure note retenue,
     comptés dans la moyenne s'ils sont faits, jamais « à faire »). Clé = id du chapitre,
     valeur = codes tels qu'enregistrés dans quiz_sessions (« A 07 », avec l'espace). */
  automatismes: {
    A01: ['A 07', 'A 08', 'A 09', 'A 11', 'A 16', 'A 19', 'B 06', 'B 07'],
    A02: ['C 07'],
    A03: ['A 15', 'B 08', 'B 09', 'C 08', 'C 09', 'C 10'],
    A04: ['A 05', 'A 06'],
    A05: ['A 02', 'A 03'],
    AL02: ['C 03', 'C 04'],
    G01: ['A 12', 'A 13', 'A 14', 'A 17', 'A 18', 'A 20', 'A 21', 'A 22'],
    G03: ['C 11'],
    S01: ['B 03', 'B 04'],
    S02: ['A 04', 'B 05'],
    S03: ['A 01', 'B 01', 'B 02', 'C 01', 'C 02'],
    S05: ['C 05', 'C 06'],
    E2: ['A 10']
  },

  /* Format d'un chapitre :
     id, groupe, titre
     filtre   : { domaines:[fragments du domaine, sans accents], code_td:'TD01' | 'TP02' }
     onglets  : [ [id_onglet, libellé, {niveaux:['1ere'|'tle'|'2nde'], facultatif:true}] ]
                « niveaux » : l'onglet ne concerne que ces classes ; « facultatif » : compté s'il est fait,
                jamais « à faire » (onglets réservés à certaines filières, activités atelier).
     puzzle   : { sujets:['A','B','C'], requis:1 }  (copies « Sujet A/B/C » ; requis = sujets à réaliser)
     quiz     : { categorie:'playmaths'|'playsciences', code:'G01', niveaux:[...] }  (notes /10 du quiz) */
  chapitres: [
    {"id":"A01","groupe":"Mathématiques · Algèbre","titre":"Résoudre un problème du premier degré","filtre":{"domaines":["ALGEBRE"],"code_td":"TD01"},"quiz":{"categorie":"playmaths","code":"A01"},"onglets":[["tab-equation","Équation"],["tab-inequation","Inéquation"],["tab-intervalles","Intervalles de ℝ"],["tab-probleme","Traduire un problème"]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"A02","groupe":"Mathématiques · Algèbre","titre":"Étudier et comparer des suites numériques","filtre":{"domaines":["ALGEBRE"],"code_td":"TD02"},"quiz":{"categorie":"playmaths","code":"A02"},"onglets":[["ar-etudier","Étudier une suite arithmétique",{"niveaux":["1ere"]}],["ar-comparer","Comparer deux évolutions",{"niveaux":["1ere"]}],["geo-etudier","Étudier une suite géométrique",{"niveaux":["tle"]}],["geo-comparer","Comparer deux évolutions",{"niveaux":["tle"]}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"A03","groupe":"Mathématiques · Algèbre","titre":"Étudier des fonctions","filtre":{"domaines":["ALGEBRE"],"code_td":"TD03"},"quiz":{"categorie":"playmaths","code":"A03"},"onglets":[["resolution-graphique","Résolution graphique",{"niveaux":["1ere"]}],["polynomes-degre2","Polynômes de degré 2",{"niveaux":["1ere"]}],["derivation-variations","Dérivation et variations",{"niveaux":["1ere"]}],["fonction-cube","La fonction cube",{"niveaux":["tle"]}],["polynome-degre3","Polynôme de degré 3",{"niveaux":["tle"]}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"A04","groupe":"Mathématiques · Algèbre","titre":"Fonctions exponentielles et logarithme décimal","filtre":{"domaines":["ALGEBRE"],"code_td":"TD04"},"quiz":{"categorie":"playmaths","code":"A04"},"onglets":[["fonction-exponentielle","Fonction exponentielle de base q"],["fonction-log","Fonction logarithme décimal"]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"A05","groupe":"Mathématiques · Algèbre","titre":"Calculs commerciaux et financiers","filtre":{"domaines":["ALGEBRE"],"code_td":"TD05"},"quiz":{"categorie":"playmaths","code":"A05"},"onglets":[["interets-simples","Intérêts simples",{"niveaux":["1ere"]}],["couts-marginal-moyen","Coût marginal et coût moyen",{"niveaux":["1ere"]}],["interets-composes","Intérêts composés",{"niveaux":["tle"]}],["amortissement","Tableau d'amortissement",{"niveaux":["tle"]}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"AL01","groupe":"Mathématiques · Algorithme","titre":"Simuler une expérience aléatoire","filtre":{"domaines":["ALGORITHM"],"code_td":"TD01"},"quiz":{"categorie":"playmaths","code":"AL01"},"onglets":[["modifier-simulation","Modifier une simulation donnée"],["utiliser-simulation","Utiliser une simulation fournie"],["ecrire-fonction","Écrire une fonction de simulation"],["frequence-lettre","Fréquence d'une lettre dans un mot"]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"AL02","groupe":"Mathématiques · Algorithme","titre":"Statistiques à deux variables et probabilités en Python","filtre":{"domaines":["ALGORITHM"],"code_td":"TD02"},"quiz":{"categorie":"playmaths","code":"AL02"},"onglets":[["stats-1ere","Statistiques à deux variables",{"niveaux":["1ere"]}],["probas-1ere","Probabilités (réunion et intersection)",{"niveaux":["1ere"]}],["stats-tle","Ajustement d'un nuage de points",{"niveaux":["tle"]}],["probas-tle","Arbre pondéré, probabilités totales et indépendance",{"niveaux":["tle"]}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"AL03","groupe":"Mathématiques · Algorithme","titre":"Suites numériques en Python","filtre":{"domaines":["ALGORITHM"],"code_td":"TD03"},"quiz":{"categorie":"playmaths","code":"AL03"},"onglets":[["ar-termes-somme","Termes et somme (arithmétique)",{"niveaux":["1ere"]}],["ar-nuage-seuil","Nuage de points et seuil",{"niveaux":["1ere"]}],["geo-termes-somme","Termes et somme (géométrique)",{"niveaux":["tle"]}],["geo-nuage-seuil","Nuage de points et seuil",{"niveaux":["tle"]}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"AL04","groupe":"Mathématiques · Algorithme","titre":"Fonctions et calculs commerciaux en Python","filtre":{"domaines":["ALGORITHM"],"code_td":"TD04"},"quiz":{"categorie":"playmaths","code":"AL04"},"onglets":[["fonctions-2nde","Fonctions en Python",{"niveaux":["2nde"]}],["commercial-2nde","Intérêt simple et remise",{"niveaux":["2nde"]}],["balayage-1ere","Résolution par balayage",{"niveaux":["1ere"]}],["tangente-1ere","Tangente (GeoGebra)",{"niveaux":["1ere"]}],["commercial-1ere","Intérêts simples, coût marginal et moyen",{"niveaux":["1ere"]}],["balayage-tle","Résolution par balayage",{"niveaux":["tle"]}],["commercial-tle","Intérêts composés et crédit",{"niveaux":["tle"]}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"AL05","groupe":"Mathématiques · Algorithme","titre":"Géométrie : calculs et constructions","filtre":{"domaines":["ALGORITHM"],"code_td":"TD05"},"quiz":{"categorie":"playmaths","code":"AL05"},"onglets":[["pythagore","Triplets pythagoriciens"],["aires-volumes","Aires, volumes et proportionnalité"],["construction","Construire une figure (GeoGebra)"]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"G01","groupe":"Mathématiques · Géométrie","titre":"Solides, aires, volumes, Pythagore et Thalès","filtre":{"domaines":["GEOMETRIE"],"code_td":"TD01"},"quiz":{"categorie":"playmaths","code":"G01"},"onglets":[["aires-perimetres","Aires et périmètres"],["volumes","Volumes de solides"],["pythagore","Théorème de Pythagore"],["thales","Théorème de Thalès"],["agrandissement","Agrandissement / réduction"]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"G02","groupe":"Mathématiques · Géométrie","titre":"Représenter et sectionner un solide","filtre":{"domaines":["GEOMETRIE"],"code_td":"TD02"},"quiz":{"categorie":"playmaths","code":"G02"},"onglets":[["representer-solide","Représenter un solide"],["section-plan","Section d'un solide par un plan"]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"G03","groupe":"Mathématiques · Géométrie","titre":"Vecteurs du plan et de l'espace","filtre":{"domaines":["GEOMETRIE"],"code_td":"TD03"},"quiz":{"categorie":"playmaths","code":"G03"},"onglets":[["construire-vecteurs","Construire et reconnaître des vecteurs",{"niveaux":["1ere"]}],["coordonnees-plan","Coordonnées, somme, produit, norme",{"niveaux":["1ere"]}],["vecteurs-espace","Vecteurs dans l'espace",{"niveaux":["tle"],"facultatif":true}],["activites-atelier","Activités atelier",{"facultatif":true}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"G04","groupe":"Mathématiques · Géométrie","titre":"Trigonométrie","filtre":{"domaines":["GEOMETRIE"],"code_td":"TD04"},"quiz":{"categorie":"playmaths","code":"G04"},"onglets":[["cercle-trigo","Cercle trigonométrique et radian",{"facultatif":true}],["fonctions-sin-cos","Fonctions sinus et cosinus",{"facultatif":true}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"S01","groupe":"Mathématiques · Statistiques","titre":"Organiser une série","filtre":{"domaines":["STATISTIQUE"],"code_td":"TD01"},"quiz":{"categorie":"playmaths","code":"S01"},"onglets":[["regrouper-classes","Regrouper une série en classes"],["representer-qualitative","Représenter une série qualitative"],["representer-chronologique","Représenter une évolution (lignes brisées)"]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"S02","groupe":"Mathématiques · Statistiques","titre":"Comparer des séries","filtre":{"domaines":["STATISTIQUE"],"code_td":"TD02"},"quiz":{"categorie":"playmaths","code":"S02"},"onglets":[["indicateurs-serie","Calculer les indicateurs d'une série"],["comparer-series","Comparer deux séries"]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"S03","groupe":"Mathématiques · Statistiques","titre":"Fluctuation, probabilités","filtre":{"domaines":["STATISTIQUE"],"code_td":"TD03"},"quiz":{"categorie":"playmaths","code":"S03"},"onglets":[["fluctuation-echantillons","Observer la fluctuation d'une fréquence"],["stabilisation-n","Stabilisation quand n augmente"],["arbre-denombrement","Dénombrer avec un arbre"]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"S04","groupe":"Mathématiques · Statistiques","titre":"Nuage de points et ajustement","filtre":{"domaines":["STATISTIQUE"],"code_td":"TD04"},"quiz":{"categorie":"playmaths","code":"S04"},"onglets":[["nuage-ajustement-affine","Nuage de points et ajustement affine"],["interpoler-extrapoler","Interpoler / extrapoler"],["ajustement-non-affine","Ajustement non affine (Tle)",{"niveaux":["tle"]}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"S05","groupe":"Mathématiques · Statistiques","titre":"Tableau croisé et arbre pondéré","filtre":{"domaines":["STATISTIQUE"],"code_td":"TD05"},"quiz":{"categorie":"playmaths","code":"S05"},"onglets":[["tableau-croise","Tableau croisé et probabilité conditionnelle"],["arbre-pondere","Arbre pondéré et indépendance (Tle)",{"niveaux":["tle"]}]],"puzzle":{"sujets":["A","B","C"],"requis":1}},
    {"id":"C1","groupe":"Sciences · Chimie","titre":"Solutions","filtre":{"domaines":["CHIMIE"],"code_td":"TP01"},"onglets":[["dissolution","Dissolution"],["dilution","Dilution"],["identification-ions","Identification d'ions"],["solutions-commerciales","Solutions commerciales"]],"quiz":{"categorie":"playsciences","code":"C1","niveaux":["2nde"]}},
    {"id":"C2","groupe":"Sciences · Chimie","titre":"pH - Indicateurs","filtre":{"domaines":["CHIMIE"],"code_td":"TP02"},"onglets":[["indicateur","Indicateur"],["papier-ph","Papier pH"],["titrage-colorimetrique","Titrage colorimétrique"],["acido-basique","Solution acido-basique"],["ph-vers-concentration","Calculer le pH"],["concentration-vers-ph","Calculer [H₃O⁺]"]],"quiz":{"categorie":"playsciences","code":"C2","niveaux":["2nde"]}},
    {"id":"C3","groupe":"Sciences · Chimie","titre":"Titrages","filtre":{"domaines":["CHIMIE"],"code_td":"TP03"},"onglets":[["tp","Compte rendu du TP"]],"quiz":{"categorie":"playsciences","code":"C3","niveaux":["1ere"]}},
    {"id":"C4","groupe":"Sciences · Chimie","titre":"Oxydo-réduction","filtre":{"domaines":["CHIMIE"],"code_td":"TP04"},"onglets":[["reaction-acide","Réaction métal / acide"],["classification-qualitative","Classification qualitative"],["pile-electrochimique","Pile électrochimique"],["classification","Classification des couples"],["corrosion-passivation","Corrosion et passivation"],["anode-sacrificielle","Anode sacrificielle"],["accumulateur","Accumulateur"]],"quiz":{"categorie":"playsciences","code":"C4","niveaux":["tle"]}},
    {"id":"C5","groupe":"Sciences · Chimie","titre":"Chimie organique","filtre":{"domaines":["CHIMIE"],"code_td":"TP05"},"onglets":[["esterification","Synthèse d'un ester"],["hydrolyse-basique","Hydrolyse basique"],["oxydation-alcool","Oxydation d'un alcool"],["test-fehling","Test de Fehling"],["groupes-caracteristiques","Groupes caractéristiques"]],"quiz":{"categorie":"playsciences","code":"C5","niveaux":["tle"]}},
    {"id":"A1","groupe":"Sciences · Acoustique","titre":"Caractériser un son","filtre":{"domaines":["ACOUSTIQUE"],"code_td":"TP01"},"onglets":[["periode-frequence","Période / fréquence"],["niveau-intensite","Niveau d'intensité acoustique"],["classement-sons","Classement des sons"]],"quiz":{"categorie":"playsciences","code":"A1","niveaux":["2nde"]}},
    {"id":"A2","groupe":"Sciences · Acoustique","titre":"Isolation phonique","filtre":{"domaines":["ACOUSTIQUE"],"code_td":"TP02"},"onglets":[["mesure-attenuation","Mesure de l'atténuation"],["classement-isolants","Classement des isolants"]],"quiz":{"categorie":"playsciences","code":"A2","niveaux":["2nde"]}},
    {"id":"A3","groupe":"Sciences · Acoustique","titre":"Chaîne de transmission sonore","filtre":{"domaines":["ACOUSTIQUE"],"code_td":"TP03"},"onglets":[["emetteur-piezo","Émetteur piézoélectrique"],["recepteur-piezo","Récepteur piézoélectrique"],["schema-chaine","Schéma de la chaîne"]],"quiz":{"categorie":"playsciences","code":"A3","niveaux":["1ere"]}},
    {"id":"A4","groupe":"Sciences · Acoustique","titre":"Propagation du son","filtre":{"domaines":["ACOUSTIQUE"],"code_td":"TP04"},"onglets":[["milieu-materiel","Nécessité d'un milieu matériel"],["vitesse-propagation","Vitesse de propagation"],["longueur-onde","Longueur d'onde et fréquence"],["acquisition-exao","Acquisition ExAO (temps réel)"]],"quiz":{"categorie":"playsciences","code":"A4","niveaux":["1ere"]}},
    {"id":"A5","groupe":"Sciences · Acoustique","titre":"Pression et niveau acoustiques","filtre":{"domaines":["ACOUSTIQUE"],"code_td":"TP05"},"onglets":[["niveau-depuis-pression","Niveau depuis pression/intensité"],["attenuation-distance","Atténuation avec la distance"]],"quiz":{"categorie":"playsciences","code":"A5","niveaux":["tle"]}},
    {"id":"O1","groupe":"Sciences · Optique","titre":"Réflexion et réfraction","filtre":{"domaines":["OPTIQUE"],"code_td":"TP01"},"onglets":[["loi-reflexion","Loi de la réflexion"],["loi-refraction","Loi de la réfraction"],["angle-limite","Angle limite et réflexion totale"]],"quiz":{"categorie":"playsciences","code":"O1","niveaux":["2nde"]}},
    {"id":"O2","groupe":"Sciences · Optique","titre":"Spectre de la lumière blanche","filtre":{"domaines":["OPTIQUE"],"code_td":"TP02"},"onglets":[["decomposition-recomposition","Décomposition / recomposition"],["echelle-longueurs-onde","Échelle des longueurs d'onde"],["ir-uv-sante","IR, UV et santé"]],"quiz":{"categorie":"playsciences","code":"O2","niveaux":["2nde"]}},
    {"id":"O3","groupe":"Sciences · Optique","titre":"Perception des couleurs","filtre":{"domaines":["OPTIQUE"],"code_td":"TP03"},"onglets":[["synthese-additive","Synthèse additive"],["synthese-soustractive","Synthèse soustractive"],["couleur-objet-eclairage","Couleur d'un objet et éclairage"],["modele-oeil","Modèle de l'œil"]],"quiz":{"categorie":"playsciences","code":"O3","niveaux":["1ere"]}},
    {"id":"O4","groupe":"Sciences · Optique","titre":"Photocomposants","filtre":{"domaines":["OPTIQUE"],"code_td":"TP04"},"onglets":[["caracteristique-eclairement","Caractéristique / éclairement"],["caracteristique-longueur-onde","Caractéristique / longueur d'onde"],["energie-photon","Énergie du photon"]],"quiz":{"categorie":"playsciences","code":"O4","niveaux":["1ere"]}},
    {"id":"O5","groupe":"Sciences · Optique","titre":"Sources lumineuses","filtre":{"domaines":["OPTIQUE"],"code_td":"TP05"},"onglets":[["spectres-emission","Spectres d'émission"],["efficacite-energetique","Efficacité énergétique"],["proprietes-laser","Propriétés du laser"]],"quiz":{"categorie":"playsciences","code":"O5","niveaux":["tle"]}},
    {"id":"O6","groupe":"Sciences · Optique","titre":"Lentilles convergentes/divergentes","filtre":{"domaines":["OPTIQUE"],"code_td":"TP06"},"onglets":[["differencier-lentilles","Convergente ou divergente ?"],["distance-focale","Distance focale expérimentale"],["conjugaison-grandissement","Conjugaison et grandissement"]],"quiz":{"categorie":"playsciences","code":"O6","niveaux":["tle"]}},
    {"id":"E1","groupe":"Sciences · Électricité","titre":"Puissance et énergie électrique","filtre":{"domaines":["ELECTRICITE"],"code_td":"TP01"},"onglets":[["mesure-puissance","Mesure de la puissance"],["energie-consommee","Énergie consommée"]],"quiz":{"categorie":"playsciences","code":"E1","niveaux":["1ere"]}},
    {"id":"E2","groupe":"Sciences · Électricité","titre":"Transport de l'énergie électrique","filtre":{"domaines":["ELECTRICITE"],"code_td":"TP02"},"onglets":[["reseau-distribution","Réseau de distribution"],["effet-joule","Effet Joule et pertes en ligne"],["transformateur","Transformateur"],["manipulation-reelle","Manipulation réelle"]],"quiz":{"categorie":"playsciences","code":"E2","niveaux":["1ere"]}},
    {"id":"E3","groupe":"Sciences · Électricité","titre":"Puissance active","filtre":{"domaines":["ELECTRICITE"],"code_td":"TP03"},"onglets":[["dephasage","Déphasage tension-intensité"],["puissance-active","Puissance active et facteur de puissance"]],"quiz":{"categorie":"playsciences","code":"E3","niveaux":["tle"]}},
    {"id":"E4","groupe":"Sciences · Électricité","titre":"Conversion et moteurs électriques","filtre":{"domaines":["ELECTRICITE"],"code_td":"TP04"},"onglets":[["redressement","Redressement et filtrage"],["moteurs","Moteurs électriques"]],"quiz":{"categorie":"playsciences","code":"E4","niveaux":["tle"]}},
    {"id":"E5","groupe":"Sciences · Électricité","titre":"Stockage électrochimique","filtre":{"domaines":["ELECTRICITE"],"code_td":"TP05"},"onglets":[["accumulateur","Charge et décharge d'un accumulateur"]],"quiz":{"categorie":"playsciences","code":"E5","niveaux":["tle"]}},
    {"id":"M1","groupe":"Sciences · Mécanique","titre":"Décrire un mouvement","filtre":{"domaines":["MECANIQUE"],"code_td":"TP01"},"onglets":[["trajectoire","Trajectoire et référentiel"],["vitesse-moyenne","Vitesse moyenne"],["frequence-rotation","Fréquence de rotation"]],"quiz":{"categorie":"playsciences","code":"M1","niveaux":["2nde"]}},
    {"id":"M2","groupe":"Sciences · Mécanique","titre":"Actions mécaniques et équilibre","filtre":{"domaines":["MECANIQUE"],"code_td":"TP02"},"onglets":[["modeliser-force","Modéliser une force"],["poids","Poids d'un corps"],["equilibre","Équilibre de forces concourantes"]],"quiz":{"categorie":"playsciences","code":"M2","niveaux":["2nde"]}},
    {"id":"M3","groupe":"Sciences · Mécanique","titre":"Cinématique et pression","filtre":{"domaines":["MECANIQUE"],"code_td":"TP03"},"onglets":[["vitesse-acceleration","Vitesse et accélération"],["pression-force","Pression et force pressante"],["acquisition-exao","Acquisition ExAO (pression)"]],"quiz":{"categorie":"playsciences","code":"M3","niveaux":["1ere"]}},
    {"id":"M4","groupe":"Sciences · Mécanique","titre":"Équilibre en rotation et Archimède","filtre":{"domaines":["MECANIQUE"],"code_td":"TP04"},"onglets":[["equilibre-rotation","Équilibre en rotation (moments)"],["archimede","Force d'Archimède"],["flexion-poutre","Flexion d'une poutre"]],"quiz":{"categorie":"playsciences","code":"M4","niveaux":["tle"]}},
    {"id":"M5","groupe":"Sciences · Mécanique","titre":"Pression, débit et résonance","filtre":{"domaines":["MECANIQUE"],"code_td":"TP05"},"onglets":[["pression-fluide","Pression dans un fluide immobile"],["debit","Débit d'un fluide en mouvement"],["resonance","Résonance mécanique"],["trainee-portance","Traînée, portance et effet Venturi"]],"quiz":{"categorie":"playsciences","code":"M5","niveaux":["tle"]}},
    {"id":"S1","groupe":"Sciences · Signaux","titre":"Caractériser une onde électromagnétique","filtre":{"domaines":["SIGNA"],"code_td":"TP01"},"onglets":[["relation-lambda-c-f","Relation λ = c/f"],["domaine-spectral","Domaine spectral"],["sources-vie-courante","Sources de la vie courante"]],"quiz":{"categorie":"playsciences","code":"S1","niveaux":["1ere"]}},
    {"id":"S2","groupe":"Sciences · Signaux","titre":"Transmettre l'information","filtre":{"domaines":["SIGNA"],"code_td":"TP02"},"onglets":[["propagation-libre-guidee","Propagation libre / guidée"],["chaine-generale","Chaîne de transmission"],["fibre-optique","Fibre optique"]],"quiz":{"categorie":"playsciences","code":"S2","niveaux":["tle"]}},
    {"id":"T1","groupe":"Sciences · Thermique","titre":"Capteurs de température","filtre":{"domaines":["THERMIQUE"],"code_td":"TP01"},"onglets":[["echelles","Échelles Celsius/Kelvin"],["thermistance","Thermistance"],["pt100","Sonde Pt100"],["thermocouple","Thermocouple"],["ir-cristaux","IR / cristaux liquides"]],"quiz":{"categorie":"playsciences","code":"T1","niveaux":["2nde"]}},
    {"id":"T2","groupe":"Sciences · Thermique","titre":"Équilibre thermique","filtre":{"domaines":["THERMIQUE"],"code_td":"TP02"},"onglets":[["melange","Équilibre thermique (mélange)"],["energie","Énergie échangée Q = mcΔθ"],["suivi-temporel","Suivi temporel"]],"quiz":{"categorie":"playsciences","code":"T2","niveaux":["2nde"]}},
    {"id":"T3","groupe":"Sciences · Thermique","titre":"Changement d'état","filtre":{"domaines":["THERMIQUE"],"code_td":"TP03"},"onglets":[["palier","Relevé du palier"],["energie-latente","Énergie de changement d'état Q = mL"],["bilan-complet","Bilan énergétique complet"]],"quiz":{"categorie":"playsciences","code":"T3","niveaux":["1ere"]}},
    {"id":"T4","groupe":"Sciences · Thermique","titre":"Combustion","filtre":{"domaines":["THERMIQUE"],"code_td":"TP04"},"onglets":[["equation","Équation de combustion"],["energie-combustion","Énergie libérée"],["masse-co2","Masse de CO₂ dégagée"]],"quiz":{"categorie":"playsciences","code":"T4","niveaux":["1ere"]}},
    {"id":"T5","groupe":"Sciences · Thermique","titre":"Transferts thermiques","filtre":{"domaines":["THERMIQUE"],"code_td":"TP05"},"onglets":[["trois-modes","Les trois modes de transfert"],["conduction","Conduction thermique"],["rayonnement","Rayonnement thermique"],["effet-de-serre","Effet de serre atmosphérique"]],"quiz":{"categorie":"playsciences","code":"T5","niveaux":["tle"]}}
  ]
};