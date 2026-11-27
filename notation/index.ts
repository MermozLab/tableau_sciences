// Edge Function « analyser-copie-secours » : IA de secours multi-fournisseurs (quotas gratuits).
// Clés lues dans les secrets Supabase (jamais dans le navigateur ni le dépôt) :
//   GEMINI_API_KEY, GROQ_API_KEY, MISTRAL_API_KEY, CEREBRAS_API_KEY, OPENROUTER_API_KEY
// Seuls les secrets définis sont utilisés. Accès réservé aux utilisateurs connectés.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (o: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json", ...extra } });

const CONSIGNE = `Tu es professeur de lycée professionnel (maths-sciences) et tu corriges le compte rendu écrit d'un élève.
Pour CHAQUE question, attribue une cotation entière :
- 2 = réponse correcte, précise et justifiée, adaptée à la question ;
- 1 = réponse partielle, imprécise, incomplète, ou avec une erreur ;
- 0 = absente, hors sujet ou fausse.
Sois bienveillant mais rigoureux : ne cote pas 2 une réponse vague. Tiens compte de la compétence visée (APP s'approprier, ANA analyser, REA réaliser, VAL valider, COM communiquer).
« signal_ia » = true si la réponse ressemble à un texte copié ou généré, sinon false.
Réponds UNIQUEMENT par un objet JSON de la forme :
{"questions":[{"code":"Q1","cotation":0,"signal_ia":false,"justification":"une phrase courte"}],"commentaire_note":"2 à 3 phrases pour l'élève, avec un conseil"}
Un élément par question reçue, avec exactement le même "code".`;

type F = { id: string; secret: string; modele: string; url?: string };
const FOURNISSEURS: F[] = [
  { id: "gemini", secret: "GEMINI_API_KEY", modele: "gemini-2.0-flash" },
  { id: "groq", secret: "GROQ_API_KEY", modele: "llama-3.3-70b-versatile", url: "https://api.groq.com/openai/v1/chat/completions" },
  { id: "mistral", secret: "MISTRAL_API_KEY", modele: "mistral-small-latest", url: "https://api.mistral.ai/v1/chat/completions" },
  { id: "cerebras", secret: "CEREBRAS_API_KEY", modele: "llama-3.3-70b", url: "https://api.cerebras.ai/v1/chat/completions" },
  { id: "openrouter", secret: "OPENROUTER_API_KEY", modele: "meta-llama/llama-3.3-70b-instruct:free", url: "https://openrouter.ai/api/v1/chat/completions" },
];

class ErrFournisseur extends Error {
  constructor(m: string, public statut: number, public delai = 0) { super(m); }
}

async function appeler(f: F, cle: string, charge: unknown): Promise<string> {
  const user = "Compte rendu à corriger (JSON) :\n" + JSON.stringify(charge);
  let r: Response;
  if (f.id === "gemini") {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${f.modele}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": cle },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: CONSIGNE }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    });
  } else {
    r = await fetch(f.url!, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + cle },
      body: JSON.stringify({
        model: f.modele, temperature: 0.2, response_format: { type: "json_object" },
        messages: [{ role: "system", content: CONSIGNE }, { role: "user", content: user }],
      }),
    });
  }
  if (!r.ok) throw new ErrFournisseur(`${f.id} HTTP ${r.status}`, r.status, Number(r.headers.get("retry-after")) || 0);
  const j = await r.json();
  return f.id === "gemini"
    ? j?.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("")
    : j?.choices?.[0]?.message?.content;
}

function normaliser(texte: string, charge: { questions: { code: string }[] }) {
  const t = String(texte || "").replace(/```json|```/gi, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("réponse sans JSON");
  const brut = JSON.parse(t.slice(a, b + 1));
  const attendus = new Set(charge.questions.map((q) => q.code));
  const questions = (brut.questions || [])
    .filter((x: { code: string }) => attendus.has(x.code))
    .map((x: { code: string; cotation: unknown; signal_ia: unknown; justification: unknown }) => ({
      code: x.code,
      cotation: Math.max(0, Math.min(2, Math.round(Number(x.cotation)))),
      signal_ia: !!x.signal_ia,
      justification: String(x.justification || "").slice(0, 400),
    }))
    .filter((x: { cotation: number }) => Number.isFinite(x.cotation));
  if (questions.length < attendus.size) throw new Error("cotation incomplète");
  return { questions, commentaire_note: String(brut.commentaire_note || "").slice(0, 600) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // Accès réservé aux enseignants connectés (la clé publique seule ne suffit pas).
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: u } = await sb.auth.getUser();
  if (!u?.user) return json({ erreur: "connexion requise" }, 401);

  let charge;
  try { charge = (await req.json())?.copie; } catch { return json({ erreur: "corps invalide" }, 400); }
  if (!Array.isArray(charge?.questions) || !charge.questions.length) return json({ erreur: "copie invalide" }, 400);

  const actifs = FOURNISSEURS.filter((f) => Deno.env.get(f.secret));
  if (!actifs.length) return json({ erreur: "aucun secret de fournisseur défini (GEMINI_API_KEY, GROQ_API_KEY…)" }, 500);

  const echecs: string[] = [];
  let tousQuota = true, delaiMin = 0;
  for (const f of actifs) {
    try {
      const res = normaliser(await appeler(f, Deno.env.get(f.secret)!, charge), charge);
      return json({ ...res, modele: f.modele, fournisseur: f.id });
    } catch (e) {
      const st = e instanceof ErrFournisseur ? e.statut : 0;
      if (st === 429) { if (e instanceof ErrFournisseur && e.delai) delaiMin = delaiMin ? Math.min(delaiMin, e.delai) : e.delai; }
      else tousQuota = false;
      echecs.push(`${f.id} : ${(e as Error).message}`);
    }
  }
  if (tousQuota) return json({ erreur: "quotas gratuits épuisés : " + echecs.join(" ; "), reessayer_dans_s: delaiMin }, 429);
  return json({ erreur: "échec des fournisseurs : " + echecs.join(" ; ") }, 502);
});