const STATUS = {
  novo: {label:"Novo pedido", cls:"b-new"},
  orcamento: {label:"Orçamento", cls:"b-quote"},
  aguardando: {label:"Aguardando aprovação", cls:"b-await"},
  aprovado: {label:"Aprovado", cls:"b-approved"},
  producao: {label:"Em produção", cls:"b-production"},
  finalizado: {label:"Finalizado", cls:"b-finished"},
  entregue: {label:"Entregue", cls:"b-delivered"}
};
const STATUS_ORDER = ["novo","orcamento","aguardando","aprovado","producao","finalizado","entregue"];

const seedOrders = [
  {id:"PED-1048",client:"Construtora Horizonte",phone:"(45) 99999-1001",service:"Fachada em ACM",description:"Fachada comercial com letras caixa e acabamento em ACM.",qty:1,size:"6,00 × 2,80 m",finish:"ACM + letras caixa",quote:4850,deadline:"2026-09-18",status:"producao",notes:"Conferir medidas antes da instalação.",history:[["aprovado","12/09/2026"],["producao","15/09/2026"]]},
  {id:"PED-1047",client:"Clínica Vida",phone:"(45) 99999-1002",service:"Placa de identificação",description:"Placa interna de identificação de ambientes.",qty:12,size:"30 × 15 cm",finish:"PVC expandido",quote:1260,deadline:"2026-09-20",status:"aguardando",notes:"Aguardando aprovação da arte.",history:[["orcamento","14/09/2026"],["aguardando","15/09/2026"]]},
  {id:"PED-1046",client:"Restaurante Sabor",phone:"(45) 99999-1003",service:"Adesivação de vitrine",description:"Adesivos para vitrine frontal e lateral.",qty:1,size:"4,50 × 1,90 m",finish:"Vinil de recorte",quote:980,deadline:"2026-09-17",status:"aprovado",notes:"Arte aprovada pelo cliente.",history:[["orcamento","12/09/2026"],["aprovado","14/09/2026"]]},
  {id:"PED-1045",client:"Auto Peças Paraná",phone:"(45) 99999-1004",service:"Banner promocional",description:"Banner promocional para campanha de serviços.",qty:4,size:"0,80 × 1,20 m",finish:"Lona 440g",quote:540,deadline:"2026-09-16",status:"finalizado",notes:"Pronto para retirada.",history:[["aprovado","11/09/2026"],["producao","12/09/2026"],["finalizado","15/09/2026"]]},
  {id:"PED-1044",client:"Mercado Central",phone:"(45) 99999-1005",service:"Totem de sinalização",description:"Totem externo para orientação de clientes.",qty:1,size:"0,70 × 2,20 m",finish:"ACM + estrutura",quote:2400,deadline:"2026-09-25",status:"orcamento",notes:"Enviar proposta final.",history:[["novo","16/09/2026"],["orcamento","16/09/2026"]]}
];

let orders = JSON.parse(localStorage.getItem("dgifoz_orders") || "null") || seedOrders;
let clients = JSON.parse(localStorage.getItem("dgifoz_clients") || "null") || [
  {name:"Construtora Horizonte",phone:"(45) 99999-1001",city:"Foz do Iguaçu",orders:8},
  {name:"Clínica Vida",phone:"(45) 99999-1002",city:"Foz do Iguaçu",orders:4},
  {name:"Restaurante Sabor",phone:"(45) 99999-1003",city:"Foz do Iguaçu",orders:6},
  {name:"Auto Peças Paraná",phone:"(45) 99999-1004",city:"Foz do Iguaçu",orders:3},
  {name:"Mercado Central",phone:"(45) 99999-1005",city:"Foz do Iguaçu",orders:2},
];
let currentPage = "dashboard";

const $ = s => document.querySelector(s);
const money = n => Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const initials = n => n.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();
const dateBR = s => new Date(s+"T12:00:00").toLocaleDateString("pt-BR");
const escapeHTML = s => String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function persist(){localStorage.setItem("dgifoz_orders",JSON.stringify(orders));localStorage.setItem("dgifoz_clients",JSON.stringify(clients));}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)}
function badge(status){const s=STATUS[status]||STATUS.novo;return `<span class="badge ${s.cls}"><i></i>${s.label}</span>`}
function orderRow(o){
  return `<tr class="tbody-click" onclick="openOrder('${o.id}')">
    <td><strong>${o.id}</strong></td>
    <td><div class="client-cell"><div class="client-avatar">${initials(o.client)}</div><div><span class="client-name">${escapeHTML(o.client)}</span><span class="client-sub">${escapeHTML(o.phone)}</span></div></div></td>
    <td class="service">${escapeHTML(o.service)}</td><td>${badge(o.status)}</td><td class="deadline">${dateBR(o.deadline)}</td><td><strong>${money(o.quote)}</strong></td>
  </tr>`;
}

