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
import {
  LayersControl,
  MapContainer,
  Polygon,
  ScaleControl,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { growthStages, shortStage } from '../constants'

const stagePlanning = {
  'Germination (0-45 days)': {
    priority: 'High priority', className: 'high', color: '#e1554a',
    focus: 'Keep the planting zone uniformly moist and inspect this plot before the next cycle.',
  },
  'Tillering (46-100 days)': {
    priority: 'Due soon', className: 'soon', color: '#e29b25',
    focus: 'Review root-zone moisture and prepare the next irrigation cycle for active tillering.',
  },
  'Grand Growth (101-270 days)': {
    priority: 'Active cycle', className: 'active', color: '#1f9b63',
    focus: 'Maintain consistent moisture and inspect high-demand portions of the field.',
  },
  'Maturity (271-365 days)': {
    priority: 'Monitor', className: 'monitor', color: '#64748b',
    focus: 'Avoid excess water and irrigate only after checking field and soil conditions.',
  },
}

const locationCoordinates = [
  ['shrirampur', [19.6197, 74.6570]], ['kopargaon', [19.8824, 74.4764]],
  ['rahuri', [19.3907, 74.6488]], ['chalisgaon', [20.4640, 75.0060]],
  ['malegaon', [20.5579, 74.5089]], ['niphad', [20.0776, 74.1098]],
  ['paithan', [19.4828, 75.3850]], ['georai', [19.2637, 75.7500]],
  ['tuljapur', [18.0080, 76.0700]], ['ausa', [18.2473, 76.4996]],
  ['loha', [18.9629, 77.1306]], ['pandharpur', [17.6746, 75.3237]],
  ['malshiras', [17.8630, 74.9100]], ['akluj', [17.8830, 75.0200]],
  ['indapur', [18.1171, 75.0236]], ['baramati', [18.1517, 74.5777]],
  ['daund', [18.4638, 74.5789]], ['junnar', [19.2082, 73.8752]],
  ['saswad', [18.3435, 74.0310]], ['purandar', [18.2820, 74.1430]],
  ['phaltan', [17.9911, 74.4313]], ['koregaon', [17.6989, 74.1596]],
  ['patan', [17.3751, 73.9017]], ['wai', [17.9520, 73.8900]],
  ['karad', [17.2850, 74.1840]], ['miraj', [16.8220, 74.6428]],
  ['tasgaon', [17.0370, 74.6017]], ['palus', [17.0976, 74.4481]],
  ['radhanagari', [16.4130, 73.9950]], ['hatkanangale', [16.7444, 74.4477]],
  ['shirol', [16.7330, 74.6000]],
]

const hashText = (value) => [...value].reduce((total, character) => total + character.charCodeAt(0), 0)

const locateFarm = (record) => {
  const location = record.location.toLowerCase()
  const base = locationCoordinates.find(([name]) => location.includes(name))?.[1] || [18.5204, 73.8567]
  const hash = hashText(`${record.farm_name}-${record.id}`)
  const angle = ((hash % 360) * Math.PI) / 180
  const distance = 0.032 + (hash % 5) * 0.003
  return [
    base[0] + Math.cos(angle) * distance,
    base[1] + (Math.sin(angle) * distance) / Math.cos((base[0] * Math.PI) / 180),
  ]
}

const createPlotBoundary = (record, [latitude, longitude]) => {
  const sideInMetres = Math.sqrt(Number(record.area) * 4046.8564224)
  const halfSide = Math.max(sideInMetres / 2, 36)
  const latitudeRadius = halfSide / 111320
  const longitudeRadius = halfSide / (111320 * Math.cos((latitude * Math.PI) / 180))

  return [
    [latitude + latitudeRadius * 0.92, longitude - longitudeRadius * 0.78],
    [latitude + latitudeRadius * 0.70, longitude + longitudeRadius * 0.88],
    [latitude + latitudeRadius * 0.12, longitude + longitudeRadius],
    [latitude - latitudeRadius * 0.83, longitude + longitudeRadius * 0.72],
    [latitude - latitudeRadius, longitude - longitudeRadius * 0.58],
    [latitude - latitudeRadius * 0.20, longitude - longitudeRadius],
  ]
}

function MapController({ center }) {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize()
    map.flyTo(center, 16, { duration: 0.65 })
  }, [center, map])

  return null
}

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

  const mappedRecords = useMemo(
    () => records.map((record) => {
      const center = locateFarm(record)
      return { ...record, center, boundary: createPlotBoundary(record, center) }
    }),
    [records],
  )
  const visibleRecords = useMemo(
    () => mappedRecords.filter((record) => !stage || record.growth_stage === stage),
    [mappedRecords, stage],
  )

  useEffect(() => {
    if (!visibleRecords.length) {
      setSelectedId(null)
      return
    }
    if (!visibleRecords.some((record) => record.id === selectedId)) setSelectedId(visibleRecords[0].id)
  }, [selectedId, visibleRecords])

  const selected = mappedRecords.find((record) => record.id === selectedId) || visibleRecords[0]
  const selectedPlanning = selected ? stagePlanning[selected.growth_stage] : null
  const totalArea = visibleRecords.reduce((sum, record) => sum + Number(record.area || 0), 0)
  const attentionCount = visibleRecords.filter((record) => ['Germination (0-45 days)', 'Tillering (46-100 days)'].includes(record.growth_stage)).length
  const plotNumber = selected ? records.findIndex((record) => record.id === selected.id) + 1 : 0

  return (
    <div className="page-stack page-enter field-map-page">
      <section className="map-intro">
        <div>
          <span className="eyebrow">Geographic irrigation planning</span>
          <h2>Farm plot map</h2>
          <p>View a selected sugarcane plot on a real map, with its approximate field boundary shaded by irrigation priority.</p>
        </div>
        <div className="map-intro__controls">
          <label className="map-filter map-filter--farm">
            <span>Mapped farm</span>
            <select value={selectedId || ''} onChange={(event) => setSelectedId(Number(event.target.value))} disabled={!visibleRecords.length}>
              {visibleRecords.map((record) => <option key={record.id} value={record.id}>{record.farm_name}</option>)}
            </select>
          </label>
          <label className="map-filter">
            <span>Growth stage</span>
            <select value={stage} onChange={(event) => setStage(event.target.value)}>
              <option value="">All growth stages</option>
              {growthStages.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="map-metrics" aria-label="Mapped farm summary">
        <MapMetric icon={LandPlot} label="Available plots" value={loading ? '—' : visibleRecords.length} note="Mapped SQLite records" />
        <MapMetric icon={Ruler} label="Covered area" value={loading ? '—' : `${totalArea.toFixed(1)} acres`} note="Current filtered selection" />
        <MapMetric icon={Droplets} label="Needs attention" value={loading ? '—' : attentionCount} note="High priority or due soon" />
        <MapMetric icon={Sprout} label="Selected plot" value={selected ? shortStage(selected.growth_stage) : 'None'} note={selected?.farm_name || 'Choose a field'} />
      </section>

      <section className="field-map-layout">
        <article className="field-map-panel">
          <div className="field-map-panel__header">
            <div>
              <span className="eyebrow">Satellite & street map</span>
              <h3>Shaded field boundary</h3>
            </div>
            <span className="map-live-badge"><span /> Interactive map</span>
          </div>

          <div className="field-map-canvas">
            {loading ? (
              <div className="map-loading"><span className="spinner" /> Loading mapped farms…</div>
            ) : selected && selectedPlanning ? (
              <>
                <MapContainer center={selected.center} zoom={16} minZoom={6} maxZoom={19} scrollWheelZoom zoomControl className="leaflet-farm-map">
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Satellite imagery">
                      <TileLayer attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={19} />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Street map">
                      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
                    </LayersControl.BaseLayer>
                  </LayersControl>
                  <Polygon
                    positions={selected.boundary}
                    pathOptions={{ color: '#ffffff', weight: 4, opacity: 1, fillColor: selectedPlanning.color, fillOpacity: 0.58 }}
                  >
                    <Tooltip permanent direction="center" className="plot-map-label">
                      Plot {String(plotNumber).padStart(2, '0')} · {selected.area} acres
                    </Tooltip>
                  </Polygon>
                  <ScaleControl position="bottomleft" imperial={false} />
                  <MapController center={selected.center} />
                </MapContainer>

                <div className="map-legend" aria-label="Irrigation priority legend">
                  {Object.values(stagePlanning).map((item) => (
                    <span key={item.priority}><i style={{ background: item.color }} /> {item.priority}</span>
                  ))}
                </div>
                <span className={`map-boundary-badge map-boundary-badge--${selectedPlanning.className}`}>
                  <MapPinned size={14} /> {selectedPlanning.priority} boundary
                </span>
              </>
            ) : (
              <div className="map-loading"><Layers3 size={22} /> No mapped farms in this filter</div>
            )}
          </div>

          <div className="map-note">
            <CircleHelp size={16} />
            <span><strong>Demo map:</strong> the basemap is real. The shaded footprint uses the stored acreage and an approximate location near the recorded town; replace it with surveyed GPS/GeoJSON coordinates for field deployment.</span>
          </div>
        </article>

        <aside className="map-details" aria-live="polite">
          {selected && selectedPlanning ? (
            <>
              <div className="map-details__top">
                <span className={`priority-badge priority-badge--${selectedPlanning.className}`}><Droplets size={14} /> {selectedPlanning.priority}</span>
                <span className="map-plot-id">Plot {String(plotNumber).padStart(2, '0')}</span>
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
