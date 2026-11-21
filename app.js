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
// ───────────── nutrition estimate (per serving, ±15%) ─────────────
const NUT = (window.NUTRITION || []).flatMap(([names, k, p, c, f, pc, d]) => names.map((n) => ({ n, k, p, c, f, pc: pc || 0, d: d || 1 })));
const PRODUCE_DEFAULT = { k: 30, p: 1.5, c: 6, f: 0.2, pc: 100, d: 1 };
const SIDES = { rice: { label: "cup of rice", kcal: 260, p: 5 }, bread: { label: "bread / injera / tortillas", kcal: 220, p: 7 } };
// grams of an ingredient line + its nutrition row (null if unknown)
function gramsFor(i) {
  const n = i.n.toLowerCase().replace(/\(.*?\)/g, "");
  let best = null;
  for (const e of NUT) if (n.includes(e.n) && (!best || e.n.length > best.n.length)) best = e;
  if (!best && i.a === "produce") best = PRODUCE_DEFAULT;
  const b = best || { pc: 100, d: 1 };
  const g = i.q == null || isNaN(i.q) ? 0 : !i.u ? i.q * (b.pc || 100) : i.q * (window.UNIT_GRAMS[i.u] ?? 50) * (window.LIQUID_UNITS.includes(i.u) ? b.d : 1);
  return { g, best };
}
function estimateNutrition(r) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  for (const i of r.ing) {
    const { g: grams, best } = gramsFor(i);
    i.grams = grams;
    if (!grams || i.a === "spice" || !best) continue;
    let g = grams;
    for (const [re, fr] of window.EATEN_FRACTION || []) if (re.test(i.n)) { g *= fr; break; }
    t.kcal += best.k * g / 100; t.p += best.p * g / 100; t.c += best.c * g / 100; t.f += best.f * g / 100;
  }
  for (const k in t) t[k] = Math.round(t[k] / r.servings);
  return t;
}

// ───────────── cost estimate (local currency) ─────────────
const PRICE_ROWS = (window.PRICES || []).flatMap(([names, usd]) => names.map((n) => ({ n, usd })));
function usdPerKg(name) {
  const n = name.toLowerCase().replace(/\(.*?\)/g, "");
  let best = null;
  for (const e of PRICE_ROWS) if (n.includes(e.n) && (!best || e.n.length > best.n.length)) best = e;
  return best ? best.usd : null;
}
const priceLevel = () => +(state.settings.priceLevel || 1);
const currency = () => state.settings.currency || "$";
function fmtMoney(x) { x = +x || 0; return `${currency()}${x >= 100 ? Math.round(x).toLocaleString() : x.toFixed(2)}`; }
// local price per kg for an ingredient key/name (your override wins)
function pricePerKg(k, name, aisle) {
  const o = state.settings.prices?.[k];
  if (o != null && o !== "") return +o;
  return (usdPerKg(name) ?? window.AISLE_PRICE?.[aisle] ?? 4) * priceLevel();
}
function lineCost(i, grams) {
  if (i.a === "spice") return (window.SPICE_LINE_COST || 0.15) * priceLevel();
  return pricePerKg(i.k, i.n, i.a) * (grams ?? i.grams ?? 0) / 1000;
}
const recipeCost = (r) => r.ing.reduce((a, i) => a + lineCost(i), 0) / r.servings;   // per serving
const sideCost = (r) => (r.side === "rice" ? 0.3 : r.side === "bread" ? 0.5 : 0) * priceLevel();
const addonCost = (id) => (SHAKE_BY_ID[id] ? recipeCost(SHAKE_BY_ID[id]) : (window.ADDON_COST?.[id] ?? 0.5) * priceLevel());

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
  r.nut = estimateNutrition(r);
  // starch served alongside but not in the ingredient amounts (e.g. "steamed rice (to serve)")
  const served = r.ing.filter((i) => i.q == null).map((i) => i.n.toLowerCase()).join(" ");
  r.side = /rice/.test(served) ? "rice" : /injera|bread|khobz|tortilla|baguette/.test(served) ? "bread" : null;
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
// Protein shakes: parsed like mini-recipes so nutrition and cost come from their ingredients
const SHAKES = (window.SHAKES || []).map((s) => {
  const r = { ...s, servings: 1 };
  r.ing = s.ingredients.map((line) => { const [q, u, n, a] = line.split("|"); return { q: parseQty(q), u: u || "", n, a: a || "pantry", k: ingKey(n) }; });
  r.nut = estimateNutrition(r);
  return r;
});
const SHAKE_BY_ID = Object.fromEntries(SHAKES.map((s) => [s.id, s]));
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
  favorites: store.get("favorites", []),     // recipe ids you've hearted
  workout: store.get("workout", { equip: "gym", level: "beginner", log: {} }), // training settings + lift log
  goals: store.get("goals", null),         // gain/maintain plan: profile, weekly schedule, prefs, last result, weigh-ins
  weekOffset: 0,
  filters: { q: "", country: "", diff: 0, maxTime: 0, tag: "", sort: "name" },
};
const save = () => { for (const k of ["plan", "journal", "freezer", "shopChecks", "extras", "settings", "pantry", "goals", "workout", "favorites"]) store.set(k, state[k]); };

const isFav = (id) => state.favorites.includes(id);
function toggleFav(id) {
  state.favorites = isFav(id) ? state.favorites.filter((x) => x !== id) : [...state.favorites, id];
  save();
}
const heart = (id) => `<button class="fav-btn ${isFav(id) ? "on" : ""}" data-fav="${id}" title="${isFav(id) ? "Remove from favorites" : "Add to favorites"}" aria-label="Favorite">${isFav(id) ? "♥" : "♡"}</button>`;
function renderDiscoverKeepScroll() { const y = window.scrollY; renderDiscover(); window.scrollTo(0, y); }
// hearts work anywhere (cards, favorites row) without opening the recipe underneath
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-fav]");
  if (!b) return;
  e.stopPropagation(); e.preventDefault();
  toggleFav(b.dataset.fav);
  if ((location.hash || "#discover") === "#discover") renderDiscoverKeepScroll();
  else { b.classList.toggle("on", isFav(b.dataset.fav)); b.textContent = isFav(b.dataset.fav) ? "♥" : "♡"; }
}, true);
const cookedIds = () => new Set(state.journal.map((j) => j.recipeId));
function skillCounts() {
  const counts = {};
  for (const id of cookedIds()) for (const s of BY_ID[id]?.skills || []) counts[s] = (counts[s] || 0) + 1;
  return counts;
}
const skillLevel = (n) => (n >= 5 ? "Confident" : n >= 3 ? "Competent" : n >= 1 ? "Learning" : "Not started");

// ───────────── routing ─────────────
const views = { workouts: renderWorkouts, goals: renderGoals, ingredients: renderIngredients, pantry: renderPantry, discover: renderDiscover, plan: renderPlan, shop: renderShop, prep: renderPrep, skills: renderSkills, journal: renderJournal };
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
  const favs = state.favorites.map((id) => BY_ID[id]).filter(Boolean);
  const tags = ["favorites", "sourced", "batch", "freezer", "quick", "weeknight", "vegetarian", "vegan", "budget", "one pot", "meal prep", "weekend project"];
  const recs = recommend();
  $("#view").innerHTML = `
    <h1>Discover</h1>
    <p class="sub">${RECIPES.length} traditional recipes from ${countries.length - 1} countries — each linked to native-language sources from that country.</p>
    ${favs.length ? `<h2>♥ Your favorites (${favs.length})</h2><div class="favrow">${favs.map((r) => `<div class="favcard" data-open="${r.id}">${heart(r.id)}<span class="fl-big">${r.flag}</span><b>${r.name}</b><span class="small muted">${fmtMin(r.totalMin)} · 🔥 ${r.nut.kcal} kcal · 💵 ${fmtMoney(recipeCost(r))}</span></div>`).join("")}</div>` : ""}
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
      <select id="f-sort">${[["name", "Sort: name"], ["time", "Sort: quickest"], ["active", "Sort: least hands-on"], ["diff", "Sort: easiest"], ["have", "Sort: most ingredients I have"], ["kcal", "Sort: most calories"], ["protein", "Sort: most protein per calorie"], ["cheap", "Sort: cheapest per serving"]].map(([v, l]) => `<option value="${v}" ${f.sort === v ? "selected" : ""}>${l}</option>`).join("")}</select>
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
    (!f.tag || (f.tag === "favorites" ? isFav(r.id) : r.tags.some((t) => t.includes(f.tag)))));
  const sorters = { cheap: (a, b) => recipeCost(a.r) - recipeCost(b.r), protein: (a, b) => b.r.nut.p / b.r.nut.kcal - a.r.nut.p / a.r.nut.kcal, kcal: (a, b) => b.r.nut.kcal - a.r.nut.kcal, name: (a, b) => a.r.name.localeCompare(b.r.name), time: (a, b) => a.r.totalMin - b.r.totalMin, active: (a, b) => a.r.activeMin - b.r.activeMin, diff: (a, b) => a.r.difficulty - b.r.difficulty || a.r.totalMin - b.r.totalMin, have: (a, b) => coverage(a.r).missing.length - coverage(b.r).missing.length };
  list.sort((a, b) => (terms.length > 1 ? b.match - a.match : 0) || sorters[f.sort](a, b));
  $("#grid").innerHTML = list.length ? list.map(({ r, match }) => `
    <div class="card rcard" data-open="${r.id}">
      ${heart(r.id)}${cooked.has(r.id) ? `<span class="badge-cooked">✓ cooked</span>` : ""}
      <div class="flag">${r.flag}</div>
      <div class="name">${r.name}</div>
      <div class="native">${r.native} · ${r.country}</div>
      <div><span class="chip diff-${r.difficulty}">${DIFF[r.difficulty]}</span>${r.sourced ? `<span class="badge-src" title="Researched from local recipe pages">📚 sourced</span> ` : ""}${r.tags.filter((t) => t !== "sourced").slice(0, 3).map((t) => `<span class="chip">${t}</span>`).join("")}</div>
      <div class="meta"><span>⏱ ${fmtMin(r.totalMin)}${r.advance.length ? " + soak" : ""}</span><span>🔪 ${fmtMin(r.activeMin)} hands-on</span><span title="estimated per serving">🔥 ${r.nut.kcal} kcal</span><span title="protein per serving">💪 ${r.nut.p} g</span><span title="estimated cost per serving">💵 ${fmtMoney(recipeCost(r))}</span>${hasPantry ? `<span title="ingredients you have">🏠 ${coverage(r).have}/${r.ing.length}</span>` : ""}
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
      <div class="stat" title="Estimated from the ingredients (±15%)${r.side ? `; add ~${SIDES[r.side].kcal} kcal for the ${SIDES[r.side].label} it's served with` : ""}"><div class="k">Per serving (est.)</div><div class="v">🔥 ${r.nut.kcal} kcal · 💪 ${r.nut.p} g protein</div><div class="small muted">C ${r.nut.c} g · F ${r.nut.f} g${r.side ? ` · + ${SIDES[r.side].label}` : ""}</div></div>
      <div class="stat" title="Estimated from typical prices; set your currency, price level and own prices in Shop"><div class="k">Cost (est.)</div><div class="v">💵 ${fmtMoney(recipeCost(r))} / serving</div><div class="small muted">${fmtMoney(recipeCost(r) * servings)} for ${servings}</div></div>
      <div class="stat"><div class="k">Keeps</div><div class="v">${r.store.fridge ? `${r.store.fridge}d fridge` : "eat fresh"}${r.store.freeze ? ` · ${r.store.freeze}mo freezer` : ""}</div></div>
    </div>
    ${r.advance.length ? `<div class="box amber">🌙 <b>Plan ahead:</b> ${r.advance.map((s) => esc(s.t)).join(" ")}</div>` : ""}
    ${last ? `<div class="box blue">📝 <b>Last time (${last.date}, ${"★".repeat(last.rating)}):</b> ${esc(last.next || last.good || "no notes")}</div>` : ""}
    <div class="row" style="margin:16px 0">
      <button class="btn primary" id="go-cook">▶ Cook mode</button>
      <button class="btn" id="go-plan">📅 Add to plan</button>
      <button class="btn ${isFav(id) ? "fav-on" : ""}" id="go-fav">${isFav(id) ? "♥ Favorite" : "♡ Add to favorites"}</button>
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
  $("#go-fav").onclick = () => { toggleFav(id); openRecipe(id, servings); if (location.hash === "#discover" || !location.hash) renderDiscoverKeepScroll(); };
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

