// Module commun des rubriques « Protocoles de Chimie », « Protocoles de Physique » et « Notices appareils ».
// La rubrique est lue dans <body data-rubrique="chimie|physique|notices">.
import { sb } from "./supabase-client.js";

const R = document.body.dataset.rubrique;
const NOM = { chimie: "protocole de chimie", physique: "protocole de physique", notices: "notice d’appareil" }[R];
const $ = (s) => document.querySelector(s);
const racine = $("#app");
let docs = [], editionId = null;

const el = (tag, props = {}, ...enfants) => {
  const n = Object.assign(document.createElement(tag), props);
  enfants.flat().forEach((c) => n.append(c));
  return n;
};
const icone = (c) => el("i", { className: "fas " + c, ariaHidden: "true" });

function message(zone, texte, type = "erreur") {
  zone.className = "message " + type;
  zone.textContent = texte;
}

/* ---------- Connexion ---------- */
function vueConnexion() {
  const msg = el("div", { role: "status", className: "message" });
  const form = el("form", { className: "panneau connexion" },
    el("h2", { textContent: "Connexion enseignant" }),
    el("label", { htmlFor: "email", textContent: "Adresse e-mail" }),
    el("input", { id: "email", type: "email", required: true, autocomplete: "username" }),
    el("label", { htmlFor: "mdp", textContent: "Mot de passe" }),
    el("input", { id: "mdp", type: "password", required: true, autocomplete: "current-password" }),
    el("p", {}, el("button", { className: "btn", type: "submit" }, icone("fa-right-to-bracket"), " Se connecter")),
    msg);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { error } = await sb.auth.signInWithPassword({ email: $("#email").value.trim(), password: $("#mdp").value });
    if (error) return message(msg, "Connexion refusée : vérifiez l’adresse e-mail et le mot de passe.");
    demarrer();
  });
  racine.replaceChildren(form);
}

/* ---------- Liste ---------- */
async function charger() {
  const { data, error } = await sb.from("techlab_documents").select("*").eq("rubrique", R).order("titre");
  if (error) throw error;
  docs = data;
}

function carte(d) {
  const corps = el("details", {}, el("summary", { textContent: "Lire le contenu" }), el("pre", { textContent: d.contenu || "(vide)" }));
  const actions = el("div", { className: "actions" },
    el("button", { className: "btn secondaire", type: "button", onclick: () => formulaire(d) }, icone("fa-pen"), " Modifier"),
    el("button", { className: "btn secondaire", type: "button", onclick: (e) => imprimer(e.target.closest(".doc")) }, icone("fa-print"), " Imprimer"),
    el("button", { className: "btn danger", type: "button", onclick: () => supprimer(d) }, icone("fa-trash"), " Supprimer"));
  if (d.lien) actions.prepend(el("a", { className: "btn", href: d.lien, target: "_blank", rel: "noopener" }, icone("fa-up-right-from-square"), " Ouvrir le lien"));
  return el("article", { className: "doc" },
    el("h3", { textContent: d.titre }),
    el("span", { className: "badge" }, icone("fa-layer-group"), " " + d.niveau),
    corps, actions);
}

function afficherListe() {
  const q = ($("#recherche")?.value || "").toLowerCase();
  const liste = $("#liste");
  const filtres = docs.filter((d) => (d.titre + " " + d.contenu).toLowerCase().includes(q));
  liste.replaceChildren(...(filtres.length ? filtres.map(carte) : [el("p", { className: "vide", textContent: docs.length ? "Aucun résultat pour cette recherche." : "Rien ici pour l’instant. Utilisez « Ajouter » pour créer le premier document." })]));
}

function imprimer(article) {
  article.querySelector("details").open = true;
  document.body.classList.add("impression-unique");
  article.classList.add("cible");
  window.print();
  article.classList.remove("cible");
  document.body.classList.remove("impression-unique");
}

