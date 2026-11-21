/* World Kitchen — single-file app logic. No build step, no server; data persists in localStorage. */
(() => {
"use strict";

// ───────────── utilities ─────────────
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem("wk_" + k)); return v ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem("wk_" + k, JSON.stringify(v)); },
};
const uid = () => Math.random().toString(36).slice(2, 10);
const DIFF = ["", "Beginner", "Intermediate", "Advanced"];
const MEALS = ["lunch", "dinner"];
const FRESH_AISLES = ["produce", "meat", "seafood", "dairy", "bakery", "frozen"];
const AISLE_LABEL = { produce: "🥬 Produce", meat: "🥩 Meat", seafood: "🦐 Seafood", dairy: "🥚 Dairy, Eggs & Tofu", bakery: "🍞 Bakery", frozen: "🧊 Frozen", intl: "🌏 International / Asian aisle", pantry: "🥫 Pantry staples", spice: "🌶️ Spices" };

function fmtMin(m) {
  m = Math.round(m);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
function parseQty(s) {
  if (!s) return null;
  s = s.trim();
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/); // "1 1/2"
  if (mixed) return +mixed[1] + mixed[2] / mixed[3];
  if (s.includes("/")) { const [a, b] = s.split("/"); return +a / +b; }
  const range = s.match(/^([\d.]+)\s*[-–]\s*([\d.]+)$/); // "2-3" → 2.5
  if (range) return (+range[1] + +range[2]) / 2;
  return +s;
}
function fmtQty(x, unit) {
  if (x == null || isNaN(x)) return "";
  if ((unit === "g" || unit === "ml") && x >= 20) return String(Math.round(x / 5) * 5);
  if (x >= 10) return String(Math.round(x));
  const whole = Math.floor(x), frac = x - whole;
  const fracs = [[0, ""], [0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.67, "⅔"], [0.75, "¾"], [1, ""]];
  let best = fracs[0];
  for (const f of fracs) if (Math.abs(frac - f[0]) < Math.abs(frac - best[0])) best = f;
  const w = best[0] === 1 ? whole + 1 : whole;
  if (!best[1]) return String(w || (x > 0 ? Math.round(x * 10) / 10 : 0));
  return (w ? w : "") + best[1];
}
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (x.getDay() + 6) % 7; return addDays(x, -wd); };
const dayLabel = (d) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

// ───────────── data prep ─────────────
const RECIPES = window.RECIPES.concat(window.EXTRA_RECIPES || []);

// ───────────── ingredient guide lookup ─────────────
const GUIDE = window.INGREDIENTS || [];
const GUIDE_BY_ID = Object.fromEntries(GUIDE.map((g) => [g.id, g]));
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const GUIDE_PATTERNS = GUIDE.flatMap((g) => g.m.map((m) => ({ g, len: m.length, re: new RegExp(`(^|[^a-zà-ỹ])${reEsc(m.toLowerCase())}(s|es)?([^a-zà-ỹ]|$)`) })));
// longest matching word wins: "fermented black beans" → douchi, not black beans
function guideFor(name) {
  const n = name.toLowerCase();
  let best = null;
  for (const p of GUIDE_PATTERNS) if (p.re.test(n) && (!best || p.len > best.len)) best = p;
  return best ? best.g : null;
}
const BY_ID = {};
for (const r of RECIPES) {
  r.ing = r.ingredients.map((line) => { const [q, u, n, a] = line.split("|"); return { q: parseQty(q), u: u || "", n, a: a || "pantry" }; });
  r.st = r.steps.map((line) => {
    const i1 = line.indexOf("|"), i2 = line.indexOf("|", i1 + 1);
    return { active: line.slice(0, i1) === "A", min: +line.slice(i1 + 1, i2), t: line.slice(i2 + 1) };
  });
  // steps of 4h+ (overnight soaks) are "advance prep" and not counted in the cooking time
  r.advance = r.st.filter((s) => s.min >= 240);
  const main = r.st.filter((s) => s.min < 240);
  r.activeMin = main.filter((s) => s.active).reduce((a, s) => a + s.min, 0);
  r.totalMin = main.reduce((a, s) => a + s.min, 0);
  r.flag = `<span class="fl">${window.FLAGS[r.country] || "🍽️"}</span>`;
  for (const i of r.ing) i.g = guideFor(i.n);
  r.sourced = Array.isArray(r.sources) && r.sources.length > 0;
  if (r.sourced && !r.tags.includes("sourced")) r.tags.push("sourced");
  BY_ID[r.id] = r;
}
const SKILL_BY_ID = Object.fromEntries(window.SKILLS.map((s) => [s.id, s]));

// ───────────── ingredient identity (shared by pantry + shopping) ─────────────
// "Onions, grated" / "onion" / "onions (large)" all map to the same key: "onion"
const ingKey = (n) => n.toLowerCase().replace(/\(.*?\)/g, "").replace(/,.*$/, "").replace(/\+.*$/, "").trim().replace(/leaves$/, "leaf").replace(/(es|s)$/, "");
const ALWAYS_HAVE = new Set(["water", "ice water"]);
// every distinct ingredient in the library: key -> {name, aisle}
const ALL_INGS = {};
for (const r of RECIPES) for (const i of r.ing) {
  i.k = ingKey(i.n);
  if (!ALL_INGS[i.k]) ALL_INGS[i.k] = { name: i.n.replace(/\s*\(.*?\)/g, "").replace(/,.*$/, "").replace(/\s*\+.*$/, ""), aisle: i.a };
}
// Starter kits: one click to stock the pantry with typical staples (matched against ingredient keys)
const KITS = {
  "🧂 Basics": ["salt", "sugar", "oil", "black pepper", "olive oil", "flour", "butter", "egg", "onion", "garlic", "tomato paste", "jasmine or short-grain rice", "brown sugar"],
  "🥢 East & SE Asian": ["soy sauce", "light soy sauce", "dark soy sauce", "fish sauce", "oyster sauce", "sesame oil", "rice vinegar", "mirin", "sake", "shaoxing wine", "star anise", "rock sugar", "gochujang", "gochugaru", "toasted sesame seed", "miso", "kombu", "cornstarch", "ginger", "scallion"],
  "🍛 Indian spice box": ["cumin seed", "coriander powder", "turmeric", "kashmiri chili powder", "garam masala", "ghee", "asafoetida", "dried red chili", "kasuri methi", "ginger-garlic paste"],
  "🫒 Mediterranean": ["olive oil", "dried oregano", "bay leaf", "red wine vinegar", "tomato passata", "tahini", "ground cumin", "sweet pimentón"],
  "🌮 Mexican": ["dried mexican oregano", "chipotles in adobo", "dried pinto or black bean", "bay leaf"],
};
const inPantry = (k) => ALWAYS_HAVE.has(k) || !!state.pantry[k];
function coverage(r) {
  const missing = r.ing.filter((i) => !inPantry(i.k));
  return { have: r.ing.length - missing.length, total: r.ing.length, missing, pct: (r.ing.length - missing.length) / r.ing.length };
}
function addToPantry(k, name, aisle) {
  const base = ALL_INGS[k] || { name: name || k, aisle: aisle || "pantry" };
  state.pantry[k] = { name: base.name, aisle: base.aisle, added: ymd(new Date()) };
}

// ───────────── state ─────────────
let state = {
  plan: store.get("plan", []),          // [{id, date, meal, recipeId, servings, type: cook|leftover|freezer, parent}]
  journal: store.get("journal", []),    // [{id, recipeId, date, rating, good, next}]
  freezer: store.get("freezer", []),    // [{id, recipeId, portions, date}]
  shopChecks: store.get("shopChecks", {}),
  extras: store.get("extras", []),      // manual grocery items
  settings: store.get("settings", { household: 1 }),
  pantry: store.get("pantry", {}),          // ingredient key -> {name, aisle, added}
  weekOffset: 0,
  filters: { q: "", country: "", diff: 0, maxTime: 0, tag: "", sort: "name" },
};
const save = () => { for (const k of ["plan", "journal", "freezer", "shopChecks", "extras", "settings", "pantry"]) store.set(k, state[k]); };

const cookedIds = () => new Set(state.journal.map((j) => j.recipeId));
function skillCounts() {
  const counts = {};
  for (const id of cookedIds()) for (const s of BY_ID[id]?.skills || []) counts[s] = (counts[s] || 0) + 1;
  return counts;
}
const skillLevel = (n) => (n >= 5 ? "Confident" : n >= 3 ? "Competent" : n >= 1 ? "Learning" : "Not started");

// ───────────── routing ─────────────
const views = { ingredients: renderIngredients, pantry: renderPantry, discover: renderDiscover, plan: renderPlan, shop: renderShop, prep: renderPrep, skills: renderSkills, journal: renderJournal };
function route() {
  const tab = (location.hash.slice(1).split("?")[0]) || "discover";
  $$("#tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
  (views[tab] || renderDiscover)();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

// ───────────── modal ─────────────
function openModal(html, narrow = false) {
  const card = $("#modal-card");
  card.className = "modal-card" + (narrow ? " narrow" : "");
  card.innerHTML = `<button class="close-x" data-close>×</button>` + html;
  $("#modal").classList.remove("hidden");
  $("#modal").scrollTop = 0;
}
function closeModal() { $("#modal").classList.add("hidden"); }
document.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); } });

