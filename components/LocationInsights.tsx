'use client';

import { useMemo } from 'react';
import { Property, AmenityInfo, NeighborhoodProfile } from '@/types';
import {
  calcPriceAnalysis,
  calcScoreBreakdown,
  scoreLabel,
  scoreRingHex,
} from '@/lib/insights';

interface Props {
  property: Property;
  allProperties: Property[];
}

// ─── tiny helpers ─────────────────────────────────────────────────────────────

function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

type Quality = 'good' | 'ok' | 'bad';

const qualityText: Record<Quality, string> = {
  good: 'text-emerald-700',
  ok:   'text-amber-700',
  bad:  'text-red-600',
};
const qualityBg: Record<Quality, string> = {
  good: 'bg-emerald-400',
  ok:   'bg-amber-400',
  bad:  'bg-red-500',
};
const qualityPill: Record<Quality, string> = {
  good: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  ok:   'bg-amber-50 text-amber-700 border border-amber-200',
  bad:  'bg-red-50 text-red-600 border border-red-200',
};
const qualityLabel: Record<Quality, string> = {
  good: '✓ Mirë',
  ok:   '◐ Mesatar',
  bad:  '✕ Keq',
};

// ─── Sub-score bar ─────────────────────────────────────────────────────────────

function SubScoreBar({
  label, value, max, color,
}: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 tabular-nums w-12 text-right">
        {value} / {max}
      </span>
    </div>
  );
}

// ─── Amenity row with distance bar ────────────────────────────────────────────

interface AmenityRowProps {
  emoji: string;
  label: string;
  info: AmenityInfo;
  threshold: number;
}

