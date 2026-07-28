// ============ THE PAN-AM TRAIL — game logic ============

// ---------- tiny helpers ----------
const $ = id => document.getElementById(id);
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1)); // inclusive int
const rf = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const money = n => "$" + Math.round(n).toLocaleString();

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
  G.screen = id;
}

// ---------- bleepy audio ----------
let audioCtx = null;
function beep(freq, dur = 0.08, type = "square", vol = 0.04) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (e) { /* audio is optional */ }
}
const sfx = {
  ok: () => beep(660, 0.06),
  bad: () => { beep(220, 0.15, "sawtooth"); setTimeout(() => beep(160, 0.2, "sawtooth"), 120); },
  good: () => { beep(520, 0.07); setTimeout(() => beep(780, 0.1), 80); },
  pickup: () => beep(880, 0.05),
  death: () => { [330, 262, 196, 131].forEach((f, i) => setTimeout(() => beep(f, 0.25, "triangle", 0.06), i * 220)); },
  fanfare: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, "square", 0.05), i * 140)); }
};

// ---------- pixel sprites ----------
const PAL = {
  K: "#101010", W: "#cfe8ff", R: "#c83c30", O: "#e8842a", Y: "#f0c030",
  G: "#8a9098", D: "#4a5058", B: "#3878c8", L: "#f8f0d8", T: "#6a4a2a",
  E: "#30a848", S: "#c0c8d0", P: "#e85a88"
};

const SPRITES = {
  ev: [
    "......................",
    ".......SSSSSSSS.......",
    "......SWWWWWWWWS......",
    ".....SWWWWSWWWWSS.....",
    "..BBBBBBBBBBBBBBBBB...",
    ".BBBBBBBBBBBBBBBBBBY..",
    ".BBBBBBBBBBBBBBBBBBB..",
    "...KK...........KK....",
    "..KKKK.........KKKK...",
    "...KK...........KK...."
  ],
  van: [
    "......................",
    "..LLLLLLLLLLLLLLLL....",
    ".LWWWWLWWWWLWWWWLLL...",
    ".LWWWWLWWWWLWWWWLLLL..",
    ".RRRRRRRRRRRRRRRRRRR..",
    ".RRRRRRRRRRRRRRRRRRY..",
    ".RRRRRRRRRRRRRRRRRRR..",
    "...KK...........KK....",
    "..KKKK.........KKKK...",
    "...KK...........KK...."
  ],
  moto: [
    "......................",
    "..........OO..........",
    ".........OOOO.........",
    "..........DD..........",
    ".......DDDDDDD........",
    "......DDDDDDDDDY......",
    ".....KKK......KKK.....",
    "....KKKKK....KKKKK....",
    ".....KKK......KKK.....",
    "......................"
  ],
  bus: [
    "......................",
    ".YYYYYYYYYYYYYYYYYYY..",
    ".YWWYWWYWWYWWYWWYYYY..",
    ".YYYYYYYYYYYYYYYYYYYL.",
    ".YYYYYYYYYYYYYYYYYYYY.",
    ".KKKKKKKKKKKKKKKKKKKK.",
    "...KK....KK.....KK....",
    "..KKKK..KKKK...KKKK...",
    "...KK....KK.....KK....",
    "......................"
  ]
};

function drawSprite(ctx, map, x, y, sc) {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      const ch = map[r][c];
      if (ch !== ".") {
        ctx.fillStyle = PAL[ch] || "#fff";
        ctx.fillRect(x + c * sc, y + r * sc, sc, sc);
      }
    }
  }
}

// deterministic hash for scenery placement
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

// ---------- scenery painters ----------
function drawFar(ctx, kind, color, snowcap, off, W, horizon) {
  ctx.fillStyle = color;
  if (kind === "flat") { ctx.fillRect(0, horizon - 8, W, 8); return; }
  if (kind === "ocean") {
    ctx.fillRect(0, horizon - 26, W, 26);
    ctx.fillStyle = "#e8f4f8";
    for (let i = 0; i < 14; i++) {
      const x = ((i * 61 + off * 0.15) % (W + 40)) - 20;
      ctx.fillRect(x, horizon - 8 - (i % 3) * 6, 12, 2);
    }
    return;
  }
  const spacing = kind === "peaks" ? 90 : kind === "mesas" ? 110 : 130;
  const base = Math.floor(off / spacing);
  for (let i = -1; i < W / spacing + 2; i++) {
    const idx = base + i;
    const h = 30 + hash(idx) * (kind === "peaks" ? 75 : kind === "hills" || kind === "dunes" ? 32 : 55);
    const cx = idx * spacing - off + spacing / 2;
    const wHalf = spacing * (0.65 + hash(idx + 99) * 0.4);
    ctx.fillStyle = color;
    if (kind === "mesas") {
      ctx.fillRect(cx - wHalf / 2, horizon - h, wHalf, h);
      ctx.fillRect(cx - wHalf / 2 - 8, horizon - h + 10, wHalf + 16, h - 10);
    } else if (kind === "volcano") {
      steppedTriangle(ctx, cx, horizon, wHalf, h);
      ctx.fillStyle = "#888";
      ctx.fillRect(cx - 3, horizon - h - 8 - hash(idx) * 6, 6, 6); // puff of smoke
    } else {
      steppedTriangle(ctx, cx, horizon, wHalf, h);
      if (snowcap && h > 45) {
        ctx.fillStyle = "#e8f0f8";
        steppedTriangle(ctx, cx, horizon - h + 14, wHalf * (14 / h), 14);
      }
    }
  }
}

function steppedTriangle(ctx, cx, baseY, halfW, h) {
  const steps = 6;
  for (let s = 0; s < steps; s++) {
    const w = halfW * (1 - s / steps);
    const y = baseY - (h * (s + 1)) / steps;
    ctx.fillRect(cx - w, y, w * 2, h / steps + 1);
  }
}

function drawMidItem(ctx, kind, x, y, seed) {
  const v = hash(seed);
  ctx.fillStyle = "#2a5a20";
  if (kind === "cactus") {
    ctx.fillStyle = "#3a8a3a";
    ctx.fillRect(x, y - 22, 6, 22);
    ctx.fillRect(x - 6, y - 16, 6, 4); ctx.fillRect(x - 6, y - 16, 4, 8);
    ctx.fillRect(x + 6, y - 12, 6, 4); ctx.fillRect(x + 8, y - 12, 4, 6);
  } else if (kind === "pine") {
    ctx.fillStyle = "#4a3020"; ctx.fillRect(x + 2, y - 6, 4, 6);
    ctx.fillStyle = v > 0.5 ? "#1a5a2a" : "#286a30";
    steppedTriangle(ctx, x + 4, y - 4, 10, 24);
  } else if (kind === "palm") {
    ctx.fillStyle = "#7a5a30"; ctx.fillRect(x, y - 20, 4, 20);
    ctx.fillStyle = "#2a8a30";
    ctx.fillRect(x - 8, y - 24, 10, 4); ctx.fillRect(x + 2, y - 24, 10, 4);
    ctx.fillRect(x - 5, y - 20, 6, 3); ctx.fillRect(x + 3, y - 20, 6, 3);
  } else if (kind === "agave") {
    ctx.fillStyle = "#5a8a4a";
    ctx.fillRect(x - 6, y - 6, 14, 4); ctx.fillRect(x - 2, y - 12, 6, 10);
    ctx.fillRect(x - 8, y - 10, 4, 6); ctx.fillRect(x + 6, y - 10, 4, 6);
  } else if (kind === "grass") {
    ctx.fillStyle = "#6a8a3a";
    ctx.fillRect(x, y - 6, 2, 6); ctx.fillRect(x + 4, y - 8, 2, 8); ctx.fillRect(x + 8, y - 5, 2, 5);
  } else if (kind === "shrub") {
    ctx.fillStyle = "#5a6a3a";
    ctx.fillRect(x, y - 6, 10, 6); ctx.fillRect(x + 2, y - 9, 6, 3);
  } else if (kind === "snowshrub") {
    ctx.fillStyle = "#8a9a8a"; ctx.fillRect(x, y - 5, 8, 5);
    ctx.fillStyle = "#e8f0f8"; ctx.fillRect(x, y - 7, 8, 2);
  }
}