// ───────────── INGREDIENT GUIDE ─────────────
// Photos and encyclopedia intros come from Wikipedia / Wikimedia Commons (credited on screen).
// Results are cached in localStorage and the images by the service worker, so the guide works offline after a visit.
const WIKI_API = "https://en.wikipedia.org/w/api.php?format=json&origin=*&redirects=1&action=query";
const CAT_LABEL = { aromatic: "🧄 Aromatics", herb: "🌿 Herbs", spice: "🌶️ Spices", sauce: "🍶 Sauces, pastes & ferments", produce: "🥬 Produce", grain: "🍚 Rice, noodles & legumes", protein: "🥩 Meat & seafood", dairy: "🥚 Eggs, dairy & tofu", pantry: "🥫 Pantry", bakery: "🌮 Breads & tortillas" };
const catIcon = (c) => (CAT_LABEL[c] || "🍽️ Other").split(" ")[0];
const catLabel = (c) => CAT_LABEL[c] || "🍽️ Other";
let thumbs = store.get("thumbs", {});           // wiki title -> thumbnail url
const wikiCache = store.get("wiki", {});        // wiki title -> {extract, url, img, file}

async function wikiQuery(titles, extra) {
  const res = await fetch(`${WIKI_API}&titles=${encodeURIComponent(titles.join("|"))}${extra}`);
  const j = await res.json();
  const map = {};
  const norm = {}; for (const n of j.query.normalized || []) norm[n.from] = n.to;
  const red = {}; for (const r of j.query.redirects || []) red[r.from] = r.to;
  const pages = {}; for (const p of Object.values(j.query.pages || {})) pages[p.title] = p;
  for (const t of titles) { let x = norm[t] || t; x = red[x] || x; map[t] = pages[x]; }
  return map;
}
async function loadThumbs() {
  const titles = [...new Set(GUIDE.map((g) => g.imgWiki || g.wiki))].filter((t) => !(t in thumbs));
  for (let i = 0; i < titles.length; i += 50) {
    try {
      const map = await wikiQuery(titles.slice(i, i + 50), "&prop=pageimages&piprop=thumbnail&pithumbsize=320");
      for (const [t, p] of Object.entries(map)) thumbs[t] = p?.thumbnail?.source || "";
    } catch { return; } // offline: keep whatever we have
  }
  store.set("thumbs", thumbs);
}
async function loadWiki(g) {
  if (wikiCache[g.wiki]) return wikiCache[g.wiki];
  const info = (await wikiQuery([g.wiki], "&prop=extracts|pageimages|info&exintro=1&explaintext=1&exsentences=4&piprop=thumbnail|name&pithumbsize=640&inprop=url"))[g.wiki] || {};
  let imgPage = info;
  if (g.imgWiki) imgPage = (await wikiQuery([g.imgWiki], "&prop=pageimages&piprop=thumbnail|name&pithumbsize=640"))[g.imgWiki] || {};
  const data = { extract: info.extract || "", url: info.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(g.wiki)}`, title: info.title || g.wiki.replace(/_/g, " "),
    img: imgPage.thumbnail?.source || "", file: imgPage.pageimage || "" };
  wikiCache[g.wiki] = data; store.set("wiki", wikiCache);
  return data;
}
const recipesUsing = (g) => RECIPES.filter((r) => r.ing.some((i) => i.g === g));
const guideKeys = (g) => [...new Set(RECIPES.flatMap((r) => r.ing.filter((i) => i.g === g).map((i) => i.k)))];

let ingFilter = { q: "", cat: "" };
function renderIngredients() {
  const f = ingFilter, q = f.q.toLowerCase();
  const list = GUIDE.filter((g) => (!f.cat || g.cat === f.cat) && (!q || `${g.name} ${g.native} ${g.origin}`.toLowerCase().includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name));
  const cats = Object.keys(CAT_LABEL).filter((c) => GUIDE.some((g) => g.cat === c));
  $("#view").innerHTML = `
    <h1>Ingredients</h1>
    <p class="sub">${GUIDE.length} key ingredients: what they are, where they come from, how to use, store and swap them. Tap any underlined ingredient in a recipe to jump here.</p>
    <div class="filters"><input type="search" id="ig-q" placeholder="Search ingredients, e.g. galangal, miso, saffron…" value="${esc(f.q)}"></div>
    <div class="row" style="margin-bottom:16px"><span class="chip click ${!f.cat ? "on" : ""}" data-cat="">All</span>${cats.map((c) => `<span class="chip click ${f.cat === c ? "on" : ""}" data-cat="${c}">${CAT_LABEL[c]}</span>`).join("")}</div>
    <div class="grid ing-grid">${list.map((g) => {
      const t = thumbs[g.imgWiki || g.wiki];
      return `<div class="card icard" data-guide="${g.id}">
        <div class="ithumb">${t ? `<img src="${esc(t)}" alt="${esc(g.name)}" loading="lazy">` : `<span>${catIcon(g.cat)}</span>`}</div>
        <div class="ibody"><b>${esc(g.name)}</b><div class="small muted">${esc(g.native)}</div><div class="small">📍 ${esc(g.origin)}</div>
        <div class="small muted">Used in ${recipesUsing(g).length} recipe(s)</div></div></div>`; }).join("") || `<div class="empty">No ingredients match.</div>`}</div>
    <p class="small muted" style="margin-top:20px">Photos and encyclopedia summaries: Wikipedia &amp; Wikimedia Commons contributors (CC BY-SA). Cooking notes: World Kitchen.</p>`;
  const qi = $("#ig-q");
  qi.oninput = () => { f.q = qi.value; renderIngredients(); const n = $("#ig-q"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
  $$("[data-cat]").forEach((c) => c.onclick = () => { f.cat = c.dataset.cat; renderIngredients(); });
  $$("[data-guide]").forEach((c) => c.onclick = () => openIngredient(c.dataset.guide));
  if (GUIDE.some((g) => !((g.imgWiki || g.wiki) in thumbs)) && navigator.onLine) loadThumbs().then(() => { if (location.hash === "#ingredients") renderIngredients(); });
}

async function openIngredient(id, back) {
  const g = GUIDE_BY_ID[id];
  const used = recipesUsing(g), keys = guideKeys(g);
  const owned = keys.some((k) => state.pantry[k]);
  const section = (icon, title, text) => text ? `<div class="box"><b>${icon} ${title}</b><div class="small" style="margin-top:4px">${esc(text)}</div></div>` : "";
  openModal(`
    ${back ? `<button class="btn sm" id="ig-back">← Back to ${esc(BY_ID[back.recipe].name)}</button>` : ""}
    <div class="ing-hero"><div class="ing-img" id="ig-img"><span class="muted small">Loading photo…</span></div>
      <div><h1>${esc(g.name)}</h1><div class="muted">${esc(g.native)}</div>
        <div style="margin-top:8px"><span class="chip">${catLabel(g.cat)}</span><span class="chip">📍 ${esc(g.origin)}</span></div>
        <div class="row" style="margin-top:12px">${keys.length ? `<button class="btn ${owned ? "" : "primary"}" id="ig-pantry">${owned ? "✓ In my pantry — remove" : "🏠 I have this"}</button>` : ""}</div></div></div>
    <div class="box amber"><b>📜 History</b><div style="margin-top:4px">${esc(g.hist)}</div></div>
    <div class="box blue" id="ig-wiki"><b>📖 From Wikipedia</b><div class="small muted" style="margin-top:4px">Loading…</div></div>
    <div class="two" style="margin-top:4px;grid-template-columns:1fr 1fr">
      <div>${section("👅", "Taste", g.taste)}${section("🍳", "How to use it", g.use)}</div>
      <div>${section("🧺", "Buying & storing", g.keep)}${section("🔄", "Substitutes", g.subs)}</div>
    </div>
    <h2>Recipes that use it (${used.length})</h2>
    <div>${used.map((r) => `<span class="chip click" data-open="${r.id}">${r.flag} ${r.name}</span>`).join("") || "<span class='muted'>None yet.</span>"}</div>`);
  if ($("#ig-back")) $("#ig-back").onclick = () => openRecipe(back.recipe, back.servings);
  if ($("#ig-pantry")) $("#ig-pantry").onclick = () => {
    if (owned) keys.forEach((k) => delete state.pantry[k]); else keys.forEach((k) => addToPantry(k));
    save(); openIngredient(id, back);
  };
  $$("#modal-card [data-open]").forEach((c) => c.onclick = () => openRecipe(c.dataset.open));
  try {
    const w = await loadWiki(g);
    if (!$("#ig-wiki") || $("#modal").classList.contains("hidden")) return;
    $("#ig-img").innerHTML = w.img
      ? `<img src="${esc(w.img)}" alt="${esc(g.name)}"><a class="credit" href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(w.file)}" target="_blank" rel="noopener">Photo: Wikimedia Commons ↗</a>`
      : `<span style="font-size:48px">${catIcon(g.cat)}</span>`;
    $("#ig-wiki").innerHTML = `<b>📖 From Wikipedia</b><div class="small" style="margin-top:4px">${esc(w.extract.replace(/\s*\([\s;,]*\)/g, "")) || "No summary available."}</div>
      <div class="small" style="margin-top:6px"><a href="${esc(w.url)}" target="_blank" rel="noopener">Read “${esc(w.title)}” on Wikipedia ↗</a> <span class="muted">· text CC BY-SA 4.0</span></div>`;
  } catch {
    if ($("#ig-wiki")) $("#ig-wiki").innerHTML = `<b>📖 From Wikipedia</b><div class="small muted">You're offline — the photo and encyclopedia summary load once you're online (then they're saved for offline use).</div>`;
    if ($("#ig-img")) $("#ig-img").innerHTML = `<span style="font-size:48px">${catIcon(g.cat)}</span>`;
  }
}