function render(){
  const content=$("#content");
  const labels={dashboard:"Dashboard",pedidos:"Pedidos",clientes:"Clientes",empresa:"Empresa"};
  $("#pageLabel").textContent=labels[currentPage];
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===currentPage));
  if(currentPage==="dashboard") content.innerHTML=dashboard();
  if(currentPage==="pedidos") content.innerHTML=ordersPage();
  if(currentPage==="clientes") content.innerHTML=clientsPage();
  if(currentPage==="empresa") content.innerHTML=companyPage();
}

function dashboard(){
  const total=orders.length, awaiting=orders.filter(o=>o.status==="aguardando").length, approved=orders.filter(o=>o.status==="aprovado").length, production=orders.filter(o=>o.status==="producao").length, done=orders.filter(o=>["finalizado","entregue"].includes(o.status)).length;
  const upcoming=[...orders].filter(o=>o.status!=="entregue").sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,4);
  const latest=[...orders].sort((a,b)=>b.id.localeCompare(a.id)).slice(0,6);
  return `<div class="hero"><div><div class="kicker">Visão geral • Hoje</div><h1>Olá, Luiz. 👋</h1><p>Acompanhe a operação da DGIFOZ em um único painel.</p></div><button class="primary" onclick="newOrder()"><span class="plus">＋</span>Novo pedido</button></div>
  <div class="stat-grid">
    <div class="stat accent"><div class="stat-top"><span class="stat-label">Total de pedidos</span><span class="stat-icon">▤</span></div><div class="stat-number">${total}<span class="stat-meta">registrados</span></div></div>
    <div class="stat"><div class="stat-top"><span class="stat-label">Aguardando cliente</span><span class="stat-icon">◷</span></div><div class="stat-number">${awaiting}<span class="stat-meta">aprovação</span></div></div>
    <div class="stat"><div class="stat-top"><span class="stat-label">Aprovados</span><span class="stat-icon">✓</span></div><div class="stat-number">${approved}<span class="stat-meta">prontos</span></div></div>
    <div class="stat"><div class="stat-top"><span class="stat-label">Em produção</span><span class="stat-icon">⚙</span></div><div class="stat-number">${production}<span class="stat-meta">ativos</span></div></div>
    <div class="stat"><div class="stat-top"><span class="stat-label">Concluídos</span><span class="stat-icon">↗</span></div><div class="stat-number">${done}<span class="stat-meta">finalizados</span></div></div>
  </div>
  <div class="grid-main">
    <section class="panel"><div class="panel-head"><div><h2>Pedidos recentes</h2><p>Últimas solicitações registradas</p></div><button class="secondary" onclick="go('pedidos')">Ver todos</button></div>
      <div class="table-wrap"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Serviço</th><th>Status</th><th>Prazo</th><th>Orçamento</th></tr></thead><tbody>${latest.map(orderRow).join("")}</tbody></table></div>
    </section>
    <div class="side-stack">
      <section class="panel"><div class="panel-head"><div><h2>Próximos prazos</h2><p>Pedidos que pedem atenção</p></div></div>
        <div class="deadline-list">${upcoming.map(o=>`<div class="deadline-item" onclick="openOrder('${o.id}')" style="cursor:pointer"><div class="date-box"><strong>${new Date(o.deadline+"T12:00:00").getDate()}</strong><span>${new Date(o.deadline+"T12:00:00").toLocaleDateString("pt-BR",{month:"short"}).replace(".","")}</span></div><div class="deadline-info"><strong>${escapeHTML(o.service)}</strong><span>${escapeHTML(o.client)}</span></div><span class="arrow">›</span></div>`).join("")}</div>
      </section>
      <section class="panel"><div class="panel-head"><div><h2>Fluxo de pedidos</h2><p>Distribuição atual por etapa</p></div></div><div class="progress-area">
        ${STATUS_ORDER.slice(1,6).map(st=>{const c=orders.filter(o=>o.status===st).length;const pct=Math.round(c/Math.max(total,1)*100);return `<div class="progress-row"><div class="progress-head"><span>${STATUS[st].label}</span><strong>${c}</strong></div><div class="progress-track"><div class="progress-bar" style="width:${pct}%"></div></div></div>`}).join("")}
      </div></section>
    </div>
  </div>`;
}