// ---------- game state ----------
let G = { screen: "screen-title" };
let rafId = null;
let lastFrame = 0;
let dayProgress = 0; // 0..1 within current travel day
const DAY_MS = 1500;

function newState() {
  return {
    screen: "screen-setup",
    occ: null, vehicle: null, month: 2, // March default
    money: 0, food: 60, parts: 2, medkits: 2,
    gear: { filter: false, bugspray: false, satphone: false, rack: false },
    crew: [],
    km: 0, day: 1, nextLm: 1,
    pace: 1, rations: 1, morale: 80,
    vehHp: 100,
    paused: true, weather: "sunny",
    stats: { deaths: 0, breakdowns: 0, diseases: 0, foraged: 0 },
    mode: "travel"
  };
}

const curRegion = () => REGIONS[LANDMARKS[Math.max(0, G.nextLm - 1)].region];
const curRegionId = () => LANDMARKS[Math.max(0, G.nextLm - 1)].region;
const veh = () => VEHICLES.find(v => v.id === G.vehicle);
const alive = () => G.crew.filter(c => c.alive);
const cargoCap = () => veh().cargo + (G.gear.rack ? 80 : 0);
const curMonth = () => (G.month + Math.floor((G.day - 1) / 30)) % 12;
const isImmune = (c, disId) => !!(c.immune && c.immune[disId]);
function recoverFrom(c) {
  const dis = DISEASES.find(d => d.id === c.sick);
  if (dis && dis.immunizes) (c.immune = c.immune || {})[dis.id] = true;
  c.sick = null;
}

// occupation × vehicle chemistry
const hasAffinity = () =>
  (G.occ === "mechanic" && G.vehicle === "bus") || (G.occ === "dev" && G.vehicle === "ev");
function opsToday() {
  let o = veh().ops;
  if (G.occ === "mechanic") o *= 0.85;          // keeps anything running lean
  if (G.occ === "dev" && G.vehicle === "ev") o *= 0.7; // scripts the charging apps
  return Math.round(o);
}

// ---------- dialog ----------
let dialogKeyMap = [];
function dialog(title, html, options) {
  $("dialog-title").textContent = title;
  $("dialog-text").innerHTML = html;
  const box = $("dialog-options");
  box.innerHTML = "";
  dialogKeyMap = [];
  (options || [{ label: "Continue" }]).forEach((opt, i) => {
    const b = document.createElement("button");
    b.textContent = `${i + 1}. ${opt.label}`;
    b.onclick = () => {
      $("dialog-overlay").classList.add("hidden");
      dialogKeyMap = [];
      if (opt.fn) opt.fn(); else afterDialog();
    };
    box.appendChild(b);
    dialogKeyMap.push(b);
  });
  $("dialog-overlay").classList.remove("hidden");
}
function afterDialog() {
  // default: process any queued dialogs, else stay paused on travel screen
  if (dialogQueue.length) { const d = dialogQueue.shift(); dialog(d.title, d.html, d.options); }
}
let dialogQueue = [];
function queueDialog(title, html, options) {
  if ($("dialog-overlay").classList.contains("hidden")) dialog(title, html, options);
  else dialogQueue.push({ title, html, options });
}

// ---------- setup flow ----------
function startSetup() {
  G = newState();
  showScreen("screen-setup");
  setupOccupation();
}

function setupBody(html) { $("setup-body").innerHTML = html; }

function setupOccupation() {
  let html = `<h2>WHO ARE YOU?</h2><div class="menu">`;
  OCCUPATIONS.forEach((o, i) => {
    html += `<button data-key="${i + 1}" onclick="pickOcc(${i})">${i + 1}. ${o.name} — ${money(o.cash)} <span style="color:#6ac4ff">(score x${o.mult})</span><br><span style="font-weight:normal;font-size:12px;color:#999">${o.blurb}</span></button>`;
  });
  html += `</div>`;
  setupBody(html);
}
function pickOcc(i) {
  sfx.ok();
  G.occ = OCCUPATIONS[i].id;
  G.money = OCCUPATIONS[i].cash;
  setupMonth();
}

function setupMonth() {
  let html = `<h2>WHEN DO YOU LEAVE USHUAIA?</h2>
    <div class="box lefty"><p>Leave in the southern summer (Dec&ndash;Mar) and Patagonia is kind &mdash; and you'll reach Alaska in its brief, glorious summer. Leave in June and you'll freeze at both ends of the hemisphere. Bold strategy.</p></div><div class="menu">`;
  [0, 1, 2, 10, 11, 5].forEach((m, i) => {
    html += `<button data-key="${i + 1}" onclick="pickMonth(${m})">${i + 1}. ${MONTHS[m]}${m === 5 ? " (why)" : ""}</button>`;
  });
  html += `</div>`;
  setupBody(html);
}
function pickMonth(m) { sfx.ok(); G.month = m; setupVehicle(); }

function setupVehicle() {
  let html = `<h2>CHOOSE YOUR RIG</h2><p class="sub">You have ${money(G.money)}</p><div class="menu">`;
  VEHICLES.forEach((v, i) => {
    const afford = G.money >= v.cost;
    const affinity = (G.occ === "mechanic" && v.id === "bus") || (G.occ === "dev" && v.id === "ev");
    html += `<button data-key="${i + 1}" ${afford ? "" : "disabled"} onclick="pickVehicle(${i})">${i + 1}. ${v.name} — ${money(v.cost)}<br>
      <span style="font-weight:normal;font-size:12px;color:#999">${v.blurb}<br>${money(v.ops)}/day to run &middot; speed x${v.speed} &middot; cargo ${v.cargo} kg</span>${affinity ? `<br><span style="font-size:12px;color:#7ddc5e">&#9733; You know this machine inside and out.</span>` : ""}</button>`;
  });
  html += `</div>`;
  setupBody(html);
}
function pickVehicle(i) {
  sfx.ok();
  const v = VEHICLES[i];
  G.vehicle = v.id;
  G.money -= v.cost;
  setupCrew();
}