// ───────────── GOALS: calorie-target planner (weight gain / maintain) ─────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ADDON = Object.fromEntries((window.ADDONS || []).map((a) => [a.id, a]));
function defaultGoals() {
  return {
    profile: { sex: "male", age: 25, height: 175, weight: 65, activity: 1.55, goal: 400, custom: 0, proteinPerKg: 1.8 },
    schedule: DAYS.map((d, i) => i < 5
      ? { cook: 20, train: [0, 2, 4].includes(i), trainAt: "18:00", wake: "07:00", b: "home", l: "packed", d: "home" }
      : { cook: 120, train: i === 5, trainAt: "10:30", wake: "09:00", b: "home", l: "home", d: "home" }),
    prefs: { maxDiff: 2, veg: false, extraTrainKcal: 150, week: "this", replace: true },
    result: null, weighIns: [],
  };
}
const goals = () => state.goals || (state.goals = defaultGoals());
const toMin = (t) => { const [h, m] = String(t || "12:00").split(":").map(Number); return h * 60 + m; };
const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.round(m) % 60).padStart(2, "0")}`;
function calcTargets(p = goals().profile) {
  const bmr = Math.round(10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === "male" ? 5 : -161)); // Mifflin–St Jeor
  const tdee = Math.round(bmr * p.activity);
  const target = +p.custom > 0 ? +p.custom : tdee + +p.goal;
  return { bmr, tdee, target, protein: Math.round(p.weight * p.proteinPerKg), perWeek: Math.round(((target - tdee) * 7 / 7700) * 100) / 100 };
}
// food target for a weekday: base target + that day's training & cardio (auto, from Workouts) or a fixed training-day bump
const dayTarget = (i) => calcTargets().target + (state.workout && W().autoKcal ? exerciseKcalForDay(i) : goals().schedule[i].train ? +goals().prefs.extraTrainKcal : 0);
const isMain = (r) => r.country !== "Basics" && r.nut.kcal >= 250 && !r.tags.some((t) => ["condiment", "dip"].includes(t));
const sideKcal = (r) => (r.side ? SIDES[r.side].kcal : 0);
const portionFor = (r, target) => Math.min(2.5, Math.max(0.75, Math.round(((target - sideKcal(r)) / r.nut.kcal) * 4) / 4));
const mealKcal = (r, m) => Math.round(r.nut.kcal * m + sideKcal(r));
const mealP = (r, m) => Math.round(r.nut.p * m + (r.side ? SIDES[r.side].p : 0));

// The builder: batch-cook on days with time, eat leftovers on busy days, quick cooks where there's a little time,
// size portions to the calorie target, then close each day's gap with snacks timed around training.
function buildWeek(costW = 0) {
  const G = goals(), P = G.prefs;
  state.weekOffset = P.week === "next" ? 1 : 0;
  const dates = weekDates(), today = ymd(new Date());
  const days = dates.map((date, i) => ({ date, i, s: G.schedule[i], target: dayTarget(i), active: date >= today }));
  const slots = [];
  for (const d of days) if (d.active) {
    if (d.s.l !== "out") slots.push({ d, meal: "lunch" });
    if (d.s.d !== "out") slots.push({ d, meal: "dinner" });
  }
  const pool = RECIPES.filter((r) => isMain(r) && r.difficulty <= +P.maxDiff && (!P.veg || r.tags.some((t) => t.startsWith("veg"))));
  const usedR = new Set(), usedC = new Set();
  const costOf = new Map(pool.map((r) => [r.id, recipeCost(r)]));
  const avgCost = [...costOf.values()].reduce((s, c) => s + c, 0) / Math.max(1, pool.length) || 1;
  // protein per calorie, batch-friendliness, variety — and, when on a budget, cheaper dishes
  const score = (r) => (r.nut.p / r.nut.kcal) * 100 + (r.tags.includes("batch") ? 2 : 0) + (r.store.freeze ? 1 : 0) + Math.random() * 3 - (usedC.has(r.country) ? 4 : 0) + (P.favs && isFav(r.id) ? 5 : 0) - costW * (costOf.get(r.id) / avgCost);
  const choose = (ok) => {
    const c = pool.filter((r) => !usedR.has(r.id) && ok(r)).map((r) => [r, score(r)]).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (c) { usedR.add(c.id); usedC.add(c.country); }
    return c;
  };
  const assign = new Map(), key = (s) => s.d.date + s.meal;
  const entries = [], sessions = [], notes = [];
  const mealTarget = (d) => Math.round(d.target * 0.32); // lunch & dinner ≈ 32% each; breakfast + snacks fill the rest

  // 1) batch-cook days (≥ 60 min free) cover the following days until the next batch day
  let batchDays = days.filter((d) => d.active && d.s.cook >= 60);
  if (!batchDays.length) {
    const best = days.filter((d) => d.active).sort((a, b) => b.s.cook - a.s.cook)[0];
    if (best && best.s.cook >= 30) batchDays = [best];
    else notes.push("No day has 30+ minutes to cook, so there is no batch-cook session. Give at least one day 60+ minutes for the plan to work well.");
  }
  // Kickoff cook: meals before the week's first batch day (e.g. Mon–Fri when you batch on the weekend)
  // are covered by a batch cooked earlier — the free day just before the week, or the earliest day with some time.
  const firstSlot = slots[0];
  if (firstSlot && firstSlot.d.i < (batchDays[0]?.i ?? 7)) {
    let kick = null;
    if (P.week === "next") {
      const before = G.schedule.map((s, i) => ({ date: ymd(addDays(parseYmd(dates[0]), i - 7)), i: i - 7, s, target: dayTarget(i), active: false, kickoff: true }))
        .filter((d) => d.date >= today && d.s.cook >= 60);
      kick = before[before.length - 1] || null;
    }
    if (!kick) kick = days.filter((d) => d.active && d.i < (batchDays[0]?.i ?? 7) && d.s.cook >= 30).sort((a, b) => b.s.cook - a.s.cook || a.i - b.i)[0] || null;
    if (kick && kick.i > firstSlot.d.i) {
      // the best day comes after some meals: those earlier meals stay uncovered unless that day is the first one
      const earliest = days.find((d) => d.active && d.i === firstSlot.d.i && d.s.cook >= 30);
      if (earliest) kick = earliest;
    }
    if (kick) { batchDays.unshift(kick); if (kick.kickoff) notes.push(`Kickoff batch cook on ${dayLabel(parseYmd(kick.date))} (before the week starts) covers the first weekdays. Its ingredients are on that week’s grocery list.`); }
  }
  batchDays.forEach((b, bi) => {
    const end = bi + 1 < batchDays.length ? batchDays[bi + 1].i : 7;
    const win = slots.filter((s) => s.d.i >= b.i && s.d.i < end && !assign.has(key(s)));
    const groups = [win.filter((s) => s.meal === "lunch"), win.filter((s) => s.meal === "dinner")].filter((g) => g.length);
    const cooked = [];
    for (const g of groups) {
      const span = g[g.length - 1].d.i - b.i + 1;
      const r = choose((r) => r.servings >= 4 && r.activeMin <= b.s.cook * 0.6 && r.totalMin <= b.s.cook * 2 && (r.store.fridge >= Math.min(span, 4) || r.store.freeze > 0));
      if (!r) continue;
      const m = portionFor(r, mealTarget(b));
      const cook = { id: uid(), date: b.date, meal: "prep", recipeId: r.id, servings: 0, type: "cook", eat: 0, side: r.side, gp: true };
      entries.push(cook);
      let frozen = 0;
      for (const s of g) {
        const age = s.d.i - b.i;
        const type = age < r.store.fridge ? "leftover" : r.store.freeze ? "freezer" : null;
        if (!type) continue;
        if (type === "freezer") frozen++;
        cook.servings += m;
        entries.push({ id: uid(), date: s.d.date, meal: s.meal, recipeId: r.id, servings: m, eat: m, type, parent: cook.id, side: r.side, gp: true });
        assign.set(key(s), { r, m });
      }
      cook.servings = Math.ceil(cook.servings * 2) / 2;
      cook.frozen = frozen;
      cooked.push(r);
    }
    if (cooked.length) {
      const sched = schedule(cooked);
      sessions.push({ date: b.date, start: Math.max(toMin(b.s.wake) + 150, 10 * 60), minutes: Math.max(...sched.map((x) => x.end)),
        handsOn: cooked.reduce((a, r) => a + r.activeMin, 0), recipes: cooked.map((r) => r.id),
        frozen: entries.filter((e) => e.date === b.date && e.meal === "prep" && e.frozen).map((e) => `${e.frozen} portion(s) of ${BY_ID[e.recipeId].name}`) });
    }
  });
  // 2) days with a little time: one quick fresh dinner (+ tomorrow's packed lunch if it keeps)
  for (const d of days.filter((d) => d.active && d.s.cook >= 15)) {
    const target = slots.find((s) => s.d === d && s.meal === "dinner" && !assign.has(key(s))) || slots.find((s) => s.d === d && s.meal === "lunch" && !assign.has(key(s)));
    if (!target) continue;
    const r = choose((r) => r.totalMin <= Math.max(d.s.cook, 20) && r.activeMin <= Math.max(d.s.cook, 15));
    if (!r) continue;
    const next = slots.find((s) => s.d.i === d.i + 1 && s.meal === "lunch" && !assign.has(key(s)));
    const m = portionFor(r, mealTarget(d));
    const extra = next && r.store.fridge >= 2 ? m : 0;
    const cook = { id: uid(), date: d.date, meal: target.meal, recipeId: r.id, servings: Math.ceil((m + extra) * 2) / 2, eat: m, type: "cook", side: r.side, gp: true };
    entries.push(cook); assign.set(key(target), { r, m });
    if (extra) { entries.push({ id: uid(), date: next.d.date, meal: "lunch", recipeId: r.id, servings: m, eat: m, type: "leftover", parent: cook.id, side: r.side, gp: true }); assign.set(key(next), { r, m }); }
  }
  // 3) any meal still open: pull a frozen portion from an earlier batch cook
  for (const s of slots.filter((s) => !assign.has(key(s)))) {
    const src = entries.find((e) => e.type === "cook" && e.meal === "prep" && e.date <= s.d.date && BY_ID[e.recipeId].store.freeze);
    if (!src) { notes.push(`${DAYS[s.d.i]} ${s.meal}: nothing planned (no cooking time and nothing in the freezer). Eat out, or give that day a little cooking time.`); continue; }
    const r = BY_ID[src.recipeId], m = portionFor(r, mealTarget(s.d));
    src.servings += m;
    entries.push({ id: uid(), date: s.d.date, meal: s.meal, recipeId: r.id, servings: m, eat: m, type: "freezer", parent: src.id, side: r.side, gp: true });
    assign.set(key(s), { r, m });
  }

  // 4) day-by-day timeline with calories, snacks and timing around training
  const T = calcTargets();
  const out = days.map((d) => {
    if (!d.active) return { date: d.date, past: true };
    const s = d.s, wake = toMin(s.wake), train = s.train ? toMin(s.trainAt) : null;
    const items = [];
    const add = (time, kind, label, kcal = 0, p = 0, extra = {}) => items.push({ time, kind, label, kcal, p, ...extra });
    if (s.b !== "skip") {
      const bf = s.cook <= 20 ? ADDON.oats : d.i % 2 ? ADDON["eggs-toast"] : ADDON["yogurt-bowl"];
      add(wake + 30, "breakfast", bf.name, bf.kcal, bf.p, { addon: bf.id });
    }
    let lunchT = 12 * 60 + 30, dinnerT = 19 * 60;
    if (train && train >= 16 * 60 && train <= 20 * 60) dinnerT = train + 90;   // eat within ~1 h after finishing
    if (train && train >= 11 * 60 && train < 14 * 60) lunchT = train + 90;
    for (const meal of ["lunch", "dinner"]) {
      const a = assign.get(d.date + meal), t = meal === "lunch" ? lunchT : dinnerT;
      const where = meal === "lunch" ? s.l : s.d;
      if (a) add(t, meal, `${a.r.name} × ${a.m} serving${a.m === 1 ? "" : "s"}${a.r.side ? ` + 1 ${SIDES[a.r.side].label}` : ""}${where === "packed" ? " (packed)" : ""}`, mealKcal(a.r, a.m), mealP(a.r, a.m), { recipe: a.r.id });
      else if (where === "out") add(t, meal, "Eating out: choose a protein-rich dish with rice or bread", 800, 35, { out: true });
    }
    if (train) {
      const wo = workoutForDay(d.i);
      add(train, "train", wo ? `Training: ${wo.name} (about ${wo.minutes} min)` : "Training");
      if (train - 90 > wake + 90) add(train - 90, "snack", `${ADDON.banana.name} (pre-workout)`, ADDON.banana.kcal, ADDON.banana.p);
    }
    const cmin = cardioPlan().days[d.i];
    if (cmin) add(train ? train + 60 : 17 * 60 + 30, "train", `${cardioPlan().opt.name}: ${cmin} min (WHO 150 min/week)`);
    const sess = sessions.find((x) => x.date === d.date);
    if (sess) add(sess.start, "cook", `Batch cook: ${sess.recipes.map((id) => BY_ID[id].name).join(" + ")} (about ${fmtMin(sess.minutes)}, ${fmtMin(sess.handsOn)} hands-on)${sess.frozen.length ? `. Freeze ${sess.frozen.join(", ")}` : ""}`, 0, 0, { session: true });
    const quick = entries.find((e) => e.date === d.date && e.type === "cook" && e.meal !== "prep");
    if (quick) { const r = BY_ID[quick.recipeId]; add((quick.meal === "dinner" ? dinnerT : lunchT) - r.totalMin - 5, "cook", `Cook ${r.name} (${fmtMin(r.totalMin)})${quick.servings > quick.eat ? ", and pack tomorrow’s lunch" : ""}`, 0, 0, { recipe: r.id }); }
    let total = items.reduce((a, x) => a + x.kcal, 0);
    let n = 0;
    const take = (id, time, suffix = "") => { const a = snackInfo(id); add(time, "snack", a.name + suffix, a.kcal, a.p, { addon: id, shake: !!SHAKE_BY_ID[id] }); total += a.kcal; n++; };
    // post-workout shake first on training days
    if (train && d.target - total >= 150) {
      const gap = d.target - total, gaining = +G.profile.goal > 0 || +G.profile.custom > 0;
      take(!gaining ? "shake-lean" : gap >= 650 ? "shake-gainer" : "shake-whey", train + 75, " (post-workout)");
    }
    let snackIds = ["shake-greek", "trail-mix", "pb-toast", "milk", "shake-sinh-to-bo", "yogurt-bowl", "olive-oil"];
    snackIds = snackIds.slice(d.i % snackIds.length).concat(snackIds.slice(0, d.i % snackIds.length)); // rotate for variety
    if (costW > 0) snackIds.sort((x, y) => addonCost(x) / snackInfo(x).kcal - addonCost(y) / snackInfo(y).kcal);
    const snackTimes = [lunchT + 180, wake + 210];
    for (const id of snackIds) {
      const gap = d.target - total;
      if (gap < 150 || n >= 3) break;
      if (snackInfo(id).kcal > gap + 150) continue;
      take(id, snackTimes.shift() ?? dinnerT + 120);
    }
    const sleepT = wake + 16 * 60;
    if (d.target - total >= 200 && n < 4) take("shake-bedtime", sleepT - 45, " (before bed)");
    items.sort((x, y) => x.time - y.time);
    return { date: d.date, items, kcal: total, p: items.reduce((a, x) => a + x.p, 0), target: d.target, ptarget: T.protein, train: !!s.train, sleep: hhmm(sleepT - 30 + 24 * 60), wake: s.wake };
  });
  // night-before reminders: overnight oats, soaking beans
  out.forEach((d, i) => {
    const prev = out[i - 1];
    if (!prev || prev.past || d.past) return;
    if (d.items.some((x) => x.addon === "oats")) prev.items.push({ time: 21 * 60 + 30, kind: "prep", label: "Make overnight oats for tomorrow (2 min)", kcal: 0, p: 0 });
    const sess = sessions.find((x) => x.date === d.date);
    for (const id of sess?.recipes || []) for (const st of BY_ID[id].advance) prev.items.push({ time: 21 * 60, kind: "prep", label: `For tomorrow’s ${BY_ID[id].name}: ${st.t}`, kcal: 0, p: 0 });
    prev.items.sort((x, y) => x.time - y.time);
  });
  const lowP = out.filter((d) => !d.past && d.p < d.ptarget - 20);
  if (lowP.length) notes.push(`Protein is short on ${lowP.map((d) => DAYS[dates.indexOf(d.date)]).join(", ")}. Swap a snack for the whey or Greek-yogurt shake, or add 2 eggs.`);

  // estimated food cost of this plan: everything cooked + sides + breakfasts/snacks/shakes
  const cost = entries.filter((e) => e.type === "cook").reduce((s, e) => s + recipeCost(BY_ID[e.recipeId]) * e.servings, 0)
    + entries.filter((e) => e.eat).reduce((s, e) => s + sideCost(BY_ID[e.recipeId]), 0)
    + out.reduce((s, d) => s + (d.items || []).reduce((t, x) => t + (x.addon ? addonCost(x.addon) : 0), 0), 0);
  return { entries, dates, today, result: { week: dates[0], days: out, sessions, notes, cost, built: ymd(new Date()) } };
}
// Run the builder; on a budget, retry with stronger preference for cheap dishes and keep the best plan that fits.
function runBuilder() {
  const G = goals(), budget = +state.settings.weeklyBudget || 0;
  let best = buildWeek(0);
  if (budget && best.result.cost > budget) {
    for (const w of [2, 4, 8, 16]) for (let t = 0; t < 3; t++) {
      const c = buildWeek(w);
      if (c.result.cost < best.result.cost) best = c;
      if (best.result.cost <= budget) break;
    }
    if (best.result.cost > budget) best.result.notes.push(`Even the cheapest plan found is about ${fmtMoney(best.result.cost)}, over your ${fmtMoney(budget)} budget. Try fewer snacks, more lentil/bean dishes, or check your prices in Shop → Prices & budget.`);
  }
  best.result.budget = budget;
  const { entries, dates, today } = best;
  // write to the meal plan (also clears a kickoff cook from a previous build, which sits just before the week)
  if (G.prefs.replace) state.plan = state.plan.filter((p) => !(p.date >= today && (dates.includes(p.date) || (p.gp && p.date < dates[0]))));
  state.plan.push(...entries);
  G.result = best.result;
  save();
}
const snackInfo = (id) => SHAKE_BY_ID[id] ? { name: SHAKE_BY_ID[id].name, kcal: SHAKE_BY_ID[id].nut.kcal, p: SHAKE_BY_ID[id].nut.p } : ADDON[id];

function renderGoals() {
  const G = goals(), p = G.profile, T = calcTargets(), P = G.prefs;
  const sel = (id, val, opts) => `<select data-g="${id}">${opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(val) ? "selected" : ""}>${l}</option>`).join("")}</select>`;
  const R = G.result;
  $("#view").innerHTML = `
    <h1>Goals</h1>
    <p class="sub">Set a calorie target (for example, to gain weight) and your week. The builder tells you what to cook, on which day, how big each portion is, and what to eat around training to hit your numbers.</p>
    <div class="two" style="grid-template-columns:1fr 1fr">
      <div class="card"><h3>1 · Your target</h3>
        <div class="row">
          <label class="field">Sex ${sel("profile.sex", p.sex, [["male", "Male"], ["female", "Female"]])}</label>
          <label class="field">Age <input type="number" data-g="profile.age" value="${p.age}" style="width:70px"></label>
          <label class="field">Height (cm) <input type="number" data-g="profile.height" value="${p.height}" style="width:80px"></label>
          <label class="field">Weight (kg) <input type="number" step="0.1" data-g="profile.weight" value="${p.weight}" style="width:80px"></label>
        </div>
        <label class="field">Activity ${sel("profile.activity", p.activity, [[1.2, "Mostly sitting, little exercise"], [1.3, "Light daily life — workouts added per day (Workouts tab)"], [1.375, "Light: 1–3 workouts a week"], [1.55, "Moderate: 3–5 workouts a week"], [1.725, "Very active: 6–7 workouts or a physical job"]])}</label>
        <div class="row">
          <label class="field">Goal ${sel("profile.goal", p.goal, [[0, "Maintain weight"], [250, "Lean gain (+250 kcal)"], [400, "Steady gain (+400 kcal)"], [550, "Faster gain (+550 kcal)"], ...([0, 250, 400, 550].includes(+p.goal) ? [] : [[p.goal, `Science-based for you (+${p.goal} kcal)`]])])}</label>
          <label class="field">Protein ${sel("profile.proteinPerKg", p.proteinPerKg, [[1.6, "1.6 g/kg"], [1.8, "1.8 g/kg"], [2, "2.0 g/kg"], [2.2, "2.2 g/kg"]])}</label>
          <label class="field">Or set kcal yourself <input type="number" data-g="profile.custom" value="${p.custom || ""}" placeholder="auto" style="width:90px"></label>
        </div>
        <div class="summary">
          <div class="stat"><div class="k">Maintenance (est.)</div><div class="v">${T.tdee} kcal</div></div>
          <div class="stat"><div class="k">Daily target</div><div class="v" style="color:var(--accent)">${T.target} kcal</div><div class="small muted">+${P.extraTrainKcal} on training days</div></div>
          <div class="stat"><div class="k">Protein</div><div class="v">${T.protein} g</div></div>
          <div class="stat"><div class="k">Expected change</div><div class="v">${T.perWeek > 0 ? "+" : ""}${T.perWeek} kg/wk</div></div>
        </div>
        <p class="small muted">Estimates (Mifflin–St Jeor formula). Bodies vary, so weigh in weekly below and adjust. This isn't medical advice. If you have a health condition, check with a professional.</p>
      </div>
      <div class="card"><h3>2 · Preferences</h3>
        <label class="field">Hardest recipes to include ${sel("prefs.maxDiff", P.maxDiff, [[1, "Beginner only"], [2, "Up to intermediate"], [3, "Anything"]])}</label>
        <label class="field">Weekly food budget (${esc(currency())}) <input type="number" step="5" id="g-budget" value="${state.settings.weeklyBudget || ""}" placeholder="no limit" style="width:100px"></label>
        ${W().autoKcal ? `<p class="small muted">Training & cardio calories are added to each day automatically from your <a href="#workouts">Workouts</a> program.</p>` : `<label class="field">Extra calories on training days <input type="number" step="50" data-g="prefs.extraTrainKcal" value="${P.extraTrainKcal}" style="width:90px"></label>`}
        <label class="row small"><input type="checkbox" data-g="prefs.favs" ${P.favs ? "checked" : ""}> Prefer my ♥ favorites (${state.favorites.length})</label>
        <label class="row small"><input type="checkbox" data-g="prefs.veg" ${P.veg ? "checked" : ""}> Vegetarian only</label>
        <label class="field" style="margin-top:12px">Build for ${sel("prefs.week", P.week, [["this", "This week (from today)"], ["next", "Next week"]])}</label>
        <label class="row small"><input type="checkbox" data-g="prefs.replace" ${P.replace ? "checked" : ""}> Replace meals already planned that week</label>
        <button class="btn primary" id="g-build" style="margin-top:14px">✨ Build my week</button>
      </div>
    </div>
    <div class="card" style="margin-top:16px;overflow-x:auto"><h3>3 · Your week</h3>
      <p class="small muted" style="margin-top:0">How much time you have to cook each day decides when you batch-cook (60+ min), cook something quick (15–45 min), or just eat leftovers.</p>
      <table class="sched"><tr><th></th><th>Time to cook</th><th>Wake</th><th>Training</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th></tr>
      ${G.schedule.map((s, i) => `<tr><th>${DAYS[i]}</th>
        <td>${sel(`schedule.${i}.cook`, s.cook, [[0, "None"], [15, "15 min"], [20, "20 min"], [30, "30 min"], [45, "45 min"], [60, "1 h"], [90, "1.5 h"], [120, "2 h"], [180, "3 h+"]])}</td>
        <td><input type="time" data-g="schedule.${i}.wake" value="${s.wake}"></td>
        <td><label class="row small" style="gap:4px"><input type="checkbox" data-g="schedule.${i}.train" ${s.train ? "checked" : ""}> <input type="time" data-g="schedule.${i}.trainAt" value="${s.trainAt}" ${s.train ? "" : "disabled"}></label></td>
        <td>${sel(`schedule.${i}.b`, s.b, [["home", "At home"], ["skip", "Skip"]])}</td>
        <td>${sel(`schedule.${i}.l`, s.l, [["home", "At home"], ["packed", "Packed"], ["out", "Eat out"]])}</td>
        <td>${sel(`schedule.${i}.d`, s.d, [["home", "At home"], ["out", "Eat out"]])}</td></tr>`).join("")}</table>
    </div>
    <div id="g-result">${R ? renderGoalResult(R) : ""}</div>
    <div class="card" style="margin-top:16px"><h3>⚖️ Weekly weigh-in</h3>
      <p class="small muted" style="margin-top:0">Weigh yourself once a week, same day and time (for example, Monday morning before breakfast). After 2+ weeks the app suggests whether to adjust.</p>
      <div class="row"><input type="date" id="w-date" value="${ymd(new Date())}"><input type="number" step="0.1" id="w-kg" placeholder="kg" style="width:90px"><button class="btn" id="w-add">Add</button></div>
      ${weighInSummary()}
    </div>`;
  $$("[data-g]").forEach((el) => el.onchange = () => {
    const path = el.dataset.g.split(".");
    let o = G; for (const k of path.slice(0, -1)) o = o[k];
    const last = path[path.length - 1];
    o[last] = el.type === "checkbox" ? el.checked : el.type === "number" || /^(activity|goal|proteinPerKg|cook|maxDiff)$/.test(last) ? +el.value : el.value;
    if (last === "weight" && +el.value > 0) o.weight = +el.value;
    save(); renderGoals();
  });
  $("#g-budget").onchange = (e) => { state.settings.weeklyBudget = Math.max(0, +e.target.value || 0); save(); renderGoals(); };
  $("#g-build").onclick = () => { runBuilder(); renderGoals(); $("#g-result").scrollIntoView({ behavior: "smooth" }); };
  $("#w-add").onclick = () => {
    const kg = +$("#w-kg").value; if (!kg) return;
    G.weighIns = (G.weighIns || []).filter((w) => w.date !== $("#w-date").value).concat({ date: $("#w-date").value, kg }).sort((a, b) => a.date.localeCompare(b.date));
    G.profile.weight = kg; save(); renderGoals();
  };
  if ($("#w-apply")) $("#w-apply").onclick = () => { G.profile.custom = 0; G.profile.goal = +G.profile.goal + +$("#w-apply").dataset.delta; save(); renderGoals(); };
  $$("#g-result [data-open]").forEach((el) => el.onclick = () => openRecipe(el.dataset.open));
  $$("[data-prepsess]").forEach((b) => b.onclick = () => { prepSelection = b.dataset.prepsess.split(","); location.hash = "#prep"; });
}