// ───────────── PANTRY ─────────────
let pantryFilter = "";
function renderPantry() {
  const owned = Object.keys(state.pantry);
  const ready = RECIPES.map((r) => ({ r, c: coverage(r) })).filter(({ c }) => c.pct >= 0.5)
    .sort((a, b) => a.c.missing.length - b.c.missing.length || b.c.pct - a.c.pct).slice(0, 6);
  // everything known: library ingredients + custom items you added
  const known = { ...ALL_INGS };
  for (const [k, v] of Object.entries(state.pantry)) if (!known[k]) known[k] = { name: v.name, aisle: v.aisle || "other", custom: true };
  const f = pantryFilter.toLowerCase();
  const byAisle = {};
  for (const [k, v] of Object.entries(known)) {
    if (ALWAYS_HAVE.has(k) || (f && !v.name.toLowerCase().includes(f))) continue;
    (byAisle[v.aisle] = byAisle[v.aisle] || []).push({ k, ...v });
  }
  const order = ["pantry", "spice", "intl", "produce", "dairy", "meat", "seafood", "frozen", "bakery", "other"];
  $("#view").innerHTML = `
    <h1>Pantry</h1>
    <p class="sub">Tap what you have at home (${owned.length} items now). Your grocery list skips these, and recipes show what you're missing.</p>
    <div class="row" style="margin-bottom:12px"><span class="small muted">Quick start:</span>
      ${Object.keys(KITS).map((name) => `<button class="btn sm" data-kit="${esc(name)}">${name}</button>`).join("")}
      <span class="spacer"></span>${owned.length ? `<button class="btn sm ghost" id="pt-clear">Empty pantry</button>` : ""}</div>
    ${ready.length ? `<h2>🍳 Cook from your pantry</h2><div class="recs">${ready.map(({ r, c }) => `
      <div class="rec" data-open="${r.id}">${r.flag} <b style="display:inline">${r.name}</b> <span class="muted small">${fmtMin(r.totalMin)}</span>
        <div class="bar"><div style="width:${Math.round(c.pct * 100)}%"></div></div>
        <div class="small muted">${c.missing.length ? `Missing ${c.missing.length}: ${c.missing.slice(0, 5).map((i) => esc(ALL_INGS[i.k].name)).join(", ")}${c.missing.length > 5 ? "…" : ""}` : "✓ You have everything!"}</div></div>`).join("")}</div>`
      : owned.length ? "" : `<div class="box blue">👋 Start with a quick-start kit above, then tap anything else you have. It takes about 2 minutes.</div>`}
    <h2>Everything</h2>
    <div class="row" style="margin-bottom:10px">
      <input type="search" id="pt-q" placeholder="Filter, or type a new item and press Enter to add it…" value="${esc(pantryFilter)}" style="flex:1;min-width:240px">
    </div>
    ${order.filter((a) => byAisle[a]).map((a) => `<div class="shop-group"><h3>${AISLE_LABEL[a] || "📦 Other"}</h3>
      ${byAisle[a].sort((x, y) => x.name.localeCompare(y.name)).map((i) => `<span class="chip click pchip ${state.pantry[i.k] ? "on" : ""}" data-pk="${esc(i.k)}">${state.pantry[i.k] ? "✓ " : ""}${esc(i.name)}</span>`).join("")}</div>`).join("")
      || `<p class="muted">Nothing matches. Press Enter to add “${esc(pantryFilter)}” as a custom item.</p>`}`;
  $$("[data-kit]").forEach((b) => b.onclick = () => {
    let n = 0;
    for (const k of KITS[b.dataset.kit]) if (ALL_INGS[k] && !state.pantry[k]) { addToPantry(k); n++; }
    save(); renderPantry();
  });
  if ($("#pt-clear")) $("#pt-clear").onclick = () => { if (confirm("Remove everything from your pantry?")) { state.pantry = {}; save(); renderPantry(); } };
  $$("[data-pk]").forEach((c) => c.onclick = () => {
    const k = c.dataset.pk;
    if (state.pantry[k]) delete state.pantry[k]; else addToPantry(k, known[k]?.name, known[k]?.aisle);
    save(); renderPantry(); $("#pt-q").focus();
  });
  $$("[data-open]").forEach((el) => el.onclick = () => openRecipe(el.dataset.open));
  const q = $("#pt-q");
  q.oninput = () => { pantryFilter = q.value; renderPantry(); const n = $("#pt-q"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
  q.onkeydown = (e) => {
    if (e.key !== "Enter" || !q.value.trim()) return;
    const k = ingKey(q.value.trim());
    addToPantry(k, q.value.trim(), ALL_INGS[k]?.aisle || "other");
    pantryFilter = ""; save(); renderPantry(); $("#pt-q").focus();
  };
}

// ───────────── DISCOVER ─────────────
function recommend() {
  const cooked = cookedIds();
  const counts = skillCounts();
  const level = Math.min(3, 1 + Math.floor(cooked.size / 4));
  return RECIPES.filter((r) => !cooked.has(r.id) && r.difficulty <= level + (cooked.size >= 2 ? 1 : 0))
    .map((r) => {
      const newSkills = r.skills.filter((s) => !counts[s]);
      const practice = r.skills.filter((s) => counts[s] && counts[s] < 5);
      let score = practice.length * 2 + (newSkills.length === 1 ? 3 : newSkills.length === 0 ? 1 : 0) - Math.abs(r.difficulty - level);
      if (r.tags.includes("batch")) score += 1;
      return { r, score, newSkills, practice };
    })
    .sort((a, b) => b.score - a.score).slice(0, 3);
}

function renderDiscover() {
  const f = state.filters;
  const countries = [...new Set(RECIPES.map((r) => r.country))].sort();
  const tags = ["sourced", "batch", "freezer", "quick", "weeknight", "vegetarian", "vegan", "budget", "one pot", "meal prep", "weekend project"];
  const recs = recommend();
  $("#view").innerHTML = `
    <h1>Discover</h1>
    <p class="sub">${RECIPES.length} traditional recipes from ${countries.length - 1} countries — each linked to native-language sources from that country.</p>
    ${recs.length ? `<h2>Cook next to level up</h2><div class="recs">${recs.map(({ r, newSkills, practice }) => `
      <div class="rec" data-open="${r.id}"><span>${r.flag}</span> <b>${r.name}</b>
        <span class="chip diff-${r.difficulty}">${DIFF[r.difficulty]}</span><span class="muted small">${fmtMin(r.totalMin)}</span>
        <div class="small muted">${newSkills.length ? `New skill: <b style="display:inline">${newSkills.map((s) => SKILL_BY_ID[s].name).join(", ")}</b>` : ""}
        ${practice.length ? ` Practices: ${practice.map((s) => SKILL_BY_ID[s].name).join(", ")}` : ""}</div></div>`).join("")}</div>` : ""}
    <h2>All recipes</h2>
    <div class="filters">
      <input type="search" id="f-q" placeholder="Search dish, country, or ingredients you have (e.g. chicken, coconut)…" value="${esc(f.q)}" />
      <select id="f-country"><option value="">All countries</option>${countries.map((c) => `<option ${c === f.country ? "selected" : ""}>${c}</option>`).join("")}</select>
      <select id="f-diff"><option value="0">Any difficulty</option>${[1, 2, 3].map((d) => `<option value="${d}" ${+f.diff === d ? "selected" : ""}>${DIFF[d]}</option>`).join("")}</select>
      <select id="f-time"><option value="0">Any time</option>${[20, 30, 45, 60, 90, 180].map((t) => `<option value="${t}" ${+f.maxTime === t ? "selected" : ""}>≤ ${fmtMin(t)}</option>`).join("")}</select>
      <select id="f-sort">${[["name", "Sort: name"], ["time", "Sort: quickest"], ["active", "Sort: least hands-on"], ["diff", "Sort: easiest"], ["have", "Sort: most ingredients I have"]].map(([v, l]) => `<option value="${v}" ${f.sort === v ? "selected" : ""}>${l}</option>`).join("")}</select>
    </div>
    <div class="row" style="margin-bottom:16px">${tags.map((t) => `<span class="chip click ${f.tag === t ? "on" : ""}" data-tag="${t}">${t}</span>`).join("")}</div>
    <div class="grid" id="grid"></div>`;
  const bind = (id, key) => $(id).addEventListener("input", (e) => { f[key] = e.target.value; drawGrid(); });
  bind("#f-q", "q"); bind("#f-country", "country"); bind("#f-diff", "diff"); bind("#f-time", "maxTime"); bind("#f-sort", "sort");
  $$("[data-tag]").forEach((el) => el.addEventListener("click", () => { f.tag = f.tag === el.dataset.tag ? "" : el.dataset.tag; renderDiscover(); }));
  $$("[data-open]").forEach((el) => el.addEventListener("click", () => openRecipe(el.dataset.open)));
  drawGrid();
}

function drawGrid() {
  const f = state.filters, cooked = cookedIds(), hasPantry = Object.keys(state.pantry).length > 0;
  const terms = f.q.toLowerCase().split(/[,\s]+/).filter(Boolean);
  let list = RECIPES.map((r) => {
    let match = 0;
    if (terms.length) {
      const hay = `${r.name} ${r.native} ${r.country} ${r.region} ${r.tags.join(" ")}`.toLowerCase();
      const ingHay = r.ing.map((i) => i.n.toLowerCase()).join(" | ");
      for (const t of terms) if (hay.includes(t) || ingHay.includes(t)) match++;
    }
    return { r, match };
  }).filter(({ r, match }) =>
    (!terms.length || match > 0) &&
    (!f.country || r.country === f.country) &&
    (!+f.diff || r.difficulty === +f.diff) &&
    (!+f.maxTime || r.totalMin <= +f.maxTime) &&
    (!f.tag || r.tags.some((t) => t.includes(f.tag))));
  const sorters = { name: (a, b) => a.r.name.localeCompare(b.r.name), time: (a, b) => a.r.totalMin - b.r.totalMin, active: (a, b) => a.r.activeMin - b.r.activeMin, diff: (a, b) => a.r.difficulty - b.r.difficulty || a.r.totalMin - b.r.totalMin, have: (a, b) => coverage(a.r).missing.length - coverage(b.r).missing.length };
  list.sort((a, b) => (terms.length > 1 ? b.match - a.match : 0) || sorters[f.sort](a, b));
  $("#grid").innerHTML = list.length ? list.map(({ r, match }) => `
    <div class="card rcard" data-open="${r.id}">
      ${cooked.has(r.id) ? `<span class="badge-cooked">✓ cooked</span>` : ""}
      <div class="flag">${r.flag}</div>
      <div class="name">${r.name}</div>
      <div class="native">${r.native} · ${r.country}</div>
      <div><span class="chip diff-${r.difficulty}">${DIFF[r.difficulty]}</span>${r.sourced ? `<span class="badge-src" title="Researched from local recipe pages">📚 sourced</span> ` : ""}${r.tags.filter((t) => t !== "sourced").slice(0, 3).map((t) => `<span class="chip">${t}</span>`).join("")}</div>
      <div class="meta"><span>⏱ ${fmtMin(r.totalMin)}${r.advance.length ? " + soak" : ""}</span><span>🔪 ${fmtMin(r.activeMin)} hands-on</span><span>🍽 ${r.servings}</span>${hasPantry ? `<span title="ingredients you have">🏠 ${coverage(r).have}/${r.ing.length}</span>` : ""}
        ${terms.length > 1 ? `<span>✓ ${match}/${terms.length}</span>` : ""}</div>
    </div>`).join("") : `<div class="empty">No recipes match. Try fewer filters.</div>`;
  $$("#grid [data-open]").forEach((el) => el.addEventListener("click", () => openRecipe(el.dataset.open)));
}

// ───────────── RECIPE DETAIL ─────────────
function sourceLinks(r) {
  const srcs = window.SOURCES[r.country] || [];
  const nativeName = r.native.split(/ (?=[A-Za-z])/)[0]; // e.g. "親子丼 Oyakodon" -> "親子丼"
  return srcs.map((s) => {
    const q = encodeURIComponent(`site:${s.domain} ${nativeName}`);
    return `<a href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener">${esc(s.name)}</a> <span class="muted small">(${s.domain}, ${s.lang})</span>`;
  }).join("<br>");
}

function openRecipe(id, scaleServings) {
  const r = BY_ID[id];
  const servings = scaleServings || r.servings;
  const k = servings / r.servings;
  const past = state.journal.filter((j) => j.recipeId === id).sort((a, b) => b.date.localeCompare(a.date));
  const last = past[0];
  const cov = coverage(r);
  openModal(`
    <div class="recipe-head"><div class="flag">${r.flag}</div><div>
      <h1>${r.name}</h1>
      <div class="muted"><i>${r.native}</i> · ${r.country} — ${r.region}</div>
      <div style="margin-top:6px"><span class="chip diff-${r.difficulty}">${DIFF[r.difficulty]}</span>${r.tags.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
    </div></div>
    <p>${r.intro}</p>
    <div class="stats">
      <div class="stat"><div class="k">Total time</div><div class="v">${fmtMin(r.totalMin)}</div></div>
      <div class="stat"><div class="k">Hands-on</div><div class="v">${fmtMin(r.activeMin)}</div></div>
      <div class="stat"><div class="k">Hands-off</div><div class="v">${fmtMin(r.totalMin - r.activeMin)}</div></div>
      <div class="stat"><div class="k">Servings</div><div class="v row" style="gap:6px">
        <button class="btn sm" id="sv-minus">−</button><span id="sv">${servings}</span><button class="btn sm" id="sv-plus">+</button></div></div>
      <div class="stat"><div class="k">Keeps</div><div class="v">${r.store.fridge ? `${r.store.fridge}d fridge` : "eat fresh"}${r.store.freeze ? ` · ${r.store.freeze}mo freezer` : ""}</div></div>
    </div>
    ${r.advance.length ? `<div class="box amber">🌙 <b>Plan ahead:</b> ${r.advance.map((s) => esc(s.t)).join(" ")}</div>` : ""}
    ${last ? `<div class="box blue">📝 <b>Last time (${last.date}, ${"★".repeat(last.rating)}):</b> ${esc(last.next || last.good || "no notes")}</div>` : ""}
    <div class="row" style="margin:16px 0">
      <button class="btn primary" id="go-cook">▶ Cook mode</button>
      <button class="btn" id="go-plan">📅 Add to plan</button>
      <button class="btn" id="go-log">✓ I cooked this</button>
      ${Object.keys(state.pantry).length && cov.missing.length ? `<button class="btn" id="go-missing">🛒 Add ${cov.missing.length} missing to grocery list</button>` : ""}
    </div>
    <div class="two">
      <div>
        <h2>Ingredients</h2>
        ${Object.keys(state.pantry).length ? `<p class="small muted">🏠 You have ${cov.have} of ${cov.total} ingredients.</p>` : ""}
        <ul class="ing">${r.ing.map((i) => `<li class="${Object.keys(state.pantry).length && !inPantry(i.k) ? "missing" : ""}"><input type="checkbox"><span class="q">${fmtQty(i.q != null ? i.q * k : null, i.u)} ${i.u}</span><span>${i.g ? `<a href="#" class="ing-link" data-ing="${i.g.id}" title="About this ingredient">${esc(i.n)}</a>` : esc(i.n)}</span>${Object.keys(state.pantry).length ? (inPantry(i.k) ? `<span class="have-tag">✓ have</span>` : `<span class="need-tag">need</span>`) : ""}</li>`).join("")}</ul>
        <h2>Skills you'll practice</h2>
        ${r.skills.map((s) => `<span class="chip skill-chip" data-skill="${s}">${SKILL_BY_ID[s].name}</span>`).join("")}
        <div class="box green"><b>🧊 Storage & batch cooking</b><br>${esc(r.store.reheat)}</div>
        <div class="box"><b>♻️ Leftover makeover</b><br>${esc(r.next)}</div>
        ${r.sourced ? `<div class="box green"><b>📚 Researched from local sources</b>
          ${r.authenticity ? `<div class="small" style="margin:6px 0">${esc(r.authenticity)}</div>` : ""}
          ${r.sources.map((s) => `<div class="small">↗ <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a> <span class="muted">(${esc(s.lang || "")})</span></div>`).join("")}
          <div class="small muted" style="margin-top:6px">Written in our own words after cross-checking these pages.</div></div>` : ""}
        <div class="box"><b>🌏 ${r.sourced ? "More local sources" : "Check it against local sources"}</b><br><span class="small muted">Search the native dish name on sites from ${r.country}:</span><br>${sourceLinks(r) || "<span class='muted'>—</span>"}</div>
      </div>
      <div>
        <h2>Method</h2>
        <ol class="steps">${r.st.map((s, i) => `<li><span class="${s.active ? "tag-a" : "tag-p"}">${s.active ? "HANDS-ON" : "HANDS-OFF"} · ${s.min >= 240 ? "overnight" : fmtMin(s.min)}</span>
          ${s.min > 0 && s.min < 240 ? `<button class="btn sm ghost" data-timer="${i}">⏲ start timer</button>` : ""}<div>${esc(s.t)}</div></li>`).join("")}</ol>
        <h2>Tips from home cooks</h2>
        <ul>${r.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
    </div>`);
  $("#sv-minus").onclick = () => openRecipe(id, Math.max(1, servings - 1));
  $("#sv-plus").onclick = () => openRecipe(id, servings + 1);
  $("#go-cook").onclick = () => { closeModal(); startCookMode(id); };
  $("#go-plan").onclick = () => addToPlanDialog(id, null, null, servings);
  $("#go-log").onclick = () => logCookDialog(id);
  if ($("#go-missing")) $("#go-missing").onclick = () => {
    for (const i of cov.missing) { const line = `${i.q != null ? fmtQty(i.q * k, i.u) + " " + i.u + " " : ""}${i.n} (for ${r.name})`; if (!state.extras.includes(line)) state.extras.push(line); }
    save(); $("#go-missing").textContent = "✓ Added to grocery list extras";
  };
  $$("[data-timer]").forEach((b) => b.onclick = () => { const s = r.st[+b.dataset.timer]; startTimer(`${r.name}: step ${+b.dataset.timer + 1}`, s.min); });
  $$("[data-skill]").forEach((b) => b.onclick = () => { closeModal(); location.hash = "#skills"; });
  $$("[data-ing]").forEach((a) => a.onclick = (e) => { e.preventDefault(); openIngredient(a.dataset.ing, { recipe: id, servings }); });
  $$(".ing input").forEach((c) => c.onchange = () => c.parentElement.classList.toggle("done", c.checked));
}

// ───────────── TIMERS ─────────────
let timers = [];
let audioCtx;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((t) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.25, audioCtx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.3);
      o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.3);
    });
  } catch {}
}
function startTimer(label, minutes) {
  timers.push({ id: uid(), label, end: Date.now() + minutes * 60000, done: false });
  drawTimers();
}
function drawTimers() {
  $("#timers").innerHTML = timers.map((t) => {
    const left = Math.max(0, Math.round((t.end - Date.now()) / 1000));
    return `<div class="timer ${t.done ? "done" : ""}"><div><div class="small">${esc(t.label)}</div>
      <div class="t">${t.done ? "Done!" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`}</div></div>
      <button data-kill="${t.id}" title="Dismiss">✕</button></div>`;
  }).join("");
  $$("[data-kill]").forEach((b) => b.onclick = () => { timers = timers.filter((t) => t.id !== b.dataset.kill); drawTimers(); });
}
setInterval(() => {
  if (!timers.length) return;
  for (const t of timers) if (!t.done && Date.now() >= t.end) { t.done = true; beep(); }
  if (timers.some((t) => t.done && !t.beeped)) timers.forEach((t) => { if (t.done) t.beeped = true; });
  drawTimers();
}, 1000);

// ───────────── COOK MODE ─────────────
let wakeLock = null;
function startCookMode(id, idx = 0) {
  const r = BY_ID[id];
  const el = $("#cookmode");
  el.classList.remove("hidden");
  if (navigator.wakeLock && !wakeLock) navigator.wakeLock.request("screen").then((w) => (wakeLock = w)).catch(() => {});
  const s = r.st[idx];
  el.innerHTML = `
    <div class="top"><b>${r.flag} ${r.name}</b><span class="spacer"></span>
      <button class="btn" id="cm-ing">Ingredients</button><button class="btn" id="cm-exit">✕ Exit</button></div>
    <div class="ingpanel hidden" id="cm-ingpanel" style="display:none;margin-top:12px">${r.ing.map((i) => `${fmtQty(i.q, i.u)} ${i.u} ${esc(i.n)}`).join("<br>")}</div>
    <div class="stepbig">
      <div class="progress"><div style="width:${((idx + 1) / r.st.length) * 100}%"></div></div>
      <div class="stepnum" style="margin-top:20px">STEP ${idx + 1} OF ${r.st.length} · ${s.active ? "HANDS-ON" : "HANDS-OFF — go prep the next thing or clean up"} · ${s.min >= 240 ? "overnight" : fmtMin(s.min)}</div>
      <div class="steptext">${esc(s.t)}</div>
      ${idx + 1 < r.st.length ? `<div class="muted" style="color:#a99">Next: ${esc(r.st[idx + 1].t.slice(0, 120))}${r.st[idx + 1].t.length > 120 ? "…" : ""}</div>` : ""}
      <div class="row" style="margin-top:28px">
        <button class="btn" id="cm-prev" ${idx === 0 ? "disabled" : ""}>← Back</button>
        ${s.min > 0 && s.min < 240 ? `<button class="btn" id="cm-timer">⏲ Timer ${fmtMin(s.min)}</button>` : ""}
        <span class="spacer"></span>
        ${idx + 1 < r.st.length ? `<button class="btn primary" id="cm-next">Next step →</button>` : `<button class="btn primary" id="cm-done">✓ Finished — log it</button>`}
      </div>
    </div>`;
  const exit = () => { el.classList.add("hidden"); if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } };
  $("#cm-exit").onclick = exit;
  $("#cm-ing").onclick = () => { const p = $("#cm-ingpanel"); p.style.display = p.style.display === "none" ? "block" : "none"; };
  if ($("#cm-prev")) $("#cm-prev").onclick = () => startCookMode(id, idx - 1);
  if ($("#cm-next")) $("#cm-next").onclick = () => startCookMode(id, idx + 1);
  if ($("#cm-timer")) $("#cm-timer").onclick = () => startTimer(`${r.name}: step ${idx + 1}`, s.min);
  if ($("#cm-done")) $("#cm-done").onclick = () => { exit(); logCookDialog(id); };
}

// ───────────── JOURNAL / LOG ─────────────
function logCookDialog(id) {
  const r = BY_ID[id];
  let rating = 4;
  openModal(`
    <h2 style="margin-top:0">✓ Log: ${r.name}</h2>
    <p class="muted small">Reflecting after each cook is the fastest way to improve. Your notes show up the next time you open this recipe.</p>
    <label class="field">Date<input type="date" id="lg-date" value="${ymd(new Date())}"></label>
    <label class="field">How did it turn out?<div class="star-input" id="lg-stars"></div></label>
    <label class="field">What went well?<textarea id="lg-good" placeholder="e.g. broth was really clear this time"></textarea></label>
    <label class="field">What will you change next time?<textarea id="lg-next" placeholder="e.g. less sugar, char the onions longer, start rice earlier"></textarea></label>
    <button class="btn primary" id="lg-save">Save to journal</button>`, true);
  const drawStars = () => { $("#lg-stars").innerHTML = [1, 2, 3, 4, 5].map((n) => `<button data-n="${n}" class="${n <= rating ? "on" : ""}">★</button>`).join(""); $$("#lg-stars button").forEach((b) => b.onclick = (e) => { e.preventDefault(); rating = +b.dataset.n; drawStars(); }); };
  drawStars();
  $("#lg-save").onclick = () => {
    state.journal.push({ id: uid(), recipeId: id, date: $("#lg-date").value, rating, good: $("#lg-good").value.trim(), next: $("#lg-next").value.trim() });
    save(); closeModal(); route();
  };
}

function renderJournal() {
  const entries = [...state.journal].sort((a, b) => b.date.localeCompare(a.date));
  const cooked = cookedIds();
  const countriesCooked = new Set([...cooked].map((id) => BY_ID[id]?.country));
  const countries = Object.keys(window.FLAGS).filter((c) => c !== "Basics");
  $("#view").innerHTML = `
    <h1>Cooking Journal</h1>
    <p class="sub">${state.journal.length} cooks logged · ${cooked.size} different dishes · ${[...countriesCooked].filter((c) => c !== "Basics").length}/${countries.length} countries</p>
    <h2>🛂 Culinary passport</h2>
    <div class="stamps">${countries.map((c) => `<div class="stamp ${countriesCooked.has(c) ? "on" : ""}"><div><span class="f fl">${window.FLAGS[c]}</span>${c}</div></div>`).join("")}</div>
    <h2>Entries</h2>
    ${entries.length ? entries.map((j) => { const r = BY_ID[j.recipeId]; return r ? `
      <div class="card" style="margin-bottom:10px"><div class="row"><b>${r.flag} ${r.name}</b><span class="stars">${"★".repeat(j.rating)}${"☆".repeat(5 - j.rating)}</span>
        <span class="muted small">${j.date}</span><span class="spacer"></span><button class="btn sm" data-open="${r.id}">Open recipe</button><button class="btn sm ghost" data-del="${j.id}">🗑</button></div>
        ${j.good ? `<div class="small">👍 ${esc(j.good)}</div>` : ""}${j.next ? `<div class="small">🔁 Next time: ${esc(j.next)}</div>` : ""}</div>` : ""; }).join("")
      : `<div class="empty">No cooks logged yet. Open a recipe and hit “I cooked this” after you make it.</div>`}`;
  $$("[data-open]").forEach((b) => b.onclick = () => openRecipe(b.dataset.open));
  $$("[data-del]").forEach((b) => b.onclick = () => { if (confirm("Delete this journal entry?")) { state.journal = state.journal.filter((j) => j.id !== b.dataset.del); save(); renderJournal(); } });
  $("#view").insertAdjacentHTML("beforeend", `
    <h2>💾 Your data</h2>
    <div class="box small">Everything (plan, pantry, journal, freezer, grocery extras) is stored only in this browser on this device.
      Make a backup file to keep it safe or move it to another device (e.g. your phone), then use “Restore” there.
      <div class="row" style="margin-top:10px"><button class="btn" id="bk-export">⬇ Download backup</button>
      <label class="btn">⬆ Restore from backup<input type="file" id="bk-import" accept=".json,application/json" hidden></label></div></div>`);
  $("#bk-export").onclick = exportBackup;
  $("#bk-import").onchange = (e) => e.target.files[0] && importBackup(e.target.files[0]);
}

// ───────────── BACKUP / RESTORE ─────────────
const BACKUP_KEYS = ["plan", "journal", "freezer", "shopChecks", "extras", "settings", "pantry"];
function exportBackup() {
  const data = { app: "world-kitchen", version: 1, exported: new Date().toISOString(), prepStart: store.get("prepStart", "10:00") };
  for (const k of BACKUP_KEYS) data[k] = state[k];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: "application/json" }));
  a.download = `world-kitchen-backup-${ymd(new Date())}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(reader.result); } catch { return alert("That file isn't a valid backup."); }
    if (data.app !== "world-kitchen") return alert("That file isn't a World Kitchen backup.");
    const summary = `${(data.plan || []).length} planned meals, ${(data.journal || []).length} journal entries, ${Object.keys(data.pantry || {}).length} pantry items`;
    if (!confirm(`Restore backup from ${String(data.exported).slice(0, 10)}?\n${summary}\n\nThis replaces the data currently on this device.`)) return;
    for (const k of BACKUP_KEYS) if (data[k] !== undefined) state[k] = data[k];
    if (data.prepStart) store.set("prepStart", data.prepStart);
    save(); route(); alert("Restored ✓");
  };
  reader.readAsText(file);
}