async function supprimer(d) {
  if (!confirm("Supprimer définitivement « " + d.titre + " » ?")) return;
  const { error } = await sb.from("techlab_documents").delete().eq("id", d.id);
  if (error) return message($("#msg"), "Suppression impossible : " + error.message);
  docs = docs.filter((x) => x.id !== d.id);
  afficherListe();
  message($("#msg"), "Document supprimé.", "ok");
}

/* ---------- Formulaire ---------- */
function formulaire(d = null) {
  editionId = d?.id ?? null;
  const msg = el("div", { role: "status", className: "message" });
  const niveaux = ["Tous niveaux", "2nde", "1ère", "Tle"].map((n) => el("option", { value: n, textContent: n, selected: d?.niveau === n }));
  const f = el("form", { className: "panneau" },
    el("h2", { textContent: (d ? "Modifier le " : "Ajouter un ") + NOM }),
    el("label", { htmlFor: "f-titre", textContent: "Titre" }),
    el("input", { id: "f-titre", required: true, maxLength: 160, value: d?.titre ?? "" }),
    el("label", { htmlFor: "f-niveau", textContent: "Niveau" }),
    el("select", { id: "f-niveau" }, niveaux),
    el("label", { htmlFor: "f-contenu", textContent: R === "notices" ? "Résumé, consignes de sécurité, réglages" : "Matériel, étapes, sécurité" }),
    el("textarea", { id: "f-contenu", value: d?.contenu ?? "" }),
    el("label", { htmlFor: "f-lien", textContent: "Lien vers le document complet (facultatif)" }),
    el("input", { id: "f-lien", type: "url", placeholder: "https://…", value: d?.lien ?? "" }),
    el("div", { className: "actions" },
      el("button", { className: "btn", type: "submit" }, icone("fa-floppy-disk"), " Enregistrer"),
      el("button", { className: "btn secondaire", type: "button", onclick: () => { $("#zone-form").replaceChildren(); } }, "Annuler")),
    msg);
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ligne = { rubrique: R, titre: $("#f-titre").value.trim(), niveau: $("#f-niveau").value, contenu: $("#f-contenu").value, lien: $("#f-lien").value.trim() || null };
    const rep = editionId
      ? await sb.from("techlab_documents").update(ligne).eq("id", editionId).select().single()
      : await sb.from("techlab_documents").insert(ligne).select().single();
    if (rep.error) return message(msg, "Enregistrement impossible : " + rep.error.message);
    docs = editionId ? docs.map((x) => (x.id === editionId ? rep.data : x)) : [...docs, rep.data];
    docs.sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
    $("#zone-form").replaceChildren();
    afficherListe();
    message($("#msg"), "Document enregistré.", "ok");
  });
  $("#zone-form").replaceChildren(f);
  f.scrollIntoView({ behavior: "smooth", block: "start" });
  $("#f-titre").focus();
}

/* ---------- Démarrage ---------- */
async function demarrer() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return vueConnexion();
  const msg = el("div", { id: "msg", role: "status", className: "message" });
  racine.replaceChildren(
    el("div", { className: "barre" },
      el("input", { id: "recherche", type: "search", placeholder: "Rechercher un titre ou un mot du contenu", ariaLabel: "Rechercher", oninput: afficherListe }),
      el("button", { className: "btn", type: "button", onclick: () => formulaire() }, icone("fa-plus"), " Ajouter"),
      el("button", { className: "btn secondaire", type: "button", onclick: async () => { await sb.auth.signOut(); vueConnexion(); } }, icone("fa-right-from-bracket"), " Se déconnecter")),
    msg, el("div", { id: "zone-form" }), el("div", { id: "liste" }));
  try {
    await charger();
    afficherListe();
  } catch (e) {
    message(msg, "Lecture impossible. Ce compte est-il enregistré comme enseignant dans Supabase ? (" + e.message + ")");
  }
}
demarrer();
