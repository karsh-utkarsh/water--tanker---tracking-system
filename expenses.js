

const CSV_PATH = 'Society_Water_Expenses_Unique.csv'; 
const MAIN_SHOW = 6;
const MODAL_SHOW = 9999;

let houses = []; // loaded dataset
let totals = {consumption:0, expense:0};

/* ------------------ Helpers ------------------ */
function q(sel, root=document) { return root.querySelector(sel); }
function qa(sel, root=document) { return Array.from(root.querySelectorAll(sel)); }
function parseCSV(text){
  const lines = text.trim().split(/\r?\n/);
  if(lines.length<=1) return [];
  const header = lines[0].split(',').map(h=>h.replace(/^"|"$/g,'').trim());
  const rows = lines.slice(1).map(line=>{
    // naive split by comma - safe for our CSV that doesn't contain commas in fields
    const parts = line.split(',').map(p => p.replace(/^"|"$/g,'').trim());
    if(parts.length < header.length) return null;
    const obj = {};
    header.forEach((h,i)=> {
      obj[h] = parts[i];
    });
    return obj;
  }).filter(Boolean);
  return rows;
}

function money(x){ return '₹' + Number(x).toLocaleString('en-IN', {maximumFractionDigits:2}); }
function liters(x){ return Number(x).toLocaleString('en-IN') + ' L'; }
function avatarUrl(seed){
  // use randomuser portraits but keep deterministic per flat (seed)
  const id = Math.abs(hashCode(seed)) % 90 + 1;
  return `https://randomuser.me/api/portraits/${(id % 2 ? 'men':'women')}/${id}.jpg`;
}
function hashCode(s){ let h=0; for(let i=0;i<s.length;i++){ h = ((h<<5)-h)+s.charCodeAt(i); h |= 0; } return h; }

/* ------------------ Load data ------------------ */
async function loadData(){
  try{
    const resp = await fetch(CSV_PATH);
    if(!resp.ok) throw new Error('CSV not found: ' + resp.status);
    const txt = await resp.text();
    const parsed = parseCSV(txt);
    // expected columns: FlatNo,OwnerName,MonthlyConsumption(L),MonthlyExpense(INR),PercentageExpense(%)
    houses = parsed.map(r=>({
      flat: r['FlatNo']?.replace(/^"|"$/g,'') || r['Flat No'] || r['FlatNo'],
      owner: r['OwnerName']?.replace(/^"|"$/g,'') || r['OwnerName'],
      consumption: Number(r['MonthlyConsumption(L)'] || r['MonthlyConsumption(L)'] || r['Consumption'] || r['Consumption(L)'] || 0),
      expense: Number(r['MonthlyExpense(INR)'] || r['MonthlyExpense(INR)'] || r['Expense'] || 0),
      percent: Number(r['PercentageExpense(%)'] || r['PercentageExpense(%)'] || r['Percent'] || 0)
    }));

    totals.consumption = houses.reduce((s,h)=>s + (h.consumption||0), 0);
    totals.expense = houses.reduce((s,h)=>s + (h.expense||0), 0);

    // If percent not present, compute
    if(!houses.some(h=>h.percent && h.percent>0)){
      houses.forEach(h=> h.percent = totals.expense ? +(h.expense / totals.expense * 100).toFixed(2) : 0);
    }
    return houses;
  }catch(err){
    console.error('Failed loading CSV', err);
    // fallback: generate random demo dataset (should not normally be needed)
    houses = demoGenerate(150);
    totals.consumption = houses.reduce((s,h)=>s+h.consumption,0);
    totals.expense = houses.reduce((s,h)=>s+h.expense,0);
    houses.forEach(h=> h.percent = +(h.expense / totals.expense * 100).toFixed(2));
    return houses;
  }
}

/* ------------------ Demo fallback generator ------------------ */
function demoGenerate(n){
  const FIRST = ["Rajesh","Neha","Amit","Priya","Suresh","Anita","Vikas","Pooja","Ravi","Kavita","Arjun","Meena","Sanjay","Sunita","Manoj","Rekha"];
  const LAST = ["Sharma","Gupta","Verma","Patel","Reddy","Singh","Iyer","Nair"];
  const blocks = ['A','B','C','D','E','F'];
  const arr = [];
  for(let i=0;i<n;i++){
    const flat = `${blocks[i % blocks.length]}-${101 + Math.floor(i/blocks.length)}`;
    const owner = FIRST[Math.floor(Math.random()*FIRST.length)] + ' ' + LAST[Math.floor(Math.random()*LAST.length)];
    const consumption = Math.round(5000 + Math.random()*10000);
    const expense = +(consumption * (0.12 + Math.random()*0.06)).toFixed(2);
    arr.push({flat, owner, consumption, expense, percent:0});
  }
  return arr;
}

