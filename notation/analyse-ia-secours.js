/* ==========================================================================
   notation/analyse-ia-secours.js — IA de secours (quotas gratuits supplémentaires)
   Quand la Edge Function « analyser-copie » (Supabase) est à court de quota, la copie est
   envoyée directement depuis ce navigateur aux fournisseurs dont l'enseignant a saisi une
   clé gratuite : Gemini, Groq, Mistral, Cerebras, OpenRouter. Chacun a son propre quota :
   ils s'additionnent. Les clés restent dans ce navigateur (localStorage), jamais dans le dépôt.
   Seul le contenu pédagogique est envoyé (pas de nom ni de prénom d'élève).
   ========================================================================== */

const CLE_STOCKAGE = "notation-ia-secours";

export const FOURNISSEURS = [
  { id: "gemini", nom: "Google Gemini", modele: "gemini-2.0-flash", aide: "https://aistudio.google.com/apikey" },
  { id: "groq", nom: "Groq", modele: "llama-3.3-70b-versatile", url: "https://api.groq.com/openai/v1/chat/completions", aide: "https://console.groq.com/keys" },
  { id: "mistral", nom: "Mistral", modele: "mistral-small-latest", url: "https://api.mistral.ai/v1/chat/completions", aide: "https://console.mistral.ai/api-keys" },
  { id: "cerebras", nom: "Cerebras", modele: "llama-3.3-70b", url: "https://api.cerebras.ai/v1/chat/completions", aide: "https://cloud.cerebras.ai" },
  { id: "openrouter", nom: "OpenRouter (modèles :free)", modele: "meta-llama/llama-3.3-70b-instruct:free", url: "https://openrouter.ai/api/v1/chat/completions", aide: "https://openrouter.ai/keys" }
];

/* ---------- Clés (stockage local) ---------- */
export function lireCles() {
  try { return JSON.parse(localStorage.getItem(CLE_STOCKAGE) || "{}") || {}; } catch { return {}; }
}
export function enregistrerCles(cles) {
  const propres = {};
  for (const f of FOURNISSEURS) if (cles[f.id] && cles[f.id].trim()) propres[f.id] = cles[f.id].trim();
  try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(propres)); } catch { /* stockage indisponible */ }
  return propres;
}
export const fournisseursActifs = () => { const c = lireCles(); return FOURNISSEURS.filter(f => c[f.id]); };

/* Fournisseur en pause (quota atteint) : jusqu'à une heure donnée ; mémorisé pour ne pas le réinterroger pour rien. */
const pauses = new Map();
const enPause = id => (pauses.get(id) || 0) > Date.now();

/* ---------- Consigne ---------- */
const CONSIGNE = `Tu es professeur de lycée professionnel (maths-sciences) et tu corriges le compte rendu écrit d'un élève.
Pour CHAQUE question, attribue une cotation entière :
- 2 = réponse correcte, précise et justifiée, adaptée à la question ;
- 1 = réponse partielle, imprécise, incomplète, ou avec une erreur ;
- 0 = absente, hors sujet ou fausse.
Sois bienveillant mais rigoureux : ne cote pas 2 une réponse vague. Tiens compte de la compétence visée (APP s'approprier, ANA analyser, REA réaliser, VAL valider, COM communiquer).
« signal_ia » = true si la réponse ressemble à un texte copié ou généré (style trop soutenu pour le niveau, hors contexte, vocabulaire inhabituel), sinon false.
Réponds UNIQUEMENT par un objet JSON, sans texte autour, de la forme :
{"questions":[{"code":"Q1","cotation":0,"signal_ia":false,"justification":"une phrase courte"}],"commentaire_note":"2 à 3 phrases pour l'élève, avec un conseil"}
Un élément par question reçue, avec exactement le même "code".`;

function messageUtilisateur(charge) {
  return "Compte rendu à corriger (JSON) :\n" + JSON.stringify(charge);
}

/* ---------- Extraction / validation du JSON ---------- */
function extraireJson(texte) {
  const t = String(texte || "").replace(/```json|```/gi, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("réponse sans JSON");
  return JSON.parse(t.slice(a, b + 1));
}
function normaliser(brut, charge) {
  if (!Array.isArray(brut?.questions)) throw new Error("liste de questions absente");
  const attendus = new Set(charge.questions.map(q => q.code));
  const questions = brut.questions
    .filter(x => attendus.has(x.code))
    .map(x => ({
      code: x.code,
      cotation: Math.max(0, Math.min(2, Math.round(Number(x.cotation)))),
      signal_ia: !!x.signal_ia,
      justification: String(x.justification || "").slice(0, 400)
    }))
    .filter(x => Number.isFinite(x.cotation));
  if (questions.length < attendus.size) throw new Error("cotation incomplète");
  return { questions, commentaire_note: String(brut.commentaire_note || "").slice(0, 600) };
}

/* ---------- Appels ---------- */
function erreurHttp(f, statut, corps, retryAfter) {
  const e = new Error(`${f.nom} : HTTP ${statut}`);
  e.statut = statut;
  e.quota = statut === 429 || (statut === 403 && /quota|rate|limit/i.test(corps));
  e.delai = Number(retryAfter) || 0;
  return e;
}

async function appelerOpenAICompatible(f, cle, charge) {
  const r = await fetch(f.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + cle },
    body: JSON.stringify({
      model: f.modele, temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: CONSIGNE }, { role: "user", content: messageUtilisateur(charge) }]
    })
  });
  if (!r.ok) throw erreurHttp(f, r.status, await r.text().catch(() => ""), r.headers.get("retry-after"));
  const j = await r.json();
  return j?.choices?.[0]?.message?.content;
}