function renderGoalResult(R) {
  const icon = { shake: "🥤", breakfast: "🍳", lunch: "🍱", dinner: "🍽️", snack: "🥜", cook: "🔥", prep: "🌙", train: "🏋️" };
  const live = R.days.filter((d) => !d.past);
  const avg = live.length ? Math.round(live.reduce((a, d) => a + d.kcal, 0) / live.length) : 0;
  return `
    <h2>Your plan for the week of ${dayLabel(parseYmd(R.week))}</h2>
    <div class="row"><a class="btn" href="#plan">📅 See it in the meal plan</a><a class="btn" href="#shop">🛒 Grocery list</a><span class="muted small">Average ≈ ${avg} kcal/day</span>
      ${R.cost != null ? `<span class="chip ${R.budget && R.cost > R.budget ? "diff-3" : "diff-1"}">💵 Food ≈ ${fmtMoney(R.cost)}${R.budget ? ` / ${fmtMoney(R.budget)} budget` : " this week"}</span>` : ""}</div>
    ${R.notes.length ? `<div class="box amber small">${R.notes.map(esc).join("<br>")}</div>` : ""}
    ${R.sessions.length ? `<h3 style="margin-top:18px">🔥 When to cook</h3>${R.sessions.map((s) => `<div class="box green"><b>${dayLabel(parseYmd(s.date))}, ${hhmm(s.start)} to ${hhmm(s.start + s.minutes)}</b>: ${s.recipes.map((id) => `<a href="#" data-open="${id}">${BY_ID[id].name}</a>`).join(" + ")}
      <span class="small muted">(${fmtMin(s.minutes)} cooked together, ${fmtMin(s.handsOn)} hands-on)</span>${s.frozen.length ? `<div class="small">🧊 Freeze: ${s.frozen.map(esc).join(", ")}</div>` : ""}
      <div><button class="btn sm" data-prepsess="${s.recipes.join(",")}" style="margin-top:6px">⏱ Step-by-step session timeline</button></div></div>`).join("")}` : ""}
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));margin-top:16px">
    ${R.days.map((d) => d.past ? "" : `<div class="card">
      <div class="row"><b>${dayLabel(parseYmd(d.date))}</b>${d.train ? `<span class="chip diff-2">training day</span>` : ""}<span class="spacer"></span><span class="small"><b>${d.kcal}</b> / ${d.target} kcal</span></div>
      <div class="bar"><div style="width:${Math.min(100, (d.kcal / d.target) * 100)}%;background:${Math.abs(d.kcal - d.target) <= 150 ? "var(--green)" : "var(--amber)"}"></div></div>
      <div class="small muted">💪 Protein ${d.p} / ${d.ptarget} g</div>
      <div class="health small">💧 2.5–3 L water · 🥦 5+ fruit & veg portions · 😴 lights out ${d.sleep || "by 23:00"}${d.train ? "" : " · 🚶 30-min walk (rest day)"}</div>
      <ul class="tl">${d.items.map((x) => `<li class="k-${x.kind}${x.shake ? " k-shake" : ""}"><span class="time">${hhmm(x.time)}</span> ${x.shake ? "🥤" : x.kind === "train" ? `<a href="#workouts" title="Open workout">🏋️</a>` : icon[x.kind] || "•"} ${x.recipe ? `<a href="#" data-open="${x.recipe}">${esc(x.label)}</a>` : esc(x.label)}${x.kcal ? ` <span class="muted">${x.kcal} kcal</span>` : ""}</li>`).join("")}</ul>
    </div>`).join("")}</div>
    <div class="box blue small" style="margin-top:12px"><b>Tips for gaining:</b> eat every 3–4 hours rather than forcing huge meals. Drink some of your calories (milk, smoothies) if you get full easily. Keep a protein source in every meal. If the scale hasn't moved after 2 weeks, add about 150 kcal a day.</div>`;
}