// ───────────── OFFLINE / INSTALL (PWA) ─────────────
function updateNet() {
  const el = $("#net"); if (!el) return;
  const ready = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
  if (!navigator.onLine) { el.className = "chip offline"; el.textContent = ready ? "⚡ Offline — all good" : "⚡ Offline"; }
  else { el.className = "chip " + (ready ? "ready" : ""); el.textContent = ready ? "✓ Works offline" : location.protocol === "file:" ? "Open via start.cmd for offline mode" : "Online"; }
}
window.addEventListener("online", updateNet);
window.addEventListener("offline", updateNet);
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").then(() => navigator.serviceWorker.ready).then(updateNet).catch((e) => console.warn("SW failed", e));
  // A new version was downloaded in the background: offer a one-tap reload.
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return updateNet();
    const el = $("#net");
    el.className = "chip ready"; el.style.cursor = "pointer";
    el.textContent = "↻ Update ready — tap to reload";
    el.onclick = () => location.reload();
  });
}
let installPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installPrompt = e; $("#install").classList.remove("hidden"); });
window.addEventListener("appinstalled", () => $("#install").classList.add("hidden"));
$("#install").onclick = async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; $("#install").classList.add("hidden"); };
updateNet();

// ───────────── SKILLS ─────────────
function renderSkills() {
  const counts = skillCounts(), cooked = cookedIds();
  $("#view").innerHTML = `
    <h1>Skills</h1>
    <p class="sub">Every recipe trains specific techniques. Cook 5 dishes that use a skill to reach “Confident”. Start with the level-1 skills.</p>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">
    ${[...window.SKILLS].sort((a, b) => a.level - b.level).map((s) => {
      const n = counts[s.id] || 0;
      const rs = RECIPES.filter((r) => r.skills.includes(s.id)).sort((a, b) => a.difficulty - b.difficulty);
      return `<div class="card">
        <div class="row"><h3 style="margin:0">${s.name}</h3><span class="spacer"></span><span class="chip diff-${s.level}">Lv ${s.level}</span></div>
        <div class="small muted">${skillLevel(n)} · ${n}/5 dishes</div>
        <div class="bar"><div style="width:${Math.min(100, n * 20)}%"></div></div>
        <p class="small">${s.why}</p>
        <b class="small">How</b><ul class="small">${s.how.map((h) => `<li>${h}</li>`).join("")}</ul>
        <b class="small">Common mistakes</b><ul class="small">${s.mistakes.map((h) => `<li>${h}</li>`).join("")}</ul>
        <b class="small">Practice with</b><div>${rs.map((r) => `<span class="chip click ${cooked.has(r.id) ? "diff-1" : ""}" data-open="${r.id}">${cooked.has(r.id) ? "✓ " : ""}${r.flag} ${r.name}</span>`).join("")}</div>
      </div>`; }).join("")}
    </div>`;
  $$("[data-open]").forEach((b) => b.onclick = () => openRecipe(b.dataset.open));
}