/* ------------------ Rendering ------------------ */
function renderTopCards(){
  q('#kpi-houses').textContent = houses.length;
  q('#totalConsumptionVal').textContent = liters(totals.consumption);
  q('#totalExpenseVal').textContent = money(totals.expense);
  const avg = totals.expense / Math.max(1, houses.length);
  q('#avgExpenseVal').textContent = money(avg);

  q('#totalConsumptionMeta').textContent = `Across ${houses.length} houses`;
  q('#totalExpenseMeta').textContent = `Split options: Equal / Proportional`;
  q('#avgExpenseMeta').textContent = `Auto-calculated by JS`;
}

function buildCard(house){
  const div = document.createElement('article');
  div.className = 'flat-card reveal';
  div.tabIndex = 0;
  const alertHtml = house.consumption > 14000 || house.percent > 2.5
    ? `<div class="alert">⚠ High</div>` : `<div style="height:24px"></div>`;

  div.innerHTML = `
    <div class="percent-badge">${house.percent.toFixed(2)}%</div>
    <div class="card-top">
      <div class="avatar"><img alt="${house.owner}" src="${avatarUrl(house.flat)}" loading="lazy"></div>
      <div class="card-headline">
        <div class="flat-no">${house.flat}</div>
        <div class="owner">${house.owner}</div>
      </div>
    </div>

    <div class="card-stats">
      <div class="stat"><span class="label">Consumption</span><span class="val">${liters(house.consumption)}</span></div>
      <div class="stat"><span class="label">Expense</span><span class="val">${money(house.expense)}</span></div>
      <div class="stat"><span class="label">Share</span><span class="val">${house.percent.toFixed(2)}%</span></div>
    </div>

    <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center">
      <div class="more"><a href="#" data-flat="${house.flat}" class="detail-open">View details</a></div>
      ${alertHtml}
    </div>
  `;
  // data binding
  div.dataset.flat = house.flat;
  return div;
}

function renderMainCards(list){
  const main = q('#mainCards');
  main.innerHTML = '';
  list.slice(0, MAIN_SHOW).forEach(h => {
    main.appendChild(buildCard(h));
  });
  startReveal();
  attachDetailOpeners();
}

function renderModalCards(list){
  const modalBody = q('#modalCards');
  modalBody.innerHTML = '';
  list.slice(MAIN_SHOW).forEach(h => {   // from 7th card onward
    modalBody.appendChild(buildCard(h));
  });
  startReveal();
  attachDetailOpeners();
}


/* ------------------ Detail Panel ------------------ */
function openDetail(flat){
  const house = houses.find(h=>h.flat===flat);
  if(!house) return;
  const panel = q('#detailPanel');
  const content = q('#detailContent');
  content.innerHTML = `
    <div class="detail-card">
      <div style="display:flex;gap:12px;align-items:center">
        <div style="width:84px;height:84px;border-radius:12px;overflow:hidden"><img src="${avatarUrl(house.flat)}" style="width:100%;height:100%;object-fit:cover" alt="${house.owner}"></div>
        <div>
          <h4 style="margin:0">${house.owner}</h4>
          <div style="color:var(--muted);margin-top:6px">${house.flat}</div>
          <div style="margin-top:8px;font-weight:700">${money(house.expense)}</div>
        </div>
      </div>

      <div style="margin-top:16px">
        <div class="detail-row"><div>Monthly Consumption</div><div><strong>${liters(house.consumption)}</strong></div></div>
        <div class="detail-row"><div>Expense Share</div><div><strong>${house.percent.toFixed(2)}%</strong></div></div>
        <div class="detail-row"><div>Estimated Municipal/Tanker Split</div><div><em>Proportional</em></div></div>
        <div class="detail-row"><div>Last Payment</div><div><em>Not recorded</em></div></div>
      </div>

      <div style="margin-top:14px">
        <button id="downloadFlat" class="btn-ghost">Download Bill (CSV)</button>
      </div>
    </div>
  `;
  // wire download
  q('#downloadFlat').onclick = ()=> downloadSingleCsv(house);
  panel.classList.add('open');
  panel.setAttribute('aria-hidden','false');
}

