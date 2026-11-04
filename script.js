const WHATSAPP = "5584994123216";

const MOTOS = [
  {
    marca: "Yamaha",
    modelo: "Lander 250",
    ano: 2023,
    km: 41934,
    cor: "Vermelha",
    preco: null,
    fipe: null,
    repasse: false,
    foto: "assets/img/lander-250.jpg"
  },
  {
    marca: "Honda",
    modelo: "Titan 160",
    ano: 2025,
    km: 14357,
    cor: "Laranja",
    preco: null,
    fipe: null,
    repasse: false,
    foto: "assets/img/titan-160.jpg"
  },
  {
    marca: "Yamaha",
    modelo: "TTR 230",
    ano: 2023,
    km: null,
    cor: "Azul",
    preco: 15500,
    fipe: 16900,
    repasse: true,
    foto: "assets/img/ttr-230.jpg"
  }
];

const HORARIOS = { 0: null, 1: [7, 17], 2: [7, 17], 3: [7, 17], 4: [7, 17], 5: [7, 17], 6: [7, 13] };

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reais = n => "R$ " + n.toLocaleString("pt-BR");
const linkZap = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

document.documentElement.classList.add("preparando");
window.addEventListener("load", () => {
  requestAnimationFrame(() => document.documentElement.classList.remove("preparando"));
});
setTimeout(() => document.documentElement.classList.remove("preparando"), 2500);

const topo = $("#topo");
const aoRolar = () => topo.classList.toggle("rolado", window.scrollY > 40);
window.addEventListener("scroll", aoRolar, { passive: true });
aoRolar();

const menu = $("#menu");
const abrirMenu = $("#abrirMenu");
const fecharMenu = () => {
  menu.classList.remove("aberto");
  abrirMenu.setAttribute("aria-expanded", "false");
};
abrirMenu.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  abrirMenu.setAttribute("aria-expanded", String(aberto));
});
$$("a", menu).forEach(a => a.addEventListener("click", fecharMenu));

function hodometro(km) {
  const digitos = km == null ? "------" : String(km).padStart(6, "0").slice(-6);
  const rolos = [...digitos].map(d => `<span${d === "-" ? ' class="vazio"' : ""}>${d === "-" ? "0" : d}</span>`).join("");
  const rotulo = km == null ? "km a confirmar com a loja" : "km rodados";
  const leitura = km == null ? "Quilometragem a confirmar" : `${km.toLocaleString("pt-BR")} km rodados`;
  return `<div class="hodometro" role="img" aria-label="${leitura}"><span class="hodometro-rolos" aria-hidden="true">${rolos}</span><small aria-hidden="true">${rotulo}</small></div>`;
}

function etiqueta(m) {
  const nome = `${m.marca} ${m.modelo} ${m.ano}`;
  const preco = m.preco
    ? `<strong>${reais(m.preco)}</strong>${m.fipe ? `<small>Tabela FIPE <s>${reais(m.fipe)}</s></small>` : ""}`
    : `<strong class="consulta">Preço pelo WhatsApp</strong><small>varia com troca e forma de pagamento</small>`;
  const aviso = m.repasse ? `<p class="etiqueta-aviso">Moto de repasse, vendida sem garantia.</p>` : "";
  const msg = `Olá, MB Motos! Vi no site a ${nome} e quero saber mais. Ela ainda está disponível?`;
  return `
    <article class="etiqueta">
      <div class="etiqueta-foto"><img src="${m.foto}" alt="${nome}, cor ${m.cor.toLowerCase()}" loading="lazy"></div>
      <div class="etiqueta-papel">
        <p class="etiqueta-marca">${m.marca}</p>
        <h3>${m.modelo}</h3>
        <dl class="etiqueta-dados">
          <div><dt>Ano</dt><dd>${m.ano}</dd></div>
          <div><dt>Cor</dt><dd>${m.cor}</dd></div>
        </dl>
        ${hodometro(m.km)}
        ${aviso}
        <div class="etiqueta-preco">${preco}</div>
        <a class="botao botao-cheio" href="${linkZap(msg)}" target="_blank" rel="noopener">Perguntar sobre esta moto</a>
      </div>
    </article>`;
}

