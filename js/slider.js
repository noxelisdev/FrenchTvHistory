import * as db from "./tvdb.json" with { type: 'json' };
const SITE_START_YM = "1935-04";
let SITE_END_YM = `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, "0")}`;

function parseYM(ym){ const [y,m]=ym.split("-").map(Number); return {y, m}; }
function ymToIndexFrom(baseYM, ym){ const b=parseYM(baseYM), t=parseYM(ym); return (t.y-b.y)*12+(t.m-b.m); }
function indexToYMFrom(baseYM, idx){ const b=parseYM(baseYM); const y=b.y+Math.floor((b.m-1+idx)/12); const m=((b.m-1+idx)%12)+1; return `${y}-${String(m).padStart(2,"0")}`; }
function coversYM_inclusive(fromYM, toYM, ym){
    const i = ymToIndexFrom(SITE_START_YM, ym);
    const a = ymToIndexFrom(SITE_START_YM, fromYM);
    const b = (toYM ? ymToIndexFrom(SITE_START_YM, toYM) : Infinity);
    return a <= i && i <= b; // to inclusif, null = ouvert
}

function computeSiteBounds(logos, fallbackEndYM = SITE_END_YM){
    const allFrom = []; const allTo = [];
    for(const meta of Object.values(logos)){
        for(const r of meta.ranges){
            allFrom.push(r.from);
            allTo.push(r.to ?? fallbackEndYM);
        }
    }
    const minFrom = allFrom.reduce((acc,ym)=> ymToIndexFrom(SITE_START_YM, ym) < ymToIndexFrom(SITE_START_YM, acc) ? ym : acc, SITE_START_YM);
    const maxTo   = allTo.reduce((acc,ym)=> ymToIndexFrom(SITE_START_YM, ym) > ymToIndexFrom(SITE_START_YM, acc) ? ym : acc, fallbackEndYM);
    return { minIndex: ymToIndexFrom(SITE_START_YM, minFrom), maxIndex: ymToIndexFrom(SITE_START_YM, maxTo) };
}

function monthLabel(ym){
    const months = [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ];
    const {y,m} = parseYM(ym);
    return `${months[m-1]} ${y}`;
}

function getActiveRange(ranges, ym){
    return ranges.find(r => coversYM_inclusive(r.from, r.to, ym));
}

function getActiveIdsForIndex(logos, index, siteEndYM = SITE_END_YM){
    const ym = indexToYMFrom(SITE_START_YM, index);
    const items = [];
    for(const [id, meta] of Object.entries(logos)){
        const active = getActiveRange(meta.ranges, ym);
        if(active){ items.push({ id, meta, active }); }
    }
    return { ym, items };
}

function createCard(id, meta, active){
    const el = document.createElement('article');
    const [yFrom, mFrom] = active.from.split("-");
    const [yTo, mTo] = (active.to ? active.to.split("-") : [new Date().getFullYear(), String(new Date().getMonth()).padStart(2, "0")]);

    el.className = 'card';
    el.innerHTML = `
        <div class="logo-wrap">
          <div id="${id}" class="logo" aria-label="${meta.name}"></div>
        </div>
        <div class="meta">
          <div class="name">${meta.name}</div>
          <div class="period">${mFrom}/${yFrom} → ${active.to ? `${mTo}/${yTo}` : "Aujourd'hui"}</div>
        </div>
      `;

    return el;
}

const grid = document.getElementById('grid');
const slider = document.getElementById('slider');
const labelMois = document.getElementById('labelMois');
const filterInput = document.getElementById('filter');
const bounds = computeSiteBounds(db.default);

slider.min = 0;
slider.max = bounds.maxIndex;
slider.value = bounds.maxIndex;

function render(){
    const { ym, items } = getActiveIdsForIndex(db.default, Number(slider.value));
    labelMois.textContent = `${monthLabel(ym)}`;
    const q = filterInput.value.trim().toLowerCase();
    grid.innerHTML = '';
    items
        .filter(({ meta })=> q ? (meta.name.toLowerCase().includes(q)) : true)
        .sort((a,b)=> a.meta.name.localeCompare(b.meta.name) || a.id.localeCompare(b.id))
        .forEach(({ id, meta, active })=> grid.appendChild(createCard(id, meta, active)));
}

slider.addEventListener('input', render);
filterInput.addEventListener('input', render);

window.addEventListener('keydown', (e)=>{
    const t = e.target;
    const tag = t && t.tagName ? t.tagName.toUpperCase() : '';
    const isEditable = (tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable));
    if (isEditable) return;
    if(e.key==='ArrowLeft'){ slider.value = Number(slider.value)-1; render(); }
    if(e.key==='ArrowRight'){ slider.value = Number(slider.value)+1; render(); }
});

render();