// ───────────── PLAN ─────────────
const weekStart = () => addDays(mondayOf(new Date()), state.weekOffset * 7);
const weekDates = () => Array.from({ length: 7 }, (_, i) => ymd(addDays(weekStart(), i)));
const slotEntries = (date, meal) => state.plan.filter((p) => p.date === date && p.meal === meal);

function addToPlanDialog(recipeId, date, meal, servings) {
  const days = Array.from({ length: 21 }, (_, i) => addDays(new Date(), i - 0));
  const pickRecipe = !recipeId;
  const r = recipeId ? BY_ID[recipeId] : null;
  const hh = state.settings.household;
  openModal(`
    <h2 style="margin-top:0">📅 Add to plan</h2>
    ${pickRecipe ? `<label class="field">Recipe<select id="ap-recipe">${[...RECIPES].sort((a, b) => a.name.localeCompare(b.name)).map((x) => `<option value="${x.id}">${x.flag} ${x.name} — ${fmtMin(x.totalMin)}</option>`).join("")}</select></label>` : `<p><b>${r.flag} ${r.name}</b></p>`}
    <div class="row"><label class="field">Cook on<select id="ap-date">${days.map((d) => `<option value="${ymd(d)}" ${ymd(d) === date ? "selected" : ""}>${dayLabel(d)}</option>`).join("")}</select></label>
    <label class="field">Meal<select id="ap-meal">${MEALS.map((m) => `<option ${m === meal ? "selected" : ""}>${m}</option>`).join("")}</select></label>
    <label class="field">Servings to cook<input type="number" id="ap-serv" min="1" value="${servings || (r ? r.servings : 4)}" style="width:90px"></label></div>
    <label class="row small"><input type="checkbox" id="ap-left" checked> Auto-schedule leftovers into upcoming meals (you eat ${hh} portion${hh > 1 ? "s" : ""} per meal)</label>
    <label class="row small" style="margin-top:6px"><input type="checkbox" id="ap-spread" checked> Spread them out — max once per day</label>
    <p class="small muted" id="ap-preview"></p>
    <button class="btn primary" id="ap-save">Add</button>`, true);
  const preview = () => {
    const rr = BY_ID[pickRecipe ? $("#ap-recipe").value : recipeId];
    if (pickRecipe && document.activeElement === $("#ap-recipe")) $("#ap-serv").value = rr.servings;
    const portions = Math.floor(+$("#ap-serv").value / hh);
    $("#ap-preview").textContent = `${portions} meal${portions !== 1 ? "s" : ""} from one cook · ${fmtMin(rr.activeMin)} hands-on · keeps ${rr.store.fridge} day(s) in fridge${rr.store.freeze ? `, ${rr.store.freeze} months frozen` : ""}.`;
  };
  ["#ap-serv", "#ap-recipe"].forEach((s) => $(s) && $(s).addEventListener("input", preview));
  preview();
  $("#ap-save").onclick = () => {
    const rid = pickRecipe ? $("#ap-recipe").value : recipeId;
    const msg = scheduleCook(rid, $("#ap-date").value, $("#ap-meal").value, +$("#ap-serv").value, $("#ap-left").checked, $("#ap-spread").checked);
    closeModal();
    location.hash = "#plan"; route();
    if (msg) setTimeout(() => alert(msg), 50);
  };
}