const lista = $("#etiquetas");
function mostrar(marca) {
  const motos = MOTOS.filter(m => marca === "todas" || m.marca === marca);
  lista.innerHTML = motos.map(etiqueta).join("");
  $("#vazio").hidden = motos.length > 0;
}
$("#marcas").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  $$("#marcas button").forEach(x => x.classList.toggle("ativo", x === b));
  mostrar(b.dataset.marca);
});
mostrar("todas");

$$("[data-zap]").forEach(a => {
  a.href = linkZap(a.dataset.zap);
  a.target = "_blank";
  a.rel = "noopener";
});

const ficha = $("#ficha");
const km = $("#fKm");
km.addEventListener("input", () => {
  const d = km.value.replace(/\D/g, "").slice(0, 7);
  km.value = d ? Number(d).toLocaleString("pt-BR") : "";
});
$("#fAno").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, ""); });

ficha.addEventListener("submit", e => {
  e.preventDefault();
  const campos = [["#fNome", "seu nome"], ["#fModelo", "a marca e o modelo"], ["#fAno", "o ano"], ["#fKm", "o km rodado"]];
  const faltando = campos.filter(([s]) => !$(s).value.trim());
  campos.forEach(([s]) => $(s).closest(".linha").classList.toggle("erro", faltando.some(([f]) => f === s)));
  const erro = $("#fichaErro");
  if (faltando.length) {
    erro.textContent = "Falta preencher " + faltando.map(([, n]) => n).join(", ") + ".";
    erro.hidden = false;
    $(faltando[0][0]).focus();
    return;
  }
  erro.hidden = true;
  const d = new FormData(ficha);
  const msg = [
    `Olá, MB Motos! Sou ${d.get("nome")} e quero ${d.get("quer")}.`,
    "",
    `Moto: ${d.get("modelo")}`,
    `Ano: ${d.get("ano")}`,
    `Km: ${d.get("km")}`,
    `Estado: ${d.get("estado")}`,
    "",
    "Podem avaliar?"
  ].join("\n");
  window.open(linkZap(msg), "_blank", "noopener");
});

function agora() {
  const partes = new Intl.DateTimeFormat("en-US", { timeZone: "America/Fortaleza", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const pega = t => partes.find(p => p.type === t).value;
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dia: dias[pega("weekday")], hora: Number(pega("hour")) + Number(pega("minute")) / 60 };
}

function atualizarPlaca() {
  const { dia, hora } = agora();
  const hoje = HORARIOS[dia];
  const aberto = hoje && hora >= hoje[0] && hora < hoje[1];
  let sub;
  if (aberto) {
    sub = `até as ${hoje[1]}h`;
  } else if (hoje && hora < hoje[0]) {
    sub = `abre hoje às ${hoje[0]}h`;
  } else {
    let prox = dia;
    do { prox = (prox + 1) % 7; } while (!HORARIOS[prox]);
    const nomes = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    sub = `abre ${prox === (dia + 1) % 7 ? "amanhã" : nomes[prox]} às ${HORARIOS[prox][0]}h`;
  }
  $("#placa").classList.toggle("fechado", !aberto);
  $("#placaTexto").textContent = aberto ? "Aberto" : "Fechado";
  $("#placaSub").textContent = sub;
  $$("#horarios div").forEach(l => l.classList.toggle("hoje", l.dataset.dias.split(",").includes(String(dia))));
}
atualizarPlaca();
setInterval(atualizarPlaca, 60000);

const video = $("#video");
const videoBotao = $("#videoBotao");
let pausadoPeloUsuario = false;
new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !pausadoPeloUsuario) video.play().catch(() => {});
  else video.pause();
}, { threshold: .4 }).observe(video);
videoBotao.addEventListener("click", () => {
  pausadoPeloUsuario = !video.paused;
  pausadoPeloUsuario ? video.pause() : video.play().catch(() => {});
  videoBotao.classList.toggle("pausado", pausadoPeloUsuario);
  videoBotao.setAttribute("aria-label", pausadoPeloUsuario ? "Reproduzir vídeo" : "Pausar vídeo");
});

$("#ano").textContent = new Date().getFullYear();
