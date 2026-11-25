/**
 * game-complementaire.js — Jeux du parcours complémentaire « niveau fin de 3e ».
 * À charger APRÈS game.js (utilise gEscape, shuffle, normalise, JEUX_LISTE, JEUX_RENDERERS)
 * et AVANT app.js.
 *
 * Jeux : compte (Le compte est bon), code (Crack le code), etoile (L'étoile magique),
 *        labyrinthe (équations), quiestce (Qui est-ce ? nombres), jaiquia (J'ai… Qui a ?),
 *        taboo (Taboo des mathématiques), pile (Pile de triangles).
 *
 * Idées : livret de vacances 3e (collège MTA) et brochure « Détourner et décliner un jeu de
 * référence » (académie de Créteil). Les données (nombres, indices, cartes) sont propres à ce module.
 * Les fonctions de calcul sont exposées dans window.MLDS_COMP pour pouvoir être testées.
 */
(function () {
  "use strict";

  // ==========================================================================
  // OUTILS
  // ==========================================================================
  function fmt(n, dec) {
    const d = dec === undefined ? 3 : dec;
    return String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).replace(".", ",").replace("-", "−");
  }
  function parseNum(s) {
    const t = String(s == null ? "" : s).replace(/\s/g, "").replace(",", ".").replace("−", "-");
    if (t === "" || isNaN(Number(t))) return NaN;
    return Number(t);
  }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function actionsBar(onBack, extra) {
    const actions = el("div", "actions");
    const back = el("button", "secondary", "← Retour aux jeux");
    back.type = "button";
    back.addEventListener("click", onBack);
    actions.appendChild(back);
    (extra || []).forEach((b) => actions.appendChild(b));
    return actions;
  }
  function bouton(texte, cls, fn) {
    const b = el("button", cls, texte);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  }
  function entete(section, jeu, intro) {
    section.innerHTML = `<h1>${gEscape(jeu.titre)}</h1><p class="intro">${gEscape(jeu.sousTitre)} — ${gEscape(intro)}</p>`;
  }
  function pied(section, jeu) {
    const src = el("p", "jeu-source");
    src.textContent = jeu.source;
    section.appendChild(src);
  }
  function illustration(src, alt, cls) {
    return `<figure class="comp-illu ${cls || ""}"><img src="${src}" alt="${gEscape(alt)}" loading="lazy"></figure>`;
  }

  // ==========================================================================
  // 1. LE COMPTE EST BON
  // ==========================================================================
  const JEU_COMPTE = {
    id: "compte",
    titre: "Le compte est bon",
    sousTitre: "Calcul mental et essais organisés",
    source: "Idée : livret de vacances 3e, collège MTA (lundi). Barème : addition et multiplication 1 point, soustraction 2 points, division 4 points.",
    problemes: [
      { cible: 14, nombres: [3, 4, 7, 12, 12] },
      { cible: 20, nombres: [2, 2, 3, 6, 9] },
      { cible: 43, nombres: [3, 4, 6, 7, 12] },
      { cible: 51, nombres: [3, 3, 3, 4, 18] },
      { cible: 34, nombres: [2, 6, 8, 8, 20] }
    ]
  };

  /** Analyse une expression : retourne { value, used, ops } ou lève une Error au message lisible. */
  function analyserExpression(texte) {
    const brut = String(texte || "")
      .replace(/[×xX*·]/g, "*").replace(/[÷:]/g, "/").replace(/[−–]/g, "-").replace(/\s+/g, "");
    if (!brut) throw new Error("Écris un calcul.");
    if (/[^0-9+\-*/()]/.test(brut)) throw new Error("Caractère non autorisé : utilise des nombres, + − × ÷ et des parenthèses.");
    const tokens = brut.match(/\d+|[()+\-*/]/g) || [];
    let pos = 0;
    const used = [];
    const ops = { add: 0, sub: 0, mul: 0, div: 0 };

    function peek() { return tokens[pos]; }
    function factor() {
      const t = tokens[pos++];
      if (t === undefined) throw new Error("Le calcul est incomplet.");
      if (t === "(") {
        const v = expr();
        if (tokens[pos++] !== ")") throw new Error("Il manque une parenthèse fermante.");
        return v;
      }
      if (/^\d+$/.test(t)) { used.push(Number(t)); return Number(t); }
      throw new Error("Calcul mal écrit (« " + t + " » au mauvais endroit).");
    }
    function term() {
      let v = factor();
      while (peek() === "*" || peek() === "/") {
        const op = tokens[pos++];
        const r = factor();
        if (op === "*") { v = v * r; ops.mul++; }
        else {
          if (r === 0 || v % r !== 0) throw new Error("Division non exacte : " + v + " ÷ " + r + " n'est pas un entier.");
          v = v / r; ops.div++;
        }
      }
      return v;
    }
    function expr() {
      let v = term();
      while (peek() === "+" || peek() === "-") {
        const op = tokens[pos++];
        const r = term();
        if (op === "+") { v = v + r; ops.add++; }
        else {
          if (v - r <= 0) throw new Error("Soustraction interdite : " + v + " − " + r + " n'est pas un nombre positif.");
          v = v - r; ops.sub++;
        }
      }
      return v;
    }
    const value = expr();
    if (pos < tokens.length) throw new Error("Calcul mal écrit.");
    return { value, used, ops };
  }

  function pointsCompte(ops) { return ops.add + ops.mul + 2 * ops.sub + 4 * ops.div; }

  /** Vérifie que « used » est inclus dans le multi-ensemble « nombres ». */
  function nombresDisponibles(used, nombres) {
    const reste = nombres.slice();
    for (const u of used) {
      const i = reste.indexOf(u);
      if (i < 0) return u;
      reste.splice(i, 1);
    }
    return null;
  }

  /** Cherche une solution de score minimal (retourne { expr, points } ou null). */
  function resoudreCompte(nombres, cible) {
    let meilleur = null;
    function rec(items) {
      for (const it of items) {
        if (it.v === cible && (!meilleur || it.c < meilleur.points)) meilleur = { expr: it.e, points: it.c };
      }
      if (items.length < 2) return;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i], b = items[j];
          const reste = items.filter((_, k) => k !== i && k !== j);
          const essais = [{ v: a.v + b.v, e: "(" + a.e + " + " + b.e + ")", c: 1 }, { v: a.v * b.v, e: "(" + a.e + " × " + b.e + ")", c: 1 }];
          const hi = a.v >= b.v ? a : b, lo = a.v >= b.v ? b : a;
          if (hi.v - lo.v > 0) essais.push({ v: hi.v - lo.v, e: "(" + hi.e + " − " + lo.e + ")", c: 2 });
          if (lo.v !== 0 && hi.v % lo.v === 0) essais.push({ v: hi.v / lo.v, e: "(" + hi.e + " ÷ " + lo.e + ")", c: 4 });
          for (const r of essais) {
            rec(reste.concat([{ v: r.v, e: r.e, c: a.c + b.c + r.c }]));
          }
        }
      }
    }
    rec(nombres.map((n) => ({ v: n, e: String(n), c: 0 })));
    if (meilleur) meilleur.expr = meilleur.expr.replace(/^\((.*)\)$/, "$1");
    return meilleur;
  }

  function renderJeuCompte(onBack) {
    const jeu = JEU_COMPTE;
    const section = document.createElement("section");
    entete(section, jeu, "Fabrique le nombre cible avec les nombres donnés. Chaque nombre sert au plus une fois ; les calculs intermédiaires doivent rester des entiers positifs.");
    let total = 0;

    jeu.problemes.forEach((pb, idx) => {
      const bloc = el("div", "jeu-bloc compte-bloc");
      bloc.innerHTML = `
        <h3>Défi ${idx + 1} : fabriquer <span class="compte-cible">${pb.cible}</span></h3>
        <div class="compte-nombres">${pb.nombres.map((n) => `<span class="compte-jeton">${n}</span>`).join("")}</div>
        <div class="field"><label for="cb-${idx}">Ton calcul (ex. 3 × (4 + 7) − 12)</label>
          <input type="text" id="cb-${idx}" class="jeu-input compte-saisie" autocomplete="off" inputmode="text" style="min-width:min(100%,360px)"></div>
        <div class="jeu-feedback" data-fb="${idx}" role="status" aria-live="polite"></div>`;
      const actions = el("div", "actions");
      const btnOk = bouton("Vérifier", "primary", () => verifier());
      const btnSol = bouton("Voir une solution", "secondary", () => {
        const s = resoudreCompte(pb.nombres, pb.cible);
        fb.innerHTML = s
          ? `<span class="ko">Une solution : ${gEscape(s.expr.replace(/\*/g, "×"))} = ${pb.cible} (${s.points} point${s.points > 1 ? "s" : ""}).</span>`
          : `<span class="ko">Pas de solution avec ces règles.</span>`;
      });
      actions.appendChild(btnOk); actions.appendChild(btnSol);
      bloc.appendChild(actions);
      const fb = bloc.querySelector(`[data-fb="${idx}"]`);
      const input = bloc.querySelector("input");
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") verifier(); });

      function verifier() {
        try {
          const r = analyserExpression(input.value);
          const manque = nombresDisponibles(r.used, pb.nombres);
          if (manque !== null) throw new Error("Le nombre " + manque + " n'est pas disponible (ou déjà utilisé).");
          if (r.value !== pb.cible) {
            input.style.borderColor = "var(--brique)";
            fb.innerHTML = `<span class="ko">Ton calcul donne ${r.value}, pas ${pb.cible}. Essaie une autre combinaison.</span>`;
            return;
          }
          const pts = pointsCompte(r.ops);
          input.style.borderColor = "var(--vert)";
          fb.innerHTML = `<span class="ok">✓ Le compte est bon ! Score de ce calcul : ${pts} point${pts > 1 ? "s" : ""}. Cherches-en un autre pour essayer d'avoir plus de points.</span>`;
          bloc.dataset.pts = String(Math.max(Number(bloc.dataset.pts || 0), pts));
          total = [...section.querySelectorAll(".compte-bloc")].reduce((a, b) => a + Number(b.dataset.pts || 0), 0);
          section.querySelector("[data-total]").textContent = String(total);
        } catch (e) {
          input.style.borderColor = "var(--brique)";
          fb.innerHTML = `<span class="ko">${gEscape(e.message)}</span>`;
        }
      }
      section.appendChild(bloc);
    });

    const tot = el("p", "jeu-question", `<strong>Meilleur score cumulé : <span data-total>0</span> point(s).</strong> Garde ton meilleur calcul de chaque défi.`);
    section.appendChild(tot);
    section.appendChild(actionsBar(onBack));
    pied(section, jeu);
    return section;
  }

  // ==========================================================================
  // 2. CRACK LE CODE
  // ==========================================================================
  const JEU_CODE = {
    id: "code",
    titre: "Crack le code",
    sousTitre: "Raisonnement et déduction",
    source: "Idée : livret de vacances 3e, collège MTA (mercredi). Cadenas et indices créés pour ce module (solution unique, vérifiée par recherche exhaustive).",
    indices: [
      { chiffres: "860", bien: 0, mal: 1 },
      { chiffres: "913", bien: 0, mal: 2 },
      { chiffres: "906", bien: 1, mal: 0 },
      { chiffres: "039", bien: 1, mal: 0 },
      { chiffres: "824", bien: 0, mal: 0 }
    ]
  };

  /** Pour un code et un indice : [chiffres bien placés, chiffres corrects mal placés]. */
  function retourCode(code, indice) {
    let bien = 0, mal = 0;
    for (let i = 0; i < 3; i++) {
      if (indice[i] === code[i]) bien++;
      else if (code.indexOf(indice[i]) >= 0) mal++;
    }
    return [bien, mal];
  }
  function phraseIndice(ind) {
    if (ind.bien === 0 && ind.mal === 0) return "Aucun chiffre n'est correct";
    const p = [];
    if (ind.bien) p.push(ind.bien === 1 ? "Un chiffre est correct et bien placé" : ind.bien + " chiffres sont corrects et bien placés");
    if (ind.mal) p.push(ind.mal === 1 ? "un chiffre est correct mais mal placé" : ind.mal + " chiffres sont corrects mais mal placés");
    return p.join(", ").replace(/^./, (c) => c.toUpperCase());
  }
  function codesPossibles(indices) {
    const sols = [];
    for (let n = 0; n < 1000; n++) {
      const c = String(n).padStart(3, "0");
      if (indices.every((ind) => { const r = retourCode(c, ind.chiffres); return r[0] === ind.bien && r[1] === ind.mal; })) sols.push(c);
    }
    return sols;
  }

  function renderJeuCode(onBack) {
    const jeu = JEU_CODE;
    const solutions = codesPossibles(jeu.indices);
    const section = document.createElement("section");
    entete(section, jeu, "Le code a trois chiffres. Chaque indice est un code déjà essayé : lis ce qu'il dit, élimine, déduis.");
    section.insertAdjacentHTML("beforeend", illustration("img/crack-le-code.svg", "Cadenas à trois chiffres avec cinq indices : 860, 913, 906, 039 et 824", "illu-code"));

    const bloc = el("div", "jeu-bloc");
    bloc.innerHTML = `
      <h3>Ton code</h3>
      <div class="code-saisie">
        ${[0, 1, 2].map((i) => `<input type="text" inputmode="numeric" maxlength="1" class="jeu-input code-chiffre" aria-label="Chiffre ${i + 1}" data-i="${i}">`).join("")}
      </div>
      <table class="code-table" aria-label="Contrôle des indices">
        <thead><tr><th scope="col">Indice</th><th scope="col">Ce qu'il dit</th><th scope="col">Ton code</th></tr></thead>
        <tbody>${jeu.indices.map((ind, i) => `<tr><td class="code-ind">${ind.chiffres}</td><td>${gEscape(phraseIndice(ind))}</td><td data-ctrl="${i}">—</td></tr>`).join("")}</tbody>
      </table>
      <div class="jeu-feedback" data-fb="code" role="status" aria-live="polite"></div>`;
    section.appendChild(bloc);

    const inputs = [...bloc.querySelectorAll(".code-chiffre")];
    inputs.forEach((inp, i) => {
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\D/g, "").slice(0, 1);
        if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
        controle();
      });
    });
    function controle() {
      const code = inputs.map((i) => i.value).join("");
      const fb = bloc.querySelector('[data-fb="code"]');
      if (code.length < 3) {
        jeu.indices.forEach((_, i) => { bloc.querySelector(`[data-ctrl="${i}"]`).textContent = "—"; });
        fb.innerHTML = "";
        return;
      }
      let tous = true;
      jeu.indices.forEach((ind, i) => {
        const r = retourCode(code, ind.chiffres);
        const ok = r[0] === ind.bien && r[1] === ind.mal;
        if (!ok) tous = false;
        const cell = bloc.querySelector(`[data-ctrl="${i}"]`);
        cell.innerHTML = ok ? '<span class="ok">✓ respecté</span>' : '<span class="ko">✗ non respecté</span>';
      });
      fb.innerHTML = tous
        ? `<span class="ok">✓ Cadenas ouvert ! ${solutions.length === 1 && solutions[0] === code ? "C'est bien le seul code possible." : ""}</span>`
        : `<span class="ko">Au moins un indice n'est pas respecté : repère lequel et corrige.</span>`;
    }

    const btnAide = bouton("Un coup de pouce", "secondary", () => {
      aide.classList.toggle("hidden");
    });
    const aide = el("div", "reveal-card hidden", `<p class="reveal-prompt">Commence par l'indice qui dit « aucun chiffre n'est correct » : barre ses trois chiffres. Puis cherche un indice dont presque tous les chiffres sont éliminés.</p>`);
    section.appendChild(aide);
    section.appendChild(actionsBar(onBack, [btnAide]));
    pied(section, jeu);
    return section;
  }

  // ==========================================================================
  // 3. L'ÉTOILE MAGIQUE
  // ==========================================================================
  const JEU_ETOILE = {
    id: "etoile",
    titre: "L'étoile magique",
    sousTitre: "Raisonnement et somme constante",
    source: "Idée : livret de vacances 3e, collège MTA (lundi 27). Illustration originale.",
    fixes: { T: 1, D: 3, R: 12, H: 2 },
    libres: ["A", "B", "C", "L", "E", "F", "G", "Bt"],
    lignes: [["A", "B", "C", "D"], ["E", "F", "G", "H"], ["T", "B", "L", "E"], ["T", "C", "R", "H"], ["A", "L", "F", "Bt"], ["D", "R", "G", "Bt"]],
    // positions dans une grille 500 × 500 (voir img/etoile-magique.svg)
    pos: { T: [250, 84], Bt: [250, 416], A: [100, 167], B: [200, 167], C: [300, 167], D: [400, 167], E: [100, 333], F: [200, 333], G: [300, 333], H: [400, 333], L: [150, 250], R: [350, 250] }
  };

  function renderJeuEtoile(onBack) {
    const jeu = JEU_ETOILE;
    const section = document.createElement("section");
    entete(section, jeu, "Place les nombres de 4 à 11, une seule fois chacun, pour que les six alignements de 4 nombres aient la même somme.");

    const bloc = el("div", "jeu-bloc");
    const wrap = el("div", "etoile-wrap");
    let svg = `<svg viewBox="0 0 500 500" class="etoile-svg" aria-hidden="true">`;
    jeu.lignes.forEach((ln) => {
      const a = jeu.pos[ln[0]], b = jeu.pos[ln[3]];
      svg += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#E2A63B" stroke-width="5" stroke-linecap="round"/>`;
    });
    Object.keys(jeu.pos).forEach((k) => {
      const [x, y] = jeu.pos[k];
      if (jeu.fixes[k] !== undefined) {
        svg += `<circle cx="${x}" cy="${y}" r="22" fill="#1B2A4A"/><text x="${x}" y="${y + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">${jeu.fixes[k]}</text>`;
      } else {
        svg += `<circle cx="${x}" cy="${y}" r="22" fill="#FFF8E7" stroke="#E2A63B" stroke-width="3"/>`;
      }
    });
    svg += `</svg>`;
    wrap.innerHTML = svg;
    jeu.libres.forEach((k) => {
      const [x, y] = jeu.pos[k];
      const inp = el("input", "etoile-input");
      inp.type = "text"; inp.inputMode = "numeric"; inp.maxLength = 2;
      inp.dataset.k = k;
      inp.setAttribute("aria-label", "Emplacement " + k);
      inp.style.left = (x / 5) + "%"; inp.style.top = (y / 5) + "%";
      inp.addEventListener("input", () => { inp.value = inp.value.replace(/\D/g, "").slice(0, 2); maj(); });
      wrap.appendChild(inp);
    });
    bloc.appendChild(wrap);
    const liste = el("ul", "etoile-sommes");
    jeu.lignes.forEach((ln, i) => { liste.appendChild(el("li", "", `<span data-ln="${i}"></span>`)); });
    bloc.appendChild(liste);
    const fb = el("div", "jeu-feedback"); fb.setAttribute("role", "status"); fb.setAttribute("aria-live", "polite");
    bloc.appendChild(fb);
    section.appendChild(bloc);

    function valeur(k) {
      if (jeu.fixes[k] !== undefined) return jeu.fixes[k];
      const inp = wrap.querySelector(`input[data-k="${k}"]`);
      return inp && inp.value !== "" ? Number(inp.value) : null;
    }
    function maj() {
      let sommes = [], complet = true;
      jeu.lignes.forEach((ln, i) => {
        const vals = ln.map(valeur);
        const span = liste.querySelector(`[data-ln="${i}"]`);
        const txt = ln.map((k, j) => (vals[j] === null ? "?" : vals[j])).join(" + ");
        if (vals.includes(null)) { span.textContent = txt + " = ?"; complet = false; sommes.push(null); span.className = ""; }
        else { const s = vals.reduce((a, b) => a + b, 0); sommes.push(s); span.textContent = txt + " = " + s; }
      });
      const valides = sommes.filter((s) => s !== null);
      const cible = valides.length ? valides[0] : null;
      jeu.lignes.forEach((ln, i) => {
        const span = liste.querySelector(`[data-ln="${i}"]`);
        if (sommes[i] === null) return;
        span.className = sommes[i] === cible ? "etoile-ok" : "etoile-ko";
      });
      const libres = jeu.libres.map(valeur);
      const dedans = libres.filter((v) => v !== null);
      const horsPlage = dedans.some((v) => v < 4 || v > 11);
      const doublon = new Set(dedans).size !== dedans.length;
      if (horsPlage) fb.innerHTML = `<span class="ko">Utilise uniquement les nombres de 4 à 11.</span>`;
      else if (doublon) fb.innerHTML = `<span class="ko">Un nombre est utilisé deux fois.</span>`;
      else if (complet && valides.every((s) => s === cible)) fb.innerHTML = `<span class="ok">✓ Étoile magique réussie : chaque alignement fait ${cible}.</span>`;
      else if (complet) fb.innerHTML = `<span class="ko">Les sommes ne sont pas toutes égales : modifie un nombre.</span>`;
      else fb.innerHTML = "";
    }
    maj();

    const aide = el("div", "reveal-card hidden", `<p class="reveal-prompt">Chaque nombre de l'étoile appartient à deux alignements. La somme de 1 à 12 vaut 78, donc les six alignements totalisent 2 × 78 = 156. Chaque alignement vaut donc 156 ÷ 6 = <strong>26</strong>. Cherche alors l'emplacement où une seule case reste à remplir dans un alignement (celui qui contient 1, 12 et 2).</p>`);
    section.appendChild(aide);
    const btnAide = bouton("Un coup de pouce", "secondary", () => aide.classList.toggle("hidden"));
    const btnVider = bouton("Tout effacer", "secondary", () => { wrap.querySelectorAll("input").forEach((i) => { i.value = ""; }); maj(); });
    section.appendChild(actionsBar(onBack, [btnAide, btnVider]));
    pied(section, jeu);
    return section;
  }

  /** Cherche toutes les étoiles magiques (pour les tests). */
  function solutionsEtoile() {
    const jeu = JEU_ETOILE, sols = [];
    const nombres = [4, 5, 6, 7, 8, 9, 10, 11];
    (function perm(reste, choisis) {
      if (!reste.length) {
        const v = Object.assign({}, jeu.fixes);
        jeu.libres.forEach((k, i) => { v[k] = choisis[i]; });
        const s = new Set(jeu.lignes.map((ln) => ln.reduce((a, k) => a + v[k], 0)));
        if (s.size === 1) sols.push(v);
        return;
      }
      reste.forEach((n, i) => perm(reste.filter((_, j) => j !== i), choisis.concat([n])));
    })(nombres, []);
    return sols;
  }

  // ==========================================================================
  // 4. LABYRINTHE D'ÉQUATIONS
  // ==========================================================================
  const JEU_LABYRINTHE = {
    id: "labyrinthe",
    titre: "Labyrinthe d'équations",
    sousTitre: "Équations du premier degré",
    source: "Idée : livret de vacances 3e, collège MTA (jeudi). Équations créées pour ce module.",
    // a x + b = c x + d
    etapes: [
      { txt: "x + 8 = 3", a: 1, b: 8, c: 0, d: 3 },
      { txt: "2x + 3 = 10", a: 2, b: 3, c: 0, d: 10 },
      { txt: "5x − 4 = 2x + 11", a: 5, b: -4, c: 2, d: 11 },
      { txt: "4x − 3 = 6x + 5", a: 4, b: -3, c: 6, d: 5 },
      { txt: "3x + 5,5 = 7", a: 3, b: 5.5, c: 0, d: 7 },
      { txt: "2(x − 1) = 3x + 4", a: 2, b: -2, c: 3, d: 4 }
    ]
  };
  function solutionLineaire(e) { return (e.d - e.b) / (e.a - e.c); }
  function propositionsLabyrinthe(e) {
    const s = solutionLineaire(e);
    const cand = [-s, (e.d + e.b) / (e.a - e.c), (e.d - e.b) / (e.a + e.c), (e.b - e.d) / (e.a + e.c), s + 1, s - 1, 2 * s, s / 2];
    const r = [], vus = new Set([Math.round(s * 1000)]);
    cand.forEach((v) => {
      if (!isFinite(v)) return;
      const k = Math.round(v * 1000);
      if (vus.has(k) || r.length >= 3) return;
      vus.add(k); r.push(v);
    });
    return shuffle(r.concat([s]));
  }

  function renderJeuLabyrinthe(onBack) {
    const jeu = JEU_LABYRINTHE;
    const section = document.createElement("section");
    entete(section, jeu, "Résous l'équation de ta case, puis prends la flèche qui porte la bonne solution. Une mauvaise flèche te laisse sur place : vérifie en remplaçant x.");
    const bloc = el("div", "jeu-bloc");
    section.appendChild(bloc);
    let i = 0, essais = 0, erreurs = 0;

    function dessiner() {
      const piste = jeu.etapes.map((_, k) => `<span class="lab-case ${k < i ? "lab-fait" : k === i ? "lab-courant" : ""}">${k + 1}</span>`).join('<span class="lab-lien">→</span>');
      if (i >= jeu.etapes.length) {
        bloc.innerHTML = `<div class="lab-piste">${piste}<span class="lab-lien">→</span><span class="lab-case lab-fait">🏁</span></div>
          <p class="jeu-feedback"><span class="ok">✓ Arrivée atteinte ! ${erreurs === 0 ? "Sans aucune erreur." : erreurs + " erreur(s) en chemin : c'est en vérifiant qu'on progresse."}</span></p>`;
        const rejouer = bouton("Rejouer", "secondary", () => { i = 0; essais = 0; erreurs = 0; dessiner(); });
        bloc.appendChild(rejouer);
        return;
      }
      const e = jeu.etapes[i];
      const props = propositionsLabyrinthe(e);
      bloc.innerHTML = `
        <div class="lab-piste">${piste}<span class="lab-lien">→</span><span class="lab-case">🏁</span></div>
        <p class="lab-equation">Case ${i + 1} : <strong>${gEscape(e.txt)}</strong></p>
        <p class="jeu-meta">Quelle flèche prends-tu ?</p>
        <div class="lab-fleches">${props.map((v, k) => `<button type="button" class="lab-fleche" data-k="${k}">x = ${fmt(v)}</button>`).join("")}</div>
        <div class="jeu-feedback" role="status" aria-live="polite"></div>`;
      const fb = bloc.querySelector(".jeu-feedback");
      bloc.querySelectorAll(".lab-fleche").forEach((btn) => {
        btn.addEventListener("click", () => {
          const v = props[Number(btn.dataset.k)];
          essais++;
          if (Math.abs(v - solutionLineaire(e)) < 1e-9) { i++; dessiner(); }
          else {
            erreurs++;
            btn.disabled = true; btn.classList.add("lab-refuse");
            fb.innerHTML = `<span class="ko">Cette flèche est fermée. Remplace x par ${fmt(v)} dans l'équation : les deux membres sont-ils égaux ?</span>`;
          }
        });
      });
    }
    dessiner();
    section.appendChild(actionsBar(onBack));
    pied(section, jeu);
    return section;
  }

  // ==========================================================================
  // 5. QUI EST-CE ? (NOMBRES)
  // ==========================================================================
  const JEU_QUIESTCE = {
    id: "quiestce",
    titre: "Qui est-ce ? Les nombres",
    sousTitre: "Multiples, diviseurs, critères de divisibilité",
    source: "Principe : brochure « Détourner et décliner un jeu de référence » (académie de Créteil, jeu 3). Le tableau est adapté : 100 devient 12 et 150 devient 180, pour que chaque nombre ait une liste de diviseurs différente parmi 2, 3, 4, 5, 9 et 10.",
    nombres: [30, 60, 35, 20, 45, 36, 23, 75, 18, 50, 33, 12, 90, 180, 28, 34],
    questions: [2, 3, 4, 5, 9, 10]
  };
  function signatureDiviseurs(n) { return JEU_QUIESTCE.questions.filter((q) => n % q === 0).join("-"); }

  function renderJeuQuiEstCe(onBack) {
    const jeu = JEU_QUIESTCE;
    const section = document.createElement("section");
    entete(section, jeu, "Un nombre est caché parmi 16. Pose des questions auxquelles on répond par oui ou par non, barre les nombres éliminés et retrouve le nombre caché avec le moins de questions possible.");
    let secret = jeu.nombres[Math.floor(Math.random() * jeu.nombres.length)];
    let reponses = []; // { q, oui }
    const barres = new Set();

    const bloc = el("div", "jeu-bloc");
    section.appendChild(bloc);

    function consistent(n) { return reponses.every((r) => (n % r.q === 0) === r.oui); }

    function dessiner() {
      bloc.innerHTML = `
        <p class="jeu-meta">Questions posées : <strong>${reponses.length}</strong></p>
        <div class="qe-questions">${jeu.questions.map((q) => `<button type="button" class="secondary qe-q" data-q="${q}" ${reponses.some((r) => r.q === q) ? "disabled" : ""}>Est-il divisible par ${q} ?</button>`).join("")}</div>
        <ul class="qe-historique">${reponses.map((r) => `<li>Divisible par ${r.q} ? <strong>${r.oui ? "Oui" : "Non"}</strong></li>`).join("")}</ul>
        <p class="jeu-meta">Clique sur un nombre pour le barrer (ou le remettre).</p>
        <div class="qe-grille">${jeu.nombres.map((n) => `<button type="button" class="qe-nombre ${barres.has(n) ? "qe-barre" : ""}" data-n="${n}" aria-pressed="${barres.has(n)}">${n}</button>`).join("")}</div>
        <div class="actions">
          <button type="button" class="secondary" data-act="verif">Vérifier mes éliminations</button>
          <button type="button" class="secondary" data-act="nouveau">Nouveau nombre</button>
        </div>
        <div class="field qe-propose"><label for="qe-final">Je pense que le nombre est…</label>
          <select id="qe-final" class="jeu-select"><option value="">— choisir —</option>${jeu.nombres.map((n) => `<option value="${n}">${n}</option>`).join("")}</select>
          <button type="button" class="primary" data-act="final">Proposer</button></div>
        <div class="jeu-feedback" role="status" aria-live="polite"></div>`;
      const fb = bloc.querySelector(".jeu-feedback");
      bloc.querySelectorAll(".qe-q").forEach((b) => b.addEventListener("click", () => {
        const q = Number(b.dataset.q);
        reponses.push({ q, oui: secret % q === 0 });
        dessiner();
      }));
      bloc.querySelectorAll(".qe-nombre").forEach((b) => b.addEventListener("click", () => {
        const n = Number(b.dataset.n);
        if (barres.has(n)) barres.delete(n); else barres.add(n);
        const fbTxt = fb.innerHTML;
        dessiner();
        bloc.querySelector(".jeu-feedback").innerHTML = fbTxt;
      }));
      bloc.querySelector('[data-act="verif"]').addEventListener("click", () => {
        const aTort = jeu.nombres.filter((n) => barres.has(n) && consistent(n));
        const oublies = jeu.nombres.filter((n) => !barres.has(n) && !consistent(n));
        if (!reponses.length) fb.innerHTML = `<span class="ko">Pose d'abord une question.</span>`;
        else if (aTort.length) fb.innerHTML = `<span class="ko">Attention : ${aTort.length} nombre(s) barré(s) respectent encore toutes les réponses (par exemple ${aTort[0]}). Relis la dernière réponse : si c'est « oui », on garde les multiples.</span>`;
        else if (oublies.length) fb.innerHTML = `<span class="ko">Il reste ${oublies.length} nombre(s) à barrer (par exemple ${oublies[0]}).</span>`;
        else fb.innerHTML = `<span class="ok">✓ Tes éliminations sont toutes correctes. Il reste ${jeu.nombres.filter(consistent).length} nombre(s) possible(s).</span>`;
      });
      bloc.querySelector('[data-act="nouveau"]').addEventListener("click", () => {
        secret = jeu.nombres[Math.floor(Math.random() * jeu.nombres.length)];
        reponses = []; barres.clear(); dessiner();
      });
      bloc.querySelector('[data-act="final"]').addEventListener("click", () => {
        const v = Number(bloc.querySelector("#qe-final").value);
        if (!v) { fb.innerHTML = `<span class="ko">Choisis un nombre.</span>`; return; }
        if (v === secret) {
          const candidats = jeu.nombres.filter(consistent).length;
          fb.innerHTML = `<span class="ok">✓ Bravo, c'était ${secret}, trouvé en ${reponses.length} question(s)${candidats > 1 ? " (tu avais encore " + candidats + " nombres possibles : tu as eu de la chance !)" : ""}.</span>`;
        } else fb.innerHTML = `<span class="ko">Ce n'est pas ${v}. Relis les réponses : ${v} ${consistent(v) ? "est encore possible, continue de poser des questions" : "ne respecte pas toutes les réponses"}.</span>`;
      });
    }
    dessiner();
    section.appendChild(actionsBar(onBack));
    pied(section, jeu);
    return section;
  }

  // ==========================================================================
  // 6. J'AI… QUI A ?
  // ==========================================================================
  const JEU_JAIQUIA = {
    id: "jaiquia",
    titre: "J'ai… Qui a ?",
    sousTitre: "Calcul mental en boucle (dominos)",
    source: "Principe : brochure « Détourner et décliner un jeu de référence » (académie de Créteil, jeu 1). Expressions créées pour le niveau fin de 3e ; tous les résultats sont différents (pas de « paires croisées »).",
    paires: [
      { e: "2 × 7", v: 14 }, { e: "3 × 5", v: 15 }, { e: "(2 + 5) × 6", v: 42 }, { e: "√81", v: 9 },
      { e: "5² − 1", v: 24 }, { e: "−8 + 20", v: 12 }, { e: "2³ + 3", v: 11 }, { e: "100 ÷ 4", v: 25 },
      { e: "−3 × (−6)", v: 18 }, { e: "6 × 7 − 2", v: 40 }, { e: "4 + 3 × 2²", v: 16 }, { e: "−15 + 8 + 20", v: 13 }
    ]
  };

  function renderJeuJaiQuiA(onBack) {
    const jeu = JEU_JAIQUIA;
    const section = document.createElement("section");
    entete(section, jeu, "Lis le domino : « J'ai … Qui a … ? ». Calcule l'expression demandée et tape le résultat : le domino suivant s'affiche. La boucle se ferme quand on retombe sur le premier domino.");
    const bloc = el("div", "jeu-bloc");
    section.appendChild(bloc);
    let ordre, etape, erreurs;

    function nouvelle() { ordre = shuffle(jeu.paires); etape = 0; erreurs = 0; dessiner(); }
    function domino(k) {
      const n = ordre.length;
      return { jai: ordre[k].v, quia: ordre[(k + 1) % n].e };
    }
    function dessiner() {
      const n = ordre.length;
      const histo = [];
      for (let k = 0; k <= Math.min(etape, n - 1); k++) {
        const d = domino(k);
        histo.push(`<div class="jqa-domino ${k === etape ? "jqa-courant" : ""}"><span class="jqa-jai">J'ai<br><strong>${d.jai}</strong></span><span class="jqa-quia">Qui a<br><strong>${gEscape(d.quia)}</strong> ?</span></div>`);
      }
      if (etape >= n) {
        bloc.innerHTML = `<div class="jqa-chaine">${histo.join("")}</div><p class="jeu-feedback"><span class="ok">✓ Boucle fermée ! ${n} dominos${erreurs ? ", " + erreurs + " erreur(s) en chemin" : ", sans aucune erreur"}.</span></p>`;
        bloc.appendChild(bouton("Rejouer", "secondary", nouvelle));
        return;
      }
      bloc.innerHTML = `
        <div class="jqa-chaine">${histo.join("")}</div>
        <div class="field"><label for="jqa-rep">Résultat de <strong>${gEscape(domino(etape).quia)}</strong></label>
          <input type="text" id="jqa-rep" class="jeu-input" inputmode="numeric" autocomplete="off" size="8"></div>
        <div class="actions"><button type="button" class="primary" id="jqa-ok">Valider</button></div>
        <div class="jeu-feedback" role="status" aria-live="polite"></div>`;
      const inp = bloc.querySelector("#jqa-rep"), fb = bloc.querySelector(".jeu-feedback");
      function valider() {
        const v = parseNum(inp.value);
        const attendu = ordre[(etape + 1) % n].v;
        if (v === attendu) { etape++; dessiner(); }
        else {
          erreurs++;
          inp.style.borderColor = "var(--brique)";
          fb.innerHTML = `<span class="ko">Ce n'est pas ${isNaN(v) ? "un nombre" : fmt(v)}. Refais le calcul en respectant les priorités.</span>`;
        }
      }
      bloc.querySelector("#jqa-ok").addEventListener("click", valider);
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") valider(); });
      inp.focus();
    }
    nouvelle();
    section.appendChild(actionsBar(onBack));
    pied(section, jeu);
    return section;
  }

  // ==========================================================================
  // 7. TABOO DES MATHÉMATIQUES
  // ==========================================================================
  const JEU_TABOO = {
    id: "taboo",
    titre: "Taboo des mathématiques",
    sousTitre: "Vocabulaire et communication",
    source: "Principe : brochure « Détourner et décliner un jeu de référence » (académie de Créteil, jeu 2). Cartes créées pour le niveau fin de 3e : trois mots interdits pour tous, trois de plus (en rouge) pour le niveau avancé.",
    cartes: [
      { cible: "Hypoténuse", base: ["triangle", "rectangle", "côté"], plus: ["plus long", "Pythagore", "angle droit"] },
      { cible: "Médiatrice", base: ["segment", "milieu", "perpendiculaire"], plus: ["droite", "équidistant", "compas"] },
      { cible: "Homothétie", base: ["agrandissement", "rapport", "centre"], plus: ["réduction", "figure", "image"] },
      { cible: "Équation", base: ["inconnue", "égal", "résoudre"], plus: ["x", "solution", "balance"] },
      { cible: "Diviseur", base: ["division", "multiple", "reste"], plus: ["entier", "divisible", "nombre"] },
      { cible: "Nombre premier", base: ["diviseur", "deux", "divisible"], plus: ["1", "entier", "factorisation"] },
      { cible: "Médiane", base: ["moyenne", "milieu", "série"], plus: ["ordonner", "valeurs", "partage"] },
      { cible: "Cosinus", base: ["angle", "triangle", "hypoténuse"], plus: ["adjacent", "calculatrice", "rapport"] },
      { cible: "Thalès", base: ["parallèles", "triangle", "proportion"], plus: ["droite", "longueur", "configuration"] },
      { cible: "Pourcentage", base: ["cent", "proportion", "fraction"], plus: ["%", "augmenter", "remise"] },
      { cible: "Fonction", base: ["x", "image", "courbe"], plus: ["antécédent", "formule", "f(x)"] },
      { cible: "Racine carrée", base: ["carré", "nombre", "radical"], plus: ["√", "positif", "carré parfait"] },
      { cible: "Probabilité", base: ["chance", "hasard", "événement"], plus: ["issue", "fréquence", "entre 0 et 1"] },
      { cible: "Antécédent", base: ["image", "fonction", "nombre"], plus: ["f(x)", "flèche", "départ"] }
    ]
  };

  function renderJeuTaboo(onBack) {
    const jeu = JEU_TABOO;
    const section = document.createElement("section");
    entete(section, jeu, "Fais deviner le mot cible à un camarade sans dire les mots interdits (ni un mot de la même famille). Annonce avant de commencer combien de mots vous allez deviner.");
    const bloc = el("div", "jeu-bloc");
    section.appendChild(bloc);
    let pioche = shuffle(jeu.cartes), courante = null, avance = false, chrono = false, timer = null, reste = 60;

    function arreter() { if (timer) { clearInterval(timer); timer = null; } }
    function dessiner() {
      arreter();
      bloc.innerHTML = `
        <div class="taboo-options">
          <label class="vf-label"><input type="checkbox" id="tb-avance" ${avance ? "checked" : ""}> Niveau avancé (mots interdits en plus)</label>
          <label class="vf-label"><input type="checkbox" id="tb-chrono" ${chrono ? "checked" : ""}> Chronomètre de 60 s (facultatif)</label>
        </div>
        ${courante ? `<div class="taboo-carte">
            <div class="taboo-cible">${gEscape(courante.cible)}</div>
            <ul class="taboo-interdits">
              ${courante.base.map((m) => `<li>${gEscape(m)}</li>`).join("")}
              ${avance ? courante.plus.map((m) => `<li class="taboo-plus">${gEscape(m)}</li>`).join("") : ""}
            </ul>
          </div>${chrono ? `<p class="taboo-chrono" role="timer" aria-live="off">⏱ <span id="tb-temps">${reste}</span> s</p>` : ""}`
          : `<p class="jeu-meta">Clique sur « Tirer une carte » pour commencer.</p>`}
        <div class="actions">
          <button type="button" class="primary" id="tb-tirer">${courante ? "Carte suivante" : "Tirer une carte"}</button>
          ${courante ? `<button type="button" class="secondary" id="tb-cartes">Voir les mots interdits à deviner à l'envers</button>` : ""}
        </div>
        <p class="jeu-meta">Cartes restantes : ${pioche.length}</p>
        <div class="jeu-feedback" role="status" aria-live="polite"></div>`;
      bloc.querySelector("#tb-avance").addEventListener("change", (e) => { avance = e.target.checked; dessiner(); });
      bloc.querySelector("#tb-chrono").addEventListener("change", (e) => { chrono = e.target.checked; reste = 60; dessiner(); });
      bloc.querySelector("#tb-tirer").addEventListener("click", () => {
        if (!pioche.length) pioche = shuffle(jeu.cartes);
        courante = pioche.pop(); reste = 60; dessiner();
      });
      const btnEnvers = bloc.querySelector("#tb-cartes");
      if (btnEnvers) btnEnvers.addEventListener("click", () => {
        const liste = courante.base.concat(avance ? courante.plus : []);
        bloc.querySelector(".jeu-feedback").innerHTML = `<span class="ok">Une fois « ${gEscape(courante.cible)} » trouvé, expliquez pourquoi ces mots étaient interdits : ${liste.map(gEscape).join(", ")}.</span>`;
      });
      if (courante && chrono) {
        timer = setInterval(() => {
          if (!section.isConnected) { arreter(); return; }
          reste--;
          const s = bloc.querySelector("#tb-temps");
          if (s) s.textContent = String(Math.max(reste, 0));
          if (reste <= 0) { arreter(); bloc.querySelector(".jeu-feedback").innerHTML = `<span class="ko">Temps écoulé : on dévoile le mot, puis on passe à la carte suivante.</span>`; }
        }, 1000);
      }
    }
    dessiner();
    section.appendChild(actionsBar(onBack));
    pied(section, jeu);
    return section;
  }

  // ==========================================================================
  // 8. PILE DE TRIANGLES
  // ==========================================================================
  const JEU_PILE = {
    id: "pile",
    titre: "Pile de triangles",
    sousTitre: "Trigonométrie et Pythagore enchaînés",
    source: "Idée : livret de vacances 3e, collège MTA (mardi 28). Les quatre triangles et leurs mesures sont créés pour ce module ; la figure est originale.",
    // triangles rectangles en B ; A à gauche, C en haut
    etapes: [
      { titre: "① Cherche AC", donnees: "AB = 8 cm et angle Â = 34°.", relation: "cos", calc: () => 8 / Math.cos(34 * Math.PI / 180), prev: null },
      { titre: "② Cherche BC", donnees: "AC = résultat de ① et angle Â = 28°.", relation: "sin", calc: (p) => p * Math.sin(28 * Math.PI / 180), prev: true },
      { titre: "③ Cherche AC", donnees: "AB = résultat de ② et angle Â = 41°.", relation: "cos", calc: (p) => p / Math.cos(41 * Math.PI / 180), prev: true },
      { titre: "④ Cherche BC", donnees: "AB = 3,5 cm et AC = résultat de ③.", relation: "pyth", calc: (p) => Math.sqrt(p * p - 3.5 * 3.5), prev: true }
    ],
    relations: [
      { id: "cos", txt: "cosinus (adjacent ÷ hypoténuse)" },
      { id: "sin", txt: "sinus (opposé ÷ hypoténuse)" },
      { id: "tan", txt: "tangente (opposé ÷ adjacent)" },
      { id: "pyth", txt: "théorème de Pythagore" }
    ]
  };
  function valeursPile() {
    const exact = [];
    JEU_PILE.etapes.forEach((e, i) => { exact.push(e.calc(i ? exact[i - 1] : null)); });
    return exact;
  }

  function renderJeuPile(onBack) {
    const jeu = JEU_PILE;
    const exact = valeursPile();
    const section = document.createElement("section");
    entete(section, jeu, "Calculatrice en mode degrés. Dans chaque triangle rectangle en B, choisis la bonne relation puis calcule, arrondi au dixième. Le résultat d'une étape sert à la suivante.");
    section.insertAdjacentHTML("beforeend", illustration("img/pile-triangles.svg", "Quatre triangles rectangles à enchaîner", "illu-pile"));
    section.insertAdjacentHTML("beforeend", illustration("img/trigo-vocabulaire.svg", "Rappel : adjacent, opposé et hypoténuse par rapport à l'angle α", "illu-rappel"));

    const reponses = [];
    jeu.etapes.forEach((e, i) => {
      const bloc = el("div", "jeu-bloc pile-etape");
      bloc.innerHTML = `
        <h3>${gEscape(e.titre)}</h3>
        <p class="jeu-meta">${gEscape(e.donnees)}</p>
        <div class="row">
          <div class="field"><label for="pl-r-${i}">Relation utilisée</label>
            <select id="pl-r-${i}" class="jeu-select"><option value="">— choisir —</option>${jeu.relations.map((r) => `<option value="${r.id}">${r.txt}</option>`).join("")}</select></div>
          <div class="field"><label for="pl-v-${i}">Longueur (cm)</label><input id="pl-v-${i}" type="text" inputmode="decimal" class="jeu-input" size="8" autocomplete="off"></div>
        </div>
        <div class="actions"><button type="button" class="secondary">Vérifier cette étape</button></div>
        <div class="jeu-feedback" role="status" aria-live="polite"></div>`;
      const fb = bloc.querySelector(".jeu-feedback");
      bloc.querySelector("button").addEventListener("click", () => {
        const rel = bloc.querySelector(`#pl-r-${i}`).value;
        const v = parseNum(bloc.querySelector(`#pl-v-${i}`).value);
        if (!rel || isNaN(v)) { fb.innerHTML = `<span class="ko">Choisis une relation et écris une longueur.</span>`; return; }
        if (rel !== e.relation) {
          fb.innerHTML = `<span class="ko">Pas la bonne relation. Repère la longueur connue et la longueur cherchée par rapport à l'angle.</span>`;
          return;
        }
        // on accepte le résultat exact arrondi, ou celui recalculé à partir de la valeur de l'élève à l'étape précédente
        const attendus = [exact[i]];
        if (i > 0 && reponses[i - 1] !== undefined) attendus.push(e.calc(reponses[i - 1]));
        const ok = attendus.some((a) => Math.abs(v - a) <= 0.06);
        if (ok) {
          reponses[i] = v;
          fb.innerHTML = `<span class="ok">✓ Correct : ${fmt(v, 1)} cm.</span>`;
        } else {
          fb.innerHTML = `<span class="ko">Ce n'est pas ça. Vérifie ton mode (degrés) et recalcule avec la valeur de l'étape précédente. Valeur attendue : environ ${fmt(exact[i], 1)} cm.</span>`;
        }
      });
      section.appendChild(bloc);
    });
    section.appendChild(actionsBar(onBack));
    pied(section, jeu);
    return section;
  }

  // ==========================================================================
  // ENREGISTREMENT
  // ==========================================================================
  const NOUVEAUX_JEUX = [
    [JEU_COMPTE, renderJeuCompte], [JEU_CODE, renderJeuCode], [JEU_ETOILE, renderJeuEtoile],
    [JEU_LABYRINTHE, renderJeuLabyrinthe], [JEU_QUIESTCE, renderJeuQuiEstCe],
    [JEU_JAIQUIA, renderJeuJaiQuiA], [JEU_TABOO, renderJeuTaboo], [JEU_PILE, renderJeuPile]
  ];
  if (typeof JEUX_LISTE !== "undefined" && typeof JEUX_RENDERERS !== "undefined") {
    NOUVEAUX_JEUX.forEach(([jeu, rendu]) => {
      if (!JEUX_LISTE.some((j) => j.id === jeu.id)) JEUX_LISTE.push(jeu);
      JEUX_RENDERERS[jeu.id] = rendu;
    });
  }

  window.MLDS_COMP = {
    analyserExpression, pointsCompte, nombresDisponibles, resoudreCompte, JEU_COMPTE,
    retourCode, codesPossibles, JEU_CODE, phraseIndice,
    solutionsEtoile, JEU_ETOILE,
    solutionLineaire, propositionsLabyrinthe, JEU_LABYRINTHE,
    signatureDiviseurs, JEU_QUIESTCE,
    JEU_JAIQUIA, JEU_TABOO, JEU_PILE, valeursPile,
    fmt, parseNum
  };
})();
