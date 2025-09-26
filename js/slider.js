import * as db from "./tvdb.json" with { type: 'json' };
const SITE_START_YM = "1935-04";
let SITE_END_YM;

function parseYM(ym) {
    const [y, m] = ym.split("-").map(Number);
    return { y, m };
}

function ymToIndexFrom(baseYM, ym) {
    const b = parseYM(baseYM);
    const t = parseYM(ym);
    return (t.y - b.y) * 12 + (t.m - b.m);
}

function indexToYMFrom(baseYM, idx) {
    const b = parseYM(baseYM);
    const y = b.y + Math.floor((b.m - 1 + idx) / 12);
    const m = ((b.m - 1 + idx) % 12) + 1;
    return `${y}-${String(m).padStart(2, "0")}`;
}

function coversYM_inclusive(fromYM, toYM, ym, siteEndYM = SITE_END_YM) {
    const to = toYM ?? siteEndYM;
    const i = ymToIndexFrom(SITE_START_YM, ym);
    const a = ymToIndexFrom(SITE_START_YM, fromYM);
    const b = ymToIndexFrom(SITE_START_YM, to);
    return a <= i && i <= b;
}

function computeSiteBounds(logos, fallbackEndYM = SITE_END_YM) {
    let minYM = SITE_START_YM;
    let maxYM = fallbackEndYM;

    const allYMs = [];
    for (const meta of Object.values(db.default)) {
        const ranges = meta.ranges ?? [{ from: meta.from, to: meta.to ?? null }];

        for (const r of ranges) {
            allYMs.push(r.from);
            allYMs.push(r.to ?? fallbackEndYM);
        }
    }

    if (allYMs.length) {
        minYM = allYMs.reduce((acc, ym) => ymToIndexFrom(SITE_START_YM, ym) < ymToIndexFrom(SITE_START_YM, acc) ? ym : acc, allYMs[0]);
        maxYM = allYMs.reduce((acc, ym) => ymToIndexFrom(SITE_START_YM, ym) > ymToIndexFrom(SITE_START_YM, acc) ? ym : acc, allYMs[0]);
    }

    const minIndex = ymToIndexFrom(SITE_START_YM, minYM);
    const maxIndex = ymToIndexFrom(SITE_START_YM, maxYM);
    return { minYM, maxYM, minIndex, maxIndex };
}

function getActiveIdsForIndex(index, siteEndYM = SITE_END_YM) {
    const ym = indexToYMFrom(SITE_START_YM, index);
    const active = [];

    for (const [id, meta] of Object.entries(db.default)) {
        const ranges = meta.ranges ?? [{ from: meta.from, to: meta.to ?? null }];
        if (ranges.some(r => coversYM_inclusive(r.from, r.to ?? null, ym, siteEndYM))) {
            active.push(id);
        }
    }

    return { ym, ids: active };
}

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function renderForIndex(i) {
    const { ym, ids } = getActiveIdsForIndex(Number(i));
    document.getElementById("currentMonth").textContent = `${capitalizeFirstLetter(new Date(ym).toLocaleString('default', { month: 'long' }))} ${ym.substring(0, 4)}`;

    Array.from(document.getElementsByClassName("show")).forEach((element) => {
        element.classList.remove("show");
    });

    ids.forEach((id) => {
        document.getElementById(id).classList.add("show");
    })
}

const { maxYM, maxIndex } = computeSiteBounds(db.default);
SITE_END_YM = maxYM;
document.getElementById("month").min = 0;
document.getElementById("month").max = maxIndex;
document.getElementById("month").addEventListener("input", (e) => renderForIndex(e.target.value));
renderForIndex(0);