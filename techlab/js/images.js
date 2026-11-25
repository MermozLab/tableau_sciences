// Réduction de poids des images PNG / JPG / JPEG — traitement 100 % local (canvas), rien n'est envoyé.
(() => {
  const $ = (s) => document.querySelector(s);
  const depot = $("#depot"), entree = $("#fichiers"), corps = $("#corps");
  const items = []; // { nom, original, resultat, nomSortie, url }

  const taille = (o) => o < 1024 ? o + " o" : o < 1048576 ? (o / 1024).toFixed(0) + " Ko" : (o / 1048576).toFixed(2) + " Mo";
  const chargerImage = (blob) => new Promise((ok, ko) => {
    const url = URL.createObjectURL(blob), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); ok(img); };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error("Image illisible")); };
    img.src = url;
  });
  const versBlob = (canvas, type, q) => new Promise((ok) => canvas.toBlob(ok, type, q));

  async function reduire(fichier) {
    const img = await chargerImage(fichier);
    const max = Math.max(100, +$("#largeur").value || 1600);
    const ratio = Math.min(1, max / img.naturalWidth);
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * ratio);
    c.height = Math.round(img.naturalHeight * ratio);
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    const jpeg = fichier.type === "image/jpeg";
    const webp = $("#format").value === "webp";
    if (jpeg && !webp) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const type = webp ? "image/webp" : fichier.type;
    const q = +$("#qualite").value / 100;
    const blob = await versBlob(c, type, q);
    const base = fichier.name.replace(/\.[^.]+$/, "");
    const ext = webp ? ".webp" : fichier.name.slice(fichier.name.lastIndexOf("."));
    // Si le résultat n'est pas plus léger, on garde l'original tel quel.
    if (!blob || (!webp && blob.size >= fichier.size)) return { blob: fichier, nom: fichier.name };
    return { blob, nom: base + ext };
  }

  async function traiter(liste) {
    const valides = [...liste].filter((f) => /^image\/(png|jpeg)$/.test(f.type));
    for (const f of valides) {
      try {
        const r = await reduire(f);
        const it = { nom: f.name, original: f, resultat: r.blob, nomSortie: r.nom, url: URL.createObjectURL(r.blob) };
        items.push(it);
      } catch (e) {
        alert("Impossible de traiter « " + f.name + " » : " + e.message);
      }
    }
    afficher();
  }

  function afficher() {
    $("#resultats").hidden = !items.length;
    corps.replaceChildren(...items.map((it) => {
      const gain = Math.round((1 - it.resultat.size / it.original.size) * 100);
      const tr = document.createElement("tr");
      const td = (...n) => { const e = document.createElement("td"); e.append(...n); return e; };
      const im = Object.assign(document.createElement("img"), { src: it.url, alt: "", className: "apercu" });
      const g = Object.assign(document.createElement("span"), {
        className: gain > 0 ? "gain-ok" : "gain-nul",
        textContent: gain > 0 ? "− " + gain + " %" : "Déjà optimisée"
      });
      const a = Object.assign(document.createElement("a"), { className: "btn secondaire", href: it.url, download: it.nomSortie, textContent: "Télécharger" });
      tr.append(td(im), td(it.nomSortie), td(taille(it.original.size)), td(taille(it.resultat.size)), td(g), td(a));
      return tr;
    }));
    const av = items.reduce((s, i) => s + i.original.size, 0), ap = items.reduce((s, i) => s + i.resultat.size, 0);
    $("#bilan").textContent = items.length ? taille(av) + " → " + taille(ap) + " (" + Math.round((1 - ap / av) * 100) + " % économisés)" : "";
  }

  async function retraiter() { const src = items.map((i) => i.original); vider(); if (src.length) await traiter(src); }
  function vider() { items.forEach((i) => URL.revokeObjectURL(i.url)); items.length = 0; afficher(); }

  entree.addEventListener("change", () => { traiter(entree.files); entree.value = ""; });
  ["dragenter", "dragover"].forEach((t) => depot.addEventListener(t, (e) => { e.preventDefault(); depot.classList.add("survol"); }));
  ["dragleave", "drop"].forEach((t) => depot.addEventListener(t, (e) => { e.preventDefault(); depot.classList.remove("survol"); }));
  depot.addEventListener("drop", (e) => traiter(e.dataTransfer.files));
  $("#vider").addEventListener("click", vider);
  $("#qualite").addEventListener("input", (e) => { $("#val-q").textContent = e.target.value; });
  ["largeur", "qualite", "format"].forEach((id) => $("#" + id).addEventListener("change", retraiter));

  $("#zip").addEventListener("click", async () => {
    const zip = new JSZip();
    items.forEach((i) => zip.file(i.nomSortie, i.resultat));
    const blob = await zip.generateAsync({ type: "blob" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "images-optimisees.zip" });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
})();