function setupCrew() {
  const names = [...CREW_NAME_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
  let html = `<h2>NAME YOUR CREW</h2><div class="box">`;
  for (let i = 0; i < 5; i++) {
    html += `<div>${i === 0 ? "You:" : "&nbsp;&nbsp;&nbsp;&nbsp;"} <input type="text" id="crew-${i}" value="${names[i]}" maxlength="12"></div>`;
  }
  html += `</div><div class="menu">
    <button data-key="1" onclick="confirmCrew()">1. That's us</button>
    <button data-key="2" onclick="setupCrew()">2. Reroll names</button></div>`;
  setupBody(html);
}
function confirmCrew() {
  sfx.ok();
  G.crew = [];
  for (let i = 0; i < 5; i++) {
    const name = ($("crew-" + i).value.trim() || "Traveler " + (i + 1)).slice(0, 12);
    G.crew.push({ name, hp: 100, alive: true, sick: null, sickDays: 0, immune: {} });
  }
  setupShop();
}

// ---------- shop (setup + landmarks) ----------
let shopPrices = null;
function priceMult() {
  // remote places are pricier
  const r = curRegionId();
  return ["patagonia", "atacama", "tundra", "boreal", "andes"].includes(r) ? 1.5 : 1.0;
}
function buildShop(isSetup) {
  const pm = isSetup ? 1.0 : priceMult();
  shopPrices = { food: 4 * pm, part: 120 * pm, medkit: 60 * pm };
  let html = `<h2>${isSetup ? "OUTFITTER — USHUAIA" : "SUPPLIES"}</h2>
    <p class="sub">Money: <span id="shop-money">${money(G.money)}</span> &middot; cargo ${Math.round(G.food)} / ${cargoCap()} kg &middot; rig costs ${money(opsToday())}/day to run</p>
    <div class="box">
    <div class="shoprow"><span>Food — ${money(shopPrices.food)}/kg</span>
      <span class="qtybtns"><button onclick="buy('food',-10)">-10</button><button onclick="buy('food',10)">+10</button><button onclick="buy('food',25)">+25</button></span>
      <span class="qty" id="shop-food">${Math.round(G.food)} kg</span></div>
    <div class="shoprow"><span>Spare parts — ${money(shopPrices.part)}</span>
      <span class="qtybtns"><button onclick="buy('part',-1)">-1</button><button onclick="buy('part',1)">+1</button></span>
      <span class="qty" id="shop-parts">${G.parts}</span></div>
    <div class="shoprow"><span>Medkits — ${money(shopPrices.medkit)}</span>
      <span class="qtybtns"><button onclick="buy('medkit',-1)">-1</button><button onclick="buy('medkit',1)">+1</button></span>
      <span class="qty" id="shop-medkits">${G.medkits}</span></div>`;
  GEAR.forEach(g => {
    html += `<div class="shoprow"><span>${g.name} — ${money(g.cost)}<br><span style="font-weight:normal;font-size:11px;color:#999">${g.blurb}</span></span>
      <span class="qtybtns">${G.gear[g.id] ? "<span style='color:#7ddc5e'>OWNED</span>" : `<button onclick="buyGear('${g.id}')">Buy</button>`}</span></div>`;
  });
  html += `</div><div class="menu"><button data-key="1" onclick="${isSetup ? "departUshuaia()" : "closeShop()"}">1. ${isSetup ? "Hit the road" : "Done shopping"}</button></div>`;
  return html;
}
function setupShop() { setupBody(buildShop(true)); }
let shopReturn = null;
function openShop() { shopReturn = "landmark"; setupBody(buildShop(false)); showScreen("screen-setup"); }
function closeShop() { sfx.ok(); showScreen("screen-travel"); updateHud(); showLandmark(LANDMARKS[G.nextLm - 1], true); }

function refreshShop() {
  const isSetup = G.km === 0 && G.day === 1;
  setupBody(buildShop(isSetup));
}
function buy(what, n) {
  const price = { food: shopPrices.food, part: shopPrices.part, medkit: shopPrices.medkit }[what];
  if (n > 0) {
    let cost = price * n;
    if (what === "food" && G.food + n > cargoCap()) { sfx.bad(); return; }
    if (G.money < cost) { sfx.bad(); return; }
    G.money -= cost;
    if (what === "food") G.food += n;
    if (what === "part") G.parts += n;
    if (what === "medkit") G.medkits += n;
  } else {
    const have = what === "food" ? G.food : what === "part" ? G.parts : G.medkits;
    if (have + n < 0) { sfx.bad(); return; }
    G.money += price * -n * 0.5; // sell back at half
    if (what === "food") G.food += n;
    if (what === "part") G.parts += n;
    if (what === "medkit") G.medkits += n;
  }
  sfx.pickup();
  refreshShop();
}
function buyGear(id) {
  const g = GEAR.find(x => x.id === id);
  if (G.money < g.cost || G.gear[id]) { sfx.bad(); return; }
  G.money -= g.cost; G.gear[id] = true;
  sfx.good();
  refreshShop();
}

function departUshuaia() {
  sfx.good();
  showScreen("screen-travel");
  updateHud();
  buildProgressDots();
  dialog("USHUAIA — KM 0",
    `The sign at the edge of town reads <b>"FIN DEL MUNDO"</b> — the end of the world.\n\nFor you, it's the beginning. 25,300 km of highway, desert, jungle, and tundra between here and the Arctic Ocean.\n\nPress GO (or ENTER) to start driving.`,
    [{ label: "Let's ride" }]);
  startLoop();
}

// ---------- travel loop ----------
function startLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  lastFrame = performance.now();
  const frame = (t) => {
    const dt = Math.min(100, t - lastFrame);
    lastFrame = t;
    if (G.screen === "screen-travel" && G.mode === "travel") {
      if (!G.paused && $("dialog-overlay").classList.contains("hidden")) {
        dayProgress += dt / DAY_MS;
        if (dayProgress >= 1) { dayProgress = 0; dayTick(); }
      }
      renderTravel();
    } else if (G.mode === "forage") {
      forageFrame(dt);
    }
    rafId = requestAnimationFrame(frame);
  };
  rafId = requestAnimationFrame(frame);
}

function togglePause() {
  if (G.screen !== "screen-travel") return;
  G.paused = !G.paused;
  $("btn-go").innerHTML = G.paused ? "&#9658; GO" : "&#10074;&#10074; PAUSE";
  sfx.ok();
}
function pauseTravel() {
  G.paused = true;
  $("btn-go").innerHTML = "&#9658; GO";
}

// ---------- one day of travel ----------
function dayTick() {
  G.day++;
  rollWeather();

  const pace = PACES[G.pace];
  const v = veh();
  let kmToday = pace.km * v.speed;
  if (G.weather === "storm") kmToday *= 0.6;
  else if (G.weather === "rain" || G.weather === "snow") kmToday *= 0.8;
  if (G.vehHp < 40) kmToday *= 0.7;

  // daily operating cost — you're an expert; fuel takes care of itself, the bill doesn't
  const ops = opsToday();
  if (G.money >= ops) {
    G.money -= ops;
  } else {
    G.money = 0;
    kmToday *= 0.6; // limping on favors and fumes
    G.morale = clamp(G.morale - 2, 0, 100);
    if (Math.random() < 0.35) {
      queueDialog("RUNNING ON EMPTY (FINANCIALLY)",
        `<span class="bad">You can't cover the rig's daily costs. You're limping along on favors, coasting downhills, and dignity.\n\nStop for a side gig (G) to refill the wallet.</span>`);
      pauseTravel();
    }
  }
  kmToday = Math.round(kmToday);

  // move, but stop at next landmark
  const lm = LANDMARKS[G.nextLm];
  let hitLandmark = false;
  if (lm && G.km + kmToday >= lm.km) { G.km = lm.km; hitLandmark = true; }
  else G.km += kmToday;

  consumeAndHeal();
  diseaseRolls();
  vehicleWear();
  if (!hitLandmark && Math.random() < 0.30) randomEvent();

  updateHud();
  checkDeaths();
  if (!anyoneAlive()) return;

  if (hitLandmark) {
    G.nextLm++;
    pauseTravel();
    if (lm.end) { victory(); return; }
    if (lm.darien) { darienGap(lm); return; }
    showLandmark(lm, false);
  }
}

