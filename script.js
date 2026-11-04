const WHATSAPP = "5584994123216";

const MOTOS = [
  {
    id: "lander-250-2023",
    marca: "Yamaha",
    modelo: "Lander 250",
    ano: 2023,
    km: 41934,
    cor: "Vermelha",
    categoria: "trilha",
    preco: null,
    fipe: null,
    garantia: true,
    foto: "assets/img/lander-250.jpg",
    obs: "Trail versátil para cidade e estrada. Pronta para rodar."
  },
  {
    id: "titan-160-2025",
    marca: "Honda",
    modelo: "CG Titan 160",
    ano: 2025,
    km: 14357,
    cor: "Laranja",
    categoria: "street",
    preco: null,
    fipe: null,
    garantia: true,
    foto: "assets/img/titan-160.jpg",
    obs: "Modelo 2025 com baixa quilometragem. Econômica e muito procurada."
  },
  {
    id: "ttr-230-2023",
    marca: "Yamaha",
    modelo: "TTR 230",
    ano: 2023,
    km: null,
    cor: "Azul",
    categoria: "trilha",
    preco: 15500,
    fipe: 16900,
    garantia: false,
    foto: "assets/img/ttr-230.jpg",
    obs: "Moto de repasse (sem garantia). Abaixo da tabela FIPE."
  }
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = n => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const kmFmt = n => n == null ? "Consulte" : n.toLocaleString("pt-BR") + " km";
const waLink = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

window.addEventListener("load", () => {
  setTimeout(() => $("#loader").classList.add("done"), 350);
});

const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const burger = $("#burger");
const navLinks = $("#navLinks");
burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  burger.classList.toggle("open", open);
  document.body.classList.toggle("lock", open);
});
$$("#navLinks a").forEach(a => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  burger.classList.remove("open");
  document.body.classList.remove("lock");
}));

const sections = $$("main section[id]");
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$("#navLinks a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach(s => spy.observe(s));

const revealer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealer.unobserve(e.target);
    }
  });
}, { threshold: .12 });
$$(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 70 + "ms";
  revealer.observe(el);
});

const counter = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || 0, 10);
    const suf = el.dataset.suffix || "";
    const t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / 1400, 1);
      const v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec).replace(".", ",") + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    counter.unobserve(el);
  });
}, { threshold: .6 });
$$("[data-count]").forEach(el => counter.observe(el));

const grid = $("#gridMotos");
const empty = $("#empty");
let filtro = "todas";
let busca = "";

function cardHTML(m) {
  const preco = m.preco ? brl(m.preco) : "Consulte";
  const badge = m.garantia
    ? '<span class="badge badge-ok">Disponível</span>'
    : '<span class="badge badge-warn">Repasse</span>';
  const abaixo = m.preco && m.fipe && m.preco < m.fipe ? '<span class="badge">Abaixo da FIPE</span>' : "";
  return `
    <button class="card" data-id="${m.id}" aria-label="Ver detalhes da ${m.marca} ${m.modelo} ${m.ano}">
      <div class="card-media">
        <img src="${m.foto}" alt="${m.marca} ${m.modelo} ${m.ano} ${m.cor.toLowerCase()}" loading="lazy">
        <div class="card-badges">${badge}${abaixo}</div>
      </div>
      <div class="card-body">
        <span class="card-brand">${m.marca}</span>
        <h3 class="card-title">${m.modelo}</h3>
        <div class="card-specs">
          <span>${m.ano}</span>
          <span>${kmFmt(m.km)}</span>
          <span>${m.cor}</span>
        </div>
        <div class="card-foot">
          <div class="card-price"><small>Valor</small><strong>${preco}</strong></div>
          <span class="card-go"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
        </div>
      </div>
    </button>`;
}

function render() {
  const q = busca.trim().toLowerCase();
  const lista = MOTOS.filter(m => {
    const okFiltro = filtro === "todas" || m.marca === filtro || m.categoria === filtro;
    const okBusca = !q || `${m.marca} ${m.modelo} ${m.ano} ${m.cor}`.toLowerCase().includes(q);
    return okFiltro && okBusca;
  });
  grid.innerHTML = lista.map(cardHTML).join("");
  empty.hidden = lista.length > 0;
  $$(".card", grid).forEach((c, i) => c.style.animationDelay = i * 80 + "ms");
}

$("#filters").addEventListener("click", e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  $$(".chip").forEach(c => c.classList.toggle("active", c === b));
  filtro = b.dataset.filter;
  render();
});
$("#search").addEventListener("input", e => { busca = e.target.value; render(); });

const modal = $("#modal");