function ordersPage(){
  return `<div class="hero"><div><div class="kicker">Operação</div><h1>Pedidos</h1><p>Centralize orçamento, aprovação, produção e entrega.</p></div><button class="primary" onclick="newOrder()"><span class="plus">＋</span>Novo pedido</button></div>
  <div class="page-toolbar"><input class="filter-input" id="orderSearch" placeholder="Pesquisar por pedido, cliente ou serviço..." oninput="filterOrders()"><select class="select" id="statusFilter" onchange="filterOrders()"><option value="">Todos os status</option>${Object.entries(STATUS).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("")}</select></div>
  <section class="panel"><div class="table-wrap"><table class="orders-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Serviço</th><th>Status</th><th>Prazo</th><th>Orçamento</th></tr></thead><tbody id="ordersBody">${orders.map(orderRow).join("")}</tbody></table></div></section>`;
}
function filterOrders(){
  const q=($("#orderSearch")?.value||"").toLowerCase(), st=$("#statusFilter")?.value||"";
  const arr=orders.filter(o=>(!q||[o.id,o.client,o.service].some(x=>x.toLowerCase().includes(q)))&&(!st||o.status===st));
  $("#ordersBody").innerHTML=arr.length?arr.map(orderRow).join(""):`<tr><td colspan="6"><div class="empty">Nenhum pedido encontrado.</div></td></tr>`;
}

function clientsPage(){
  return `<div class="hero"><div><div class="kicker">Relacionamento</div><h1>Clientes</h1><p>Contatos relacionados aos pedidos cadastrados.</p></div><button class="primary" onclick="newClient()"><span class="plus">＋</span>Novo cliente</button></div>
  <div class="client-grid">${clients.map(c=>`<article class="client-card"><div class="client-top"><div class="client-big">${initials(c.name)}</div><div><h3>${escapeHTML(c.name)}</h3><small>${escapeHTML(c.phone)} • ${escapeHTML(c.city)}</small></div></div><div class="client-stats"><div><strong>${c.orders}</strong><span>Pedidos</span></div><div><strong>${orders.filter(o=>o.client===c.name).length}</strong><span>Ativos no sistema</span></div></div></article>`).join("")}</div>`;
}

function companyPage(){
  const photos=["producao-01.jpeg","producao-02.jpeg","producao-03.jpeg","producao-04.jpeg","producao-05.jpeg"];
  return `<div class="hero"><div><div class="kicker">Organização</div><h1>Empresa</h1><p>Informações e registros visuais da operação.</p></div></div>
  <div class="company-hero"><div class="company-cover"><img src="assets/producao-04.jpeg" alt="Área de produção da empresa"><div class="overlay"><h2>DGIFOZ Comunicação Visual</h2><p>Produção, atendimento e acompanhamento de pedidos.</p></div></div>
  <div class="company-copy"><div class="logo"><img src="assets/dgi.jfif" alt="Logo DGIFOZ"></div><h2>DGI Impressão Digital</h2><p>O sistema foi estruturado para centralizar os pedidos recebidos, organizar informações de orçamento e aprovação e tornar mais claro o acompanhamento de prazos e produção.</p><div class="info-grid" style="padding:16px 0 0"><div class="info-box"><span>Identificação</span><strong>DGI Impressão Digital</strong></div><div class="info-box"><span>Atuação visual</span><strong>DGIFOZ Comunicação Visual</strong></div></div></div></div>
  <section class="panel"><div class="panel-head"><div><h2>Ambiente de produção</h2><p>Registros utilizados como evidência visual do projeto.</p></div></div><div class="photo-grid" style="padding:18px">${photos.map((p,i)=>`<div class="photo"><img src="assets/${p}" alt="Registro da empresa ${i+1}"></div>`).join("")}</div></section>`;
}

function openOrder(id){
  const o=orders.find(x=>x.id===id); if(!o)return;
  const idx=STATUS_ORDER.indexOf(o.status), next=STATUS_ORDER[Math.min(idx+1,STATUS_ORDER.length-1)];
  openModal(`<div class="modal-head"><div><div class="kicker" style="margin:0 0 4px">${o.id}</div><h2>${escapeHTML(o.service)}</h2></div><button class="close" onclick="closeModal()">×</button></div>
  <div class="detail-card"><div><div class="info-grid"><div class="info-box"><span>Cliente</span><strong>${escapeHTML(o.client)}</strong></div><div class="info-box"><span>Telefone</span><strong>${escapeHTML(o.phone)}</strong></div><div class="info-box"><span>Quantidade</span><strong>${o.qty}</strong></div><div class="info-box"><span>Tamanho</span><strong>${escapeHTML(o.size)}</strong></div><div class="info-box"><span>Acabamento</span><strong>${escapeHTML(o.finish)}</strong></div><div class="info-box"><span>Prazo</span><strong>${dateBR(o.deadline)}</strong></div><div class="info-box"><span>Orçamento</span><strong>${money(o.quote)}</strong></div><div class="info-box"><span>Status</span><strong>${badge(o.status)}</strong></div></div><div style="padding:0 20px 20px"><div class="kicker">Descrição</div><p style="font-size:11px;line-height:1.6;color:#667080">${escapeHTML(o.description)}</p><div class="kicker" style="margin-top:14px">Observação</div><p style="font-size:11px;line-height:1.6;color:#667080">${escapeHTML(o.notes||"Sem observações.")}</p></div></div>
  <div class="panel" style="margin:20px 20px 20px 0;box-shadow:none"><div class="panel-head"><div><h2>Histórico</h2><p>Acompanhamento do pedido</p></div></div><div class="timeline">${o.history.map(h=>`<div class="timeline-item"><strong>${STATUS[h[0]].label}</strong><span>${h[1]}</span></div>`).join("")}</div></div></div>
  <div class="form-actions" style="padding:0 22px 20px">${next!==o.status?`<button class="primary" onclick="advanceStatus('${o.id}')">Avançar para “${STATUS[next].label}”</button>`:`<button class="secondary" disabled>Pedido na etapa final</button>`}</div>`);
}