function consumeAndHeal() {
  const r = RATIONS[G.rations];
  const n = alive().length;
  const eat = r.kg * n;
  let starving = false;
  if (G.food >= eat) G.food -= eat;
  else { G.food = 0; starving = true; }

  const p = PACES[G.pace];
  const comfy = veh().id === "bus" ? 0.5 : 0;
  alive().forEach(c => {
    let d = r.hp + p.hp + comfy;
    if (starving) d -= 6;
    if (c.sick) {
      const dis = DISEASES.find(x => x.id === c.sick);
      d -= dis.dmg;
      c.sickDays--;
      if (c.sickDays <= 0) {
        queueDialog("RECOVERY", `<span class="good">${c.name} has recovered from ${dis.name}.${dis.immunizes ? " Their immune system has taken detailed notes — they won't be catching that again." : ""}</span>`);
        recoverFrom(c);
      }
    }
    // weather exposure
    if ((G.weather === "snow" || G.weather === "blizzard") && !c.sick) d -= 1;
    if (G.morale < 30) d -= 1;
    c.hp = clamp(c.hp + d, 0, 100);
  });
  if (starving && Math.random() < 0.5) {
    queueDialog("NO FOOD", `<span class="bad">The cooler is empty. The crew is running on fumes and gas-station mints. Find food soon.</span>`);
    G.morale = clamp(G.morale - 5, 0, 100);
  }
}

function rollWeather() {
  const c = curRegion().climate;
  const m = curMonth();
  const southWinter = m >= 4 && m <= 8;   // May–Sep, cold in far south
  const northWinter = m <= 2 || m >= 9;   // Oct–Mar, cold in far north
  const roll = Math.random();
  let w = "sunny";
  if (c === "cold" || c === "arctic") {
    const winter = curRegionId() === "patagonia" ? southWinter : northWinter;
    if (c === "arctic" && winter) w = roll < 0.5 ? "blizzard" : "snow";
    else if (winter) w = roll < 0.3 ? "snow" : roll < 0.5 ? "rain" : "cloudy";
    else w = roll < 0.15 ? "rain" : roll < 0.4 ? "cloudy" : "sunny";
  } else if (c === "tropical") {
    w = roll < 0.25 ? "rain" : roll < 0.35 ? "storm" : "sunny";
  } else if (c === "hot") {
    w = roll < 0.55 ? "scorching" : "sunny";
  } else {
    w = roll < 0.15 ? "rain" : roll < 0.3 ? "cloudy" : "sunny";
  }
  G.weather = w;
}

// ---------- diseases ----------
function diseaseRolls() {
  const region = curRegionId();
  const candidates = DISEASES.filter(d => !d.regions || d.regions.includes(region));
  alive().forEach(c => {
    if (c.sick) return;
    let chance = 0.022;
    if (G.weather === "scorching") chance += 0.01;
    if (G.weather === "blizzard") chance += 0.02;
    if (RATIONS[G.rations].id === "bare") chance += 0.01;
    if (c.hp < 40) chance += 0.015;
    if (Math.random() > chance) return;

    // pick a disease, weighted; gear halves specific ones; immunity rules some out
    let pool = [];
    candidates.forEach(d => {
      if (isImmune(c, d.id)) return;
      let w = d.weight;
      if (d.id === "heat" && G.weather !== "scorching") w *= 0.3;
      if (d.id === "hypo" && !["snow", "blizzard"].includes(G.weather)) w *= 0.2;
      if (d.gear && G.gear[d.gear]) w *= 0.5;
      for (let i = 0; i < Math.ceil(w * 2); i++) pool.push(d);
    });
    if (!pool.length) return;
    infect(c, pick(pool));
  });

  // contagion — recovered crew are immune to what they've already survived
  const sickNoro = alive().filter(c => c.sick === "noro" || c.sick === "dysentery");
  if (sickNoro.length) {
    const spreading = sickNoro[0].sick;
    alive().filter(c => !c.sick && !isImmune(c, spreading)).forEach(c => {
      if (Math.random() < 0.12 * sickNoro.length) infect(c, DISEASES.find(d => d.id === spreading));
    });
  }
}

function infect(c, dis) {
  c.sick = dis.id;
  c.sickDays = dis.days + ri(-1, 2);
  G.stats.diseases++;
  G.morale = clamp(G.morale - 6, 0, 100);
  sfx.bad();
  const medOpt = G.medkits > 0
    ? [{ label: `Use a medkit (${G.medkits} left)`, fn: () => { G.medkits--; recoverFrom(c); sfx.good(); queueDialog("TREATED", `<span class="good">${c.name} is treated and recovering. Modern medicine: highly recommended.</span>`); afterDialogMaybe(); } },
       { label: "Tough it out", fn: () => afterDialogMaybe() }]
    : [{ label: "Tough it out (no medkits)", fn: () => afterDialogMaybe() }];
  queueDialog("ILLNESS", `<span class="bad">${c.name}${dis.catch}</span>`, medOpt);
  pauseTravel();
}
function afterDialogMaybe() { afterDialog(); }

function checkDeaths() {
  alive().forEach(c => {
    if (c.hp <= 0) {
      c.alive = false;
      c.hp = 0;
      G.stats.deaths++;
      G.morale = clamp(G.morale - 25, 0, 100);
      const cause = c.sick ? DISEASES.find(d => d.id === c.sick).name : "exhaustion";
      c.causeOfDeath = cause;
      sfx.death();
      pauseTravel();
      queueDialog("A DEATH ON THE ROAD",
        `<span class="bad">${c.name} has died of ${cause}.</span>\n\n` +
        tombstoneArt(c.name, cause, Math.round(G.km)),
        [{ label: "Drive on", fn: () => { if (!anyoneAlive()) gameOver(cause); else afterDialog(); } }]);
    }
  });
  if (!anyoneAlive()) gameOver(G.crew[0].causeOfDeath || "the road");
}
function anyoneAlive() { return alive().length > 0; }

function tombstoneArt(name, cause, km) {
  return `<div class="tombstone">      _______
     /       \\
    |  R.I.P  |
    |         |
    | ${name.slice(0, 9).padStart(Math.floor((9 + name.slice(0, 9).length) / 2)).padEnd(9)} |
    | km ${String(km).padEnd(6)}|
   ~|~~~~~~~~~|~</div>`;
}

// ---------- vehicle ----------
function vehicleWear() {
  const v = veh();
  G.vehHp = clamp(G.vehHp - rf(0.2, 0.8), 0, 100);
  let bChance = (1 - v.rel) * 0.09 + (G.vehHp < 50 ? 0.03 : 0);
  if (G.occ === "mechanic") bChance *= 0.5;
  if (G.occ === "dev" && v.id === "ev") bChance *= 0.5;
  if (Math.random() < bChance) breakdown();
}

function breakdown() {
  G.stats.breakdowns++;
  pauseTravel();
  sfx.bad();
  const v = veh();
  const flavor = pick([
    "Something under the hood makes a sound like a maraca full of bolts.",
    "The dashboard lights up like a tiny angry casino.",
    "A smell. A bad smell. A mechanical smell.",
    v.id === "ev" ? "The battery management system displays an error in a font you've never seen before." : "The engine coughs, sighs, and takes a personal day."
  ]);
  const opts = [];
  if (hasAffinity()) {
    opts.push({
      label: G.vehicle === "ev" ? "SSH in and reboot it (free — it's always software)" : "You know this bus. Fix it. (free)",
      fn: () => {
        G.vehHp = clamp(G.vehHp + 20, 0, 100);
        queueDialog("HANDLED", G.vehicle === "ev"
          ? `<span class="good">Forty minutes, one firmware rollback, and a strongly-worded bug report later, Sparky purrs back to life. It was, as always, software.</span>`
          : `<span class="good">You've met this gremlin before. Two taps of the wrench, one percussive adjustment, and El Jefe rumbles awake, mildly embarrassed.</span>`);
        afterDialog();
      }
    });
  }
  if (G.parts > 0) {
    opts.push({
      label: `Fix it with a spare part (${G.parts} left)`, fn: () => {
        G.parts--;
        const lose = G.occ === "mechanic" ? 0 : 1;
        G.day += lose; G.vehHp = clamp(G.vehHp + 25, 0, 100);
        queueDialog("REPAIRED", G.occ === "mechanic"
          ? `<span class="good">You fix it before lunch. The crew applauds. You pretend it was hard.</span>`
          : `<span class="good">A YouTube tutorial, four hours, and one spare part later — you're rolling. (Lost 1 day)</span>`);
        afterDialog();
      }
    });
  }
  const waitDays = G.gear.satphone ? 1 : 2;
  opts.push({
    label: `Wait for a local mechanic (${waitDays} day${waitDays > 1 ? "s" : ""}, ~$250)`, fn: () => {
      const cost = Math.min(G.money, 250);
      G.money -= cost; G.day += waitDays; G.vehHp = clamp(G.vehHp + 40, 0, 100);
      queueDialog("REPAIRED", `A mechanic ${G.gear.satphone ? "answers the sat phone and arrives by morning" : "materializes eventually"}, diagnoses it in nine seconds, and fixes it with a wrench older than the vehicle. (${money(cost)}, ${waitDays} day${waitDays > 1 ? "s" : ""})`);
      afterDialog();
    }
  });
  dialog("BREAKDOWN", `<span class="bad">${flavor}</span>`, opts);
}