function weighInSummary() {
  const W = goals().weighIns || [];
  if (!W.length) return `<p class="muted small">No weigh-ins yet.</p>`;
  let advice = "";
  if (W.length >= 2) {
    const first = W[Math.max(0, W.length - 5)], last = W[W.length - 1];
    const weeks = Math.max(1, (parseYmd(last.date) - parseYmd(first.date)) / (7 * 864e5));
    const rate = Math.round(((last.kg - first.kg) / weeks) * 100) / 100;
    const goal = +goals().profile.goal;
    let delta = 0, msg = `You're changing by ${rate > 0 ? "+" : ""}${rate} kg/week.`;
    if (goal > 0 && rate < 0.1 && weeks >= 2) { delta = 150; msg += " That's slower than planned. Add about 150 kcal a day."; }
    else if (goal > 0 && rate > 0.6) { delta = -150; msg += " That's faster than needed (more of it may be fat). Remove about 150 kcal a day."; }
    else msg += " On track. Keep going.";
    advice = `<div class="box ${delta ? "amber" : "green"} small">${msg}${delta ? ` <button class="btn sm" id="w-apply" data-delta="${delta}">Apply ${delta > 0 ? "+" : ""}${delta} kcal</button>` : ""}</div>`;
  }
  return `${advice}<div class="row" style="margin-top:8px">${W.slice(-8).map((w) => `<span class="chip">${w.date.slice(5)}: ${w.kg} kg</span>`).join("")}</div>`;
}

// ───────────── WORKOUTS: personalised training, built like the cooking side ─────────────
// Library (≈ Discover) · Exercise page (≈ Recipe) · Workout mode (≈ Cook mode) · Program (≈ Plan, shared with Goals)
// Volume check (≈ Batch prep) · Progress & badges (≈ Journal) · Equipment (≈ Shop) · Science (why every number is what it is)
const XLIB = window.EXERCISE_LIB || [];
const XBY = Object.fromEntries(XLIB.map((e) => [e.id, e]));
const LEVELS = { beginner: 1, intermediate: 2, advanced: 3 };
function W() {
  const w = state.workout;
  if (w.equip === "dumbbell") w.equip = "home"; // older setting name
  const d = { equip: "gym", pullupBar: true, level: "beginner", wgoal: "gain", sessionMin: 60, limits: [], cardio: "walk", autoKcal: true, favs: [], log: {}, sessions: [], blockStart: ymd(mondayOf(new Date())) };
  for (const k in d) if (w[k] === undefined) w[k] = d[k];
  return w;
}
function availableEquip() {
  const w = W(), set = new Set(window.EQUIP_SETS[w.equip] || ["bodyweight"]);
  if (w.equip !== "gym" && w.pullupBar) set.add("pullup bar");
  return set;
}
const canDo = (e) => e.equip.some((q) => availableEquip().has(q)) && !e.stress.some((s) => W().limits.includes(s));
const trainingDays = () => goals().schedule.map((s, i) => (s.train ? i : -1)).filter((i) => i >= 0);
const repTop = (range) => +String(range).split(/[–-]/).pop();

// Personalisation from your profile (age, sex, height, weight) + training settings, using the evidence in data/workouts.js
function trainingProfile() {
  const w = W(), p = goals().profile, age = +p.age, lvl = LEVELS[w.level] || 1;
  const bmi = p.weight / Math.pow(p.height / 100, 2);
  const older = age >= 65, mid = age >= 50;
  let weeklySets = [10, 14, 18][lvl - 1];                       // ≥10 sets/muscle/week (Schoenfeld 2017)
  if (mid) weeklySets -= 2;                                     // a bit less volume, more recovery after 50
  if (older) weeklySets = Math.min(weeklySets, 10);
  if (w.wgoal === "health") weeklySets = Math.min(weeklySets, 10);
  const rir = older || lvl === 1 ? "2–3" : lvl === 2 ? "1–2" : "0–2";  // reps left in reserve
  const reps = w.wgoal === "strength" ? { compound: "3–6", isolation: "8–12" }
    : w.wgoal === "health" || older ? { compound: "8–12", isolation: "10–15" }
    : w.equip === "bodyweight" ? { compound: "8–20", isolation: "12–25" }   // can’t add load → use higher reps, still effective near failure
    : { compound: lvl === 1 ? "8–12" : "6–10", isolation: "10–15" };         // ACSM 2009; similar growth 6–30 reps (Schoenfeld 2017)
  const rest = { compound: w.wgoal === "strength" ? 180 : 150, isolation: 75 };   // longer rest for big lifts (Schoenfeld 2016)
  // healthy rate of gain: ~0.25–0.5% of body weight per week (Iraki 2019); faster for beginners/underweight, slower if BMI ≥ 25
  const ratePct = bmi < 18.5 ? 0.5 : bmi >= 25 ? 0.25 : [0.5, 0.35, 0.25][lvl - 1];
  const surplus = w.wgoal === "health" ? 0 : Math.round((ratePct / 100 * p.weight * 7700 / 7) / 50) * 50;
  const protein = older ? 1.6 : w.wgoal === "health" ? 1.6 : 1.8;      // 1.6 plateau (Morton 2018), 1.4–2.0 (ISSN 2017), ≥1.2 older (PROT-AGE)
  return { age, bmi, lvl, older, mid, youth: age < 18, weeklySets, rir, reps, rest, ratePct, surplus, protein, days: trainingDays().length };
}

// Fill the split's movement slots with the best exercises for you, then size sets to hit weekly volume within your session time.
function buildProgram() {
  const w = W(), T = trainingProfile(), td = trainingDays();
  if (!td.length) return null;
  const split = window.SPLITS[Math.min(td.length, 6)];
  const used = {};
  const pick = (pattern) => {
    const c = XLIB.filter((e) => e.pattern === pattern && canDo(e));
    if (!c.length) return null;
    const score = (e) => (w.favs.includes(e.id) ? 6 : 0) - Math.abs(e.level - Math.min(T.lvl, 2)) * 2 - ((used[pattern] || []).includes(e.id) ? 3 : 0) - (T.older && e.level > 1 ? 3 : 0) - (e.unilateral && T.lvl === 1 ? 0.5 : 0);
    const best = c.map((e) => [e, score(e)]).sort((a, b) => b[1] - a[1])[0][0];
    (used[pattern] = used[pattern] || []).push(best.id);
    return best;
  };
  const sessions = split.sessions.map((s) => {
    const items = s.slots.map(pick).filter(Boolean).map((e) => ({ id: e.id, sets: T.older ? 2 : 3 }));
    if (T.older) { const b = pick("balance"); if (b) items.push({ id: b.id, sets: 2, balance: true }); }
    return { name: s.name, items };
  });
  const week = td.map((_, k) => sessions[k % sessions.length]);
  const BIG = ["chest", "back", "shoulders", "quads", "glutes", "hamstrings"], SMALL = ["biceps", "triceps", "rearDelts", "calves", "core"];
  const targetFor = (m) => (BIG.includes(m) ? T.weeklySets : Math.round(T.weeklySets * 0.6));
  const volume = () => {
    const v = {}; for (const m in window.MUSCLES) v[m] = 0;
    for (const s of week) for (const it of s.items) { const e = XBY[it.id]; for (const m of e.muscles) v[m] += it.sets; for (const m of e.sec) v[m] += it.sets / 2; }
    return v;
  };
  // adjust sets (2–5 per exercise) toward each muscle's target
  for (let pass = 0; pass < 6; pass++) {
    const v = volume();
    for (const s of sessions) for (const it of s.items) {
      if (it.balance) continue;
      const e = XBY[it.id], m = e.muscles[0]; if (!m) continue;
      if (v[m] < targetFor(m) - 1 && it.sets < 5) it.sets++;
      else if (v[m] > targetFor(m) * 1.5 && it.sets > 2) it.sets--;
    }
  }
  // fit each session into your time: trim isolation sets, then drop the last isolation exercise
  const minutesOf = (s) => Math.round(8 + s.items.reduce((t, it) => { const e = XBY[it.id]; return t + it.sets * ((e.kind === "compound" ? T.rest.compound : T.rest.isolation) + 45) / 60; }, 0));
  for (const s of sessions) {
    let guard = 0;
    while (minutesOf(s) > w.sessionMin && guard++ < 30) {
      const iso = s.items.filter((it) => XBY[it.id].kind === "isolation" && it.sets > 2).pop();
      if (iso) { iso.sets--; continue; }
      const cmp = s.items.filter((it) => it.sets > 2).pop();
      if (cmp) { cmp.sets--; continue; }
      const dropIdx = s.items.map((it) => XBY[it.id].kind).lastIndexOf("isolation");
      if (dropIdx >= 0 && s.items.length > 3) s.items.splice(dropIdx, 1); else break;
    }
    s.minutes = minutesOf(s);
    for (const it of s.items) {
      const e = XBY[it.id];
      it.reps = e.unit === "seconds" ? "20–45 s" : e.kind === "compound" ? T.reps.compound : T.reps.isolation;
      it.rest = e.kind === "compound" ? T.rest.compound : T.rest.isolation;
    }
  }
  const v = volume();
  const equipNeeded = [...new Set(sessions.flatMap((s) => s.items.flatMap((it) => XBY[it.id].equip.filter((q) => availableEquip().has(q)).slice(0, 1))))];
  return { split, sessions, week, volume: v, targetFor, T, equipNeeded };
}
const sessionKcal = (minutes) => Math.round((5.0 - 1) * goals().profile.weight * minutes / 60);   // net MET ≈ 5 (Ainsworth 2011)
function workoutForDay(i) {
  const td = trainingDays(), k = td.indexOf(i);
  if (k < 0) return null;
  const P = buildProgram(); if (!P) return null;
  const s = P.week[k];
  return { name: s.name, minutes: s.minutes, kcal: sessionKcal(s.minutes), session: s };
}
// WHO: 150+ min moderate cardio per week. Put brisk walks/rides on rest days; extra minutes after lifting.
function cardioPlan() {
  const w = W(), td = trainingDays(), opt = window.CARDIO_OPTIONS[w.cardio] || window.CARDIO_OPTIONS.walk;
  const rest = [0, 1, 2, 3, 4, 5, 6].filter((i) => !td.includes(i));
  const perRest = rest.length ? Math.min(45, Math.ceil(150 / rest.length / 5) * 5) : 0;
  const days = {};
  rest.forEach((i) => (days[i] = perRest));
  let total = perRest * rest.length;
  if (total < 150 && td.length) { const extra = Math.ceil((150 - total) / td.length / 5) * 5; td.forEach((i) => (days[i] = extra)); total += extra * td.length; }
  const kcalFor = (min) => Math.round((opt.met - 1) * goals().profile.weight * min / 60);
  return { opt, days, total, kcalFor };
}
// calories your training adds to a given weekday (used by Goals when auto is on)
function exerciseKcalForDay(i) {
  const wo = workoutForDay(i), c = cardioPlan();
  return (wo ? wo.kcal : 0) + c.kcalFor(c.days[i] || 0);
}

