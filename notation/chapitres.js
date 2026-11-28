/* /notation — Moyenne par chapitre (chapitres.html)
   Chapitres : tous les TD de /mathilab et tous les TP de /laboratory (voir chapitres-config.js).
   Sources : notation_copies + notation_reponses (copies analysées),
             quiz_sessions via notation_quiz() (PlayMaths / PlaySciences),
             notation_affectations (rattachement manuel d'une copie à un onglet),
             notation_cotations_manuelles (Absent / Dispensé / niveau corrigé). */
(() => {
  'use strict';
  const CFG = window.CHAPITRES_CONFIG;
  const sb = window.supabase.createClient(CFG.supabase.url, CFG.supabase.key,
    { auth: { persistSession: true, storageKey: CFG.storageKey } });

  /* ---------- utilitaires ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const cleEleve = (prenom, nom) => norm(`${prenom} ${nom}`).replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean).sort().join(' ');
  const titre = s => String(s || '').trim().toLowerCase().replace(/(^|[\s\-'’])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  const fmt = (n, d = 1) => (n == null || Number.isNaN(n)) ? '–' : Number(n).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const moy = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
  const dateFr = d => { const x = d ? new Date(d) : null; return x && !isNaN(x) ? x.toLocaleDateString('fr-FR') : ''; };
  const niveauCle = s => { const n = norm(s); return /2(nde|de)|seconde/.test(n) ? '2nde' : /1(ere|re)|premiere/.test(n) ? '1ere' : /tle|term/.test(n) ? 'tle' : ''; };
  const niveauDeClasse = cl => { const c = String(cl || '').toUpperCase().replace(/\s+/g, ''); return /^2/.test(c) ? '2nde' : /^1/.test(c) ? '1ere' : /^T/.test(c) ? 'tle' : ''; };
  const NIVEAU_LIB = { '2nde': '2nde', '1ere': '1ère', tle: 'Terminale' };
  const symboles = { '4': '+', '3': '', '2': '', '1': '', A: 'A', N: '', D: 'd' };
  const libNiveau = v => (CFG.niveaux.find(n => n.v === v) || {}).label || v;
  const sym = v => `<span class="sym sym-${v}" aria-hidden="true">${symboles[v] ?? ''}</span>`;

  const state = {
    chap: null, copies: [], roster: [], pm: {}, manuel: new Map(), aff: new Map(), eleves: [], infoCopies: [],
    horsConfig: [], vue: 'moyennes', tri: { col: 'nom', dir: 1 },
    opt: { agg: 'best', nonValides: false, pmSeul: false, classe: '', q: '' },
    ouverts: new Set(), erreurPm: null, affOuvert: null, affGroupe: true
  };

  /* ---------- préparation des chapitres (onglets → composantes) ---------- */
  const STOP = new Set(['avec', 'pour', 'dans', 'entre', 'sont', 'leur', 'plus', 'tous', 'tout', 'cette', 'comme', 'mais', 'donc', 'vers', 'sous', 'chez', 'dont', 'sans', 'quel', 'quelle', 'des', 'les', 'une', 'depuis', 'partir']);
  const radicaux = s => [...new Set(norm(s).split(/[^a-z0-9]+/).filter(t => t.length >= 4 && !STOP.has(t) && !/^\d/.test(t)).map(t => t.slice(0, 7)))];

  function preparer(chap) {
    if (chap.composantes) return chap;
    const comps = chap.onglets.map(([id, lib, o = {}]) => ({
      id: 'o:' + id, type: 'onglet', court: lib, libelle: lib, motifs: radicaux(lib + ' ' + id.replace(/-/g, ' ')),
      niveaux: o.niveaux || [], requis: !o.facultatif
    }));
    if (chap.puzzle) comps.push({ id: 'puzzle', type: 'puzzle', court: 'Puzzle', libelle: 'Activités Puzzle (sujets ' + chap.puzzle.sujets.join(', ') + ')', sujets: chap.puzzle.sujets, sujetsRequis: chap.puzzle.requis, niveaux: [], requis: true });
    if (chap.quiz) {
      const nomQuiz = chap.quiz.categorie === 'playmaths' ? 'PlayMaths' : 'PlaySciences';
      comps.push({ id: 'quiz', type: 'quiz', court: `${nomQuiz} ${chap.quiz.code}`, libelle: `Quiz ${nomQuiz} ${chap.quiz.code}`, categorie: chap.quiz.categorie, code: chap.quiz.code, niveaux: chap.quiz.niveaux || [], requis: true });
    }
    const progs = (CFG.pylab || {})[chap.id];
    if (progs && progs.length) {
      const i = comps.length;
      comps.splice(i, 0, { id: 'o:pylab', type: 'onglet', court: 'Programmes PyLab', libelle: 'Programmes PyLab (' + progs.join(', ') + ')', motifs: [], niveaux: [], requis: false, pylab: true });
    }
    const codesAuto = (CFG.automatismes || {})[chap.id];
    if (codesAuto && codesAuto.length) comps.push({ id: 'auto', type: 'auto', court: 'Automatismes', libelle: 'Automatismes ' + codesAuto.join(', '), codes: codesAuto, niveaux: [], requis: false });
    chap.composantes = comps;
    return chap;
  }
  CFG.chapitres.forEach(preparer);
  const chapitreDe = c => CFG.chapitres.find(ch => ch.filtre.code_td === c.code_td && ch.filtre.domaines.some(a => norm(c.domaine).includes(norm(a))));
  const slotLibelle = (chap, slot) => {
    if (slot === 'ignore') return 'Ne pas compter';
    if (slot.startsWith('puzzle:')) return 'Puzzle · sujet ' + slot.slice(7);
    return (chap.composantes.find(d => d.id === slot) || {}).libelle || slot;
  };

  /* ---------- connexion enseignant ---------- */
  const setStatut = (t, err) => { const el = $('#statut'); el.textContent = t || ''; el.className = 'message' + (err ? ' erreur' : ''); };

  async function demarrer() {
    const { data: { session } } = await sb.auth.getSession();
    afficher(!!session);
    sb.auth.onAuthStateChange((_e, s) => { const connecte = !!s; if (connecte !== !$('#panneau-principal').hidden) afficher(connecte); });
  }
  function afficher(connecte) {
    $('#panneau-connexion').hidden = connecte;
    $('#panneau-principal').hidden = !connecte;
    $('#btn-deconnexion').hidden = !connecte;
    if (connecte) { initControles(); charger(); }
  }
  $('#form-connexion').addEventListener('submit', async ev => {
    ev.preventDefault();
    const m = $('#cx-message'); m.className = 'message'; m.textContent = 'Connexion…';
    const { error } = await sb.auth.signInWithPassword({ email: $('#cx-email').value.trim(), password: $('#cx-mdp').value });
    if (error) { m.className = 'message erreur'; m.textContent = 'Connexion refusée : vérifiez l’e-mail et le mot de passe.'; }
  });
  $('#cx-lien').addEventListener('click', async () => {
    const m = $('#cx-message'); const email = $('#cx-email').value.trim();
    if (!email) { m.className = 'message erreur'; m.textContent = 'Saisissez d’abord votre adresse e-mail.'; return; }
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href.split('#')[0] } });
    m.className = 'message' + (error ? ' erreur' : '');
    m.textContent = error ? 'Envoi impossible : ' + error.message : 'Lien envoyé : ouvrez-le depuis cet appareil.';
  });
  $('#btn-deconnexion').addEventListener('click', () => sb.auth.signOut());

  /* ---------- lecture des données ---------- */
  async function lireTout(construireRequete) {
    const out = []; const pas = 500;
    for (let debut = 0; ; debut += pas) {
      const { data, error } = await construireRequete().range(debut, debut + pas - 1);
      if (error) throw error;
      out.push(...data);
      if (data.length < pas) break;
    }
    return out;
  }

  async function lireCopies(chap) {
    const lots = await lireTout(() => sb.from('notation_copies')
      .select('id,created_at,nom_fichier,matiere,domaine,code_td,niveau,classe,nom,prenom,date_copie,problematique,note_sur_10,statut,notation_reponses(code,competence,enonce,reponse,cotation_ia,cotation_prof)')
      .eq('code_td', chap.filtre.code_td).order('created_at').order('id'));
    return lots.filter(c => chap.filtre.domaines.some(a => norm(c.domaine).includes(norm(a))));
  }

  /* copies d'un domaine / TD que la configuration ne connaît pas (nom de domaine inattendu, nouveau TD) */
  async function lireHorsConfig() {
    try {
      const l = await lireTout(() => sb.from('notation_copies').select('id,domaine,code_td').order('id'));
      const m = new Map();
      for (const c of l) if (!chapitreDe(c)) { const k = `${c.domaine || '?'} · ${c.code_td || '?'}`; m.set(k, (m.get(k) || 0) + 1); }
      return [...m.entries()].map(([k, n]) => `${k} (${n})`);
    } catch { return []; }
  }

  async function charger() {
    const chap = state.chap;
    setStatut('Chargement des notes…');
    try {
      state.copies = await lireCopies(chap);
      state.pm = {}; state.erreurPm = null;
      for (const def of chap.composantes.filter(c => c.type === 'quiz')) {
        const { data, error } = await sb.rpc('notation_quiz', { p_categorie: def.categorie, p_code: def.code });
        if (error) { state.erreurPm = error.message; state.pm[def.id] = []; } else state.pm[def.id] = data || [];
      }
      /* Automatismes (PlayLab) rattachés au chapitre : même principe que PlayMaths, meilleure note retenue */
      for (const def of chap.composantes.filter(c => c.type === 'auto')) {
        const { data, error } = await sb.rpc('notation_automatismes', { p_codes: def.codes });
        if (error) { state.erreurPm = error.message; state.pm[def.id] = []; } else state.pm[def.id] = data || [];
      }
      /* élèves attendus pour ce chapitre (classe + filière), pré-remplis dans Supabase */
      state.roster = [];
      try {
        state.roster = await lireTout(() => sb.from('notation_chapitre_eleves').select('eleve_cle,nom,prenom,classe,filiere').eq('chapitre', chap.id).order('nom').order('prenom'));
      } catch (e) { state.erreurPm = state.erreurPm || ('Liste des élèves attendus illisible : ' + (e.message || e)); }
      const [{ data: man, error: errMan }, { data: aff, error: errAff }] = await Promise.all([
        sb.from('notation_cotations_manuelles').select('*').eq('chapitre', chap.id),
        sb.from('notation_affectations').select('copie_id,composante').eq('chapitre', chap.id)
      ]);
      state.manuel = new Map(); state.aff = new Map();
      if (!errMan) (man || []).forEach(m => state.manuel.set(`${m.eleve_cle}|${m.competence}`, m.valeur));
      if (!errAff) (aff || []).forEach(a => state.aff.set(a.copie_id, a.composante));
      state.horsConfig = await lireHorsConfig();
      setStatut('');
      construire(); rendre();
    } catch (e) {
      setStatut('Lecture impossible : ' + (e.message || e) + '. Vérifiez que le compte connecté est bien le compte enseignant.', true);
    }
  }

  /* ---------- rattachement automatique des copies aux composantes ---------- */
  function classer(chap, c) {
    const pz = chap.composantes.find(d => d.type === 'puzzle');
    const pb = norm(c.problematique), fichier = norm(c.nom_fichier);
    const reps = [...(c.notation_reponses || [])].sort((a, b) => String(a.code).localeCompare(String(b.code)));
    const texteRep = norm(reps.map(r => r.enonce).join(' '));
    if (pz) {
      let m = pb.match(/^\s*sujet\s*([a-z])\b/) || fichier.match(/sujet\s*([a-z])\b/);
      if (m) return 'puzzle:' + m[1].toUpperCase();
      if (/sujet traite par votre groupe/.test(texteRep) || /\bpuzzle\b/.test(pb + ' ' + fichier)) {
        const q1 = norm(reps[0]?.reponse || '').match(/^\W*(?:sujet\s*)?([a-z])\b/);
        return 'puzzle:' + (q1 && pz.sujets.map(s => s.toLowerCase()).includes(q1[1]) ? q1[1].toUpperCase() : '?');
      }
    }
    const pl = chap.composantes.find(x => x.pylab);
    if (pl && /pylab|programme python|\.py\b/.test(pb + ' ' + fichier + ' ' + texteRep.slice(0, 400))) return pl.id;
    const onglets = chap.composantes.filter(x => x.type === 'onglet' && !x.pylab);
    if (onglets.length === 1) return onglets[0].id;
    const autres = norm(texteRep + ' ' + fichier);
    let meilleur = null, best = 0;
    for (const d of onglets) {
      const compte = t => d.motifs.reduce((n, r) => n + (new RegExp('\\b' + r).test(t) ? 1 : 0), 0);
      const s = 2 * compte(pb) + compte(autres);
      if (s > best) { best = s; meilleur = d.id; }
    }
    return meilleur;
  }

  const dernier = l => [...l].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
  function retenues(liste, agg) {
    const v = liste.filter(c => c.note_sur_10 != null);
    if (!v.length) return [];
    if (agg === 'mean') return v;
    if (agg === 'last') return [dernier(v)];
    const max = Math.max(...v.map(c => Number(c.note_sur_10)));
    return [dernier(v.filter(c => Number(c.note_sur_10) === max))];
  }
  const noteListe = (liste, agg) => {
    const r = retenues(liste, agg);
    if (!r.length) return null;
    return agg === 'mean' ? moy(r.map(c => Number(c.note_sur_10))) : Number(r[0].note_sur_10);
  };

  /* ---------- construction des lignes élèves ---------- */
  function construire() {
    const chap = state.chap, o = state.opt;
    const map = new Map();
    const obtenir = (prenom, nom) => {
      const k = cleEleve(prenom, nom); if (!k) return null;
      if (!map.has(k)) map.set(k, { cle: k, variantes: new Map(), classes: new Map(), niveaux: new Map(), slots: {}, pm: {}, nbCopies: 0, vuPm: null });
      return map.get(k);
    };
    state.infoCopies = []; let ignoreesAValider = 0;

    /* tous les élèves attendus (classe / filière), même sans copie ni quiz : les cases restent « à faire » */
    for (const r of state.roster || []) {
      const e = obtenir(r.prenom, r.nom); if (!e) continue;
      e.rosterNom = `${titre(r.prenom)} ${String(r.nom || '').trim().toUpperCase()}`;
      e.rosterClasse = String(r.classe || '').toUpperCase().replace(/\s+/g, '');
      e.filiere = r.filiere || '';
    }

    for (const c of state.copies) {
      const auto = classer(chap, c), manuel = state.aff.get(c.id) || null;
      const slot = manuel || auto;
      state.infoCopies.push({ c, auto, manuel, slot });
      if (!o.nonValides && c.statut !== 'valide') { ignoreesAValider++; continue; }
      if (slot === 'ignore' || !slot) continue;
      const e = obtenir(c.prenom, c.nom); if (!e) continue;
      (e.slots[slot] ||= []).push(c);
      e.nbCopies++;
      const nomAff = `${titre(c.prenom)} ${String(c.nom || '').trim().toUpperCase()}`;
      e.variantes.set(nomAff, (e.variantes.get(nomAff) || 0) + 1);
      const cl = String(c.classe || '').toUpperCase().replace(/\s+/g, '');
      if (cl) e.classes.set(cl, (e.classes.get(cl) || 0) + 1);
      const nv = niveauCle(c.niveau); if (nv) e.niveaux.set(nv, (e.niveaux.get(nv) || 0) + 1);
    }

    for (const def of chap.composantes.filter(c => c.type === 'quiz' || c.type === 'auto')) {
      for (const s of state.pm[def.id] || []) {
        const k = cleEleve(s.prenom, s.nom); if (!k) continue;
        let e = map.get(k);
        if (!e) { if (!o.pmSeul) continue; e = obtenir(s.prenom, s.nom); }
        (e.pm[def.id] ||= []).push({ note_sur_10: s.note_10, created_at: s.ended_at || s.started_at, quiz: s.quiz });
        if (!e.variantes.size) e.vuPm = `${titre(s.prenom)} ${String(s.nom || '').trim().toUpperCase()}`;
      }
    }

    state.eleves = [...map.values()].map(e => {
      e.nom = [...e.variantes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || e.rosterNom || e.vuPm || e.cle;
      e.classe = e.rosterClasse || [...e.classes.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0]?.[0] || '';
      e.niveau = niveauDeClasse(e.rosterClasse) || [...e.niveaux.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || niveauDeClasse(e.classe);
      e.res = calculer(e);
      return e;
    });
    state.ignoreesAValider = ignoreesAValider;

    const sel = $('#f-classe'), courante = sel.value;
    const classes = [...new Set(state.eleves.map(e => e.classe).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">Toutes</option>' + classes.map(c => `<option>${esc(c)}</option>`).join('');
    sel.value = classes.includes(courante) ? courante : '';
    state.opt.classe = sel.value;
  }

  function detailCopies(liste) {
    if (!liste.length) return 'aucune copie';
    return [...liste].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))).map(c =>
      `${c.note_sur_10 == null ? 'non notée' : fmt(Number(c.note_sur_10), 1) + '/10'}${c.date_copie ? ' · ' + dateFr(c.date_copie) : ''}${c.nom_fichier ? ' · ' + esc(c.nom_fichier) : ''}${c.statut && c.statut !== 'valide' ? ' (à valider)' : ''}`
    ).join(' ; ');
  }

  function niveauDepuis(avg) {
    if (avg == null) return 'N';
    const s = CFG.seuils;
    return avg >= s.tbm ? '4' : avg >= s.satisfaisante ? '3' : avg >= s.fragile ? '2' : '1';
  }

  function calculer(e) {
    const chap = state.chap, agg = state.opt.agg;
    const comps = chap.composantes.map(def => {
      let r;
      if (def.type === 'onglet') {
        const l = e.slots[def.id] || []; const note = noteListe(l, agg);
        r = { note, complet: note != null, reste: def.court, detail: detailCopies(l) };
      } else if (def.type === 'puzzle') {
        const lettres = [...new Set([...def.sujets, ...Object.keys(e.slots).filter(k => k.startsWith('puzzle:')).map(k => k.slice(7))])];
        const sujets = lettres.map(s => { const l = e.slots['puzzle:' + s] || []; return { s, l, note: noteListe(l, agg) }; });
        const faits = sujets.filter(x => x.note != null);
        const manque = Math.max(0, def.sujetsRequis - faits.length);
        r = { sujets, note: faits.length ? moy(faits.map(x => x.note)) : null, complet: manque === 0, manque,
          reste: manque ? `${def.court} (${manque} sujet${manque > 1 ? 's' : ''})` : '',
          detail: sujets.filter(x => x.l.length).map(x => `sujet ${x.s} : ${detailCopies(x.l)}`).join(' — ') || 'aucune copie' };
      } else {
        const l = e.pm[def.id] || []; const note = noteListe(l, def.type === 'auto' ? 'best' : agg);
        r = { note, complet: note != null, reste: def.court,
          detail: l.length ? l.map(x => `${fmt(Number(x.note_sur_10), 0)}/10 · ${dateFr(x.created_at)}${x.quiz ? ' · ' + esc(x.quiz) : ''}`).join(' ; ') : 'aucune tentative terminée' };
      }
      r.def = def;
      const niveauOk = !def.niveaux.length || !e.niveau || def.niveaux.includes(e.niveau);
      r.na = r.note == null && !niveauOk;                       // onglet / quiz d'une autre classe
      r.facultatif = r.note == null && niveauOk && !def.requis;  // jamais « à faire »
      r.compte = r.note != null || (niveauOk && def.requis);
      if (!r.compte) { r.complet = true; r.reste = ''; }
      return r;
    });
    const comptes = comps.filter(c => c.compte);
    const avecNote = comps.filter(c => c.note != null);
    const prov = avecNote.length ? moy(avecNote.map(c => c.note)) * 2 : null;
    const sansReste = comptes.length ? comptes.reduce((s, c) => s + (c.note || 0), 0) / comptes.length * 2 : null;
    const nbFait = comptes.filter(c => c.complet).length;

    /* compétences : moyenne des cotations (prof, sinon IA) sur les copies retenues */
    const vals = Object.fromEntries(CFG.competences.map(c => [c.code, []]));
    for (const liste of Object.values(e.slots)) {
      for (const c of retenues(liste, agg)) for (const r of c.notation_reponses || []) {
        const v = r.cotation_prof ?? r.cotation_ia;
        if (v != null && vals[r.competence]) vals[r.competence].push(Number(v));
      }
    }
    const competences = {};
    for (const c of CFG.competences) {
      const avg = moy(vals[c.code]);
      const manuel = state.manuel.get(`${e.cle}|${c.code}`);
      competences[c.code] = { avg, n: vals[c.code].length, auto: niveauDepuis(avg), niveau: manuel || niveauDepuis(avg), manuel: !!manuel };
    }
    return { comps, prov, sansReste, nbFait, total: comptes.length, complete: comptes.length > 0 && nbFait === comptes.length,
      reste: comptes.filter(c => !c.complet).map(c => c.reste), competences };
  }

  /* ---------- filtrage / tri ---------- */
  function visibles() {
    const o = state.opt, q = norm(o.q).trim();
    let l = state.eleves.filter(e => (!o.classe || e.classe === o.classe) && (!q || norm(e.nom).includes(q)));
    const { col, dir } = state.tri;
    const val = e => col === 'classe' ? e.classe : col === 'avancement' ? (e.res.total ? e.res.nbFait / e.res.total : 0) : col === 'note' ? (e.res.prov ?? -1) : null;
    l.sort((a, b) => {
      if (col === 'nom' || val(a) === val(b)) return dir * a.nom.localeCompare(b.nom, 'fr');
      return dir * (typeof val(a) === 'string' ? val(a).localeCompare(val(b), 'fr') : val(a) - val(b));
    });
    return l;
  }

  /* ---------- rendu ---------- */
  function enteteTri(col, libelle, cls = '') {
    const actif = state.tri.col === col;
    return `<th class="${cls}" scope="col" aria-sort="${actif ? (state.tri.dir > 0 ? 'ascending' : 'descending') : 'none'}"><button type="button" class="tri" data-tri="${col}">${libelle}</button></th>`;
  }

  function cellule(c) {
    if (c.na) return `<td><span class="petit" title="Concerne une autre classe">— autre niveau</span></td>`;
    if (c.facultatif) return `<td><span class="petit" title="Réservé à certaines filières ou optionnel">facultatif</span></td>`;
    if (c.def.type === 'puzzle') {
      const chips = c.sujets.filter(x => x.note != null || c.def.sujets.includes(x.s)).map(x => x.note != null ? `<span class="chip" title="Sujet ${esc(x.s)}">${esc(x.s)} : ${fmt(x.note, 1)}</span>` : `<span class="chip vide" title="Sujet ${esc(x.s)} non réalisé">${esc(x.s)} –</span>`).join('');
      const etat = c.complet ? '' : `<br><span class="afaire">${c.manque} sujet${c.manque > 1 ? 's' : ''} à faire</span>`;
      return `<td>${chips}${c.note != null ? `<br><span class="note fait">${fmt(c.note, 1)}<small>/10</small></span>` : ''}${etat}</td>`;
    }
    return c.note != null
      ? `<td><span class="note fait">${fmt(c.note, 1)}<small>/10</small></span></td>`
      : `<td><span class="afaire">À faire</span></td>`;
  }

  function ligneDetail(e, colspan) {
    const li = e.res.comps.filter(c => c.compte || c.note != null).map(c => `<li><strong>${esc(c.def.libelle)}</strong> : ${c.detail}</li>`).join('');
    const co = CFG.competences.map(c => { const x = e.res.competences[c.code]; return `${esc(c.nom)} : ${x.avg == null ? 'non évalué' : fmt(x.avg, 2) + '/2'}${x.manuel ? ' (corrigé : ' + esc(libNiveau(x.niveau)) + ')' : ''}`; }).join(' · ');
    return `<tr class="detail"><td colspan="${colspan}"><ul>${li}</ul><p class="petit">Classe ${esc(NIVEAU_LIB[e.niveau] || 'non détectée')} — cotation moyenne par compétence : ${co}</p></td></tr>`;
  }

  function rendreMoyennes(liste) {
    const comps = state.chap.composantes;
    const colspan = comps.length + 5;
    const lignes = liste.map(e => {
      const r = e.res, ouvert = state.ouverts.has(e.cle);
      const note = r.prov == null ? '–' : `<span class="note20">${fmt(r.prov, 1)}</span><small>/20</small>`;
      const sous = r.complete ? '<br><span class="badge ok">✓ Moyenne complète</span>'
        : (r.prov == null ? '' : `<br><span class="badge cours">Provisoire</span><br><span class="petit">${fmt(r.sansReste, 1)} si le reste = 0</span>`);
      return `<tr>
        <td><button type="button" class="nom" data-detail="${esc(e.cle)}" aria-expanded="${ouvert}">${esc(e.nom)}</button></td>
        <td>${esc(e.classe) || '–'}</td>
        ${r.comps.map(cellule).join('')}
        <td>${r.total ? `<span class="barre-prog" aria-hidden="true"><i style="width:${r.nbFait / r.total * 100}%"></i></span>${r.nbFait}/${r.total}` : '–'}</td>
        <td>${note}${sous}</td>
        <td class="gauche">${r.reste.length ? r.reste.map(esc).join(', ') : '<span class="badge ok">Rien — complet</span>'}</td>
      </tr>${ouvert ? ligneDetail(e, colspan) : ''}`;
    }).join('');

    const pied = comps.map((d, i) => {
      const notes = liste.map(e => e.res.comps[i].note).filter(n => n != null);
      return `<td>${notes.length ? fmt(moy(notes), 1) + '<small>/10</small><br><span class="petit">' + notes.length + '/' + liste.length + ' élèves</span>' : '–'}</td>`;
    }).join('');
    const provs = liste.map(e => e.res.prov).filter(n => n != null);
    return `<table>
      <thead><tr>${enteteTri('nom', 'Élève')}${enteteTri('classe', 'Classe')}
        ${comps.map(d => `<th scope="col" class="comp" title="${esc(d.libelle)}">${esc(d.court)}<br><span class="petit">/10${d.niveaux.length ? ' · ' + d.niveaux.map(n => NIVEAU_LIB[n]).join('/') : ''}</span></th>`).join('')}
        ${enteteTri('avancement', 'Avancement')}${enteteTri('note', 'Moyenne /20')}<th scope="col" class="gauche">Reste à faire</th></tr></thead>
      <tbody>${lignes || `<tr><td colspan="${colspan}">Aucun élève à afficher.</td></tr>`}</tbody>
      <tfoot><tr><td>Moyenne de la classe</td><td>${liste.length} él.</td>${pied}<td>–</td><td>${provs.length ? fmt(moy(provs), 1) + '<small>/20</small>' : '–'}</td><td></td></tr></tfoot>
    </table>`;
  }

  function rendreCompetences(liste) {
    const colspan = CFG.competences.length + 2;
    const lignes = liste.map(e => {
      const ouvert = state.ouverts.has(e.cle);
      return `<tr>
        <td><button type="button" class="nom" data-detail="${esc(e.cle)}" aria-expanded="${ouvert}">${esc(e.nom)}</button></td>
        <td>${esc(e.classe) || '–'}</td>
        ${CFG.competences.map(c => { const x = e.res.competences[c.code];
          return `<td><button type="button" class="cellule-niv${x.manuel ? ' manuel' : ''}" data-niveau="${esc(e.cle)}|${c.code}" title="${esc(c.nom)} : ${esc(libNiveau(x.niveau))}${x.avg != null ? ' (' + fmt(x.avg, 2) + '/2)' : ''}${x.manuel ? ' — saisi à la main' : ''}. Cliquer pour modifier." aria-haspopup="menu">${sym(x.niveau)}<span class="val">${x.niveau}</span><span class="petit">${esc(libNiveau(x.niveau))}</span></button></td>`; }).join('')}
      </tr>${ouvert ? ligneDetail(e, colspan) : ''}`;
    }).join('');
    const pied = CFG.competences.map(c => {
      const avgs = liste.map(e => e.res.competences[c.code]).filter(x => x.avg != null && !['A', 'D'].includes(x.niveau)).map(x => x.avg);
      const m = moy(avgs), n = niveauDepuis(m);
      return `<td>${m == null ? '–' : `${sym(n)} ${fmt(m, 2)}/2<br><span class="petit">${avgs.length} élèves</span>`}</td>`;
    }).join('');
    return `<table>
      <thead><tr>${enteteTri('nom', 'Élève')}${enteteTri('classe', 'Classe')}
        ${CFG.competences.map(c => `<th scope="col">${esc(c.nom)}<br><span class="petit">${c.code}</span></th>`).join('')}</tr></thead>
      <tbody>${lignes || `<tr><td colspan="${colspan}">Aucun élève à afficher.</td></tr>`}</tbody>
      <tfoot><tr><td>Moyenne de la classe</td><td>${liste.length} él.</td>${pied}</tr></tfoot>
    </table>`;
  }

  /* ---------- rattachement des copies (détection automatique + correction manuelle) ---------- */
  function rendreAffectations() {
    const chap = state.chap;
    const el = $('#affectations');
    if (!state.infoCopies.length) { el.innerHTML = ''; return; }
    const options = [
      ...chap.composantes.filter(d => d.type === 'onglet').map(d => [d.id, d.libelle]),
      ...(chap.composantes.find(d => d.type === 'puzzle') ? [...chap.composantes.find(d => d.type === 'puzzle').sujets, '?'].map(s => ['puzzle:' + s, 'Puzzle · sujet ' + s]) : []),
      ['ignore', 'Ne pas compter cette copie']
    ];
    const inconnues = state.infoCopies.filter(x => !x.slot).length;
    const lignes = [...state.infoCopies].sort((a, b) => (!!a.slot - !!b.slot) || String(a.c.nom).localeCompare(String(b.c.nom), 'fr')).map(({ c, auto, manuel }) => `
      <tr class="${!auto && !manuel ? 'inconnue' : ''}">
        <td class="gauche">${esc(titre(c.prenom))} ${esc(String(c.nom).toUpperCase())}</td>
        <td class="gauche petit">${esc(c.nom_fichier || '')}</td>
        <td class="gauche petit">${esc((c.problematique || '').slice(0, 90))}</td>
        <td><label class="sr-only" for="aff-${esc(c.id)}">Rattachement de la copie de ${esc(c.prenom)} ${esc(c.nom)}</label>
          <select id="aff-${esc(c.id)}" data-copie="${esc(c.id)}">
            <option value="auto" ${manuel ? '' : 'selected'}>${auto ? 'Automatique : ' + esc(slotLibelle(chap, auto)) : '⚠ Non reconnue — à choisir'}</option>
            ${options.map(([v, l]) => `<option value="${esc(v)}" ${manuel === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}
          </select></td></tr>`).join('');
    const ouvert = state.affOuvert ?? inconnues > 0;
    el.innerHTML = `<details class="carte" ${ouvert ? 'open' : ''}>
      <summary><strong>Rattachement des copies aux onglets</strong> (${state.infoCopies.length} copie${state.infoCopies.length > 1 ? 's' : ''}${inconnues ? `, <span class="rouge">${inconnues} non reconnue${inconnues > 1 ? 's' : ''}</span>` : ''})</summary>
      <p class="petit">Chaque copie est rattachée automatiquement à un onglet d’après sa problématique et ses questions. Corrigez ici si besoin : le choix manuel est conservé.</p>
      <label class="case"><input type="checkbox" id="aff-groupe" ${state.affGroupe ? 'checked' : ''}> Appliquer le choix à toutes les copies ayant la même problématique</label>
      <div class="tableau-conteneur sans-bord"><table class="aff"><thead><tr><th class="gauche">Élève</th><th class="gauche">Fichier</th><th class="gauche">Problématique</th><th>Rattachée à</th></tr></thead><tbody>${lignes}</tbody></table></div>
    </details>`;
  }
  $('#affectations').addEventListener('toggle', e => { if (e.target.tagName === 'DETAILS') state.affOuvert = e.target.open; }, true);
  $('#affectations').addEventListener('change', async ev => {
    if (ev.target.id === 'aff-groupe') { state.affGroupe = ev.target.checked; return; }
    const s = ev.target.closest('select[data-copie]'); if (!s) return;
    const id = s.dataset.copie, v = s.value, q = sb.from('notation_affectations');
    const cible = state.infoCopies.find(x => x.c.id === id);
    const pb = norm(cible?.c.problematique).trim();
    const groupe = $('#aff-groupe')?.checked && pb;
    const ids = groupe ? state.infoCopies.filter(x => norm(x.c.problematique).trim() === pb).map(x => x.c.id) : [id];
    const maintenant = new Date().toISOString();
    const { error } = v === 'auto' ? await q.delete().in('copie_id', ids)
      : await q.upsert(ids.map(i => ({ copie_id: i, chapitre: state.chap.id, composante: v, updated_at: maintenant })), { onConflict: 'copie_id' });
    if (error) { setStatut('Enregistrement impossible : ' + error.message, true); return; }
    ids.forEach(i => v === 'auto' ? state.aff.delete(i) : state.aff.set(i, v));
    construire(); rendre();
  });

  function rendre() {
    const chap = state.chap, liste = visibles();
    $('#titre-page').textContent = `Moyenne du chapitre ${chap.id} — ${chap.titre}`;
    $('#zone').innerHTML = state.vue === 'moyennes' ? rendreMoyennes(liste) : rendreCompetences(liste);
    rendreAffectations();

    const al = [];
    if (state.erreurPm) al.push(`<div class="alerte erreur"><strong>Notes des quiz indisponibles</strong> : ${esc(state.erreurPm)}. Vérifiez que la fonction <code>notation_quiz</code> existe (sql/notation_chapitres.sql) et que vous êtes connecté avec le compte enseignant.</div>`);
    if (state.ignoreesAValider) al.push(`<div class="alerte">${state.ignoreesAValider} copie(s) « à valider » ne sont pas comptées. Validez-les dans l’analyse des copies ou cochez « Inclure les copies à valider ».</div>`);
    const inconnues = state.infoCopies.filter(x => !x.slot).length;
    if (inconnues) al.push(`<div class="alerte"><strong>${inconnues} copie(s) n’ont pu être rattachées à un onglet</strong> : choisissez l’onglet dans « Rattachement des copies » sous le tableau.</div>`);
    if (state.horsConfig.length) al.push(`<div class="alerte">Copies enregistrées dont le chapitre n’est pas dans la configuration : ${state.horsConfig.map(esc).join(' ; ')}. Vérifiez le nom du domaine et le code du TD/TP (chapitres-config.js).</div>`);
    $('#alertes').innerHTML = al.join('');

    const pz = chap.composantes.find(c => c.type === 'puzzle');
    $('#aide').innerHTML = state.vue === 'moyennes'
      ? `<p><strong>Calcul :</strong> chaque composante est notée sur 10 ; la note finale sur 20 est la moyenne des composantes concernées × 2. « Provisoire » = moyenne des seules activités déjà faites ; « si le reste = 0 » compte les activités manquantes comme 0. Les onglets d’une autre classe (« autre niveau ») et les onglets facultatifs ne sont pas exigés.${pz ? ` Puzzle : moyenne des sujets réalisés, ${pz.sujetsRequis} sujet(s) à réaliser au minimum.` : ''}</p>`
      : `<p><strong>Niveaux</strong> (cotation moyenne 0 à 2 sur toutes les copies du chapitre) : ${sym('4')} 4 ≥ ${CFG.seuils.tbm} · ${sym('3')} 3 ≥ ${CFG.seuils.satisfaisante} · ${sym('2')} 2 ≥ ${CFG.seuils.fragile} · ${sym('1')} 1 en dessous · ${sym('N')} N = aucune réponse cotée. Cliquez sur un niveau pour le corriger ou indiquer Absent / Dispensé.</p>`;
  }

  /* ---------- menu de correction d'un niveau ---------- */
  const menu = $('#menu-niveau'); let cibleMenu = null;
  function ouvrirMenu(btn) {
    cibleMenu = btn.dataset.niveau;
    const [cle, comp] = cibleMenu.split('|'); const e = state.eleves.find(x => x.cle === cle); const x = e.res.competences[comp];
    menu.innerHTML = `<div class="tete">${esc(e.nom)} — ${esc(CFG.competences.find(c => c.code === comp).nom)}</div>
      <button type="button" role="menuitem" data-choix="auto"><span></span><span>Automatique (${esc(libNiveau(x.auto))})</span><span></span></button>` +
      CFG.niveaux.map(n => `<button type="button" role="menuitem" data-choix="${n.v}">${sym(n.v)}<span>${esc(n.label)}</span><strong>${n.v}</strong></button>`).join('');
    const r = btn.getBoundingClientRect();
    menu.hidden = false;
    menu.style.left = Math.min(r.left, innerWidth - menu.offsetWidth - 8) + 'px';
    menu.style.top = Math.min(r.bottom + 4, innerHeight - menu.offsetHeight - 8) + 'px';
    menu.querySelector('button').focus();
  }
  const fermerMenu = () => { menu.hidden = true; cibleMenu = null; };
  menu.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-choix]'); if (!b || !cibleMenu) return;
    const [cle, comp] = cibleMenu.split('|'); const choix = b.dataset.choix;
    const e = state.eleves.find(x => x.cle === cle); fermerMenu();
    const q = sb.from('notation_cotations_manuelles');
    const { error } = choix === 'auto'
      ? await q.delete().match({ eleve_cle: cle, chapitre: state.chap.id, competence: comp })
      : await q.upsert({ eleve_cle: cle, chapitre: state.chap.id, competence: comp, valeur: choix, eleve_nom: e.nom, updated_at: new Date().toISOString() }, { onConflict: 'eleve_cle,chapitre,competence' });
    if (error) { setStatut('Enregistrement impossible : ' + error.message, true); return; }
    if (choix === 'auto') state.manuel.delete(`${cle}|${comp}`); else state.manuel.set(`${cle}|${comp}`, choix);
    e.res = calculer(e); rendre();
  });
  document.addEventListener('click', ev => { if (!menu.hidden && !menu.contains(ev.target) && !ev.target.closest('[data-niveau]')) fermerMenu(); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !menu.hidden) fermerMenu(); });

  /* ---------- interactions ---------- */
  $('#zone').addEventListener('click', ev => {
    const t = ev.target.closest('[data-tri]');
    if (t) { const col = t.dataset.tri; state.tri = { col, dir: state.tri.col === col ? -state.tri.dir : 1 }; return rendre(); }
    const d = ev.target.closest('[data-detail]');
    if (d) { const k = d.dataset.detail; state.ouverts.has(k) ? state.ouverts.delete(k) : state.ouverts.add(k); return rendre(); }
    const n = ev.target.closest('[data-niveau]'); if (n) ouvrirMenu(n);
  });

  function changerVue(v) {
    state.vue = v;
    $('#tab-moyennes').setAttribute('aria-selected', v === 'moyennes');
    $('#tab-competences').setAttribute('aria-selected', v === 'competences');
    rendre();
  }
  $('#tab-moyennes').addEventListener('click', () => changerVue('moyennes'));
  $('#tab-competences').addEventListener('click', () => changerVue('competences'));

  function choisirChapitre(id, { maj = true } = {}) {
    const chap = CFG.chapitres.find(c => c.id === id) || CFG.chapitres[0];
    state.chap = chap; state.ouverts.clear(); state.affOuvert = null;
    $('#f-chapitre').value = chap.id;
    try { history.replaceState(null, '', '#' + chap.id); } catch { /* ignoré */ }
    if (maj) charger();
  }

  let initFait = false;
  function initControles() {
    if (initFait) return; initFait = true;
    const groupes = [...new Set(CFG.chapitres.map(c => c.groupe))];
    $('#f-chapitre').innerHTML = groupes.map(g => `<optgroup label="${esc(g)}">${CFG.chapitres.filter(c => c.groupe === g).map(c => `<option value="${esc(c.id)}">${esc(c.id)} — ${esc(c.titre)}</option>`).join('')}</optgroup>`).join('');
    const depart = decodeURIComponent(location.hash.replace('#', ''));
    state.chap = CFG.chapitres.find(c => c.id === depart) || CFG.chapitres.find(c => c.id === 'G01') || CFG.chapitres[0];
    $('#f-chapitre').value = state.chap.id;
    $('#f-chapitre').addEventListener('change', e => choisirChapitre(e.target.value));
    $('#f-classe').addEventListener('change', e => { state.opt.classe = e.target.value; rendre(); });
    $('#f-recherche').addEventListener('input', e => { state.opt.q = e.target.value; rendre(); });
    $('#f-agg').addEventListener('change', e => { state.opt.agg = e.target.value; construire(); rendre(); });
    $('#f-nonvalides').addEventListener('change', e => { state.opt.nonValides = e.target.checked; construire(); rendre(); });
    $('#f-pmseul').addEventListener('change', e => { state.opt.pmSeul = e.target.checked; construire(); rendre(); });
    $('#btn-actualiser').addEventListener('click', charger);
    $('#btn-imprimer').addEventListener('click', () => window.print());
    $('#btn-csv').addEventListener('click', exporterCsv);
  }

  /* ---------- export CSV (Excel : séparateur « ; », virgule décimale) ---------- */
  function exporterCsv() {
    const chap = state.chap, liste = visibles();
    const cell = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
    const nb = v => v == null ? '' : String(Math.round(v * 100) / 100).replace('.', ',');
    const tete = ['Élève', 'Classe', ...chap.composantes.map(d => `${d.libelle} /10`), 'Activités faites', 'Moyenne provisoire /20', 'Note /20 (reste = 0)', 'Reste à faire', ...CFG.competences.map(c => `${c.nom} (niveau)`)];
    const lignes = liste.map(e => [e.nom, e.classe, ...e.res.comps.map(c => nb(c.note)), `${e.res.nbFait}/${e.res.total}`, nb(e.res.prov), nb(e.res.sansReste), e.res.reste.join(', '), ...CFG.competences.map(c => e.res.competences[c.code].niveau)]);
    const csv = '\ufeff' + [tete, ...lignes].map(l => l.map(cell).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `notation_${chap.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  demarrer();
})();