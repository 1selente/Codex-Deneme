/* AI Startup Tycoon — deterministic, dependency-free game simulation. */
(function (root) {
  "use strict";

  const VERSION = 1;
  const ROLES = Object.freeze({
    researcher: { label: "Araştırmacı", salary: 4300, description: "Yeni AI modellerini daha hızlı eğitir." },
    engineer: { label: "Yazılım Mühendisi", salary: 3100, description: "Ürünleri ve altyapıyı ayakta tutar." },
    marketer: { label: "Pazarlamacı", salary: 2500, description: "Yeni kullanıcı edinimini artırır." }
  });
  const MODELS = Object.freeze([
    { name: "Nova-1", cost: 38000, weeks: 4, quality: 40, efficiency: 32, description: "Daha tutarlı yanıtlar ve ucuz çıkarım." },
    { name: "Nova-2", cost: 90000, weeks: 6, quality: 59, efficiency: 45, description: "Kodlama ve çok adımlı akıl yürütmede sıçrama." },
    { name: "Nova-3", cost: 185000, weeks: 8, quality: 78, efficiency: 60, description: "Multimodal ve kurumsal seviyede yetenek." },
    { name: "Nova-X", cost: 360000, weeks: 11, quality: 93, efficiency: 77, description: "Son teknoloji verim ve yetenek." }
  ]);
  const PRODUCT_TYPES = Object.freeze([
    { id: "assistant", name: "AI Asistanı", icon: "✦", cost: 19000, fee: 20, demand: 300, compute: 0.95, segment: "Bireysel" },
    { id: "coder", name: "Kod Asistanı", icon: "⌘", cost: 30000, fee: 34, demand: 190, compute: 1.25, segment: "Geliştirici" },
    { id: "studio", name: "Görsel Stüdyo", icon: "◈", cost: 25000, fee: 26, demand: 215, compute: 1.45, segment: "İçerik" },
    { id: "api", name: "Kurumsal API", icon: "⬡", cost: 40000, fee: 48, demand: 120, compute: 1.7, segment: "Kurumsal" }
  ]);
  const INITIAL_RIVALS = [
    { name: "Aether AI", quality: 42, users: 16000, focus: "assistant", color: "#a9a3ff" },
    { name: "CogniForge", quality: 35, users: 10500, focus: "coder", color: "#ffb56c" },
    { name: "BlueOrbit", quality: 31, users: 8400, focus: "api", color: "#60cda7" }
  ];
  const asInt = (value, fallback) => Number.isFinite(Number(value)) ? Math.floor(Number(value)) : fallback;
  const clamp = (number, low, high) => Math.max(low, Math.min(high, number));

  function random(state) {
    state.seed = (Math.imul(1664525, state.seed >>> 0) + 1013904223) >>> 0;
    return state.seed / 4294967296;
  }

  function log(state, message, kind) {
    state.news.unshift({ week: state.week, message: String(message), kind: kind || "info" });
    state.news = state.news.slice(0, 30);
  }

  function createGame(name, seed) {
    const company = String(name || "NovaMind Labs").trim().slice(0, 40) || "NovaMind Labs";
    return {
      version: VERSION, company, seed: (asInt(seed, 123456789) >>> 0),
      week: 1, cash: 220000, reputation: 12, ownership: 100,
      team: { researcher: 1, engineer: 1, marketer: 0 },
      servers: 1, model: { name: "Proto-0", tier: 0, quality: 24, efficiency: 22 },
      research: null, products: [], fundingCooldown: 0, rounds: 0,
      rivals: INITIAL_RIVALS.map(r => ({ ...r })),
      trends: { assistant: 1, coder: 1, studio: 1, api: 1 },
      lastWeek: { revenue: 0, costs: 0, profit: 0, acquired: 0, churned: 0 },
      history: [220000],
      news: [{ week: 1, message: "Garaj ofisin açıldı. İlk ürünü geliştirme zamanı!", kind: "good" }],
      status: "running"
    };
  }

  function countStaff(state) {
    return Object.values(state.team).reduce((sum, count) => sum + count, 0);
  }

  function maxUsers(state) {
    return 1100 + state.servers * 1700;
  }

  function totalUsers(state) {
    return state.products.reduce((sum, product) => sum + product.users, 0);
  }

  function valuation(state) {
    const annualRevenue = state.lastWeek.revenue * 52;
    return Math.max(250000, Math.round(state.cash * 0.7 + annualRevenue * 3 + totalUsers(state) * 40 + state.model.quality * 1800 + state.reputation * 2500));
  }

  function result(ok, message) { return { ok, message }; }

  function hire(state, role) {
    if (!ROLES[role]) return result(false, "Bilinmeyen çalışan türü.");
    const signingFee = ROLES[role].salary * 2;
    if (countStaff(state) >= 25) return result(false, "Ofis kapasitesi doldu (25 çalışan).");
    if (state.cash < signingFee) return result(false, "İşe alım bütçesi yetersiz.");
    state.cash -= signingFee;
    state.team[role] += 1;
    log(state, "Yeni " + ROLES[role].label.toLowerCase() + " ekibe katıldı.", "good");
    return result(true, ROLES[role].label + " işe alındı.");
  }

  function fire(state, role) {
    if (!ROLES[role] || state.team[role] <= 0) return result(false, "İşten çıkarılacak çalışan yok.");
    if (role === "engineer" && state.team.engineer <= 1 && state.products.length) return result(false, "Aktif ürünler için en az 1 mühendis gerekli.");
    if (role === "researcher" && state.team.researcher <= 1 && state.research) return result(false, "Devam eden araştırma için araştırmacı gerekli.");
    state.team[role] -= 1;
    state.reputation = clamp(state.reputation - 1, 0, 100);
    log(state, ROLES[role].label + " ekipten ayrıldı.", "warning");
    return result(true, "Çalışan ekipten ayrıldı.");
  }

  function startResearch(state) {
    if (state.research) return result(false, "Zaten devam eden bir araştırma var.");
    const next = MODELS[state.model.tier];
    if (!next) return result(false, "Tüm model seviyeleri açıldı.");
    if (state.team.researcher < 1) return result(false, "En az bir araştırmacı gerekiyor.");
    if (state.cash < next.cost) return result(false, "Araştırma bütçesi yetersiz.");
    state.cash -= next.cost;
    state.research = { tier: state.model.tier + 1, remaining: next.weeks, total: next.weeks };
    log(state, next.name + " araştırması başladı. Bütçe: $" + next.cost.toLocaleString("en-US"), "info");
    return result(true, next.name + " geliştiriliyor.");
  }

  function launch(state, id) {
    const spec = PRODUCT_TYPES.find(p => p.id === id);
    if (!spec) return result(false, "Bilinmeyen ürün.");
    if (state.products.some(p => p.id === id)) return result(false, "Bu ürün zaten piyasada.");
    if (state.team.engineer < 1) return result(false, "Ürün için bir mühendis gerekiyor.");
    if (state.cash < spec.cost) return result(false, "Ürünü çıkarmaya yetecek sermaye yok.");
    if (id === "api" && state.model.quality < 30) return result(false, "Kurumsal API için kalite en az 30 olmalı.");
    state.cash -= spec.cost;
    state.products.push({ id, name: spec.name, price: spec.fee, users: 0, revenue: 0, acquired: 0, churned: 0 });
    state.reputation = clamp(state.reputation + 2, 0, 100);
    log(state, spec.name + " kullanıma açıldı!", "good");
    return result(true, spec.name + " piyasaya çıktı.");
  }

  function setPrice(state, id, price) {
    const product = state.products.find(p => p.id === id);
    if (!product) return result(false, "Ürün bulunamadı.");
    const next = asInt(price, -1);
    if (next < 5 || next > 150) return result(false, "Aylık fiyat $5–$150 arasında olmalı.");
    product.price = next;
    return result(true, "Abonelik fiyatı güncellendi.");
  }

  function addServer(state) {
    const cost = 16000 + state.servers * 6000;
    if (state.servers >= 20) return result(false, "Şimdilik en fazla 20 sunucu kümesi kurulabilir.");
    if (state.cash < cost) return result(false, "Sunucu için bütçe yetersiz.");
    state.cash -= cost;
    state.servers += 1;
    log(state, "Sunucu kümesi satın alındı. Toplam kapasite: " + maxUsers(state).toLocaleString("tr-TR"), "good");
    return result(true, "Sunucu kapasitesi artırıldı.");
  }

  function raiseFunding(state) {
    if (state.fundingCooldown > 0) return result(false, "Yeni tur için " + state.fundingCooldown + " hafta beklemelisin.");
    if (state.ownership < 35) return result(false, "Yatırımcılar daha fazla hisse almak istemiyor.");
    const injection = 140000 + state.rounds * 70000 + Math.round(totalUsers(state) * 12);
    const stake = Math.round(injection / (valuation(state) + injection) * 1000) / 10;
    if (state.ownership - stake < 30) return result(false, "Bu yatırım turunda kurucu hissesi çok azalacak.");
    state.cash += injection;
    state.ownership = Math.round((state.ownership - stake) * 10) / 10;
    state.rounds += 1;
    state.fundingCooldown = 12;
    state.reputation = clamp(state.reputation + 3, 0, 100);
    log(state, "$" + injection.toLocaleString("en-US") + " yatırım alındı. %" + stake + " hisse devredildi.", "good");
    return result(true, "Yeni yatırım turu tamamlandı.");
  }

  function marketEvent(state) {
    const roll = random(state);
    if (roll < 0.25) {
      const gain = 3500 + Math.round(random(state) * 9500);
      state.cash += gain;
      log(state, "Bir kurumsal müşteriden $" + gain.toLocaleString("en-US") + " pilot proje geliri!", "good");
    } else if (roll < 0.48) {
      const loss = 1500 + Math.round(random(state) * 6500);
      state.cash -= loss;
      log(state, "Sunucu kesintisi ve telafi maliyeti: $" + loss.toLocaleString("en-US"), "warning");
    } else if (roll < 0.72) {
      state.reputation = clamp(state.reputation + 4, 0, 100);
      log(state, "Bağımsız bir teknoloji yayını şirketinden övgüyle bahsetti.", "good");
    } else if (roll < 0.9) {
      state.reputation = clamp(state.reputation - 3, 0, 100);
      log(state, "Rakiplerin agresif reklam kampanyası görünürlüğünü düşürdü.", "warning");
    } else {
      log(state, "Yeni açık kaynak modeller piyasada rekabeti artırıyor.", "info");
      state.rivals.forEach(r => { r.quality = clamp(r.quality + 2, 0, 99); });
    }
  }

  function advanceWeek(state) {
    if (state.status !== "running") return result(false, "Oyun sona erdi. Yeni şirket kurabilirsin.");
    state.week++;
    if (state.fundingCooldown > 0) state.fundingCooldown--;

    if (state.research) {
      const boost = Math.max(1, Math.floor(state.team.researcher / 3) + 1);
      state.research.remaining -= boost;
      if (state.research.remaining <= 0) {
        const completed = MODELS[state.research.tier - 1];
        state.model = { name: completed.name, tier: state.research.tier, quality: completed.quality, efficiency: completed.efficiency };
        state.research = null;
        state.reputation = clamp(state.reputation + 5, 0, 100);
        log(state, completed.name + " yayınlandı! Kalite: " + completed.quality, "good");
      }
    }

    state.rivals.forEach(r => {
      if (random(state) < 0.14) r.quality = clamp(r.quality + 1 + Math.floor(random(state) * 3), 0, 96);
      r.users += Math.round(r.users * (0.004 + random(state) * 0.009));
    });
    Object.keys(state.trends).forEach(k => {
      state.trends[k] = clamp(state.trends[k] + (random(state) - 0.5) * 0.18, 0.72, 1.32);
    });

    const fixed = state.team.researcher * ROLES.researcher.salary +
      state.team.engineer * ROLES.engineer.salary +
      state.team.marketer * ROLES.marketer.salary + 2500 + state.servers * 850;
    let revenue = 0, costs = fixed, acquired = 0, churned = 0;
    let remainingCapacity = maxUsers(state);
    const marketReputation = 0.55 + state.reputation / 80;
    const bestRival = Math.max(...state.rivals.map(r => r.quality));

    state.products.forEach(product => {
      const spec = PRODUCT_TYPES.find(p => p.id === product.id);
      const oldUsers = product.users;
      const priceRatio = product.price / spec.fee;
      const priceFactor = clamp(1.85 - priceRatio * 0.85, 0.12, 1.75);
      const qualityFactor = clamp(0.5 + state.model.quality / 64, 0.4, 2);
      const competition = clamp(1 + (state.model.quality - bestRival) / 130, 0.5, 1.4);
      const marketingFactor = 1 + state.team.marketer * 0.2;
      const prospect = Math.round(spec.demand * marketReputation * priceFactor * qualityFactor *
        competition * marketingFactor * state.trends[product.id] * (0.85 + random(state) * 0.3));
      const churnRate = clamp(0.025 + Math.max(0, priceRatio - 1) * 0.065 +
        Math.max(0, bestRival - state.model.quality) * 0.001, 0.025, 0.28);
      const lost = Math.min(oldUsers, Math.round(oldUsers * churnRate));
      const retained = oldUsers - lost;
      const room = Math.max(0, remainingCapacity - retained);
      const gained = Math.min(room, Math.max(0, prospect));
      product.users = retained + gained;
      product.acquired = gained;
      product.churned = lost;
      product.revenue = Math.round(product.users * product.price / 4);
      acquired += gained;
      churned += lost;
      revenue += product.revenue;
      costs += Math.round(product.users * spec.compute * (1.35 - state.model.efficiency / 160));
      remainingCapacity -= product.users;
    });

    if (state.products.length && totalUsers(state) >= maxUsers(state) * 0.98) {
      log(state, "Sunucu kapasitesi doldu. Yeni müşteri kazanmak için kapasite artır.", "warning");
    }
    state.cash += revenue - costs;
    state.lastWeek = { revenue, costs, profit: revenue - costs, acquired, churned };
    if (state.week % 5 === 0) marketEvent(state);
    state.history.push(state.cash);
    state.history = state.history.slice(-48);
    if (state.cash < -25000) {
      state.status = "bankrupt";
      log(state, "Şirket iflas etti. Yeni bir girişimle tekrar dene.", "warning");
    }
    return result(true, state.status === "bankrupt" ? "Şirket iflas etti." : "Yeni haftaya geçildi.");
  }

  function dispatch(state, action, data) {
    if (!state || state.version !== VERSION || state.status !== "running") {
      return result(false, "Oyun aktif değil.");
    }
    const payload = data || {};
    switch (action) {
      case "next-week": return advanceWeek(state);
      case "hire": return hire(state, payload.role);
      case "fire": return fire(state, payload.role);
      case "research": return startResearch(state);
      case "launch": return launch(state, payload.id);
      case "price": return setPrice(state, payload.id, payload.price);
      case "server": return addServer(state);
      case "fund": return raiseFunding(state);
      case "rename":
        if (!String(payload.name || "").trim()) return result(false, "Şirket adı boş olamaz.");
        state.company = String(payload.name).trim().slice(0, 40);
        return result(true, "Şirket yeniden adlandırıldı.");
      default: return result(false, "Bilinmeyen işlem.");
    }
  }

  function parseSave(serialized) {
    try {
      const state = JSON.parse(serialized);
      if (!state || state.version !== VERSION || !state.team ||
        !Array.isArray(state.products) || !Array.isArray(state.rivals) ||
        !Array.isArray(state.history) || !Array.isArray(state.news) ||
        !Number.isFinite(state.cash) || !Number.isInteger(state.week) ||
        !Number.isInteger(state.seed) || state.week < 1) return null;
      return state;
    } catch (_error) { return null; }
  }

  const api = { VERSION, ROLES, MODELS, PRODUCT_TYPES, createGame, dispatch, maxUsers, totalUsers, countStaff, valuation, parseSave };
  root.AIStartupGame = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