// ---------- random events ----------
function randomEvent() {
  const region = curRegionId();
  const evts = [];
  const add = (w, fn) => { for (let i = 0; i < w; i++) evts.push(fn); };

  add(3, () => {
    G.day += 1;
    queueDialog("FLAT TIRE", `A pothole with ambitions takes out a tire. The spare goes on under a sky full of ${region === "atacama" ? "unreasonable stars" : "curious clouds"}. (Lost 1 day)`);
  });
  add(2, () => {
    const loss = ri(50, 220);
    const stolen = Math.min(G.money, loss);
    G.money -= stolen;
    G.morale = clamp(G.morale - 8, 0, 100);
    queueDialog("SNEAK THIEF", `<span class="bad">Someone lifts ${money(stolen)} from the glovebox while you're photographing a scenic overlook. The overlook was, admittedly, very scenic.</span>`);
  });
  add(2, () => {
    const kg = ri(4, 12);
    G.food = Math.min(cargoCap(), G.food + kg);
    G.morale = clamp(G.morale + 6, 0, 100);
    sfx.good();
    queueDialog("KINDNESS OF STRANGERS", `<span class="good">A family flags you down — not for help, but to hand you ${kg} kg of home cooking and wave you off like relatives. Morale soars.</span>`);
  });
  add(2, () => {
    G.day += 1;
    queueDialog("BORDER BUREAUCRACY", `A crossing. Forms in triplicate. A stamp that requires another stamp. A man whose entire job is frowning at your vehicle permit. (Lost 1 day)`);
  });
  add(2, () => {
    const dmg = ri(5, 15);
    G.vehHp = clamp(G.vehHp - dmg, 0, 100);
    const animal = { patagonia: "a guanaco", andes: "a llama with main-character energy", boreal: "a moose", tundra: "a caribou herd", mexdesert: "loose cattle", plains: "a deer" }[region] || "a very casual dog";
    queueDialog("WILDLIFE ON THE ROAD", `You swerve around ${animal}. The vehicle finds the rough shoulder. Everyone is fine; the suspension files a grievance.`);
  });
  if (veh().id === "ev") add(G.occ === "dev" ? 1 : 3, () => {
    G.day += 1;
    queueDialog("CHARGING DESERT", `<span class="bad">The app says there's a charger here. The app lies. You limp to a hardware store and trickle-charge overnight from a wall socket while the owner watches, fascinated. (Lost 1 day)</span>`);
  });
  if (["andes", "rockies", "centralam"].includes(region)) add(3, () => {
    G.day += ri(1, 2);
    queueDialog("LANDSLIDE", `<span class="bad">The mountain has rearranged the road. Crews wave traffic through one lane, eventually, in a geological sense of 'eventually'.</span>`);
  });
  if (G.occ === "vlogger") add(3, () => {
    let cash = ri(150, 700);
    if (G.vehicle === "bus" || G.vehicle === "moto") cash = Math.round(cash * 1.5); // quirky rig = content gold
    G.money += cash;
    sfx.good();
    queueDialog("GONE VIRAL", `<span class="good">Your video "we tried ${pick(["street food", "sleeping in the rig", "a border crossing", "driving the switchbacks"])} and it changed us" pops off. Ad revenue: ${money(cash)}.</span>`);
  });
  if (G.occ === "dev" ) add(2, () => {
    const cash = ri(200, 500);
    G.money += cash; G.day += 1;
    queueDialog("FREELANCE GIG", `<span class="good">A cafe. Decent wifi. One day of squashing someone else's bugs for ${money(cash)}. The standup is at a weird hour but the view is unbeatable.</span>`);
  });
  add(2, () => {
    G.morale = clamp(G.morale + 8, 0, 100);
    const sight = { patagonia: "a glacier calving into a silent lake", atacama: "the Milky Way, end to end", jungle: "a toucan judging your parking", tundra: "the northern lights doing their whole thing", coast: "a pod of whales heading the same way you are" }[region] || "a sunset that doesn't look real";
    queueDialog("WORTH THE DRIVE", `<span class="good">You pull over for ${sight}. Nobody says anything for a while. This is why you came.</span>`);
  });

  pick(evts)();
  updateHud();
}

// ---------- landmarks ----------
function showLandmark(lm, fromShop) {
  pauseTravel();
  if (!fromShop) sfx.good();
  const opts = [
    { label: "Keep driving", fn: () => { afterDialog(); } },
    { label: "Shop for supplies", fn: () => openShop() },
    { label: "Rest here (heal, 1 day)", fn: () => { landmarkRest(lm); } }
  ];
  if (lm.talk && lm.talk.length) {
    opts.push({ label: "Talk to locals", fn: () => {
      dialog(lm.name.toUpperCase(), `<i>${pick(lm.talk)}</i>`, [{ label: "Back", fn: () => showLandmark(lm, true) }]);
    }});
  }
  dialog(`${lm.name.toUpperCase()} — KM ${lm.km.toLocaleString()} — DAY ${G.day}`,
    lm.desc, opts);
}
function landmarkRest(lm) {
  G.day += 1;
  alive().forEach(c => {
    c.hp = clamp(c.hp + ri(8, 14), 0, 100);
    if (c.sick && Math.random() < 0.35) { c.sickDays = 0; }
  });
  G.morale = clamp(G.morale + 10, 0, 100);
  consumeFoodOnly();
  updateHud();
  dialog("RESTED", `<span class="good">A real bed. A real shower. A meal that isn't crackers. The crew looks human again.</span>`,
    [{ label: "Back", fn: () => showLandmark(lm, true) }]);
}
function consumeFoodOnly() {
  const eat = RATIONS[G.rations].kg * alive().length;
  G.food = Math.max(0, G.food - eat);
}