function AmenityRow({ emoji, label, info, threshold }: AmenityRowProps) {
  const q: Quality =
    info.distance <= threshold           ? 'good' :
    info.distance <= threshold * 2       ? 'ok'   : 'bad';
  const barPct = Math.min(100, (info.distance / (threshold * 3)) * 100);
  const modeIcon = info.mode === 'drive' ? '🚗' : '🚶';

  return (
    <div className="py-3.5 border-b border-gray-100 last:border-0">
      {/* top line */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base leading-none flex-shrink-0">{emoji}</span>
          <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-bold text-gray-900 tabular-nums">{fmtDist(info.distance)}</span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${qualityPill[q]}`}>
            {modeIcon} {info.duration} min
          </span>
        </div>
      </div>
      {/* bar */}
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            q === 'good' ? 'bg-emerald-400' : q === 'ok' ? 'bg-amber-400' : 'bg-red-400'
          }`}
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Profile card (tile) ──────────────────────────────────────────────────────

const cardBg: Record<Quality, string> = {
  good: 'bg-emerald-50 border-emerald-100',
  ok:   'bg-amber-50  border-amber-100',
  bad:  'bg-red-50    border-red-100',
};
const dotBg: Record<Quality, string> = {
  good: 'bg-emerald-400',
  ok:   'bg-amber-400',
  bad:  'bg-red-500',
};

function ProfileCard({
  emoji, label, value, quality,
}: {
  emoji: string; label: string; value: string; quality: Quality;
}) {
  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-1.5 ${cardBg[quality]}`}>
      <div className="flex items-start justify-between">
        <span className="text-lg leading-none">{emoji}</span>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${dotBg[quality]}`} />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-none">
        {label}
      </p>
      <p className={`text-sm font-bold leading-snug ${qualityText[quality]}`}>{value}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LocationInsights({ property, allProperties }: Props) {
  const analysis  = useMemo(() => calcPriceAnalysis(property, allProperties),  [property, allProperties]);
  const breakdown = useMemo(() => calcScoreBreakdown(property, allProperties), [property, allProperties]);

  const { total: score, priceScore, proximityScore, profileScore } = breakdown;
  const scoreColor = scoreRingHex(score);

  const absPct  = Math.abs(Math.round(analysis.diffPct * 100));
  const isAbove = analysis.label === 'above';
  const isBelow = analysis.label === 'below';

  const profile = property.neighborhoodProfile;

  // Profile value → display + quality
  function noise(v: NeighborhoodProfile['noise'])            : [string, Quality] {
    return v === 'calm' ? ['Qetë', 'good'] : v === 'moderate' ? ['Mesatar', 'ok'] : ['Zhurmuese', 'bad'];
  }
  function traffic(v: NeighborhoodProfile['traffic'])        : [string, Quality] {
    return v === 'low' ? ['I lehtë', 'good'] : v === 'moderate' ? ['Mesatar', 'ok'] : ['I rëndë', 'bad'];
  }
  function sun(v: NeighborhoodProfile['sunlight'])           : [string, Quality] {
    return v === 'high' ? ['I shkëlqyer', 'good'] : v === 'moderate' ? ['Mesatar', 'ok'] : ['I kufizuar', 'bad'];
  }
  function constr(v: NeighborhoodProfile['construction'])    : [string, Quality] {
    if (v === 'none')    return ['Asnjë', 'good'];
    if (v === 'stopped') return ['Bllokuar (ndalur)', 'ok'];
    if (v === 'nearby')  return ['Aktiv afër', 'ok'];
    return ['Aktiv pranë', 'bad'];
  }
  function street(v: NeighborhoodProfile['streetQuality'])   : [string, Quality] {
    return v === 'good' ? ['E mirë', 'good'] : v === 'average' ? ['Mesatare', 'ok'] : ['E dobët', 'bad'];
  }
  function parking(v: NeighborhoodProfile['parking'])        : [string, Quality] {
    return v === 'ample' ? ['I mjaftueshëm', 'good'] : v === 'moderate' ? ['Mesatar', 'ok'] : ['I kufizuar', 'bad'];
  }
  function air(v: NeighborhoodProfile['airQuality'])         : [string, Quality] {
    return v === 'good' ? ['I pastër', 'good'] : v === 'moderate' ? ['Mesatar', 'ok'] : ['I ndotur', 'bad'];
  }
  function transport(v: NeighborhoodProfile['publicTransport']): [string, Quality] {
    return v === 'good' ? ['I mirë', 'good'] : v === 'moderate' ? ['Mesatar', 'ok'] : ['I kufizuar', 'bad'];
  }

  // Price bar comparison
  const maxPrice = Math.max(property.pricePerSqm, analysis.cityAvgPricePerSqm) * 1.15;
  const thisPct  = (property.pricePerSqm / maxPrice) * 100;
  const avgPct   = (analysis.cityAvgPricePerSqm / maxPrice) * 100;

  return (
    <section className="mt-10 space-y-4">

      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 17, height: 17 }} className="text-rose-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Vendndodhja &amp; Analiza</h2>
      </div>

      {/* ══ 1. SCORE — full-width gradient bar card ══════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        {/* Score headline */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Vlerësimi i pronës
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold" style={{ color: scoreColor }}>
                {score}
              </span>
              <span className="text-xl text-gray-300 font-light">/ 10</span>
              <span className={`ml-2 text-base font-bold`} style={{ color: scoreColor }}>
                — {scoreLabel(score)}
              </span>
            </div>
          </div>
          {/* Compact ring for at-a-glance */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f3f4f6" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke={scoreColor}
                strokeWidth="4"
                strokeDasharray={`${(score / 10) * 87.96} 87.96`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold" style={{ color: scoreColor }}>
              {score}
            </span>
          </div>
        </div>

        {/* Gradient track */}
        <div className="relative mb-6">
          <div
            className="h-4 rounded-full"
            style={{ background: 'linear-gradient(to right, #ef4444 0%, #f97316 25%, #eab308 50%, #84cc16 75%, #22c55e 100%)' }}
          />
          {/* Dimmed overlay for un-reached portion */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.55)',
              left: `${(score / 10) * 100}%`,
            }}
          />
          {/* Marker dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md border-2 transition-all"
            style={{
              left: `calc(${(score / 10) * 100}% - 12px)`,
              borderColor: scoreColor,
            }}
          />
          {/* 0 / 10 labels */}
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-300">0</span>
            <span className="text-xs text-gray-300">5</span>
            <span className="text-xs text-gray-300">10</span>
          </div>
        </div>

        {/* Sub-score breakdown */}
        <div className="space-y-2.5 pt-3 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Si u llogarit
          </p>
          <SubScoreBar label="Çmimi vs qytet"    value={priceScore}     max={4} color="#f97316" />
          <SubScoreBar label="Afërsia me shërbime" value={proximityScore}  max={4} color="#3b82f6" />
          <SubScoreBar label="Cilësia e lagjes"   value={profileScore}   max={2} color="#8b5cf6" />
        </div>
      </div>

      {/* ══ 2. PRICE ANALYSIS — full-width ═══════════════════════════════════ */}
      <div className={`rounded-2xl border p-6 ${
        isBelow ? 'bg-emerald-50 border-emerald-200' :
        isAbove ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-100'
      }`}>
        <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${
          isBelow ? 'text-emerald-500' : isAbove ? 'text-red-400' : 'text-gray-400'
        }`}>
          Analiza e çmimit
        </p>

        {/* Big % badge + verdict */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`text-6xl font-extrabold leading-none ${
            isBelow ? 'text-emerald-600' : isAbove ? 'text-red-500' : 'text-gray-700'
          }`}>
            {isAbove ? '+' : isBelow ? '−' : ''}{absPct}<span className="text-3xl">%</span>
          </div>
          <div>
            <p className={`text-base font-bold ${
              isBelow ? 'text-emerald-700' : isAbove ? 'text-red-600' : 'text-gray-700'
            }`}>
              {isBelow ? 'nën mesataren e qytetit' : isAbove ? 'mbi mesataren e qytetit' : 'në mesataren e qytetit'}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              Krahasuar me {property.city}
            </p>
          </div>
        </div>

        {/* Visual price comparison bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="font-medium">Kjo pronë</span>
              <span className="font-bold text-gray-900">{property.pricePerSqm.toLocaleString('de-DE')} €/m²</span>
            </div>
            <div className="h-3 rounded-full bg-white/60 overflow-hidden">
              <div
                className={`h-full rounded-full ${isAbove ? 'bg-red-400' : 'bg-emerald-400'}`}
                style={{ width: `${thisPct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Mesatarja e {property.city}t</span>
              <span className="font-semibold text-gray-700">{analysis.cityAvgPricePerSqm.toLocaleString('de-DE')} €/m²</span>
            </div>
            <div className="h-3 rounded-full bg-white/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gray-400"
                style={{ width: `${avgPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══ 3. AMENITIES ═════════════════════════════════════════════════════ */}
      {property.nearby && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Shërbimet afër</h3>
            <p className="text-xs text-gray-400 mt-0.5">Bara tregojnë distancën relative — <span className="text-emerald-600 font-medium">gjelbër</span> = afër, <span className="text-amber-600 font-medium">verdhë</span> = mesatar, <span className="text-red-500 font-medium">kuq</span> = larg</p>
          </div>
          <div className="px-6">
            <AmenityRow emoji="🛒" label="Market / Dyqan"    info={property.nearby.market}       threshold={600}  />
            <AmenityRow emoji="🏥" label="Spital / Klinikë"  info={property.nearby.hospital}     threshold={2000} />
            <AmenityRow emoji="💊" label="Farmaci"           info={property.nearby.pharmacy}     threshold={500}  />
            <AmenityRow emoji="🚌" label="Stacion autobusi"  info={property.nearby.busStop}      threshold={400}  />
            <AmenityRow emoji="🌳" label="Park / Sheshe"     info={property.nearby.park}         threshold={600}  />
            <AmenityRow emoji="🏫" label="Shkollë"           info={property.nearby.school}       threshold={700}  />
            <AmenityRow emoji="🧒" label="Kopsht fëmijësh"  info={property.nearby.kindergarten} threshold={700}  />
          </div>
        </div>
      )}

      {/* ══ 4. NEIGHBORHOOD PROFILE ══════════════════════════════════════════ */}
      {profile && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Profili i lagjes</h3>
            <p className="text-xs text-gray-400 mt-0.5">Faktorë që ndikojnë drejtpërdrejt cilësinë e jetesës</p>
          </div>

          {/* 4-column tile grid */}
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(() => {
              const tiles: Array<[string, string, string, Quality]> = [
                ['🔊', 'Zhurmë',          ...noise(profile.noise)],
                ['🚦', 'Trafiku',         ...traffic(profile.traffic)],
                ['☀️', 'Diell',           ...sun(profile.sunlight)],
                ['🏗️', 'Ndërtim pranë',   ...constr(profile.construction)],
                ['🛣️', 'Rruga',           ...street(profile.streetQuality)],
                ['🅿️', 'Parking',         ...parking(profile.parking)],
                ['🌬️', 'Ajri',            ...air(profile.airQuality)],
                ['🚌', 'Transport pub.',  ...transport(profile.publicTransport)],
              ];
              return tiles.map(([emoji, label, value, quality], i) => (
                <ProfileCard key={i} emoji={emoji} label={label} value={value} quality={quality} />
              ));
            })()}
          </div>

          {/* Notes */}
          {profile.notes.length > 0 && (
            <div className="px-6 pb-5 pt-1 border-t border-gray-100 space-y-2.5">
              {profile.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2.5 pt-3 first:pt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 leading-snug">{note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ 5. DISCLAIMER ════════════════════════════════════════════════════ */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100">
        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-gray-400 leading-relaxed">
          Ne synojmë t&apos;ju ndihmojmë të merrni vendime më të informuara. Largësitë,
          çmimet dhe vlerësimet janë vlerësime të bazuara në të dhënat e disponueshme
          dhe mund të ndryshojnë. Vendimi final duhet të bazohet gjithmonë në
          inspektimin dhe vlerësimin tuaj personal.
        </p>
      </div>
    </section>
  );
}
