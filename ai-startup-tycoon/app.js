/* AI Startup Tycoon — view/controller. The engine owns all game rules. */
(function () {
  "use strict";

  const Engine = window.AIStartupGame;
  const STORAGE_KEY = "ai-startup-tycoon-save-v1";
  let view = "dashboard";
  let toastTimeout = null;

  function load() {
    try { return Engine.parseSave(localStorage.getItem(STORAGE_KEY)); }
    catch (_error) { return null; }
  }
  let state = load() || Engine.createGame("NovaMind Labs", Date.now());

  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const fmt = number => Math.round(number).toLocaleString("en-US");
  const usd = value => (value < 0 ? "-$" + fmt(Math.abs(value)) : "$" + fmt(value));
  const compact = value => {
    const a = Math.abs(value);
    const n = a >= 1000000 ? (a / 1000000).toFixed(1) + "M" :
      a >= 1000 ? (a / 1000).toFixed(1) + "K" : fmt(a);
    return (value < 0 ? "-" : "") + n;
  };
  const moneyShort = value => (value < 0 ? "-$" : "$") + compact(Math.abs(value));
  const bar = pct => '<div class="progress-bar"><div class="progress-fill" style="width:' +
    Math.min(100, Math.max(0, pct)).toFixed(1) + '%"></div></div>';
  const tag = (label, type) => '<span class="status-tag ' + (type || "") + '">' + label + '</span>';

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
    catch (_error) { return false; }
  }

  function notify(message, error) {
    const node = $("toast");
    node.textContent = message;
    node.className = "toast" + (error ? " error" : "");
    node.hidden = false;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { node.hidden = true; }, 3500);
  }

  function metric(label, value, foot, valueClass) {
    return '<div class="metric"><div class="metric-label">' + label +
      '</div><div class="metric-value ' + (valueClass || "") + '">' + value +
      '</div><div class="metric-foot">' + foot + '</div></div>';
  }

  function header(title, description, pill) {
    return '<div class="page-heading"><div><div class="eyebrow">GİRİŞİM YÖNETİMİ</div><h1>' +
      title + '</h1><p>' + description + '</p></div>' +
      (pill ? '<span class="page-pill">' + pill + '</span>' : "") + '</div>';
  }

  function news(limit) {
    return '<div class="activity-list news-scroll">' + state.news.slice(0, limit).map(item =>
      '<div class="activity"><span class="activity-dot ' + esc(item.kind) +
      '"></span><div><p>' + esc(item.message) +
      '</p><small>Hafta ' + item.week + '</small></div></div>'
    ).join("") + '</div>';
  }

  function chart(values) {
    const width = 780, height = 180, padding = 12;
    if (!values.length) return "";
    const min = Math.min(0, ...values), max = Math.max(1, ...values);
    const spread = Math.max(1, max - min);
    const point = (v, i) => {
      const x = padding + i * (width - padding * 2) / Math.max(1, values.length - 1);
      const y = height - padding - (v - min) / spread * (height - padding * 2);
      return [x.toFixed(1), y.toFixed(1)];
    };
    const coords = values.map(point);
    const path = coords.map((xy, index) => (index ? "L" : "M") + xy.join(",")).join(" ");
    const last = coords[coords.length - 1];
    const zeroY = height - padding - (0 - min) / spread * (height - padding * 2);
    const fill = path + " L" + last[0] + "," + (height - padding) +
      " L" + coords[0][0] + "," + (height - padding) + " Z";
    const grids = [0.2, 0.5, 0.8].map(f => '<line x1="0" x2="' + width + '" y1="' +
      (height * f) + '" y2="' + (height * f) + '" stroke="#30374b" stroke-dasharray="4,7"/>').join("");
    return '<svg viewBox="0 0 ' + width + ' ' + height +
      '" preserveAspectRatio="none" role="img" aria-label="Haftalara göre nakit bakiyesi grafiği">' +
      '<defs><linearGradient id="cashgradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#78eabc" stop-opacity=".24"/><stop offset="100%" stop-color="#78eabc" stop-opacity="0"/></linearGradient></defs>' +
      grids + '<line x1="0" x2="' + width + '" y1="' + zeroY.toFixed(1) +
      '" y2="' + zeroY.toFixed(1) + '" stroke="#a77789" stroke-dasharray="5,4" opacity=".6"/>' +
      '<path d="' + fill + '" fill="url(#cashgradient)"/><path d="' + path +
      '" stroke="#83edc4" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="5" fill="#83edc4"/></svg>';
  }

  function renderDashboard() {
    const users = Engine.totalUsers(state);
    const capacityPct = Math.round(users / Engine.maxUsers(state) * 100);
    const snapshot = state.lastWeek;
    const runway = snapshot.profit < 0 ? Math.max(0, Math.floor(state.cash / -snapshot.profit)) : null;
    const tip = state.products.length === 0
      ? 'Henüz satış yapan bir ürünün yok. İlk ürününü piyasaya sürerek müşteri kazanmaya başla.'
      : capacityPct >= 90
        ? 'Altyapın dolmak üzere. Yeni sunucu kurmazsan kullanıcı kazanımın yavaşlayacak.'
        : state.model.quality < 40
          ? 'Rakiplerin modelleri güçleniyor. Nova-1 araştırmasını başlatmak fark yaratabilir.'
          : 'Ürünlerin büyüyor. Fiyat ve pazarlama kararlarının müşteri kaybına etkisini takip et.';
    return header("Komuta Merkezi", "Şirketinin nabzı, finansal performansın ve son gelişmeler.", "Hafta " + state.week) +
      (state.status === "bankrupt" ?
        '<div class="hero"><div><div class="eyebrow">OYUN SONA ERDİ</div><h2>Şirketin iflas etti.</h2><p>Daha dengeli bir bütçe ve erken ürün lansmanıyla yeniden deneyebilirsin.</p></div><div class="hero-symbol">↺</div></div>' :
        '<div class="hero"><div><div class="eyebrow">KURUCU GÜNLÜĞÜ</div><h2>' +
          (state.week === 1 ? 'Büyük bir şeyin başlangıcı.' : 'Gelecek haftanın kararları sende.') +
          '</h2><p>' + tip + '</p></div><div class="hero-symbol">✦</div></div>') +
      '<div class="grid-2"><section class="card"><div class="card-head"><div><div class="card-title">Nakit Akışı</div><p class="card-subtitle">Son ' +
      state.history.length + ' haftanın şirket kasası</p></div>' +
      tag(snapshot.profit >= 0 ? "KÂRDA" : "ZARARDA", snapshot.profit >= 0 ? "" : "warning") +
      '</div><div class="chart-wrap">' + chart(state.history) +
      '</div><div class="chart-meta"><span><i class="legend"></i> Nakit bakiyesi</span><span>Güncel: ' +
      usd(state.cash) + '</span></div><div class="separator"></div><div class="stats-mini">' +
      '<div><span class="info-label">Haftalık gelir</span><strong class="positive">' + usd(snapshot.revenue) +
      '</strong></div><div><span class="info-label">Haftalık gider</span><strong>' + usd(snapshot.costs) +
      '</strong></div><div><span class="info-label">Net sonuç</span><strong class="' +
      (snapshot.profit >= 0 ? "positive" : "negative") + '">' + usd(snapshot.profit) +
      '</strong></div><div><span class="info-label">Tahmini nakit ömrü</span><strong>' +
      (runway === null ? "Pozitif" : runway + " hafta") + '</strong></div></div></section>' +
      '<section class="card"><div class="card-title">Son Gelişmeler</div><p class="card-subtitle">Piyasadan ve şirketinden haberler</p>' +
      news(7) + '</section></div><div class="grid-equal" style="margin-top:18px">' +
      '<section class="card"><div class="card-head"><div class="card-title">Ürün Performansı</div>' +
      tag(state.products.length + " AKTİF", "neutral") + '</div><div class="stats-mini">' +
      '<div><span class="info-label">Aktif kullanıcı</span><strong>' + fmt(users) +
      '</strong></div><div><span class="info-label">Yeni / Kayıp</span><strong>+' +
      fmt(snapshot.acquired) + ' / -' + fmt(snapshot.churned) +
      '</strong></div></div><div class="separator"></div><div class="row-between"><span class="info-label">Sunucu kullanımı</span><strong>' +
      capacityPct + '%</strong></div>' + bar(capacityPct) +
      '<p class="inline-hint">' + fmt(users) + ' / ' + fmt(Engine.maxUsers(state)) +
      ' kullanıcı kapasitesi</p></section>' +
      '<section class="card"><div class="card-head"><div class="card-title">Şirket Değeri</div>' +
      tag("ÖZEL ŞİRKET", "neutral") + '</div><div class="info-number">' +
      usd(Engine.valuation(state)) +
      '</div><p class="card-subtitle">Tahmini şirket değerlemesi (oyun içi)</p>' +
      '<div class="stats-mini"><div><span class="info-label">Kurucu hissesi</span><strong>%' +
      state.ownership.toFixed(1) +
      '</strong></div><div><span class="info-label">Tamamlanan tur</span><strong>' +
      state.rounds + '</strong></div></div><div class="callout">Yatırım almak nakit sağlar, ancak şirketteki payını azaltır.</div></section></div>';
  }

  function renderResearch() {
    const model = state.model;
    const next = Engine.MODELS[model.tier];
    const research = state.research;
    const progress = research ? Math.round((research.total - research.remaining) / research.total * 100) : 0;
    return header("Model Laboratuvarı", "Daha güçlü modeller geliştir, rakiplerini yakala ve altyapı maliyetlerini azalt.", "AR-GE") +
      '<div class="grid-equal"><section class="card"><div class="card-title">Mevcut Model</div>' +
      '<p class="card-subtitle">Tüm ürünlerinin kullandığı temel teknoloji</p>' +
      '<div class="hero" style="margin-bottom:0"><div><div class="eyebrow">YAYINDAKİ MODEL</div><h2>' +
      esc(model.name) + '</h2><p>Şirketinin kendi geliştirdiği yapay zekâ altyapısı.</p></div><div class="hero-symbol">⬡</div></div>' +
      '<div class="separator"></div><div class="row-between"><span class="info-label">Model kalitesi</span><strong>' +
      model.quality + ' / 100</strong></div>' + bar(model.quality) +
      '<div class="row-between"><span class="info-label">İşlem verimliliği</span><strong>' +
      model.efficiency + ' / 100</strong></div>' + bar(model.efficiency) + '</section>' +
      '<section class="card"><div class="card-head"><div class="card-title">Sıradaki Araştırma</div>' +
      (next ? tag(research ? "GELİŞTİRİLİYOR" : "HAZIR", research ? "warning" : "") : tag("TAMAMLANDI")) +
      '</div>' + (next ?
        '<h2 style="margin:10px 0 8px">' + next.name + '</h2><p class="card-subtitle">' +
        next.description + '</p><div class="stats-mini"><div><span class="info-label">Araştırma maliyeti</span><strong>' +
        usd(next.cost) + '</strong></div><div><span class="info-label">Temel geliştirme süresi</span><strong>' +
        next.weeks + ' hafta</strong></div><div><span class="info-label">Yeni kalite</span><strong>' +
        next.quality + '/100</strong></div><div><span class="info-label">Yeni verimlilik</span><strong>' +
        next.efficiency + '/100</strong></div></div>' +
        (research ? '<div class="separator"></div><div class="row-between"><span class="info-label">Araştırma ilerlemesi</span><strong>%' +
          progress + '</strong></div>' + bar(progress) +
          '<p class="inline-hint">Tahmini kalan: ' + Math.max(0, research.remaining) + ' araştırma haftası</p>' :
          '<div class="separator"></div><button class="primary-button full-width" data-action="research" ' +
          (state.cash < next.cost || state.team.researcher < 1 ? "disabled" : "") + '>Araştırmayı Başlat · ' +
          usd(next.cost) + '</button>') :
        '<p class="inline-hint">Mevcut prototipteki tüm araştırmaları tamamladın.</p>') +
      '</section></div><section class="card" style="margin-top:18px"><div class="card-title">Teknoloji Yol Haritası</div>' +
      Engine.MODELS.map((m, i) => '<div class="offer"><div><h3>' + (i + 1) +
        '. ' + m.name + '</h3><p>' + m.description + '</p></div><div class="offer-actions">' +
        tag(i < model.tier ? "TAMAMLANDI" : i === model.tier ? "SIRADAKİ" : "KİLİTLİ", i < model.tier ? "" : "neutral") +
        '<div class="offer-price"><strong>' + usd(m.cost) + '</strong><span>' +
        m.weeks + ' hafta</span></div></div></div>').join("") + '</section>';
  }

  function renderProducts() {
    const users = Engine.totalUsers(state);
    const available = Engine.PRODUCT_TYPES.filter(type => !state.products.some(p => p.id === type.id));
    return header("Ürün Portföyü", "Yeni ürünler piyasaya sür, fiyatları belirle, müşteri kitleni büyüt.", state.products.length + " / 4 ÜRÜN") +
      '<section class="card"><div class="card-head"><div><div class="card-title">Piyasadaki Ürünler</div>' +
      '<p class="card-subtitle">Her hafta talep, fiyat ve rakip kaliteye göre hesaplanır.</p></div>' +
      tag(fmt(users) + " KULLANICI", "neutral") + '</div>' +
      (state.products.length ? '<div class="grid-equal">' + state.products.map(product => {
        const spec = Engine.PRODUCT_TYPES.find(p => p.id === product.id);
        return '<div class="card" style="box-shadow:none;background:#1b2133">' +
          '<div class="product-heading"><span class="product-icon">' + spec.icon +
          '</span><div><strong>' + esc(product.name) + '</strong><span>' + spec.segment + '</span></div></div>' +
          '<div class="stats-mini"><div><span class="info-label">Aktif müşteri</span><strong>' +
          fmt(product.users) + '</strong></div><div><span class="info-label">Haftalık gelir</span><strong>' +
          usd(product.revenue) + '</strong></div></div><div class="separator"></div>' +
          '<div class="row-between"><span class="info-label">Aylık abonelik</span>' +
          '<div class="price-control"><button data-action="price" data-id="' + product.id +
          '" data-delta="-2" aria-label="Fiyatı düşür">−</button><strong>$' + product.price +
          '</strong><button data-action="price" data-id="' + product.id +
          '" data-delta="2" aria-label="Fiyatı yükselt">+</button></div></div>' +
          '<p class="inline-hint">Son hafta: +' + fmt(product.acquired) +
          ' yeni, −' + fmt(product.churned) + ' ayrılan müşteri</p></div>';
      }).join("") + '</div>' :
        '<div class="empty"><div class="icon">◈</div>Henüz ürünün bulunmuyor.<br>İlk ürününü aşağıdan piyasaya sürebilirsin.</div>') +
      '</section><section class="card" style="margin-top:18px"><div class="card-title">Yeni Ürün Geliştir</div>' +
      '<p class="card-subtitle">İlk piyasaya sürme maliyeti peşin ödenir; kullanıcılar sonraki haftalarda gelir getirir.</p>' +
      (available.length ? available.map(spec => '<div class="offer"><div class="product-heading" style="margin:0">' +
        '<div class="product-icon">' + spec.icon + '</div><div><strong>' + spec.name +
        '</strong><span>' + spec.segment + ' • Varsayılan aylık abonelik $' + spec.fee +
        '</span></div></div><div class="offer-actions"><div class="offer-price"><strong>' +
        usd(spec.cost) + '</strong><span>Çıkış yatırımı</span></div><button class="primary-button" data-action="launch" data-id="' +
        spec.id + '" ' + (state.cash < spec.cost || (spec.id === "api" && state.model.quality < 30) ? "disabled" : "") +
        '>Piyasaya Sür</button></div></div>').join("") :
        '<div class="empty">Bütün mevcut ürün türlerini yayınladın.</div>') +
      '<div class="callout">Kurumsal API için en az 30 model kalitesi gerekir. Müşteri sayısı sunucu kapasiteni aşamaz.</div></section>';
  }

  function renderTeam() {
    return header("Ekip ve Altyapı", "İşe alım, sabit giderler ve sunucu kapasitesi arasında denge kur.", Engine.countStaff(state) + " ÇALIŞAN") +
      '<div class="grid-2"><section class="card"><div class="card-title">Çalışan Yönetimi</div>' +
      '<p class="card-subtitle">Çalışanlar her hafta maaş alır; işe alırken iki haftalık imza ücreti ödenir.</p>' +
      Object.entries(Engine.ROLES).map(([id, role]) =>
        '<div class="offer"><div><h3>' + role.label + ' · ' + state.team[id] +
        '</h3><p>' + role.description + '</p><p>Haftalık maaş: ' + usd(role.salary) +
        '</p></div><div class="offer-actions"><button class="subtle-button" data-action="fire" data-role="' +
        id + '" ' + (state.team[id] === 0 ? "disabled" : "") +
        '>−</button><button class="primary-button" data-action="hire" data-role="' +
        id + '" ' + (state.cash < role.salary * 2 || Engine.countStaff(state) >= 25 ? "disabled" : "") +
        '>+ İşe Al</button></div></div>').join("") + '</section>' +
      '<section class="stacked"><div class="card"><div class="card-head"><div class="card-title">Sunucu Altyapısı</div>' +
      tag(state.servers + " KÜME", "neutral") + '</div><div class="info-number">' +
      fmt(Engine.maxUsers(state)) + '</div><p class="card-subtitle">Desteklenen eşzamanlı aktif müşteri kapasitesi</p>' +
      '<div class="row-between"><span class="info-label">Mevcut kullanıcı</span><strong>' +
      fmt(Engine.totalUsers(state)) + '</strong></div>' +
      bar(Engine.totalUsers(state) / Engine.maxUsers(state) * 100) +
      '<div class="separator"></div><div class="row-between"><div><strong>+1 sunucu kümesi</strong><p class="inline-hint">+1.700 kapasite, +$850 haftalık gider</p></div><button class="primary-button" data-action="server" ' +
      (state.cash < 16000 + state.servers * 6000 || state.servers >= 20 ? "disabled" : "") +
      '>Satın Al · ' + moneyShort(16000 + state.servers * 6000) +
      '</button></div></div><div class="card"><div class="card-title">Haftalık Sabit Giderler</div>' +
      '<p class="card-subtitle">Ürünlerin değişken işlem maliyetleri hariç</p>' +
      Object.entries(Engine.ROLES).map(([id, role]) =>
        '<div class="row-between" style="margin-top:13px"><span class="info-label">' + role.label + '</span><strong>' +
        usd(state.team[id] * role.salary) + '</strong></div>').join("") +
      '<div class="row-between" style="margin-top:13px"><span class="info-label">Ofis + sunucu</span><strong>' +
      usd(2500 + state.servers * 850) + '</strong></div></div></section></div>';
  }

  function renderMarket() {
    const yourUsers = Engine.totalUsers(state);
    const rivals = state.rivals;
    const max = Math.max(yourUsers, ...rivals.map(r => r.users), 1);
    return header("Pazar ve Rakipler", "Rakipler her hafta gelişir. Hedefin sürdürülebilir büyüme ve kârlılık.", "DİNAMİK PİYASA") +
      '<div class="grid-2"><section class="card"><div class="card-title">Şirket Sıralaması</div>' +
      '<p class="card-subtitle">Ürünlerdeki toplam aktif kullanıcı sayısına göre karşılaştırma</p>' +
      [{ name: state.company, users: yourUsers, quality: state.model.quality, color: "#80edc0", yours: true }, ...rivals].sort((a, b) => b.users - a.users).map((company, i) =>
        '<div class="offer"><div style="flex:1"><div class="row-between"><h3>' +
        (i + 1) + '. ' + esc(company.name) +
        (company.yours ? ' (Sen)' : '') +
        '</h3><strong>' + fmt(company.users) + '</strong></div><div class="progress-bar"><div class="progress-fill" style="width:' +
        Math.round(company.users / max * 100) + '%;background:' + company.color + '"></div></div>' +
        '<p>Model kalitesi: ' + company.quality + ' / 100</p></div></div>').join("") +
      '</section><section class="stacked"><div class="card"><div class="card-head"><div class="card-title">Yatırımcı Görüşmesi</div>' +
      tag("SERİ " + (state.rounds + 1), "neutral") + '</div><p class="card-subtitle">Büyüme karşılığında şirkete ortak alabilirsin.</p>' +
      '<div class="stats-mini"><div><span class="info-label">Yeni yatırım</span><strong>' +
      usd(140000 + state.rounds * 70000 + Math.round(yourUsers * 12)) +
      '</strong></div><div><span class="info-label">Kurucu hissesi</span><strong>%' +
      state.ownership.toFixed(1) + '</strong></div></div><div class="separator"></div>' +
      '<button data-action="fund" class="primary-button full-width" ' +
      (state.fundingCooldown > 0 || state.ownership < 35 ? "disabled" : "") +
      '>Yatırım Turunu Aç</button><p class="inline-hint">' +
      (state.fundingCooldown ? 'Yeni yatırım için ' + state.fundingCooldown + ' hafta kaldı.' :
        'Yatırım turunda verilecek hisse, şirket değerine göre hesaplanır.') +
      '</p></div><div class="card"><div class="card-title">Pazar Eğilimleri</div>' +
      '<p class="card-subtitle">Talep zamanla yükselip düşer.</p>' +
      Engine.PRODUCT_TYPES.map(spec =>
        '<div class="row-between" style="margin-top:14px"><span class="info-label">' + spec.name +
        '</span>' + tag(state.trends[spec.id] >= 1.06 ? "YÜKSELİŞ" : state.trends[spec.id] <= 0.94 ? "DÜŞÜŞ" : "DENGELİ",
          state.trends[spec.id] <= 0.94 ? "warning" : "neutral") +
        '</div>').join("") + '</div></section></div>';
  }

  function render() {
    $("rename-company").innerHTML = esc(state.company) + ' <span>✎</span>';
    $("week-count").textContent = String(state.week).padStart(2, "0");
    $("next-week").disabled = state.status !== "running";
    const cashChange = state.lastWeek.profit;
    $("metrics").innerHTML =
      metric("Şirket Kasası", moneyShort(state.cash), "Haftalık net: " + usd(cashChange), state.cash < 0 ? "negative" : "") +
      metric("Aktif Kullanıcı", compact(Engine.totalUsers(state)), "Son hafta +" + fmt(state.lastWeek.acquired) + " yeni") +
      metric("Model Kalitesi", state.model.quality + "/100", esc(state.model.name)) +
      metric("İtibar", state.reputation + "/100", "Piyasadaki marka algısı");
    document.querySelectorAll("[data-view]").forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle("selected", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    const pages = { dashboard: renderDashboard, research: renderResearch, products: renderProducts, team: renderTeam, market: renderMarket };
    $("view-content").innerHTML = (pages[view] || renderDashboard)();
  }

  function act(action, data) {
    const outcome = Engine.dispatch(state, action, data);
    notify(outcome.message, !outcome.ok);
    if (outcome.ok) { save(); render(); }
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    if (button.dataset.view) {
      view = button.dataset.view;
      render();
      return;
    }
    const action = button.dataset.action;
    if (!action) return;
    if (action === "price") {
      const product = state.products.find(p => p.id === button.dataset.id);
      if (product) act("price", { id: product.id, price: product.price + Number(button.dataset.delta) });
    } else if (action === "launch") act("launch", { id: button.dataset.id });
    else if (action === "hire" || action === "fire") act(action, { role: button.dataset.role });
    else act(action);
  });

  $("next-week").addEventListener("click", () => act("next-week"));
  $("save-game").addEventListener("click", () => {
    const ok = save();
    notify(ok ? "Oyun tarayıcına kaydedildi." : "Kayıt yapılamadı. Tarayıcı depolama iznini kontrol et.", !ok);
  });
  $("rename-company").addEventListener("click", () => {
    const name = prompt("Girişimine hangi adı vermek istiyorsun?", state.company);
    if (name !== null) act("rename", { name });
  });
  $("new-game").addEventListener("click", () => {
    if (!confirm("Mevcut kaydı silip yeni bir şirket kurmak istiyor musun?")) return;
    const name = prompt("Yeni şirketin adı:", "NovaMind Labs");
    if (name === null) return;
    state = Engine.createGame(name, Date.now());
    view = "dashboard";
    save();
    render();
    notify("Yeni oyun başladı. İlk kararını ver!");
  });

  render();
})();