function scheduleCook(recipeId, date, meal, servings, fillLeftovers, spread) {
  const r = BY_ID[recipeId], hh = state.settings.household;
  const cook = { id: uid(), date, meal, recipeId, servings, type: "cook" };
  state.plan.push(cook);
  let left = Math.floor(servings / hh) - 1;
  let msg = "";
  if (fillLeftovers && left > 0) {
    const lastDay = addDays(parseYmd(date), Math.max(0, r.store.fridge - 1));
    let d = parseYmd(date), mi = MEALS.indexOf(meal) + 1;
    const usedDays = new Set([date]);
    while (left > 0 && d <= lastDay) {
      if (mi >= MEALS.length) { mi = 0; d = addDays(d, 1); continue; }
      const ds = ymd(d), m = MEALS[mi];
      if (d > lastDay) break;
      if (!slotEntries(ds, m).length && !(spread && usedDays.has(ds))) {
        state.plan.push({ id: uid(), date: ds, meal: m, recipeId, servings: hh, type: "leftover", parent: cook.id });
        usedDays.add(ds); left--;
      }
      mi++;
    }
    if (left > 0) {
      if (r.store.freeze) {
        state.freezer.push({ id: uid(), recipeId, portions: left, date });
        msg = `${left} extra portion(s) of ${r.name} added to your freezer inventory.`;
      } else msg = `${left} extra portion(s) of ${r.name} won't fit before it spoils (${r.store.fridge}-day fridge life) and it doesn't freeze well — consider cooking fewer servings.`;
    }
  }
  save();
  return msg;
}

function renderPlan() {
  const dates = weekDates(), today = ymd(new Date());
  const inWeek = state.plan.filter((p) => dates.includes(p.date));
  const cooks = inWeek.filter((p) => p.type === "cook");
  const meals = inWeek.length;
  const handsOn = cooks.reduce((a, p) => a + BY_ID[p.recipeId].activeMin, 0);
  const total = cooks.reduce((a, p) => a + BY_ID[p.recipeId].totalMin, 0);
  const ws = weekStart();
  $("#view").innerHTML = `
    <div class="row"><h1>Meal Plan</h1><span class="spacer"></span>
      <label class="small muted">Portions per meal <input type="number" min="1" id="hh" value="${state.settings.household}" style="width:64px"></label></div>
    <p class="sub">Cook once, eat several times. Batch recipes automatically fill upcoming meals with leftovers (green) based on how long they keep.</p>
    <div class="row">
      <button class="btn" id="wk-prev">←</button><b>${dayLabel(ws)} – ${dayLabel(addDays(ws, 6))}</b><button class="btn" id="wk-next">→</button>
      ${state.weekOffset ? `<button class="btn sm" id="wk-today">This week</button>` : ""}
      <span class="spacer"></span>
      <button class="btn" id="auto-plan">✨ Auto-plan my week</button>
      <button class="btn primary" id="add-any">+ Add recipe</button>
    </div>
    <div class="summary">
      <div class="stat"><div class="k">Cooking sessions</div><div class="v">${cooks.length}</div></div>
      <div class="stat"><div class="k">Meals covered</div><div class="v">${meals} / 14</div></div>
      <div class="stat"><div class="k">Hands-on time</div><div class="v">${fmtMin(handsOn)}</div></div>
      <div class="stat"><div class="k">Avg hands-on per meal</div><div class="v">${meals ? fmtMin(handsOn / meals) : "—"}</div></div>
      <div class="stat"><div class="k">Total elapsed</div><div class="v">${fmtMin(total)}</div></div>
    </div>
    <div class="week">
      <div></div>${dates.map((d) => `<div class="h ${d === today ? "today" : ""}">${dayLabel(parseYmd(d))}</div>`).join("")}
      ${MEALS.map((m) => `<div class="lbl">${m[0].toUpperCase() + m.slice(1)}</div>${dates.map((d) => `<div class="cell">
        ${slotEntries(d, m).map((p) => { const r = BY_ID[p.recipeId]; return `<div class="entry ${p.type}" data-open="${r.id}">
          <button class="x" data-rm="${p.id}" title="Remove">×</button>
          ${p.type === "cook" ? "🔥 Cook" : p.type === "leftover" ? "♻️ Leftover" : "🧊 Freezer"}: <b>${r.flag} ${r.name}</b>
          ${p.type === "cook" ? `<div class="muted">${p.servings} servings · ${fmtMin(r.activeMin)} hands-on</div>` : ""}</div>`; }).join("")}
        <button class="add-slot" data-add="${d}|${m}">+</button></div>`).join("")}`).join("")}
    </div>
    <div class="row" style="margin-top:16px">
      <a class="btn" href="#shop">🛒 Grocery list for this week</a>
      <a class="btn" href="#prep">⏱ Plan a batch-prep session</a>
      <button class="btn ghost" id="clear-week">Clear week</button>
    </div>
    <h2>🧊 Freezer inventory</h2>
    ${state.freezer.length ? state.freezer.map((f) => { const r = BY_ID[f.recipeId]; return `<div class="shop-item"><b>${r.flag} ${r.name}</b>
      <span class="muted small">${f.portions} portion(s) · frozen ${f.date} · use within ${r.store.freeze} mo</span>
      <span class="spacer"></span><button class="btn sm" data-thaw="${f.id}">Schedule a portion</button><button class="btn sm ghost" data-fdel="${f.id}">🗑</button></div>`; }).join("")
      : `<p class="muted small">Empty. Extra portions from batch cooks that don't fit before spoiling land here automatically.</p>`}`;
  $("#hh").onchange = (e) => { state.settings.household = Math.max(1, +e.target.value || 1); save(); };
  $("#wk-prev").onclick = () => { state.weekOffset--; renderPlan(); };
  $("#wk-next").onclick = () => { state.weekOffset++; renderPlan(); };
  if ($("#wk-today")) $("#wk-today").onclick = () => { state.weekOffset = 0; renderPlan(); };
  $("#add-any").onclick = () => addToPlanDialog(null, dates.includes(today) ? today : dates[0], "dinner");
  $("#auto-plan").onclick = autoPlanDialog;
  $("#clear-week").onclick = () => { if (confirm("Remove all meals from this week?")) { state.plan = state.plan.filter((p) => !dates.includes(p.date)); save(); renderPlan(); } };
  $$("[data-add]").forEach((b) => b.onclick = () => { const [d, m] = b.dataset.add.split("|"); addToPlanDialog(null, d, m); });
  $$("[data-rm]").forEach((b) => b.onclick = (e) => {
    e.stopPropagation();
    const id = b.dataset.rm;
    state.plan = state.plan.filter((p) => p.id !== id && p.parent !== id);
    save(); renderPlan();
  });
  $$(".entry[data-open]").forEach((el) => el.onclick = () => openRecipe(el.dataset.open));
  $$("[data-fdel]").forEach((b) => b.onclick = () => { state.freezer = state.freezer.filter((f) => f.id !== b.dataset.fdel); save(); renderPlan(); });
  $$("[data-thaw]").forEach((b) => b.onclick = () => {
    const f = state.freezer.find((x) => x.id === b.dataset.thaw);
    const slot = dates.flatMap((d) => MEALS.map((m) => [d, m])).find(([d, m]) => d >= today && !slotEntries(d, m).length);
    if (!slot) return alert("No empty slot left this week.");
    state.plan.push({ id: uid(), date: slot[0], meal: slot[1], recipeId: f.recipeId, servings: state.settings.household, type: "freezer" });
    f.portions--; if (f.portions <= 0) state.freezer = state.freezer.filter((x) => x !== f);
    save(); renderPlan();
  });
}