/* ------------------ CSV downloads ------------------ */
function downloadCSV(rows, fileName='export.csv'){
  const header = Object.keys(rows[0] || {});
  const lines = [header.join(',')].concat(rows.map(r => header.map(h => `"${String(r[h]||'').replace(/"/g,'""')}"`).join(',')));
  const blob = new Blob([lines.join('\n')], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function downloadAllCsv(){
  const rows = houses.map(h => ({Flat: h.flat, Owner: h.owner, Consumption: h.consumption, Expense: h.expense, Percent: h.percent}));
  downloadCSV(rows, `society_expenses_all_${new Date().toISOString().slice(0,10)}.csv`);
}
function downloadSingleCsv(h){
  downloadCSV([{Flat:h.flat,Owner:h.owner,Consumption:h.consumption,Expense:h.expense,Percent:h.percent}], `bill_${h.flat}.csv`);
}

/* ------------------ Interactions ------------------ */
function attachDetailOpeners(){
  qa('.detail-open').forEach(el => {
    el.onclick = (ev) => { ev.preventDefault(); const flat = el.dataset.flat; openDetail(flat); };
  });
}

function bindUI(){
  // View more modal
  const modal = q('#modal');
  const viewBtn = q('#viewMoreBtn');
  const modalClose = q('#modalClose');
  const modalCloseFooter = q('#modalCloseFooter');

  viewBtn.onclick = ()=> { modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); startReveal(); };
  modalClose.onclick = ()=> { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); };
  modalCloseFooter.onclick = ()=> { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); };

  // detail panel close
  q('#detailClose').onclick = ()=> { q('#detailPanel').classList.remove('open'); q('#detailPanel').setAttribute('aria-hidden','true'); };

  // download
  q('#downloadAll').onclick = downloadAllCsv;
  q('#downloadCsv').onclick = ()=> {
    // download current visible (main + modal) simplified
    const visible = houses.slice(0, MAIN_SHOW + MODAL_SHOW).map(h => ({Flat:h.flat,Owner:h.owner,Consumption:h.consumption,Expense:h.expense,Percent:h.percent}));
    downloadCSV(visible, `society_visible_${new Date().toISOString().slice(0,10)}.csv`);
  };

  // search
  q('#searchInput').addEventListener('input', (e)=>{
    const qstr = e.target.value.trim().toLowerCase();
    const filtered = houses.filter(h => h.flat.toLowerCase().includes(qstr) || h.owner.toLowerCase().includes(qstr));
    // re-render main and modal accordingly
    renderMainCards(filtered);
    renderModalCards(filtered);
  });

  // sorts & filters
  q('#sortSelect').addEventListener('change', (e)=>{
    sortAndRender();
  });
  q('#alertFilter').addEventListener('change', (e)=>{
    sortAndRender();
  });

  // Book tanker button - anchor placeholder
  q('#bookTanker').onclick = (ev) => {
    ev.preventDefault();
    // no real link — show small toast-like hint
    showToast('Book Tanker will open the booking module (link later).');
  };

  // modal Close by clicking overlay
  q('#modal').addEventListener('click', (ev)=>{
    if(ev.target === q('#modal')) { q('#modal').classList.remove('is-open'); q('#modal').setAttribute('aria-hidden','true'); }
  });
}

/* ------------------ Sorting / filtering logic ------------------ */
function sortAndRender(){
  const sort = q('#sortSelect').value;
  const filter = q('#alertFilter').value;
  let list = [...houses];

  if(filter === 'alerts') list = list.filter(h => (h.consumption > 14000 || h.percent > 2.5));
  if(filter === 'high') list = list.filter(h => h.percent > 2.0);

  if(sort === 'percent_desc') list.sort((a,b)=>b.percent - a.percent);
  else if(sort === 'expense_desc') list.sort((a,b)=>b.expense - b.expense);
  else if(sort === 'consumption_desc') list.sort((a,b)=>b.consumption - a.consumption);
  else if(sort === 'flat_asc') list.sort((a,b)=> a.flat.localeCompare(b.flat));

  renderMainCards(list);
  renderModalCards(list);
}

/* ------------------ Reveal animations using IntersectionObserver ------------------ */
function startReveal(){
  const els = qa('.reveal');
  const io = new IntersectionObserver((entries, observer)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('revealed'); observer.unobserve(e.target); }
    });
  }, {threshold: 0.12});
  els.forEach(el=> io.observe(el));
}

/* ------------------ Toast (small feedback) ------------------ */
function showToast(msg, duration=2200){
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  Object.assign(t.style, {position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'28px',background:'#111',color:'#fff',padding:'10px 14px',borderRadius:'10px',zIndex:9999,opacity:0,transition:'opacity .18s'});
  document.body.appendChild(t);
  requestAnimationFrame(()=> t.style.opacity = 1);
  setTimeout(()=> { t.style.opacity = 0; setTimeout(()=> t.remove(),300); }, duration);
}

/* ------------------ Init ------------------ */
async function init(){
  await loadData();
  renderTopCards();
  sortAndRender();
  renderModalCards(houses);
  bindUI();

  // Wire up card click (delegated) to open details
  document.addEventListener('click', function(e){
    const el = e.target.closest('.flat-card');
    if(el && e.target.classList.contains('detail-open') === false && !e.target.closest('.modal')) {
      // open detail on whole card click
      const flat = el.dataset.flat;
      if(flat) openDetail(flat);
    }
  });
}

init();