// ───── favourites for exercises (same heart as recipes) ─────
const isXFav = (id) => W().favs.includes(id);
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-xfav]"); if (!b) return;
  e.stopPropagation(); e.preventDefault();
  const w = W(), id = b.dataset.xfav;
  w.favs = isXFav(id) ? w.favs.filter((x) => x !== id) : [...w.favs, id];
  save(); b.classList.toggle("on", isXFav(id)); b.textContent = isXFav(id) ? "♥" : "♡";
}, true);
const xheart = (id) => `<button class="fav-btn ${isXFav(id) ? "on" : ""}" data-xfav="${id}" title="Favorite exercise">${isXFav(id) ? "♥" : "♡"}</button>`;

// ───── progress helpers ─────
const e1rm = (w, r) => (w > 0 && r > 0 ? w * (1 + Math.min(r, 12) / 30) : 0);   // Epley estimate
function bestE1rm(id) { return Math.max(0, ...(W().log[id] || []).map((l) => Math.max(0, ...String(l.reps).split(/[\s,/]+/).map(Number).map((r) => e1rm(+l.weight, r))))); }
function suggestWeight(id) {
  const log = W().log[id] || [], last = log[log.length - 1];
  if (!last) return "";
  const e = XBY[id], top = repTop(e.kind === "compound" ? trainingProfile().reps.compound : trainingProfile().reps.isolation);
  const reps = String(last.reps).split(/[\s,/]+/).map(Number).filter((x) => x > 0);
  if (+last.weight && reps.length && reps.every((r) => r >= top)) return +last.weight + (e.lower ? (W().equip === "gym" ? 5 : 4) : W().equip === "gym" ? 2.5 : 2);
  return +last.weight || "";
}
function nextTarget(id) {
  const log = W().log[id] || [], e = XBY[id];
  if (!log.length) return "First time: pick a weight you could lift for the top of the rep range with 2–3 reps to spare. Log it and the app tells you what to do next time.";
  const sw = suggestWeight(id), last = log[log.length - 1];
  if (sw && +sw > +last.weight) return `You hit the top of the range on every set — next time use ${sw} kg (progressive overload, ACSM 2009).`;
  if (!+last.weight) return `Next time: aim for 1–2 more reps per set; when every set hits the top of the range, move to a harder version${e.harder ? ` (${XBY[e.harder].name})` : ""}.`;
  return `Next time: stay at ${last.weight} kg and aim for 1 more rep on each set (last: ${last.reps}).`;
}
function sparkline(vals, w = 160, h = 36) {
  if (vals.length < 2) return "";
  const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * (w - 4) + 2},${h - 2 - ((v - min) / span) * (h - 4)}`).join(" ");
  return `<svg width="${w}" height="${h}" class="spark"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2"/></svg>`;
}

// ───── main Workouts screen with sub-sections ─────
const WVIEWS = [["program", "📅 My program"], ["library", "📚 Exercises"], ["progress", "📈 Progress"], ["science", "🔬 Science"]];
function renderWorkouts() {
  W();
  const v = new URLSearchParams(location.hash.split("?")[1] || "").get("v") || "program";
  $("#view").innerHTML = `<h1>Workouts</h1>
    <div class="row subnav">${WVIEWS.map(([k, l]) => `<a class="chip click ${v === k ? "on" : ""}" href="#workouts?v=${k}">${l}</a>`).join("")}
      <span class="spacer"></span><button class="btn primary" id="w-start">▶ Start today’s workout</button></div>
    <div id="wbody"></div>`;
  ({ program: renderProgram, library: renderLibrary, progress: renderProgress, science: renderScience }[v] || renderProgram)();
  $("#w-start").onclick = () => {
    const today = (new Date().getDay() + 6) % 7, wo = workoutForDay(today), P = buildProgram();
    if (!P) return alert("Set your training days first (My program → Your week).");
    startWorkoutMode(wo ? wo.session : P.week[0]);
  };
}

