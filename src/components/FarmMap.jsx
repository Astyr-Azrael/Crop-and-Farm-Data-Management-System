import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CircleHelp,
  Droplets,
  LandPlot,
  Layers3,
  MapPinned,
  Navigation,
  Ruler,
  Sprout,
} from 'lucide-react'
import { growthStages, shortStage } from '../constants'

const stagePlanning = {
  'Germination (0-45 days)': {
    priority: 'High priority',
    className: 'high',
    color: '#dd5f52',
    focus: 'Keep the planting zone uniformly moist and inspect this plot before the next cycle.',
  },
  'Tillering (46-100 days)': {
    priority: 'Due soon',
    className: 'soon',
    color: '#e4a02e',
    focus: 'Review root-zone moisture and prepare the next irrigation cycle for active tillering.',
  },
  'Grand Growth (101-270 days)': {
    priority: 'Active cycle',
    className: 'active',
    color: '#2f9f6b',
    focus: 'Maintain consistent moisture and inspect high-demand portions of the field.',
  },
  'Maturity (271-365 days)': {
    priority: 'Monitor',
    className: 'monitor',
    color: '#718096',
    focus: 'Avoid excess water and irrigate only after checking field and soil conditions.',
  },
}

const shapeOffsets = [
  [[3, 10], [16, 2], [88, 6], [96, 69], [80, 86], [5, 79]],
  [[2, 4], [76, 1], [95, 16], [88, 83], [14, 87], [1, 66]],
  [[8, 1], [91, 8], [96, 78], [71, 89], [3, 76], [1, 20]],
  [[2, 18], [22, 2], [94, 5], [88, 72], [69, 88], [5, 80]],
]

const toPolygonPoints = (index) => {
  const column = index % 8
  const row = Math.floor(index / 8)
  const x = 25 + column * 106
  const y = 34 + row * 111
  return shapeOffsets[index % shapeOffsets.length]
    .map(([dx, dy]) => `${x + dx},${y + dy}`)
    .join(' ')
}

const polygonCenter = (index) => ({
  x: 74 + (index % 8) * 106,
  y: 78 + Math.floor(index / 8) * 111,
})

function MapMetric({ icon: Icon, label, value, note }) {
  return (
    <article className="map-metric">
      <span><Icon size={18} /></span>
      <div><small>{label}</small><strong>{value}</strong><p>{note}</p></div>
    </article>
  )
}