function advanceStatus(id){
  const o=orders.find(x=>x.id===id), i=STATUS_ORDER.indexOf(o.status); if(!o||i>=STATUS_ORDER.length-1)return;
  o.status=STATUS_ORDER[i+1];o.history.push([o.status,new Date().toLocaleDateString("pt-BR")]);persist();closeModal();render();toast(`Pedido ${o.id} atualizado.`);
}
function newOrder(){
  openModal(`<div class="modal-head"><div><div class="kicker" style="margin:0 0 4px">Cadastro</div><h2>Novo pedido</h2></div><button class="close" onclick="closeModal()">×</button></div>
  <form class="form" id="newOrderForm"><div class="form-grid">
  <div class="field"><label>Cliente</label><input name="client" required placeholder="Nome do cliente"></div>
  <div class="field"><label>Telefone</label><input name="phone" placeholder="(45) 99999-9999"></div>
  <div class="field"><label>Produto / serviço</label><input name="service" required placeholder="Ex.: Placa de identificação"></div>
  <div class="field"><label>Quantidade</label><input name="qty" type="number" min="1" value="1"></div>
  <div class="field"><label>Tamanho</label><input name="size" placeholder="Ex.: 1,00 × 0,80 m"></div>
  <div class="field"><label>Acabamento</label><input name="finish" placeholder="Ex.: ACM, PVC, lona..."></div>
  <div class="field"><label>Orçamento (R$)</label><input name="quote" type="number" min="0" step="0.01" placeholder="0,00"></div>
  <div class="field"><label>Prazo</label><input name="deadline" type="date" required></div>
  <div class="field full"><label>Descrição</label><textarea name="description" placeholder="Detalhes do pedido..."></textarea></div>
  <div class="field full"><label>Observações</label><textarea name="notes" placeholder="Aprovação, arquivos, instalação, etc."></textarea></div>
  </div><div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancelar</button><button class="primary">Salvar pedido</button></div></form>`);
  $("#newOrderForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),id="PED-"+(1050+orders.length);const o={id,client:f.get("client"),phone:f.get("phone"),service:f.get("service"),description:f.get("description"),qty:Number(f.get("qty")||1),size:f.get("size"),finish:f.get("finish"),quote:Number(f.get("quote")||0),deadline:f.get("deadline"),status:"novo",notes:f.get("notes"),history:[["novo",new Date().toLocaleDateString("pt-BR")]]};orders.unshift(o);if(!clients.some(c=>c.name===o.client))clients.unshift({name:o.client,phone:o.phone,city:"Foz do Iguaçu",orders:1});persist();closeModal();render();toast("Novo pedido cadastrado com sucesso.")};
}
function newClient(){
  openModal(`<div class="modal-head"><div><div class="kicker" style="margin:0 0 4px">Cadastro</div><h2>Novo cliente</h2></div><button class="close" onclick="closeModal()">×</button></div><form class="form" id="clientForm"><div class="form-grid"><div class="field full"><label>Nome / empresa</label><input name="name" required></div><div class="field"><label>Telefone</label><input name="phone"></div><div class="field"><label>Cidade</label><input name="city" value="Foz do Iguaçu"></div></div><div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancelar</button><button class="primary">Salvar cliente</button></div></form>`);
  $("#clientForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);clients.unshift({name:f.get("name"),phone:f.get("phone"),city:f.get("city"),orders:0});persist();closeModal();render();toast("Cliente cadastrado.")};
}
function openModal(inner){$("#modal").innerHTML=inner;$("#modalBackdrop").classList.add("open")}
function closeModal(){$("#modalBackdrop").classList.remove("open")}
$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
function go(page){currentPage=page;render();window.scrollTo({top:0,behavior:"smooth"});$("#sidebar").classList.remove("open")}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){currentPage="pedidos";render();const q=e.target.value;setTimeout(()=>{$("#orderSearch").value=q;filterOrders()},0)}});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#globalSearch").focus()}if(e.key==="Escape")closeModal()});
render();