function renderProgram() {
  const w = W(), G = goals(), p = G.profile, P = buildProgram(), T = trainingProfile(), C = cardioPlan();
  const sel = (id, val, opts) => `<select id="${id}">${opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(val) ? "selected" : ""}>${l}</option>`).join("")}</select>`;
  const todayI = (new Date().getDay() + 6) % 7;
  const block = Math.floor((new Date() - parseYmd(w.blockStart)) / (7 * 864e5)) + 1;
  $("#wbody").innerHTML = `
    <div class="two" style="grid-template-columns:1fr 1fr">
      <div class="card"><h3>About you</h3>
        <div class="row">
          <label class="field">Sex <select data-gp="sex"><option value="male" ${p.sex === "male" ? "selected" : ""}>Male</option><option value="female" ${p.sex === "female" ? "selected" : ""}>Female</option></select></label>
          <label class="field">Age <input type="number" data-gp="age" value="${p.age}" style="width:64px"></label>
          <label class="field">Height (cm) <input type="number" data-gp="height" value="${p.height}" style="width:72px"></label>
          <label class="field">Weight (kg) <input type="number" step="0.1" data-gp="weight" value="${p.weight}" style="width:72px"></label>
        </div>
        <div class="row">
          <label class="field">Experience ${sel("w-level", w.level, [["beginner", "Beginner (< 6 months)"], ["intermediate", "Intermediate (6 mo – 2 yrs)"], ["advanced", "Advanced (2+ yrs)"]])}</label>
          <label class="field">Main goal ${sel("w-goal", w.wgoal, [["gain", "Gain weight & muscle"], ["strength", "Get stronger"], ["health", "General health & fitness"]])}</label>
        </div>
        <div class="row">
          <label class="field">Equipment ${sel("w-equip", w.equip, [["gym", "Gym"], ["home", "Home: dumbbells + bands"], ["bodyweight", "No equipment"]])}</label>
          ${w.equip !== "gym" ? `<label class="row small"><input type="checkbox" id="w-bar" ${w.pullupBar ? "checked" : ""}> I have a pull-up bar</label>` : ""}
          <label class="field">Session length ${sel("w-min", w.sessionMin, [[30, "30 min"], [45, "45 min"], [60, "60 min"], [75, "75 min"], [90, "90 min"]])}</label>
        </div>
        <div class="row small"><b>Go easy on:</b>${["knee", "back", "shoulder"].map((s) => `<label class="row small"><input type="checkbox" data-limit="${s}" ${w.limits.includes(s) ? "checked" : ""}> ${s}s</label>`).join("")}</div>
        <div class="row" style="margin-top:8px"><label class="field">Cardio you like ${sel("w-cardio", w.cardio, Object.entries(window.CARDIO_OPTIONS).map(([k, o]) => [k, o.name]))}</label></div>
        <div class="summary">
          <div class="stat"><div class="k">BMI</div><div class="v">${T.bmi.toFixed(1)}</div><div class="small muted">${T.bmi < 18.5 ? "underweight" : T.bmi < 25 ? "healthy range" : T.bmi < 30 ? "overweight" : "obese"} (rough guide)</div></div>
          <div class="stat"><div class="k">Sets / muscle / week</div><div class="v">${T.weeklySets}</div></div>
          <div class="stat"><div class="k">Effort</div><div class="v">${T.rir} reps in reserve</div></div>
          <div class="stat"><div class="k">Healthy gain rate</div><div class="v">${T.surplus ? `${(T.ratePct / 100 * p.weight).toFixed(2)} kg/wk` : "maintain"}</div></div>
        </div>
        ${T.youth ? `<div class="box amber small">Under 18: WHO recommends 60 minutes of activity a day. Strength training is safe and helpful with good coaching — learn the movements with light weights first, and focus on eating enough rather than a big calorie surplus.</div>` : ""}
        ${T.older ? `<div class="box amber small">65+: your program uses fewer max-effort sets, longer recovery and adds balance work 3×/week (WHO 2020). Protein needs are higher with age (PROT-AGE).</div>` : ""}
        <p class="small muted">See <a href="#workouts?v=science">🔬 Science</a> for the research behind every number.</p>
      </div>
      <div class="card"><h3>Your week</h3>
        <p class="small muted" style="margin-top:0">Shared with Goals — meals, shakes and cooking are timed around these sessions.</p>
        <table class="sched">${G.schedule.map((s, i) => `<tr><th>${DAYS[i]}</th><td><label class="row small"><input type="checkbox" data-tday="${i}" ${s.train ? "checked" : ""}> Train</label></td>
          <td><input type="time" data-ttime="${i}" value="${s.trainAt}" ${s.train ? "" : "disabled"}></td>
          <td class="small muted">${s.train ? (workoutForDay(i)?.name || "") : C.days[i] ? `🚶 ${C.days[i]} min ${C.opt.name.toLowerCase()}` : "rest"}</td></tr>`).join("")}</table>
        <label class="row small" style="margin-top:8px"><input type="checkbox" id="w-auto" ${w.autoKcal ? "checked" : ""}> Add workout & cardio calories to each day’s food target automatically</label>
        <div class="row" style="margin-top:10px"><button class="btn primary" id="w-apply">🔬 Apply science-based targets to Goals</button></div>
        <p class="small muted">Sets your calorie surplus (+${T.surplus} kcal ≈ ${T.ratePct}% body weight/week), protein (${T.protein} g/kg) and daily activity level, then you can rebuild your meal week.</p>
      </div>
    </div>
    ${!P ? `<div class="empty" style="margin-top:16px">Tick at least one training day above to get your program. 2–4 days is ideal for most people.</div>` : `
    <div class="box green" style="margin-top:16px"><b>${P.split.name}</b> · ${P.week.length} session${P.week.length > 1 ? "s" : ""}/week · each muscle about ${P.week.length >= 2 ? "2×" : "1×"} a week · training block week ${block}${block >= 6 ? " — time for a lighter deload week (half the sets)" : ` (deload around week ${7})`}
      <button class="btn sm" id="w-newblock" style="margin-left:8px">Start new block</button></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr));margin-top:14px">
      ${trainingDays().map((i, k) => { const s = P.week[k]; return `<div class="card ${i === todayI ? "today-card" : ""}">
        <div class="row"><b>${DAYS[i]} · ${esc(G.schedule[i].trainAt)}</b>${i === todayI ? `<span class="chip diff-2">today</span>` : ""}<span class="spacer"></span><span class="small muted">≈ ${s.minutes} min · ${sessionKcal(s.minutes)} kcal</span></div>
        <h3 style="margin:6px 0">${s.name}</h3>
        <ol class="exlist">${s.items.map((it) => { const e = XBY[it.id], sw = suggestWeight(it.id); return `<li data-ex="${it.id}"><b>${esc(e.name)}</b> <span class="muted small">${it.sets} × ${it.reps} · rest ${it.rest >= 120 ? Math.round(it.rest / 30) / 2 + " min" : it.rest + " s"}${sw ? ` · ${sw} kg` : ""}</span></li>`; }).join("")}</ol>
        <button class="btn sm primary" data-startk="${k}">▶ Start this workout</button></div>`; }).join("")}
    </div>
    <h2>📊 Weekly volume check</h2>
    <p class="small muted" style="margin-top:-6px">Hard sets per muscle per week (secondary muscles count as ½). Target for you: ${T.weeklySets} for big muscles.</p>
    <div class="card">${Object.entries(window.MUSCLES).map(([m, label]) => { const val = Math.round(P.volume[m] * 2) / 2, t = P.targetFor(m); return `<div class="vrow"><span>${label}</span><div class="bar"><div style="width:${Math.min(100, (val / (t * 1.5)) * 100)}%;background:${val >= t * 0.8 ? "var(--green)" : "var(--amber)"}"></div></div><span class="small"><b>${val}</b> / ${t}</span></div>`; }).join("")}</div>
    <h2>🚶 Cardio & daily movement</h2>
    <div class="card small">${C.total} min/week of ${C.opt.name.toLowerCase()} (WHO: 150–300). ${esc(C.opt.note)}
      <div class="row" style="margin-top:6px">${Object.entries(C.days).map(([i, m]) => `<span class="chip">${DAYS[i]}: ${m} min</span>`).join("")}</div></div>
    <h2>🧰 Equipment for this program</h2>
    <div class="card small">${P.equipNeeded.map((q) => `<span class="chip">${esc(q)}</span>`).join("")}
      ${w.equip !== "gym" ? `<div class="muted" style="margin-top:6px">Building a home setup? ${["dumbbell", "band", "pullup bar", "bench"].map((q) => esc(window.EQUIP_COST[q] || q)).join(" · ")}. Prices are rough.</div>` : ""}</div>`}`;
  // bindings
  const re = () => { save(); renderWorkouts(); };
  $$("[data-gp]").forEach((el) => el.onchange = () => { p[el.dataset.gp] = el.type === "number" ? +el.value : el.value; re(); });
  $("#w-level").onchange = (e) => { w.level = e.target.value; re(); };
  $("#w-goal").onchange = (e) => { w.wgoal = e.target.value; re(); };
  $("#w-equip").onchange = (e) => { w.equip = e.target.value; re(); };
  if ($("#w-bar")) $("#w-bar").onchange = (e) => { w.pullupBar = e.target.checked; re(); };
  $("#w-min").onchange = (e) => { w.sessionMin = +e.target.value; re(); };
  $("#w-cardio").onchange = (e) => { w.cardio = e.target.value; re(); };
  $("#w-auto").onchange = (e) => { w.autoKcal = e.target.checked; re(); };
  $$("[data-limit]").forEach((c) => c.onchange = () => { w.limits = c.checked ? [...w.limits, c.dataset.limit] : w.limits.filter((x) => x !== c.dataset.limit); re(); });
  $$("[data-tday]").forEach((c) => c.onchange = () => { G.schedule[+c.dataset.tday].train = c.checked; re(); });
  $$("[data-ttime]").forEach((c) => c.onchange = () => { G.schedule[+c.dataset.ttime].trainAt = c.value; re(); });
  $("#w-apply").onclick = () => {
    p.goal = T.surplus; p.custom = 0; p.proteinPerKg = T.protein; p.activity = w.autoKcal ? 1.3 : (T.days >= 5 ? 1.725 : T.days >= 3 ? 1.55 : 1.375);
    save(); alert(`Goals updated: +${T.surplus} kcal surplus, ${T.protein} g/kg protein, daily-life activity ${p.activity}${w.autoKcal ? " (workouts added per day)" : ""}. Open Goals and press “Build my week” to refresh your meals.`); re();
  };
  if ($("#w-newblock")) $("#w-newblock").onclick = () => { w.blockStart = ymd(mondayOf(new Date())); re(); };
  $$("[data-ex]").forEach((li) => li.onclick = () => openExercise(li.dataset.ex));
  $$("[data-startk]").forEach((b) => b.onclick = () => startWorkoutMode(P.week[+b.dataset.startk]));
}

let xFilter = { q: "", muscle: "", pattern: "", mine: true, level: 0 };
function renderLibrary() {
  const f = xFilter, q = f.q.toLowerCase(), inProg = new Set((buildProgram()?.sessions || []).flatMap((s) => s.items.map((i) => i.id)));
  const list = XLIB.filter((e) => (!q || `${e.name} ${e.muscles.join(" ")} ${e.pattern}`.toLowerCase().includes(q))
    && (!f.muscle || e.muscles.includes(f.muscle) || e.sec.includes(f.muscle)) && (!f.mine || canDo(e)) && (!+f.level || e.level === +f.level) && (!f.pattern || (f.pattern === "fav" ? isXFav(e.id) : e.pattern === f.pattern)))
    .sort((a, b) => isXFav(b.id) - isXFav(a.id) || a.level - b.level || a.name.localeCompare(b.name));
  $("#wbody").innerHTML = `
    <div class="filters"><input type="search" id="xf-q" placeholder="Search exercises or muscles…" value="${esc(f.q)}">
      <select id="xf-muscle"><option value="">All muscles</option>${Object.entries(window.MUSCLES).map(([k, l]) => `<option value="${k}" ${f.muscle === k ? "selected" : ""}>${l}</option>`).join("")}</select>
      <select id="xf-level"><option value="0">Any level</option>${[1, 2, 3].map((d) => `<option value="${d}" ${+f.level === d ? "selected" : ""}>${DIFF[d]}</option>`).join("")}</select>
      <label class="row small"><input type="checkbox" id="xf-mine" ${f.mine ? "checked" : ""}> Only what I can do (equipment & joints)</label></div>
    <div class="row" style="margin-bottom:14px">${[["", "All"], ["fav", "♥ favorites"], ["squat", "Squat"], ["hinge", "Hinge"], ["hpush", "Push (horizontal)"], ["vpush", "Push (overhead)"], ["hpull", "Row"], ["vpull", "Pull-down / up"], ["lunge", "Lunge"], ["core", "Core"], ["balance", "Balance"]].map(([k, l]) => `<span class="chip click ${f.pattern === k ? "on" : ""}" data-xp="${k}">${l}</span>`).join("")}</div>
    <div class="grid">${list.map((e) => `<div class="card rcard" data-ex="${e.id}">${xheart(e.id)}
      <div class="name">${esc(e.name)}</div>
      <div class="native">${e.muscles.map((m) => window.MUSCLES[m]).join(", ") || "Balance"}</div>
      <div><span class="chip diff-${e.level}">${DIFF[e.level]}</span><span class="chip">${e.kind}</span>${inProg.has(e.id) ? `<span class="chip diff-1">in my program</span>` : ""}</div>
      <div class="meta"><span>🧰 ${e.equip.join(" / ")}</span>${(W().log[e.id] || []).length ? `<span>📈 ${(W().log[e.id] || []).length} logs</span>` : ""}</div></div>`).join("") || `<div class="empty">No exercises match.</div>`}</div>`;
  const bind = (id, k, isCheck) => $(id).addEventListener(isCheck ? "change" : "input", (e) => { f[k] = isCheck ? e.target.checked : e.target.value; renderLibrary(); if (id === "#xf-q") { const n = $("#xf-q"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); } });
  bind("#xf-q", "q"); bind("#xf-muscle", "muscle"); bind("#xf-level", "level"); bind("#xf-mine", "mine", true);
  $$("[data-xp]").forEach((c) => c.onclick = () => { f.pattern = c.dataset.xp; renderLibrary(); });
  $$("[data-ex]").forEach((c) => c.onclick = () => openExercise(c.dataset.ex));
}

function openExercise(id) {
  const e = XBY[id], w = W(), log = w.log[id] || [], T = trainingProfile();
  const reps = e.unit === "seconds" ? "20–45 s" : e.kind === "compound" ? T.reps.compound : T.reps.isolation;
  const q = encodeURIComponent(`${e.name} proper form`);
  const trend = log.map((l) => Math.max(0, ...String(l.reps).split(/[\s,/]+/).map(Number).map((r) => e1rm(+l.weight, r)))).filter((x) => x > 0);
  openModal(`
    <div class="row"><h1 style="margin:0">${esc(e.name)}</h1><span class="spacer"></span><span style="position:relative;width:36px;height:36px">${xheart(id)}</span></div>
    <div style="margin:6px 0">${e.muscles.map((m) => `<span class="chip skill-chip">${window.MUSCLES[m]}</span>`).join("")}${e.sec.map((m) => `<span class="chip">${window.MUSCLES[m]} (helper)</span>`).join("")}<span class="chip diff-${e.level}">${DIFF[e.level]}</span></div>
    <div class="stats">
      <div class="stat"><div class="k">For you</div><div class="v">${reps}</div><div class="small muted">${T.rir} reps in reserve</div></div>
      <div class="stat"><div class="k">Rest</div><div class="v">${e.kind === "compound" ? `${T.rest.compound / 60} min` : `${T.rest.isolation} s`}</div></div>
      <div class="stat"><div class="k">Equipment</div><div class="v">${esc(e.equip.join(" / "))}</div></div>
      ${trend.length ? `<div class="stat"><div class="k">Est. 1-rep max</div><div class="v">${Math.round(trend[trend.length - 1])} kg</div>${sparkline(trend, 110, 28)}</div>` : ""}
    </div>
    ${e.stress.length ? `<div class="box amber small">Loads your ${e.stress.join(" & ")}. If it hurts (sharp pain, not effort), switch to ${e.easier ? `<a href="#" data-xopen="${e.easier}">${esc(XBY[e.easier].name)}</a>` : "an easier version"}.</div>` : ""}
    <div class="two">
      <div><h2>How to do it</h2><ol class="steps">${e.how.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
      <div><h2>Cues</h2><ul>${e.cues.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
        <h2>Common mistakes</h2><ul>${e.mistakes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
        <div class="row">${e.easier ? `<a class="btn sm" href="#" data-xopen="${e.easier}">⬇ Easier: ${esc(XBY[e.easier].name)}</a>` : ""}${e.harder ? `<a class="btn sm" href="#" data-xopen="${e.harder}">⬆ Harder: ${esc(XBY[e.harder].name)}</a>` : ""}</div>
        <p><a href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">▶ Watch form videos (YouTube search) ↗</a></p></div>
    </div>
    <div class="box green"><b>🎯 ${esc(nextTarget(id))}</b></div>
    <h2>Log it</h2>
    <div class="row"><input type="date" id="ex-date" value="${ymd(new Date())}">
      <label class="small">Weight (kg) <input type="number" step="0.5" id="ex-w" style="width:80px" value="${suggestWeight(id)}"></label>
      <label class="small">${e.unit === "seconds" ? "Seconds" : "Reps"} per set <input id="ex-reps" placeholder="e.g. 10, 9, 8" style="width:120px"></label>
      <button class="btn primary" id="ex-save">Save</button></div>
    ${log.length ? `<table class="sched" style="margin-top:10px">${log.slice(-8).reverse().map((l, k) => `<tr><td>${l.date}</td><td>${+l.weight ? l.weight + " kg" : "bodyweight"}</td><td>${esc(l.reps)}</td><td><button class="btn sm ghost" data-del-log="${log.length - 1 - k}">🗑</button></td></tr>`).join("")}</table>` : ""}`);
  $("#ex-save").onclick = () => {
    const reps = $("#ex-reps").value.trim(); if (!reps) return alert("Enter what you did for each set, e.g. 10, 9, 8");
    (w.log[id] = w.log[id] || []).push({ date: $("#ex-date").value, weight: +$("#ex-w").value || 0, reps });
    w.log[id].sort((a, b) => a.date.localeCompare(b.date)); save(); openExercise(id);
  };
  $$("[data-del-log]").forEach((b) => b.onclick = () => { w.log[id].splice(+b.dataset.delLog, 1); save(); openExercise(id); });
  $$("[data-xopen]").forEach((a) => a.onclick = (ev) => { ev.preventDefault(); openExercise(a.dataset.xopen); });
}

// ───── Workout mode (the training "cook mode"): set-by-set with auto rest timer ─────
let WM = null;
function startWorkoutMode(session) {
  const steps = [{ type: "warmup", min: 8 }];
  for (const it of session.items) for (let k = 1; k <= it.sets; k++) steps.push({ type: "set", it, k });
  WM = { session, steps, i: 0, done: [], started: Date.now(), restEnd: 0, timer: null };
  if (navigator.wakeLock && !wakeLock) navigator.wakeLock.request("screen").then((x) => (wakeLock = x)).catch(() => {});
  drawWM();
}
function drawWM() {
  const el = $("#cookmode"); el.classList.remove("hidden");
  clearInterval(WM.timer);
  const s = WM.steps[WM.i], prog = `<div class="progress"><div style="width:${(WM.i / WM.steps.length) * 100}%"></div></div>`;
  const top = `<div class="top"><b>🏋️ ${esc(WM.session.name)}</b><span class="spacer"></span><span class="muted">${fmtMin((Date.now() - WM.started) / 60000)}</span><button class="btn" id="wm-exit">✕ End</button></div>`;
  if (WM.restEnd > Date.now()) {
    const next = WM.steps[WM.i];
    el.innerHTML = `${top}<div class="stepbig" style="text-align:center">${prog}
      <div class="stepnum" style="margin-top:24px">REST</div><div class="resttime" id="wm-rest"></div>
      <div class="muted">Next: ${next ? esc(next.type === "set" ? `${XBY[next.it.id].name} — set ${next.k}/${next.it.sets}` : "Done!") : "Finish"}</div>
      <div class="row" style="justify-content:center;margin-top:24px"><button class="btn" id="wm-plus">+30 s</button><button class="btn primary" id="wm-skip">Skip rest →</button></div></div>`;
    const tick = () => { const left = Math.max(0, Math.round((WM.restEnd - Date.now()) / 1000)); const r = $("#wm-rest"); if (r) r.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`; if (!left) { beep(); WM.restEnd = 0; drawWM(); } };
    tick(); WM.timer = setInterval(tick, 500);
    $("#wm-skip").onclick = () => { WM.restEnd = 0; drawWM(); };
    $("#wm-plus").onclick = () => { WM.restEnd += 30000; };
  } else if (!s) {
    finishWorkout(); return;
  } else if (s.type === "warmup") {
    el.innerHTML = `${top}<div class="stepbig">${prog}<div class="stepnum" style="margin-top:20px">WARM-UP · ${s.min} MIN</div>
      <div class="steptext">5 minutes of easy cardio (brisk walk, bike, skipping), then 1–2 light sets of your first exercise: ${esc(XBY[WM.session.items[0].id].name)}.</div>
      <div class="row"><button class="btn" id="wm-timer">⏲ ${s.min}-min timer</button><span class="spacer"></span><button class="btn primary" id="wm-next">Start lifting →</button></div></div>`;
    $("#wm-timer").onclick = () => startTimer("Warm-up", s.min);
    $("#wm-next").onclick = () => { WM.i++; drawWM(); };
  } else {
    const e = XBY[s.it.id], prev = [...WM.done].reverse().find((d) => d.ex === e.id), sw = prev ? prev.w : suggestWeight(e.id);
    el.innerHTML = `${top}<div class="stepbig">${prog}
      <div class="stepnum" style="margin-top:20px">SET ${s.k} OF ${s.it.sets} · target ${esc(s.it.reps)} · ${esc(trainingProfile().rir)} reps in reserve</div>
      <div class="steptext">${esc(e.name)}</div>
      <div class="muted" style="color:#c9b8ae">${esc(e.cues.join(" · "))}</div>
      <div class="row wm-inputs" style="margin-top:22px">
        <label>Weight (kg)<input type="number" step="0.5" id="wm-w" value="${sw}" placeholder="${e.equip.includes("bodyweight") ? "0" : ""}"></label>
        <label>${e.unit === "seconds" ? "Seconds" : "Reps done"}<input type="number" id="wm-r" value="${repTop(s.it.reps) || ""}"></label>
      </div>
      <div class="row" style="margin-top:22px"><button class="btn" id="wm-back" ${WM.i <= 1 ? "disabled" : ""}>← Back</button><button class="btn" id="wm-how">How to</button><span class="spacer"></span><button class="btn primary" id="wm-done">✓ Set done</button></div>
      <div id="wm-howbox" class="ingpanel" style="display:none;margin-top:14px">${e.how.map((h, k) => `${k + 1}. ${esc(h)}`).join("<br>")}</div></div>`;
    $("#wm-how").onclick = () => { const b = $("#wm-howbox"); b.style.display = b.style.display === "none" ? "block" : "none"; };
    $("#wm-back").onclick = () => { WM.i--; WM.done.pop(); drawWM(); };
    $("#wm-done").onclick = () => {
      WM.done.push({ ex: e.id, w: +$("#wm-w").value || 0, r: +$("#wm-r").value || 0 });
      WM.i++;
      const next = WM.steps[WM.i];
      if (next) WM.restEnd = Date.now() + s.it.rest * 1000;
      drawWM();
    };
  }
  $("#wm-exit").onclick = () => { if (!WM.done.length || confirm("End workout? Sets you did will be saved.")) finishWorkout(true); };
}
function finishWorkout(early) {
  clearInterval(WM.timer);
  const w = W(), date = ymd(new Date()), minutes = Math.round((Date.now() - WM.started) / 60000);
  const byEx = {};
  for (const d of WM.done) (byEx[d.ex] = byEx[d.ex] || []).push(d);
  const prs = [];
  for (const [ex, sets] of Object.entries(byEx)) {
    const before = bestE1rm(ex), top = Math.max(...sets.map((x) => x.w));
    (w.log[ex] = w.log[ex] || []).push({ date, weight: top, reps: sets.map((x) => x.r).join(", ") });
    const after = bestE1rm(ex); if (after > before && before > 0) prs.push(`${XBY[ex].name}: ~${Math.round(after)} kg est. 1RM`);
  }
  const volume = WM.done.reduce((s, d) => s + d.w * d.r, 0);
  if (WM.done.length) w.sessions.push({ id: uid(), date, name: WM.session.name, minutes, sets: WM.done.length, volume, prs });
  save();
  const el = $("#cookmode");
  el.innerHTML = `<div class="stepbig" style="text-align:center"><div class="stepnum">${early ? "WORKOUT ENDED" : "WORKOUT COMPLETE"} 💪</div>
    <div class="steptext">${WM.done.length} sets · ${fmtMin(Math.max(1, minutes))}${volume ? ` · ${Math.round(volume).toLocaleString()} kg lifted` : " · bodyweight"}</div>
    ${prs.length ? `<div style="color:#f0a58f">🏆 New personal records: ${prs.map(esc).join(" · ")}</div>` : ""}
    <p class="muted" style="color:#c9b8ae">Now: eat a protein-rich meal or shake within a couple of hours, and sleep 7–9 h tonight.</p>
    <div class="row" style="justify-content:center"><button class="btn primary" id="wm-close">Done</button></div></div>`;
  $("#wm-close").onclick = () => { el.classList.add("hidden"); if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } WM = null; location.hash = "#workouts?v=progress"; route(); };
}