export default function FarmMap({ records, loading, onOpenRecord }) {
  const [selectedId, setSelectedId] = useState(null)
  const [stage, setStage] = useState('')

  const visibleRecords = useMemo(
    () => records.filter((record) => !stage || record.growth_stage === stage),
    [records, stage],
  )

  useEffect(() => {
    if (!visibleRecords.length) {
      setSelectedId(null)
      return
    }
    if (!visibleRecords.some((record) => record.id === selectedId)) {
      setSelectedId(visibleRecords[0].id)
    }
  }, [selectedId, visibleRecords])

  const selected = records.find((record) => record.id === selectedId) || visibleRecords[0]
  const selectedPlanning = selected ? stagePlanning[selected.growth_stage] : null
  const totalArea = visibleRecords.reduce((sum, record) => sum + Number(record.area || 0), 0)
  const attentionCount = visibleRecords.filter((record) => ['Germination (0-45 days)', 'Tillering (46-100 days)'].includes(record.growth_stage)).length

  return (
    <div className="page-stack page-enter field-map-page">
      <section className="map-intro">
        <div>
          <span className="eyebrow">Visual irrigation planning</span>
          <h2>Farm coverage map</h2>
          <p>Select a shaded plot to connect its crop record with a clear, stage-based irrigation priority.</p>
        </div>
        <label className="map-filter">
          <span>Show growth stage</span>
          <select value={stage} onChange={(event) => setStage(event.target.value)}>
            <option value="">All growth stages</option>
            {growthStages.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <section className="map-metrics" aria-label="Mapped farm summary">
        <MapMetric icon={LandPlot} label="Mapped plots" value={loading ? '—' : visibleRecords.length} note="Selectable field boundaries" />
        <MapMetric icon={Ruler} label="Mapped area" value={loading ? '—' : `${totalArea.toFixed(1)} acres`} note="Filtered farm coverage" />
        <MapMetric icon={Droplets} label="Needs attention" value={loading ? '—' : attentionCount} note="High priority or due soon" />
        <MapMetric icon={Sprout} label="Selected plot" value={selected ? shortStage(selected.growth_stage) : 'None'} note={selected?.farm_name || 'Choose a field'} />
      </section>

      <section className="field-map-layout">
        <article className="field-map-panel">
          <div className="field-map-panel__header">
            <div>
              <span className="eyebrow">Field boundary view</span>
              <h3>Stage-based irrigation priority</h3>
            </div>
            <span className="map-live-badge"><span /> SQLite records</span>
          </div>

          <div className="field-map-canvas">
            {loading ? (
              <div className="map-loading"><span className="spinner" /> Loading mapped farms…</div>
            ) : (
              <svg viewBox="0 0 900 520" role="img" aria-labelledby="field-map-title field-map-description">
                <title id="field-map-title">Interactive farm boundary map</title>
                <desc id="field-map-description">Thirty-two schematic field parcels shaded by crop-stage irrigation priority.</desc>
                <defs>
                  <linearGradient id="map-ground" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#eff3e5" />
                    <stop offset="100%" stopColor="#dfe9d7" />
                  </linearGradient>
                  <pattern id="map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#91a58f" strokeOpacity=".12" strokeWidth="1" />
                  </pattern>
                  <filter id="plot-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#17382c" floodOpacity=".16" />
                  </filter>
                </defs>

                <rect width="900" height="520" rx="22" fill="url(#map-ground)" />
                <rect width="900" height="520" rx="22" fill="url(#map-grid)" />
                <path className="map-contour" d="M-30 106 C140 34 239 153 382 89 S648 40 939 112" />
                <path className="map-contour" d="M-40 392 C138 314 241 433 409 367 S696 328 943 401" />
                <path className="map-road map-road--edge" d="M-20 263 C180 213 301 303 453 251 S719 195 930 246" />
                <path className="map-road" d="M-20 263 C180 213 301 303 453 251 S719 195 930 246" />
                <path className="map-canal map-canal--edge" d="M153 -18 C224 105 149 178 214 289 S328 425 290 548" />
                <path className="map-canal" d="M153 -18 C224 105 149 178 214 289 S328 425 290 548" />
                <text className="map-label" x="386" y="239">FIELD ACCESS ROAD</text>
                <text className="map-label map-label--water" x="178" y="170" transform="rotate(67 178 170)">NORTH CANAL</text>

                {records.map((record, index) => {
                  const planning = stagePlanning[record.growth_stage]
                  const isVisible = !stage || record.growth_stage === stage
                  const isSelected = record.id === selected?.id
                  const center = polygonCenter(index)
                  return (
                    <g
                      className={`field-parcel ${isSelected ? 'field-parcel--selected' : ''} ${isVisible ? '' : 'field-parcel--dimmed'}`}
                      key={record.id}
                      role="button"
                      tabIndex={isVisible ? 0 : -1}
                      aria-label={`${record.farm_name}, ${planning.priority}`}
                      onClick={() => isVisible && setSelectedId(record.id)}
                      onKeyDown={(event) => {
                        if (isVisible && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault()
                          setSelectedId(record.id)
                        }
                      }}
                    >
                      <polygon
                        points={toPolygonPoints(index)}
                        fill={planning.color}
                        filter={isSelected ? 'url(#plot-shadow)' : undefined}
                      />
                      <text x={center.x} y={center.y} textAnchor="middle">P{String(index + 1).padStart(2, '0')}</text>
                      <title>{record.farm_name} · {planning.priority}</title>
                    </g>
                  )
                })}

                <g className="map-north" transform="translate(836 35)">
                  <circle cx="0" cy="0" r="23" />
                  <path d="M0 -14 L7 8 L0 4 L-7 8 Z" />
                  <text x="0" y="-29" textAnchor="middle">N</text>
                </g>
                <g className="map-scale" transform="translate(720 487)">
                  <path d="M0 0 H112" />
                  <path d="M0 -5 V5 M56 -5 V5 M112 -5 V5" />
                  <text x="56" y="-10" textAnchor="middle">250 m field scale</text>
                </g>
              </svg>
            )}

            <div className="map-legend" aria-label="Irrigation priority legend">
              {Object.values(stagePlanning).map((item) => (
                <span key={item.priority}><i style={{ background: item.color }} /> {item.priority}</span>
              ))}
            </div>
          </div>

          <div className="map-note">
            <CircleHelp size={16} />
            <span><strong>How to read this map:</strong> colour shows stage-based irrigation priority. The parcel geometry is a presentation layer; confirm surveyed boundaries, soil moisture, and weather before field action.</span>
          </div>
        </article>

        <aside className="map-details" aria-live="polite">
          {selected && selectedPlanning ? (
            <>
              <div className="map-details__top">
                <span className={`priority-badge priority-badge--${selectedPlanning.className}`}>
                  <Droplets size={14} /> {selectedPlanning.priority}
                </span>
                <span className="map-plot-id">Plot {String(records.findIndex((record) => record.id === selected.id) + 1).padStart(2, '0')}</span>
              </div>
              <div className="map-details__title">
                <span><Navigation size={17} /></span>
                <div><small>Selected farm</small><h3>{selected.farm_name}</h3><p><MapPinned size={13} /> {selected.location}</p></div>
              </div>
              <div className="map-detail-grid">
                <div><small>Area</small><strong>{selected.area} acres</strong></div>
                <div><small>Growth stage</small><strong>{shortStage(selected.growth_stage)}</strong></div>
                <div><small>Variety</small><strong>{selected.sugarcane_variety}</strong></div>
                <div><small>Soil</small><strong>{selected.soil_type}</strong></div>
              </div>
              <div className="irrigation-focus">
                <span><Droplets size={19} /></span>
                <div><small>Irrigation planning focus</small><p>{selectedPlanning.focus}</p></div>
              </div>
              <button className="button button--primary button--full" onClick={() => onOpenRecord(selected)}>
                Open full farm record <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <div className="map-details__empty"><Layers3 size={26} /><strong>No plots in this filter</strong><p>Choose another growth stage to display mapped farms.</p></div>
          )}
        </aside>
      </section>
    </div>
  )
}