// Auto-planner: picks a few batch-friendly recipes with varied cuisines that fit your time budget,
// cooks them on the days you choose, and fills the rest of the week with leftovers.
function autoPlanDialog() {
  openModal(`
    <h2 style="margin-top:0">✨ Auto-plan my week</h2>
    <p class="small muted">Builds a cook-once-eat-several-times plan for the week shown. Existing meals stay.</p>
    <label class="field">Cooking days<div class="row">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => `<label class="small"><input type="checkbox" data-day="${i}" ${[0, 3, 6].includes(i) ? "checked" : ""}> ${d}</label>`).join("")}</div></label>
    <label class="field">Max difficulty<select id="au-diff">${[1, 2, 3].map((d) => `<option value="${d}" ${d === 2 ? "selected" : ""}>${DIFF[d]}</option>`).join("")}</select></label>
    <label class="field">Max hands-on time per cook<select id="au-time">${[20, 30, 45, 60, 90].map((t) => `<option value="${t}" ${t === 45 ? "selected" : ""}>${t} min</option>`).join("")}</select></label>
    <label class="row small"><input type="checkbox" id="au-veg"> Vegetarian only</label>
    <button class="btn primary" id="au-go" style="margin-top:12px">Build plan</button>`, true);
  $("#au-go").onclick = () => {
    const days = $$("[data-day]").filter((c) => c.checked).map((c) => +c.dataset.day);
    const maxD = +$("#au-diff").value, maxT = +$("#au-time").value, veg = $("#au-veg").checked;
    const pool = RECIPES.filter((r) => r.difficulty <= maxD && r.activeMin <= maxT && r.servings >= 4 && r.store.fridge >= 2 && r.country !== "Basics"
      && (!veg || r.tags.some((t) => t.startsWith("veg"))))
      .sort(() => Math.random() - 0.5);
    const picked = [], usedCountry = new Set();
    for (const r of pool) { if (picked.length >= days.length) break; if (!usedCountry.has(r.country)) { picked.push(r); usedCountry.add(r.country); } }
    if (!picked.length) return alert("No recipes match those constraints — loosen them a bit.");
    const dates = weekDates(); const msgs = []; const todayS = ymd(new Date());
    days.filter((di) => dates[di] >= todayS).forEach((di, i) => { const r = picked[i]; if (!r) return; const m = scheduleCook(r.id, dates[di], "dinner", r.servings, true, true); if (m) msgs.push(m); });
    closeModal(); renderPlan();
    if (msgs.length) setTimeout(() => alert(msgs.join("\n")), 50);
  };
}

// ───────────── SHOP ─────────────
function buildShoppingList(entries) {
  const items = {};
  for (const p of entries.filter((e) => e.type === "cook")) {
    const r = BY_ID[p.recipeId], k = p.servings / r.servings;
    for (const i of r.ing) {
      const key = i.k + "|" + i.u;
      const it = items[key] || (items[key] = { name: i.n, k: i.k, unit: i.u, aisle: i.a, q: 0, hasQ: false, for: new Set() });
      if (i.q != null) { it.q += i.q * k; it.hasQ = true; }
      it.for.add(r.name);
    }
  }
  return Object.entries(items).map(([key, v]) => ({ key, ...v, for: [...v.for] }));
}

function renderShop() {
  const dates = weekDates(), ws = weekStart();
  const entries = state.plan.filter((p) => dates.includes(p.date));
  const items = buildShoppingList(entries);
  const wkKey = dates[0];
  const checks = state.shopChecks[wkKey] || (state.shopChecks[wkKey] = {});
  const atHome = items.filter((i) => inPantry(i.k));
  const fresh = items.filter((i) => !inPantry(i.k) && FRESH_AISLES.includes(i.aisle));
  const pantry = items.filter((i) => !inPantry(i.k) && !FRESH_AISLES.includes(i.aisle));
  const group = (list) => {
    const by = {};
    for (const i of list) (by[i.aisle] = by[i.aisle] || []).push(i);
    return Object.keys(AISLE_LABEL).filter((a) => by[a]).map((a) => `<div class="shop-group"><h3>${AISLE_LABEL[a]}</h3>
      ${by[a].sort((x, y) => x.name.localeCompare(y.name)).map((i) => `<label class="shop-item ${checks[i.key] ? "done" : ""}">
        <input type="checkbox" data-chk="${esc(i.key)}" ${checks[i.key] ? "checked" : ""}>
        <b>${i.hasQ ? `${fmtQty(i.q, i.unit)} ${i.unit}` : ""}</b> ${esc(i.name)}
        <span class="for">${i.for.map(esc).join(", ")}</span>
        ${FRESH_AISLES.includes(i.aisle) ? "" : `<button class="btn sm ghost" data-have="${esc(i.k)}" title="I already have this — remember it">🏠</button>`}</label>`).join("")}</div>`).join("");
  };
  const cooks = entries.filter((e) => e.type === "cook");
  $("#view").innerHTML = `
    <div class="row"><h1>Grocery List</h1><span class="spacer"></span>
      <button class="btn" id="wk-prev">←</button><b>${dayLabel(ws)} – ${dayLabel(addDays(ws, 6))}</b><button class="btn" id="wk-next">→</button></div>
    <p class="sub">Combined and scaled from the ${cooks.length} cooking session(s) in your plan. Leftover and freezer meals need no shopping.</p>
    ${cooks.length ? `
    <div class="row"><button class="btn primary" id="copy">📋 Copy list</button><button class="btn" id="uncheck">Uncheck all</button>
      <span class="muted small">Tip: buy fresh herbs & seafood within 1–2 days of the cook date.</span></div>
    <div class="two" style="margin-top:12px">
      <div><h2>🛒 Buy fresh</h2>${group(fresh) || "<p class='muted'>Nothing.</p>"}</div>
      <div><h2>🥫 Staples to buy</h2><p class="small muted">Long-lasting items not in your <a href="#pantry">pantry</a> yet. Already have one? Tap 🏠 to remember it.</p>${group(pantry) || "<p class='muted'>Nothing — your pantry covers it.</p>"}</div>
    </div>
    <div class="row" style="margin-top:8px"><button class="btn" id="to-pantry">🏠 Put checked staples in my pantry</button></div>
    ${atHome.length ? `<h2>✓ Already at home (${atHome.length})</h2><p class="small muted">Skipped because they're in your pantry. Running low? Tap to put it back on the list.</p>
      <div>${atHome.sort((a, b) => a.name.localeCompare(b.name)).map((i) => `<span class="chip click diff-1" data-need="${esc(i.k)}" title="Running low — add back to list">✓ ${esc(i.name)}</span>`).join("")}</div>` : ""}
    <h2>➕ Extra items</h2>
    <div class="row"><input id="extra" placeholder="e.g. coffee, dish soap"><button class="btn" id="add-extra">Add</button></div>
    <div style="margin-top:8px">${state.extras.map((x, i) => `<label class="shop-item"><input type="checkbox" data-xdel="${i}"> ${esc(x)}</label>`).join("")}</div>
    <h2>📅 When to shop</h2>
    <div class="box">${shopTiming(cooks)}</div>`
    : `<div class="empty">No cooking sessions planned this week. <a href="#plan">Plan some meals</a> and the list builds itself.</div>`}`;
  $("#wk-prev").onclick = () => { state.weekOffset--; renderShop(); };
  $("#wk-next").onclick = () => { state.weekOffset++; renderShop(); };
  $$("[data-chk]").forEach((c) => c.onchange = () => { checks[c.dataset.chk] = c.checked; c.parentElement.classList.toggle("done", c.checked); save(); });
  if (!cooks.length) return;
  $("#uncheck").onclick = () => { state.shopChecks[wkKey] = {}; save(); renderShop(); };
  $$("[data-have]").forEach((b) => b.onclick = (e) => { e.preventDefault(); addToPantry(b.dataset.have); save(); renderShop(); });
  $$("[data-need]").forEach((b) => b.onclick = () => { delete state.pantry[b.dataset.need]; save(); renderShop(); });
  $("#to-pantry").onclick = () => {
    const bought = pantry.filter((i) => checks[i.key]);
    if (!bought.length) return alert("Tick the staples you bought first.");
    bought.forEach((i) => addToPantry(i.k)); save(); renderShop();
  };
  $("#add-extra").onclick = () => { const v = $("#extra").value.trim(); if (v) { state.extras.push(v); save(); renderShop(); } };
  $$("[data-xdel]").forEach((c) => c.onchange = () => { state.extras.splice(+c.dataset.xdel, 1); save(); renderShop(); });
  $("#copy").onclick = () => {
    const lines = ["BUY FRESH", ...fresh.filter((i) => !checks[i.key]).map((i) => `- ${i.hasQ ? fmtQty(i.q, i.unit) + " " + i.unit + " " : ""}${i.name}`),
      "", "STAPLES", ...pantry.filter((i) => !checks[i.key]).map((i) => `- ${i.hasQ ? fmtQty(i.q, i.unit) + " " + i.unit + " " : ""}${i.name}`),
      ...(state.extras.length ? ["", "EXTRAS", ...state.extras.map((x) => "- " + x)] : [])];
    navigator.clipboard.writeText(lines.join("\n")).then(() => { $("#copy").textContent = "✓ Copied"; });
  };
}