function renderProgress() {
  const w = W(), S = [...w.sessions].sort((a, b) => b.date.localeCompare(a.date));
  const weekKey = (d) => ymd(mondayOf(parseYmd(d)));
  const weeks = {}; for (const s of w.sessions) weeks[weekKey(s.date)] = (weeks[weekKey(s.date)] || 0) + 1;
  const last8 = Array.from({ length: 8 }, (_, k) => ymd(addDays(mondayOf(new Date()), -7 * (7 - k))));
  let streak = 0; for (let k = 7; k >= 0; k--) { if (weeks[last8[k]]) streak++; else if (k < 7) break; }
  const planned = trainingDays().length, thisWeek = weeks[last8[7]] || 0;
  const maxW = Math.max(1, ...last8.map((k) => weeks[k] || 0), planned);
  const exs = Object.keys(w.log).filter((id) => XBY[id] && w.log[id].length);
  const badges = [["🥇 First workout", S.length >= 1], ["🔟 10 workouts", S.length >= 10], ["🏅 25 workouts", S.length >= 25], ["💯 100 workouts", S.length >= 100],
    ["🔥 4-week streak", streak >= 4], ["🏆 First PR", S.some((s) => s.prs?.length)], ["✅ WHO strength week (2+ sessions)", Object.values(weeks).some((n) => n >= 2)], ["📚 Tried 15 exercises", exs.length >= 15]];
  $("#wbody").innerHTML = `
    <div class="summary">
      <div class="stat"><div class="k">This week</div><div class="v">${thisWeek} / ${planned || "–"} sessions</div></div>
      <div class="stat"><div class="k">Streak</div><div class="v">${streak} week${streak === 1 ? "" : "s"}</div></div>
      <div class="stat"><div class="k">Total workouts</div><div class="v">${S.length}</div></div>
      <div class="stat"><div class="k">Lifted (all time)</div><div class="v">${Math.round(S.reduce((t, s) => t + (s.volume || 0), 0)).toLocaleString()} kg</div></div>
    </div>
    <h2>Sessions per week</h2>
    <div class="card weekbars">${last8.map((k) => `<div class="wb"><div class="wbbar" style="height:${((weeks[k] || 0) / maxW) * 100}%"></div><span>${k.slice(5)}</span></div>`).join("")}</div>
    <h2>🏅 Badges</h2>
    <div class="stamps">${badges.map(([l, on]) => `<div class="stamp ${on ? "on" : ""}"><div>${l}</div></div>`).join("")}</div>
    <h2>📈 Strength trends</h2>
    ${exs.length ? `<table class="sched">${exs.map((id) => { const tr = w.log[id].map((l) => Math.max(0, ...String(l.reps).split(/[\s,/]+/).map(Number).map((r) => e1rm(+l.weight, r)))).filter((x) => x > 0); const last = w.log[id][w.log[id].length - 1];
      return `<tr data-ex="${id}" style="cursor:pointer"><td><b>${esc(XBY[id].name)}</b></td><td>${tr.length ? `${Math.round(Math.max(...tr))} kg best est. 1RM` : "bodyweight"}</td><td>${sparkline(tr)}</td><td class="muted small">last ${last.date}: ${+last.weight ? last.weight + " kg × " : ""}${esc(last.reps)}</td></tr>`; }).join("")}</table>`
      : `<p class="muted">No lifts logged yet. Press “Start today’s workout” — every set you finish is saved here.</p>`}
    <h2>Workout log</h2>
    ${S.length ? S.slice(0, 30).map((s) => `<div class="card" style="margin-bottom:8px"><div class="row"><b>${esc(s.name)}</b><span class="muted small">${s.date} · ${fmtMin(s.minutes)} · ${s.sets} sets · ${Math.round(s.volume).toLocaleString()} kg</span><span class="spacer"></span><button class="btn sm ghost" data-del-s="${s.id}">🗑</button></div>${s.prs?.length ? `<div class="small">🏆 ${s.prs.map(esc).join(" · ")}</div>` : ""}</div>`).join("") : `<p class="muted">Nothing yet.</p>`}`;
  $$("[data-ex]").forEach((r) => r.onclick = () => openExercise(r.dataset.ex));
  $$("[data-del-s]").forEach((b) => b.onclick = () => { if (confirm("Delete this workout from the log?")) { w.sessions = w.sessions.filter((s) => s.id !== b.dataset.delS); save(); renderProgress(); } });
}

function renderScience() {
  const T = trainingProfile(), p = goals().profile, C = calcTargets(), w = W();
  const E = Object.fromEntries((window.TRAINING_EVIDENCE || []).map((e) => [e.key, e]));
  const link = (k) => { const e = E[k]; return e ? `<a href="${e.url || `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(e.q)}`}" target="_blank" rel="noopener">${esc(e.cite.split(" (")[0])} ${e.cite.match(/\((\d{4})\)/)?.[1] || ""} ↗</a>` : ""; };
  const rows = [
    ["Maintenance calories", `${C.tdee} kcal/day`, `Your resting energy from age, sex, height and weight, × your daily activity.`, ["mifflin"]],
    ["Calorie surplus to gain", T.surplus ? `+${T.surplus} kcal/day → ≈ ${(T.ratePct / 100 * p.weight).toFixed(2)} kg/week` : "none (maintain)", `Slow gain (${T.ratePct}% of body weight/week) builds muscle with less fat. ${T.bmi < 18.5 ? "Your BMI is under 18.5, so gaining is also a health win." : T.bmi >= 25 ? "Your BMI is 25+, so a smaller surplus is used." : ""}`, ["surplus"]],
    ["Protein", `${T.protein} g/kg → ${Math.round(T.protein * p.weight)} g/day, in 4 meals of ~${Math.round(T.protein * p.weight / 4)} g`, `Muscle-gain benefits level off around 1.6 g/kg; spread over the day every 3–4 h.${T.older ? " Older adults need more." : ""}`, ["protein", "issn", ...(T.older ? ["older"] : [])]],
    ["Training days", `${T.days || "none set"} per week, each muscle ~2×/week`, `Twice a week per muscle beats once a week. WHO: strength training on 2+ days.`, ["frequency", "who"]],
    ["Weekly sets per muscle", `${T.weeklySets} hard sets`, `More weekly sets → more growth, with 10+ clearly better than a few. ${T.mid ? "Slightly fewer after 50 for recovery." : ""}`, ["volume"]],
    ["Reps & effort", `${T.reps.compound} reps (big lifts), ${T.reps.isolation} (small), ${T.rir} reps in reserve`, `Growth is similar from about 6 to 30 reps if sets are hard; heavier sets build more strength. Stopping 1–3 reps short of failure keeps form safe.`, ["load", "progression"]],
    ["Rest between sets", `${T.rest.compound / 60} min (big lifts), ${T.rest.isolation} s (small)`, `Longer rest on big lifts lets you lift more, which built more muscle and strength.`, ["rest"]],
    ["Progression", `Add weight when every set hits the top of the rep range`, `Increase load about 2–10% when you exceed the target reps.`, ["progression"]],
    ["Cardio", `${cardioPlan().total} min/week of ${cardioPlan().opt.name.toLowerCase()}`, `Healthy heart & longevity: 150–300 min/week. Walking or cycling barely interferes with muscle gain; long running does more.`, ["who", "concurrent"]],
    ["Calories burned training", `≈ ${sessionKcal(w.sessionMin)} kcal per ${w.sessionMin}-min session`, `Estimated from MET values; ${w.autoKcal ? "added to your food target on those days." : "turn on auto-add in My program to eat them back."}`, ["met"]],
    ...(T.older ? [["Balance", "2 balance exercises in each session", "Adults 65+ should add balance and strength work 3+ days a week to prevent falls.", ["who"]]] : []),
    ["Sleep", "7–9 hours a night", "Recovery, hormones and appetite all depend on it.", ["sleep"]],
  ];
  $("#wbody").innerHTML = `
    <p class="sub">Every number in your program and food targets, for you (${p.age} y, ${p.sex}, ${p.height} cm, ${p.weight} kg, ${w.level}), and the research behind it.</p>
    <table class="sci">${rows.map(([what, yours, why, keys]) => `<tr><td><b>${what}</b></td><td class="yours">${esc(yours)}</td><td>${esc(why)}<div class="small">${keys.map(link).join(" · ")}</div></td></tr>`).join("")}</table>
    <h2>Sources</h2>
    <ol class="small">${(window.TRAINING_EVIDENCE || []).map((e) => `<li>${esc(e.cite)} — <i>${esc(e.finding)}</i> <a href="${e.url || `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(e.q)}`}" target="_blank" rel="noopener">${e.url ? "WHO ↗" : "PubMed ↗"}</a></li>`).join("")}</ol>
    <div class="box amber small">This is general, evidence-based guidance — not medical advice. Formulas give estimates; your weekly weigh-ins and logs are the real feedback. If you have a medical condition, an injury, are pregnant, or are under 18 or over 65 and new to exercise, check with a doctor or qualified coach first.</div>`;
}