async function appelerGemini(f, cle, charge) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${f.modele}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": cle },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CONSIGNE }] },
      contents: [{ role: "user", parts: [{ text: messageUtilisateur(charge) }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
    })
  });
  if (!r.ok) throw erreurHttp(f, r.status, await r.text().catch(() => ""), r.headers.get("retry-after"));
  const j = await r.json();
  return j?.candidates?.[0]?.content?.parts?.map(p => p.text).join("");
}

/**
 * Essaie les fournisseurs configurés, l'un après l'autre.
 * Retourne { questions, commentaire_note, modele, fournisseur } ou lève une erreur
 * (e.quota = true si TOUS ont répondu « quota atteint »).
 */
export async function appelerSecours(charge) {
  const actifs = fournisseursActifs().filter(f => !enPause(f.id));
  if (!actifs.length) {
    const e = new Error(fournisseursActifs().length ? "tous les fournisseurs de secours sont en pause (quota)" : "aucune clé de secours configurée");
    e.quota = fournisseursActifs().length > 0; e.statut = e.quota ? 429 : 0;
    throw e;
  }
  const cles = lireCles();
  const echecs = [];
  let tousQuota = true;
  for (const f of actifs) {
    try {
      const texte = f.id === "gemini" ? await appelerGemini(f, cles[f.id], charge)
                                     : await appelerOpenAICompatible(f, cles[f.id], charge);
      const res = normaliser(extraireJson(texte), charge);
      return { ...res, modele: f.modele, fournisseur: f.id };
    } catch (err) {
      if (err.quota) {
        // Quota par minute (délai court) : courte pause ; sinon on met le fournisseur de côté 30 min.
        pauses.set(f.id, Date.now() + (err.delai && err.delai <= 90 ? err.delai * 1000 : 30 * 60 * 1000));
      } else tousQuota = false;
      if (err.statut === 401 || err.statut === 403) pauses.set(f.id, Date.now() + 10 * 60 * 1000);   // clé refusée
      echecs.push(`${f.nom} : ${err.message.replace(/^.*?: /, "")}`);
    }
  }
  const e = new Error("IA de secours indisponible (" + echecs.join(" ; ") + ")");
  e.quota = tousQuota; e.statut = tousQuota ? 429 : 0; e.delai = 0;
  throw e;
}

/* ---------- Panneau de réglage (injecté dans la page) ---------- */
export function montrerPanneauCles(conteneur) {
  const cles = lireCles();
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  conteneur.innerHTML = `
    <details class="secours">
      <summary>Quotas gratuits supplémentaires (IA de secours)</summary>
      <p class="aide">Collez une clé gratuite par fournisseur : chacun apporte son propre quota. Les clés restent dans ce navigateur. Seul le contenu des réponses est envoyé, sans nom d’élève. Les offres gratuites peuvent utiliser les données pour améliorer leurs modèles : à vous de juger selon vos copies.</p>
      ${FOURNISSEURS.map(f => `
        <label class="ligne-cle">${esc(f.nom)} <a href="${esc(f.aide)}" target="_blank" rel="noopener">obtenir une clé</a>
          <input type="password" autocomplete="off" data-fournisseur="${f.id}" value="${esc(cles[f.id] || "")}" placeholder="clé API">
        </label>`).join("")}
      <button type="button" class="btn" id="btn-cles-secours">Enregistrer les clés</button>
      <span id="etat-cles-secours" class="aide" role="status"></span>
    </details>`;
  conteneur.querySelector("#btn-cles-secours").addEventListener("click", () => {
    const saisie = {};
    conteneur.querySelectorAll("input[data-fournisseur]").forEach(i => { saisie[i.dataset.fournisseur] = i.value; });
    const n = Object.keys(enregistrerCles(saisie)).length;
    pauses.clear();
    conteneur.querySelector("#etat-cles-secours").textContent = n ? `${n} fournisseur(s) de secours actif(s).` : "Aucune clé enregistrée.";
  });
}