function openModal(m) {
  $("#mImg").src = m.foto;
  $("#mImg").alt = `${m.marca} ${m.modelo} ${m.ano}`;
  $("#mBrand").textContent = m.marca;
  $("#mTitle").textContent = m.modelo;
  $("#mSpecs").innerHTML = [
    ["Ano", m.ano],
    ["Quilometragem", kmFmt(m.km)],
    ["Cor", m.cor],
    ["Condição", m.garantia ? "Disponível" : "Repasse, sem garantia"]
  ].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join("");
  const note = $("#mNote");
  note.textContent = m.obs;
  note.classList.toggle("warn", !m.garantia);
  $("#mPrice").textContent = m.preco ? brl(m.preco) : "Sob consulta";
  $("#mFipe").textContent = m.fipe ? `Tabela FIPE: ${brl(m.fipe)}` : "Condições especiais no PIX, cartão em até 21x ou financiamento.";
  $("#mWa").href = waLink(`Olá, MB Motos! Vi no site a ${m.marca} ${m.modelo} ${m.ano} e tenho interesse. Ela ainda está disponível?`);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
  $(".modal-close", modal).focus();
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lock");
}

grid.addEventListener("click", e => {
  const c = e.target.closest(".card");
  if (c) openModal(MOTOS.find(m => m.id === c.dataset.id));
});
$$("[data-close]", modal).forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

$$("[data-wa]").forEach(a => {
  a.href = waLink(a.dataset.wa);
  a.target = "_blank";
  a.rel = "noopener";
});

const form = $("#evalForm");
const kmInput = $("#fKm");
kmInput.addEventListener("input", () => {
  const d = kmInput.value.replace(/\D/g, "").slice(0, 7);
  kmInput.value = d ? Number(d).toLocaleString("pt-BR") : "";
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const req = ["#fNome", "#fModelo", "#fAno", "#fKm"].map(s => $(s));
  let ok = true;
  req.forEach(i => {
    const bad = !i.value.trim();
    i.classList.toggle("invalid", bad);
    if (bad) ok = false;
  });
  $("#formError").hidden = ok;
  if (!ok) return;
  const d = new FormData(form);
  const msg = [
    `Olá, MB Motos! Meu nome é ${d.get("nome")} e quero ${d.get("intencao")}.`,
    "",
    `Moto: ${d.get("modelo")}`,
    `Ano: ${d.get("ano")}`,
    `Km: ${d.get("km")}`,
    `Estado: ${d.get("estado")}`,
    "",
    "Pode avaliar para mim?"
  ].join("\n");
  window.open(waLink(msg), "_blank", "noopener");
});

const HORARIOS = { 0: null, 1: [7, 17], 2: [7, 17], 3: [7, 17], 4: [7, 17], 5: [7, 17], 6: [7, 13] };

function agoraNatal() {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Fortaleza", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const get = t => p.find(x => x.type === t).value;
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dia: dias[get("weekday")], h: Number(get("hour")) + Number(get("minute")) / 60 };
}

function atualizaStatus() {
  const { dia, h } = agoraNatal();
  const hj = HORARIOS[dia];
  const aberto = hj && h >= hj[0] && h < hj[1];
  let texto;
  if (aberto) {
    texto = `Aberto agora, até ${hj[1]}h`;
  } else {
    let prox = dia, abre;
    if (hj && h < hj[0]) abre = "hoje às " + hj[0] + "h";
    else {
      do { prox = (prox + 1) % 7; } while (!HORARIOS[prox]);
      const nomes = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
      abre = (prox === (dia + 1) % 7 ? "amanhã" : nomes[prox]) + " às " + HORARIOS[prox][0] + "h";
    }
    texto = `Fechado, abre ${abre}`;
  }
  ["#statusNav", "#statusBox"].forEach(s => {
    const el = $(s);
    el.classList.toggle("open", !!aberto);
    el.classList.toggle("closed", !aberto);
    $("b", el).textContent = s === "#statusNav" ? (aberto ? "Aberto agora" : "Fechado agora") : texto;
  });
  $$("#hours li").forEach(li => li.classList.toggle("today", li.dataset.days.split(",").includes(String(dia))));
}
atualizaStatus();
setInterval(atualizaStatus, 60000);

const video = $("#vitrine");
const vBtn = $("#videoToggle");
const vObs = new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !vBtn.classList.contains("paused")) video.play().catch(() => {});
  else video.pause();
}, { threshold: .35 });
vObs.observe(video);
vBtn.addEventListener("click", () => {
  const pausar = !video.paused;
  pausar ? video.pause() : video.play().catch(() => {});
  vBtn.classList.toggle("paused", pausar);
  vBtn.setAttribute("aria-label", pausar ? "Reproduzir vídeo" : "Pausar vídeo");
});

$("#year").textContent = new Date().getFullYear();

render();