// ---------- the Darién Gap ----------
function darienGap(lm) {
  updateHud();
  dialog("THE DARIÉN GAP",
    `The Pan-American Highway — all 25,000+ km of it — has exactly one hole, and you are looking at it.\n\nAhead lies roadless jungle: swamps, rivers, and fer-de-lance snakes. No vehicle has a good time here.\n\nHow do you get to Panama?`,
    [
      { label: `Ship the rig around it — ${money(1400)}, 5 days (safe)`, fn: () => darienShip() },
      { label: `Sail the San Blas islands — ${money(800)}, 7 days`, fn: () => darienSail() },
      { label: "Attempt the jungle. (What could go wrong?)", fn: () => darienJungle() }
    ]);
}
function darienShip() {
  if (G.money < 1400) { dialog("NOT ENOUGH MONEY", `The shipping agent looks at your ${money(G.money)} and slides the paperwork back across the desk.`, [{ label: "Back", fn: () => darienGap() }]); return; }
  G.money -= 1400; G.day += 5;
  arriveDarien(`The rig rides a container ship; you ride a puddle-jumper flight. Five days later you reunite at the Port of Panama like the end of a romance movie.`, 0);
}
function darienSail() {
  if (G.money < 800) { dialog("NOT ENOUGH MONEY", `The captain shrugs. No ${money(800)}, no boat. The sea is a business.`, [{ label: "Back", fn: () => darienGap() }]); return; }
  G.money -= 800; G.day += 7;
  let text = `Five days island-hopping through the San Blas archipelago. Postcard water. Fresh fish. Your vehicle follows on a cargo boat that the captain describes as "mostly reliable."`;
  const susceptible = alive().filter(c => !c.sick && !isImmune(c, "noro"));
  if (Math.random() < 0.35 && susceptible.length) {
    infect(pick(susceptible), DISEASES.find(d => d.id === "noro"));
    text += `\n\n<span class="bad">The sea, however, wins a round.</span>`;
  }
  arriveDarien(text, 0);
}
function darienJungle() {
  dialog("ARE YOU SURE?",
    `<span class="bad">Locals stop mid-conversation to look at you. A ranger writes down your names "for the report." The jungle does not have roads, mercy, or cell service.</span>`,
    [
      { label: "We're doing it.", fn: () => {
        G.day += ri(10, 14);
        let text = `Machetes. Winches. Rivers crossed on log rafts that should not have worked.\n`;
        // punishing gauntlet
        let victims = alive();
        if (Math.random() < 0.7 && victims.length) {
          const v1 = pick(victims);
          const dis = pick([DISEASES.find(d => d.id === "snake"), DISEASES.find(d => d.id === "dengue"), DISEASES.find(d => d.id === "dysentery")]);
          infect(v1, dis);
        }
        alive().forEach(c => c.hp = clamp(c.hp - ri(10, 25), 0, 100));
        if (Math.random() < 0.3) {
          G.vehHp = 15;
          text += `\n<span class="bad">The rig sinks to its axles in a swamp and has to be dragged out by a logging crew. It will never sound the same.</span>`;
        } else {
          G.vehHp = clamp(G.vehHp - 35, 5, 100);
        }
        G.food = Math.max(0, G.food - 20);
        G.morale = clamp(G.morale - 15, 0, 100);
        text += `\n\nTwo weeks later you stagger onto pavement in Panama, legends and cautionary tale in equal measure.`;
        arriveDarien(text, 0);
        checkDeaths();
      }},
      { label: "On second thought — back to the boats", fn: () => darienGap() }
    ]);
}
function arriveDarien(text, _) {
  // move past the gap to just before Panama City
  G.km = LANDMARKS[G.nextLm].km - 50;
  updateHud();
  sfx.good();
  dialog("ACROSS THE GAP", text, [{ label: "Northward", fn: () => afterDialog() }]);
}

// ---------- status / pace / rations ----------
function showStatus() {
  if (G.screen !== "screen-travel") return;
  pauseTravel();
  const v = veh();
  let html = `<div class="statgrid">`;
  G.crew.forEach(c => {
    const cls = !c.alive ? "dead" : c.sick ? "sick" : "";
    const label = !c.alive ? `died of ${c.causeOfDeath}` : c.sick ? DISEASES.find(d => d.id === c.sick).name : healthWord(c.hp);
    html += `<span class="${cls}">${c.name}</span><span class="${cls}">${label}</span>`;
  });
  html += `</div><br><div class="statgrid">
    <span>Vehicle</span><span>${Math.round(G.vehHp)}% — ${v.name.split("—")[0].trim()}</span>
    <span>Running cost</span><span>${money(opsToday())}/day${hasAffinity() ? " ★" : ""}</span>
    <span>Morale</span><span>${moraleWord()}</span>
    <span>Pace</span><span>${PACES[G.pace].name}</span>
    <span>Rations</span><span>${RATIONS[G.rations].name}</span>
    <span>Gear</span><span>${GEAR.filter(g => G.gear[g.id]).map(g => g.name).join(", ") || "none"}</span>
    <span>Day</span><span>${G.day} (${MONTHS[curMonth()]})</span>
  </div>`;
  dialog("CREW & RIG STATUS", html, [{ label: "Back to the road" }]);
}
function healthWord(hp) {
  return hp > 75 ? "good" : hp > 50 ? "fair" : hp > 25 ? "poor" : "very poor";
}
function moraleWord() {
  return G.morale > 75 ? "excellent — road trip energy" : G.morale > 50 ? "decent" : G.morale > 25 ? "fraying" : "mutinous";
}

function cyclePace() {
  if (G.screen !== "screen-travel") return;
  G.pace = (G.pace + 1) % PACES.length;
  const p = PACES[G.pace];
  sfx.ok();
  queueDialog("PACE: " + p.name.toUpperCase(), p.blurb);
  pauseTravel();
}
function cycleRations() {
  if (G.screen !== "screen-travel") return;
  G.rations = (G.rations + 1) % RATIONS.length;
  const r = RATIONS[G.rations];
  sfx.ok();
  queueDialog("RATIONS: " + r.name.toUpperCase(), r.blurb);
  pauseTravel();
}

function sideGig() {
  if (G.screen !== "screen-travel" || G.mode !== "travel") return;
  pauseTravel();
  G.day += 1;
  consumeFoodOnly();
  const gig = GIGS[G.occ];
  let pay = ri(gig.low, gig.high);
  if (G.occ === "vlogger" && (G.vehicle === "bus" || G.vehicle === "moto")) pay = Math.round(pay * 1.5);
  G.money += pay;
  updateHud();
  sfx.good();
  queueDialog("SIDE GIG", `<span class="good">You stop for a day to ${gig.name}. It pays ${money(pay)}.</span> (1 day)`);
}

function restDay() {
  if (G.screen !== "screen-travel") return;
  pauseTravel();
  G.day += 1;
  alive().forEach(c => {
    c.hp = clamp(c.hp + ri(6, 10), 0, 100);
    if (c.sick && Math.random() < 0.3) c.sickDays = 0;
  });
  G.morale = clamp(G.morale + 4, 0, 100);
  consumeFoodOnly();
  updateHud();
  sfx.ok();
  queueDialog("REST DAY", `<span class="good">You camp by the roadside. Someone finds the good playlist. Health improves.</span>`);
}