function shopTiming(cooks) {
  const sorted = [...cooks].sort((a, b) => a.date.localeCompare(b.date));
  const perishable = sorted.filter((p) => BY_ID[p.recipeId].ing.some((i) => i.a === "seafood" || /herb|basil|cilantro|mint|bean sprouts|perilla/i.test(i.n)));
  let html = `<b>Main shop:</b> the day before or morning of ${dayLabel(parseYmd(sorted[0].date))}.`;
  const late = perishable.filter((p) => (parseYmd(p.date) - parseYmd(sorted[0].date)) / 864e5 >= 3);
  if (late.length) html += `<br><b>Top-up shop</b> for fresh herbs/seafood before: ${late.map((p) => `${BY_ID[p.recipeId].name} (${dayLabel(parseYmd(p.date))})`).join(", ")}.`;
  const adv = sorted.filter((p) => BY_ID[p.recipeId].advance.length);
  if (adv.length) html += `<br><b>Night-before prep:</b> ${adv.map((p) => `${BY_ID[p.recipeId].name} — ${BY_ID[p.recipeId].advance.map((s) => s.t).join(" ")}`).join("<br>")}`;
  return html;
}

// ───────────── BATCH PREP (parallel scheduler) ─────────────
// One cook, many dishes: hands-on steps can't overlap; hands-off steps (simmering, marinating) run in parallel.
// Greedy list scheduling: whenever your hands are free, do the available hands-on step from the dish
// with the most remaining work (critical path first).
function schedule(recipes) {
  const jobs = recipes.map((r, i) => ({ i, r, steps: r.st.filter((s) => s.min < 240), idx: 0, ready: 0 }));
  const remaining = (j) => j.steps.slice(j.idx).reduce((a, s) => a + s.min, 0);
  const out = []; let hands = 0;
  for (let guard = 0; guard < 1000 && jobs.some((j) => j.idx < j.steps.length); guard++) {
    for (const j of jobs) while (j.idx < j.steps.length && !j.steps[j.idx].active) {
      const s = j.steps[j.idx]; out.push({ j, s, start: j.ready, end: j.ready + s.min }); j.ready += s.min; j.idx++;
    }
    const cands = jobs.filter((j) => j.idx < j.steps.length);
    if (!cands.length) break;
    const avail = cands.filter((j) => j.ready <= hands);
    const pick = avail.length ? avail.sort((a, b) => remaining(b) - remaining(a))[0] : cands.sort((a, b) => a.ready - b.ready || remaining(b) - remaining(a))[0];
    const s = pick.steps[pick.idx], start = Math.max(pick.ready, hands);
    out.push({ j: pick, s, start, end: start + s.min }); hands = start + s.min; pick.ready = hands; pick.idx++;
  }
  return out;
}

let prepSelection = null;
function renderPrep() {
  const dates = weekDates();
  if (!prepSelection) {
    const weekCooks = [...new Set(state.plan.filter((p) => dates.includes(p.date) && p.type === "cook").map((p) => p.recipeId))];
    prepSelection = weekCooks.length ? weekCooks.slice(0, 4) : ["rice", "chana-masala", "tinga"];
  }
  const sel = prepSelection.map((id) => BY_ID[id]).filter(Boolean);
  const sched = sel.length ? schedule(sel) : [];
  const makespan = Math.max(1, ...sched.map((x) => x.end));
  const sequential = sel.reduce((a, r) => a + r.totalMin, 0);
  const handsOn = sel.reduce((a, r) => a + r.activeMin, 0);
  const startEl = store.get("prepStart", "10:00");
  const [sh, sm] = startEl.split(":").map(Number);
  const clock = (m) => { const t = sh * 60 + sm + Math.round(m); return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; };
  const colors = ["#c8553d", "#3f8f5b", "#3a6fb2", "#c98a1c", "#8a4fb2", "#2f8f8f"];
  const advance = sel.filter((r) => r.advance.length);
  $("#view").innerHTML = `
    <h1>Batch Prep Session</h1>
    <p class="sub">Pick several dishes to cook in one session. The planner interleaves them so you use simmering and marinating time to work on the next dish — one person, one kitchen.</p>
    <div class="row">
      <select id="pp-add"><option value="">+ Add a dish…</option>${[...RECIPES].sort((a, b) => a.name.localeCompare(b.name)).filter((r) => !prepSelection.includes(r.id)).map((r) => `<option value="${r.id}">${r.flag} ${r.name} (${fmtMin(r.totalMin)})</option>`).join("")}</select>
      <button class="btn" id="pp-week">Use this week's planned cooks</button>
      <span class="spacer"></span><label class="small muted">Start at <input type="time" id="pp-start" value="${startEl}"></label>
    </div>
    <div style="margin:12px 0">${sel.map((r, i) => `<span class="chip" style="background:${colors[i % 6]};color:#fff">${r.flag} ${r.name} <a href="#" data-prm="${r.id}" style="color:#fff;text-decoration:none">✕</a></span>`).join("")}</div>
    ${sel.length ? `
    <div class="summary">
      <div class="stat"><div class="k">One after another</div><div class="v">${fmtMin(sequential)}</div></div>
      <div class="stat"><div class="k">Interleaved</div><div class="v" style="color:var(--green)">${fmtMin(makespan)}</div></div>
      <div class="stat"><div class="k">Time saved</div><div class="v">${fmtMin(Math.max(0, sequential - makespan))}</div></div>
      <div class="stat"><div class="k">Your hands busy</div><div class="v">${fmtMin(handsOn)} (${Math.round((handsOn / makespan) * 100)}%)</div></div>
      <div class="stat"><div class="k">Done at</div><div class="v">${clock(makespan)}</div></div>
    </div>
    ${advance.length ? `<div class="box amber">🌙 <b>Night before:</b> ${advance.map((r) => `${r.name}: ${r.advance.map((s) => esc(s.t)).join(" ")}`).join("<br>")}</div>` : ""}
    <h2>Timeline</h2>
    <div class="small muted" style="margin-bottom:8px"><span class="chip" style="background:var(--accent);color:#fff">hands-on</span><span class="chip" style="background:#9db8db;color:#fff">hands-off (simmer/rest)</span></div>
    <div class="gantt">${sel.map((r, ri) => `<div class="grow"><div class="small"><b>${r.flag} ${r.name}</b></div><div class="gtrack">
      ${sched.filter((x) => x.j.i === ri && x.s.min > 0).map((x) => `<div class="gbar ${x.s.active ? "a" : "p"}" title="${clock(x.start)}–${clock(x.end)} ${esc(x.s.t)}"
        style="left:${(x.start / makespan) * 100}%;width:${Math.max(0.4, (x.s.min / makespan) * 100)}%;${x.s.active ? `background:${colors[ri % 6]}` : ""}">${x.s.min >= 10 ? fmtMin(x.s.min) : ""}</div>`).join("")}
    </div></div>`).join("")}</div>
    <h2>Your step-by-step order</h2>
    <ol class="todo" style="padding-left:20px">${sched.filter((x) => x.s.min > 0 || x.s.active).sort((a, b) => a.start - b.start || b.s.active - a.s.active).map((x) => `
      <li><span class="time">${clock(x.start)}</span><span class="chip" style="background:${colors[x.j.i % 6]};color:#fff">${x.j.r.name}</span>
        ${x.s.active ? "" : `<span class="tag-p">⏳ HANDS-OFF ${fmtMin(x.s.min)} → ends ${clock(x.end)}</span> `}${esc(x.s.t)}</li>`).join("")}</ol>
    <div class="box blue small">💡 <b>Mise en place first:</b> before starting, read every recipe and chop all vegetables for all dishes in one go — the timeline assumes you follow it in order, but grouping identical prep (e.g. all onions at once) saves even more time.</div>`
    : `<div class="empty">Add some dishes to plan a session.</div>`}`;
  $("#pp-add").onchange = (e) => { if (e.target.value) { prepSelection.push(e.target.value); renderPrep(); } };
  $("#pp-week").onclick = () => { prepSelection = [...new Set(state.plan.filter((p) => dates.includes(p.date) && p.type === "cook").map((p) => p.recipeId))]; if (!prepSelection.length) alert("No cooks planned this week yet."); renderPrep(); };
  $("#pp-start").onchange = (e) => { store.set("prepStart", e.target.value); renderPrep(); };
  $$("[data-prm]").forEach((a) => a.onclick = (e) => { e.preventDefault(); prepSelection = prepSelection.filter((id) => id !== a.dataset.prm); renderPrep(); });
}

route();
})();