// ───────────── BACKUP / RESTORE ─────────────
const BACKUP_KEYS = ["plan", "journal", "freezer", "shopChecks", "extras", "settings", "pantry", "goals", "workout", "favorites"];
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
    ${pickRecipe ? `<label class="field">Recipe<select id="ap-recipe">${[...RECIPES].sort((a, b) => isFav(b.id) - isFav(a.id) || a.name.localeCompare(b.name)).map((x) => `<option value="${x.id}">${isFav(x.id) ? "♥ " : ""}${x.flag} ${x.name} — ${fmtMin(x.totalMin)}</option>`).join("")}</select></label>` : `<p><b>${r.flag} ${r.name}</b></p>`}
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
  const meals = inWeek.filter((p) => p.meal !== "prep").length;
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
      ${(inWeek.some((p) => p.meal === "prep") ? ["prep", ...MEALS] : MEALS).map((m) => `<div class="lbl">${m === "prep" ? "Batch cook" : m[0].toUpperCase() + m.slice(1)}</div>${dates.map((d) => `<div class="cell ${m === "prep" ? "prep-cell" : ""}">
        ${slotEntries(d, m).map((p) => { const r = BY_ID[p.recipeId]; return `<div class="entry ${p.type}" data-open="${r.id}">
          <button class="x" data-rm="${p.id}" title="Remove">×</button>
          ${p.type === "cook" ? "🔥 Cook" : p.type === "leftover" ? (p.gp ? "🍱 From batch" : "♻️ Leftover") : "🧊 Freezer"}: <b>${r.flag} ${r.name}</b>
          ${p.type === "cook" ? `<div class="muted">${p.servings} servings · ${fmtMin(r.activeMin)} hands-on</div>` : ""}
          ${p.eat ? `<div class="muted">eat ×${p.eat}${p.side ? ` + ${SIDES[p.side].label}` : ""} ≈ ${mealKcal(r, p.eat)} kcal</div>` : ""}</div>`; }).join("")}
        ${m === "prep" ? "" : `<button class="add-slot" data-add="${d}|${m}">+</button>`}</div>`).join("")}`).join("")}
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
  return Object.entries(items).map(([key, v]) => {
    const g = gramsFor({ q: v.hasQ ? v.q : null, u: v.unit, n: v.name, a: v.aisle }).g;
    return { key, ...v, for: [...v.for], cost: v.hasQ || v.aisle === "spice" ? lineCost({ k: v.k, n: v.name, a: v.aisle }, g) : 0, perKg: pricePerKg(v.k, v.name, v.aisle) };
  });
}
// breakfasts / snacks / shakes the Goals planner scheduled this week → counts + shake ingredients to buy
function goalsExtrasForWeek(dates) {
  const R = state.goals?.result;
  if (!R || R.week !== dates[0]) return null;
  const counts = {};
  for (const d of R.days) for (const x of d.items || []) if (x.addon) counts[x.addon] = (counts[x.addon] || 0) + 1;
  const ids = Object.keys(counts);
  if (!ids.length) return null;
  const shakeItems = {};
  for (const id of ids) if (SHAKE_BY_ID[id]) for (const i of SHAKE_BY_ID[id].ing) {
    if (i.q == null || i.k === "water" || i.k === "ice") continue;
    const key = i.k + "|" + i.u;
    const it = shakeItems[key] || (shakeItems[key] = { name: i.n, k: i.k, unit: i.u, aisle: i.a, q: 0 });
    it.q += i.q * counts[id];
  }
  const cost = ids.reduce((s, id) => s + addonCost(id) * counts[id], 0);
  return { counts, shakeItems: Object.values(shakeItems), cost };
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
        ${i.cost ? `<span class="cost">${fmtMoney(i.cost)}</span>` : ""}
        ${FRESH_AISLES.includes(i.aisle) ? "" : `<button class="btn sm ghost" data-have="${esc(i.k)}" title="I already have this — remember it">🏠</button>`}</label>`).join("")}</div>`).join("");
  };
  const cooks = entries.filter((e) => e.type === "cook");
  const S = state.settings;
  const sum = (l) => l.reduce((s, i) => s + (i.cost || 0), 0);
  const extrasG = goalsExtrasForWeek(dates);
  const toBuy = sum(fresh) + sum(pantry) + (extrasG ? extrasG.cost : 0), homeValue = sum(atHome);
  const budget = +S.weeklyBudget || 0;
  $("#view").innerHTML = `
    <div class="row"><h1>Grocery List</h1><span class="spacer"></span>
      <button class="btn" id="wk-prev">←</button><b>${dayLabel(ws)} – ${dayLabel(addDays(ws, 6))}</b><button class="btn" id="wk-next">→</button></div>
    <p class="sub">Combined and scaled from the ${cooks.length} cooking session(s) in your plan. Leftover and freezer meals need no shopping.</p>
    ${cooks.length ? `
    <div class="summary">
      <div class="stat"><div class="k">To buy this week (est.)</div><div class="v" style="color:${budget && toBuy > budget ? "var(--red)" : "var(--green)"}">${fmtMoney(toBuy)}</div>${budget ? `<div class="small muted">budget ${fmtMoney(budget)} · ${toBuy > budget ? `${fmtMoney(toBuy - budget)} over` : `${fmtMoney(budget - toBuy)} left`}</div>` : ""}</div>
      <div class="stat"><div class="k">Already at home (value)</div><div class="v">${fmtMoney(homeValue)}</div></div>
      <div class="stat"><div class="k">Per home meal</div><div class="v">${fmtMoney((sum(fresh) + sum(pantry) + homeValue) / Math.max(1, entries.filter((p) => p.meal !== "prep").length))}</div></div>
    </div>
    ${budget ? `<div class="bar"><div style="width:${Math.min(100, (toBuy / budget) * 100)}%;background:${toBuy > budget ? "var(--red)" : "var(--green)"}"></div></div>` : ""}
    <div class="row"><button class="btn primary" id="copy">📋 Copy list</button><button class="btn" id="uncheck">Uncheck all</button>
      <span class="muted small">Tip: buy fresh herbs & seafood within 1–2 days of the cook date.</span></div>
    <div class="two" style="margin-top:12px">
      <div><h2>🛒 Buy fresh</h2>${group(fresh) || "<p class='muted'>Nothing.</p>"}</div>
      <div><h2>🥫 Staples to buy</h2><p class="small muted">Long-lasting items not in your <a href="#pantry">pantry</a> yet. Already have one? Tap 🏠 to remember it.</p>${group(pantry) || "<p class='muted'>Nothing — your pantry covers it.</p>"}</div>
    </div>
    <div class="row" style="margin-top:8px"><button class="btn" id="to-pantry">🏠 Put checked staples in my pantry</button></div>
    ${atHome.length ? `<h2>✓ Already at home (${atHome.length})</h2><p class="small muted">Skipped because they're in your pantry. Running low? Tap to put it back on the list.</p>
      <div>${atHome.sort((a, b) => a.name.localeCompare(b.name)).map((i) => `<span class="chip click diff-1" data-need="${esc(i.k)}" title="Running low — add back to list">✓ ${esc(i.name)}</span>`).join("")}</div>` : ""}
    ${extrasG ? `<h2>🥤 Breakfasts, snacks & shakes (from your Goals plan)</h2>
      <p class="small muted">${Object.entries(extrasG.counts).map(([id, n]) => `${esc((SHAKE_BY_ID[id] || ADDON[id] || { name: id }).name)} × ${n}`).join(" · ")} — about ${fmtMoney(extrasG.cost)} in total.</p>
      ${extrasG.shakeItems.length ? `<div>${extrasG.shakeItems.map((i) => `<span class="chip">${fmtQty(i.q, i.unit)} ${i.unit} ${esc(i.name)}</span>`).join("")}</div><p class="small muted">Shake ingredients above. Simple add-ons (toast, oats, milk, nuts) — grab what you need.</p>` : ""}` : ""}
    <h2>➕ Extra items</h2>
    <div class="row"><input id="extra" placeholder="e.g. coffee, dish soap"><button class="btn" id="add-extra">Add</button></div>
    <div style="margin-top:8px">${state.extras.map((x, i) => `<label class="shop-item"><input type="checkbox" data-xdel="${i}"> ${esc(x)}</label>`).join("")}</div>
    <h2>📅 When to shop</h2>
    <div class="box">${shopTiming(cooks)}</div>
    ${priceSettingsHtml(items)}`
    : `<div class="empty">No cooking sessions planned this week. <a href="#plan">Plan some meals</a> and the list builds itself.</div>${priceSettingsHtml([])}`}`;
  bindPriceSettings(renderShop);
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

// Currency, price level and your own prices. Everything is an estimate until you enter what you pay.
const PRICE_LEVELS = [[0.35, "Very low-cost (e.g. Vietnam, India, Indonesia)"], [0.55, "Low-cost (e.g. Mexico, Thailand, Turkey)"], [0.8, "Medium (e.g. Southern/Eastern Europe)"], [1, "US average"], [1.15, "High (e.g. UK, Western Europe, Australia)"], [1.35, "Very high (e.g. Switzerland, Norway, big-city central)"]];
function priceSettingsHtml(items) {
  const S = state.settings, own = S.prices || {};
  const list = items.filter((i) => i.aisle !== "spice" && i.hasQ).sort((a, b) => b.cost - a.cost);
  return `<h2>💰 Prices & budget</h2>
    <div class="card">
      <div class="row">
        <label class="field">Currency symbol <input id="ps-cur" value="${esc(currency())}" style="width:70px"></label>
        <label class="field">Price level where you shop <select id="ps-level">${PRICE_LEVELS.map(([v, l]) => `<option value="${v}" ${+priceLevel() === v ? "selected" : ""}>${l}</option>`).join("")}<option value="custom" ${PRICE_LEVELS.some(([v]) => v === priceLevel()) ? "" : "selected"}>Custom: ×${priceLevel()}</option></select></label>
        <label class="field">Custom multiplier <input id="ps-mult" type="number" step="0.05" value="${priceLevel()}" style="width:80px"></label>
        <label class="field">Weekly food budget <input id="ps-budget" type="number" step="5" value="${S.weeklyBudget || ""}" placeholder="none" style="width:100px"></label>
      </div>
      <p class="small muted" style="margin:0">Built-in prices are typical US supermarket averages × your price level, so treat totals as rough. Enter what you actually pay below and the estimates sharpen (prices are per kg or per litre, in your currency).</p>
      ${list.length ? `<details style="margin-top:10px"><summary><b>Set your own prices for this week’s items</b> (${Object.keys(own).length} saved)</summary>
        <table class="sched" style="margin-top:8px"><tr><th>Item</th><th>Estimate / kg</th><th>Your price / kg</th><th>This week</th></tr>
        ${list.map((i) => `<tr><td>${esc(i.name)}</td><td class="muted">${fmtMoney(own[i.k] != null && own[i.k] !== "" ? (usdPerKg(i.name) ?? window.AISLE_PRICE[i.aisle] ?? 4) * priceLevel() : i.perKg)}</td>
          <td><input type="number" step="0.1" data-price="${esc(i.k)}" value="${own[i.k] ?? ""}" placeholder="—" style="width:90px"></td><td>${fmtMoney(i.cost)}</td></tr>`).join("")}</table></details>` : ""}
    </div>`;
}
function bindPriceSettings(rerender) {
  const S = state.settings;
  const set = (fn) => { fn(); save(); rerender(); };
  if (!$("#ps-cur")) return;
  $("#ps-cur").onchange = (e) => set(() => (S.currency = e.target.value.trim() || "$"));
  $("#ps-level").onchange = (e) => { if (e.target.value !== "custom") set(() => (S.priceLevel = +e.target.value)); };
  $("#ps-mult").onchange = (e) => set(() => (S.priceLevel = Math.max(0.05, +e.target.value || 1)));
  $("#ps-budget").onchange = (e) => set(() => (S.weeklyBudget = Math.max(0, +e.target.value || 0)));
  $$("[data-price]").forEach((inp) => inp.onchange = () => set(() => {
    S.prices = S.prices || {};
    if (inp.value === "") delete S.prices[inp.dataset.price]; else S.prices[inp.dataset.price] = +inp.value;
  }));
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