// ---------- HUD ----------
function updateHud() {
  const v = veh();
  const lm = LANDMARKS[G.nextLm];
  $("hud-date").textContent = `DAY ${G.day} · ${MONTHS[curMonth()].slice(0, 3).toUpperCase()}`;
  $("hud-weather").textContent = weatherLabel();
  $("hud-next").textContent = lm ? `NEXT: ${lm.name.split(",")[0]} ${Math.max(0, Math.round(lm.km - G.km))} km` : "";
  $("hud-money").textContent = money(G.money);
  $("hud-fuel").textContent = `OPS ${money(opsToday())}/DAY`;
  $("hud-fuel").style.color = G.money < opsToday() * 5 ? "var(--red)" : "";
  $("hud-food").textContent = `FOOD ${Math.round(G.food)}kg`;
  $("hud-parts").textContent = `PARTS ${G.parts} · MEDKITS ${G.medkits}`;
  const avg = alive().length ? alive().reduce((s, c) => s + c.hp, 0) / alive().length : 0;
  const sickCount = alive().filter(c => c.sick).length;
  $("hud-health").textContent = `CREW ${alive().length}/5 ${healthWord(avg).toUpperCase()}${sickCount ? ` (${sickCount} SICK)` : ""}`;
  $("hud-health").style.color = avg > 60 ? "var(--green)" : avg > 35 ? "var(--accent)" : "var(--red)";
  $("progress-fill").style.width = (G.km / TOTAL_KM * 100) + "%";
  document.querySelectorAll(".pdot").forEach((d, i) => {
    d.classList.toggle("passed", LANDMARKS[i].km <= G.km);
  });
}
function weatherLabel() {
  return { sunny: "☀ CLEAR", cloudy: "☁ OVERCAST", rain: "🌧 RAIN", storm: "⛈ STORM", snow: "❄ SNOW", blizzard: "❄❄ BLIZZARD", scorching: "🔥 SCORCHING" }[G.weather] || G.weather;
}
function buildProgressDots() {
  const box = $("progress-dots");
  box.innerHTML = "";
  LANDMARKS.forEach(lm => {
    const d = document.createElement("div");
    d.className = "pdot";
    d.style.left = `calc(${(lm.km / TOTAL_KM) * 100}% - 2px)`;
    d.title = lm.name;
    box.appendChild(d);
  });
}

// ---------- travel rendering ----------
function renderTravel() {
  const cv = $("game-canvas"), ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  const R = curRegion();
  const horizon = 240;
  const worldOff = (G.km + (G.paused ? 0 : dayProgress * PACES[G.pace].km * veh().speed));

  // sky
  const g = ctx.createLinearGradient(0, 0, 0, horizon);
  let sky = R.sky;
  if (["rain", "storm", "cloudy"].includes(G.weather)) sky = ["#485868", "#8898a8"];
  if (["snow", "blizzard"].includes(G.weather)) sky = ["#586878", "#a8b8c8"];
  g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizon);

  // sun (arcs across the current day)
  if (!["rain", "storm", "snow", "blizzard"].includes(G.weather)) {
    const t = G.paused ? 0.3 : dayProgress;
    const sx = 60 + t * (W - 120), sy = 110 - Math.sin(t * Math.PI) * 70;
    ctx.fillStyle = curRegionId() === "tundra" ? "#f8e8c8" : "#f8d840";
    ctx.fillRect(sx - 10, sy - 10, 20, 20);
    ctx.fillRect(sx - 14, sy - 4, 28, 8);
    ctx.fillRect(sx - 4, sy - 14, 8, 28);
  }

  // far layer
  drawFar(ctx, R.far, R.farC, R.snowcap, worldOff * 0.4, W, horizon);

  // ground
  let groundC = R.ground;
  if (["snow", "blizzard"].includes(G.weather)) groundC = "#d8e0e8";
  ctx.fillStyle = groundC;
  ctx.fillRect(0, horizon, W, H - horizon);

  // mid scenery (between horizon and road)
  const midOff = worldOff * 2.2;
  const spacing = 95;
  for (let i = -1; i < W / spacing + 2; i++) {
    const idx = Math.floor(midOff / spacing) + i;
    if (hash(idx * 3.7) < 0.6) {
      const x = idx * spacing - midOff + hash(idx) * 60;
      drawMidItem(ctx, R.mid, x, horizon + 22 + hash(idx + 5) * 8, idx);
    }
  }

  // road
  const roadY = 290;
  ctx.fillStyle = "#33333b";
  ctx.fillRect(0, roadY, W, 46);
  ctx.fillStyle = "#f0d048";
  const dashOff = (worldOff * 6) % 60;
  for (let x = -60; x < W + 60; x += 60) {
    ctx.fillRect(x - dashOff, roadY + 21, 30, 4);
  }

  // vehicle (bobs while moving)
  const bob = G.paused ? 0 : Math.floor((performance.now() / 120) % 2);
  drawSprite(ctx, SPRITES[G.vehicle], 200, roadY - 22 + bob, 4);

  // weather overlays
  if (["rain", "storm"].includes(G.weather)) {
    ctx.fillStyle = "rgba(180,210,240,0.7)";
    for (let i = 0; i < (G.weather === "storm" ? 90 : 45); i++) {
      const x = (hash(i) * W + performance.now() * 0.4) % W;
      const y = (hash(i + 50) * H + performance.now() * 0.9) % H;
      ctx.fillRect(x, y, 2, 8);
    }
  }
  if (["snow", "blizzard"].includes(G.weather)) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < (G.weather === "blizzard" ? 80 : 40); i++) {
      const x = (hash(i) * W + performance.now() * (G.weather === "blizzard" ? 0.3 : 0.08)) % W;
      const y = (hash(i + 50) * H + performance.now() * 0.12) % H;
      ctx.fillRect(x, y, 3, 3);
    }
  }

  // paused hint
  if (G.paused && $("dialog-overlay").classList.contains("hidden")) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(W / 2 - 130, 20, 260, 30);
    ctx.fillStyle = "#ffd24a";
    ctx.font = "bold 14px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED — PRESS ENTER TO DRIVE", W / 2, 40);
  }

  // km odometer
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(8, 8, 150, 24);
  ctx.fillStyle = "#7ddc5e";
  ctx.font = "bold 14px 'Courier New'";
  ctx.textAlign = "left";
  ctx.fillText(`KM ${Math.round(G.km).toLocaleString()}`, 16, 25);
}

// ---------- forage minigame ----------
let FG = null;
function startForage() {
  if (G.screen !== "screen-travel" || G.mode !== "travel") return;
  pauseTravel();
  G.mode = "forage";
  FG = { items: [], time: 15000, gathered: 0, spawnT: 0, bitten: false };
  sfx.ok();
}
const FORAGE_TYPES = [
  { id: "fruit", kg: 2, w: 5, color: "#f0a030", label: "🥭" },
  { id: "fish", kg: 3, w: 4, color: "#6ac4ff", label: "🐟" },
  { id: "cans", kg: 4, w: 3, color: "#c0c8d0", label: "🥫" },
  { id: "burrito", kg: 8, w: 1, color: "#ffd24a", label: "🌯" },
  { id: "snake", kg: 0, w: 2, color: "#30a848", label: "🐍" }
];
function forageFrame(dt) {
  FG.time -= dt;
  FG.spawnT -= dt;
  if (FG.spawnT <= 0) {
    FG.spawnT = ri(380, 700);
    let pool = [];
    FORAGE_TYPES.forEach(t => { for (let i = 0; i < t.w; i++) pool.push(t); });
    const t = pick(pool);
    FG.items.push({ t, x: ri(40, 600), y: ri(70, 320), ttl: t.id === "snake" ? 2600 : ri(1200, 2000) });
  }
  FG.items.forEach(it => it.ttl -= dt);
  FG.items = FG.items.filter(it => it.ttl > 0);

  // render
  const cv = $("game-canvas"), ctx = cv.getContext("2d");
  ctx.fillStyle = "#1a3a18";
  ctx.fillRect(0, 0, cv.width, cv.height);
  // dappled ground
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = i % 2 ? "#224a20" : "#183518";
    ctx.fillRect(hash(i) * 640, hash(i + 9) * 360, 30, 30);
  }
  FG.items.forEach(it => {
    ctx.font = "28px serif";
    ctx.textAlign = "center";
    // blink when about to vanish
    if (it.ttl > 400 || Math.floor(it.ttl / 100) % 2) {
      ctx.fillText(it.t.label, it.x, it.y);
    }
  });
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, 640, 34);
  ctx.fillStyle = "#ffd24a";
  ctx.font = "bold 15px 'Courier New'";
  ctx.textAlign = "left";
  ctx.fillText(`FORAGE & FISH — click food, avoid the snake!  ${Math.ceil(FG.time / 1000)}s`, 12, 23);
  ctx.textAlign = "right";
  ctx.fillText(`${FG.gathered} kg`, 628, 23);

  if (FG.time <= 0) endForage();
}
function forageClick(mx, my) {
  for (let i = FG.items.length - 1; i >= 0; i--) {
    const it = FG.items[i];
    if (Math.abs(mx - it.x) < 22 && Math.abs(my - (it.y - 10)) < 22) {
      FG.items.splice(i, 1);
      if (it.t.id === "snake") {
        FG.bitten = true;
        sfx.bad();
        endForage();
      } else {
        FG.gathered += it.t.kg;
        sfx.pickup();
      }
      return;
    }
  }
}
function endForage() {
  G.mode = "travel";
  G.day += 1;
  consumeFoodOnly();
  const space = Math.max(0, cargoCap() - G.food);
  const kept = Math.min(FG.gathered, space);
  G.food += kept;
  G.stats.foraged += kept;
  updateHud();
  let text;
  if (FG.bitten) {
    const victim = pick(alive());
    text = `<span class="bad">You gathered ${FG.gathered} kg — and then ${victim.name} reached past the wrong log.</span>`;
    updateHudLater();
    dialog("FORAGING WENT SIDEWAYS", text, [{ label: "Ow", fn: () => {
      infect(victim, DISEASES.find(d => d.id === "snake"));
    }}]);
    return;
  }
  if (FG.gathered > space) {
    text = `You gathered <b>${FG.gathered} kg</b> of food, but you could only fit <b>${kept} kg</b> in the rig.\n\nSome traditions never die.`;
  } else if (FG.gathered === 0) {
    text = `You gathered a grand total of nothing. The fish saw you coming. (Lost 1 day)`;
  } else {
    text = `<span class="good">You gathered ${kept} kg of fruit, fish, and mystery cans. Not bad. (1 day)</span>`;
  }
  dialog("FORAGING DONE", text);
}
function updateHudLater() { setTimeout(updateHud, 50); }

// ---------- endings ----------
function computeScore() {
  const mult = OCCUPATIONS.find(o => o.id === G.occ).mult;
  let s = alive().length * 400;
  s += alive().reduce((a, c) => a + c.hp, 0);
  s += Math.round(G.money / 20);
  s += Math.round(G.food) + G.parts * 20 + G.medkits * 15;
  s += Math.max(0, 200 - G.day);
  return Math.round(s * mult);
}
function ratingFor(score) {
  let r = RATINGS[0].name;
  RATINGS.forEach(x => { if (score >= x.min) r = x.name; });
  return r;
}

function victory() {
  sfx.fanfare();
  const score = computeScore();
  const survivors = alive();
  let html = `<h2>PRUDHOE BAY, ALASKA</h2>
  <div class="box lefty">
  <p>Day ${G.day}. The road ends at a gray, wind-scoured shore. The Arctic Ocean stretches to the horizon, entirely unimpressed.</p>
  <p>You drove <b>25,300 km</b> from the bottom of the world to the top. ${survivors.length === 5 ? "All five of you made it. Every single one." : `${survivors.length} of 5 made it: ${survivors.map(c => c.name).join(", ")}.`}</p>
  <p>Someone takes the photo. Nobody knows what to say. The wind says it for you.</p>
  </div>
  <div class="box">
    <div class="statgrid">
      <span>Days on the road</span><span>${G.day}</span>
      <span>Survivors</span><span>${survivors.length} / 5</span>
      <span>Breakdowns survived</span><span>${G.stats.breakdowns}</span>
      <span>Illnesses endured</span><span>${G.stats.diseases}</span>
      <span>Food foraged</span><span>${G.stats.foraged} kg</span>
      <span>Money remaining</span><span>${money(G.money)}</span>
    </div>
  </div>
  <h3>SCORE: ${score.toLocaleString()} — ${ratingFor(score).toUpperCase()}</h3>
  <div class="menu"><button data-key="1" onclick="location.reload()">1. Drive it again</button></div>`;
  $("end-body").innerHTML = html;
  showScreen("screen-end");
}

function gameOver(cause) {
  if (G.screen === "screen-end") return;
  sfx.death();
  const km = Math.round(G.km);
  let html = `<h2 style="color:var(--red)">THE TRAIL ENDS HERE</h2>
  <div class="box lefty">
  <p>Day ${G.day}, kilometer ${km.toLocaleString()}. The last of the crew is gone${cause ? ` — ${cause} took the final toll` : ""}.</p>
  <p>The rig sits by the roadside. Eventually someone will wonder about the plates from so far away.</p>
  </div>
  ${tombstoneArt("THE CREW", cause || "the road", km)}
  <p class="tiny">${km < 12200 ? "You never even saw the Darién Gap." : km < 17500 ? "So close to the northern half." : "Alaska was almost in sight."}</p>
  <div class="menu"><button data-key="1" onclick="location.reload()">1. Try again</button></div>`;
  $("end-body").innerHTML = html;
  showScreen("screen-end");
}

// ---------- title art ----------
function renderTitle() {
  const cv = $("title-canvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 160);
  g.addColorStop(0, "#282850"); g.addColorStop(1, "#e8842a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 640, 160);
  ctx.fillStyle = "#f8d840";
  ctx.fillRect(500, 30, 26, 26);
  drawFar(ctx, "peaks", "#38304a", true, 40, 640, 160);
  ctx.fillStyle = "#1a1a28";
  ctx.fillRect(0, 160, 640, 40);
  ctx.fillStyle = "#f0d048";
  for (let x = 0; x < 640; x += 60) ctx.fillRect(x, 178, 30, 4);
  drawSprite(ctx, SPRITES.van, 240, 122, 4);
  const t = () => {
    // little idle animation: van bobs
    ctx.fillStyle = g; ctx.fillRect(200, 110, 200, 50);
    drawSprite(ctx, SPRITES.van, 240, 122 + (Math.floor(performance.now() / 400) % 2), 4);
    if (G.screen === "screen-title" || !G.screen) requestAnimationFrame(t);
  };
  t();
}

// ---------- input ----------
document.addEventListener("keydown", e => {
  // dialog open: numbers pick options, Enter picks first
  if (!$("dialog-overlay").classList.contains("hidden")) {
    if (e.key === "Enter" && dialogKeyMap[0]) { dialogKeyMap[0].click(); e.preventDefault(); }
    const n = parseInt(e.key);
    if (n >= 1 && n <= dialogKeyMap.length) { dialogKeyMap[n - 1].click(); e.preventDefault(); }
    return;
  }
  // screen buttons with data-key
  const active = document.querySelector(".screen.active");
  if (active) {
    const btn = [...active.querySelectorAll("button[data-key]")].find(b =>
      b.dataset.key.toLowerCase() === e.key.toLowerCase() && !b.disabled);
    if (btn && document.activeElement.tagName !== "INPUT") { btn.click(); e.preventDefault(); return; }
  }
  if (G.screen === "screen-travel" && G.mode === "travel") {
    if (e.key === "Enter" || e.key === " ") { togglePause(); e.preventDefault(); }
  }
});

$("game-canvas").addEventListener("click", e => {
  if (G.mode !== "forage") return;
  const rect = e.target.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (640 / rect.width);
  const my = (e.clientY - rect.top) * (360 / rect.height);
  forageClick(mx, my);
});

// unlock audio on first interaction
document.addEventListener("click", () => { if (!audioCtx) beep(1, 0.01, "sine", 0.001); }, { once: true });

// ---------- boot ----------
showScreen("screen-title");
renderTitle();
