import { CalendarDays, Clock3, MapPin, PencilLine, Ruler, Sprout, X } from 'lucide-react'
import { formatDate, formatTimestamp, shortStage } from '../constants'

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="drawer-detail">
      <span><Icon size={17} /></span>
      <div><small>{label}</small><strong>{value}</strong></div>
    </div>
  )
}

export default function RecordDrawer({ record, onClose, onEdit }) {
  if (!record) return null
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="drawer" aria-label="Farm record details">
        <header className="drawer__header">
          <span className="drawer__mark"><Sprout size={24} /></span>
          <button className="icon-button" onClick={onClose} aria-label="Close details"><X size={20} /></button>
        </header>
        <div className="drawer__title">
          <span className="eyebrow">Farm record #{String(record.id).padStart(3, '0')}</span>
          <h2>{record.farm_name}</h2>
          <p><MapPin size={15} /> {record.location}</p>
          <span className="stage-chip stage-chip--large">{shortStage(record.growth_stage)}</span>
        </div>

        <div className="drawer__section">
          <h3>Farm information</h3>
          <div className="drawer-details">
            <Detail icon={Ruler} label="Cultivated area" value={`${record.area} acres`} />
            <Detail icon={Sprout} label="Sugarcane variety" value={record.sugarcane_variety} />
            <Detail icon={MapPin} label="Soil type" value={record.soil_type} />
            <Detail icon={CalendarDays} label="Plantation date" value={formatDate(record.plantation_date)} />
          </div>
        </div>

        <div className="drawer__section crop-timeline">
          <h3>Crop lifecycle</h3>
          <div className="crop-timeline__track">
            {['Germination', 'Tillering', 'Grand Growth', 'Maturity'].map((stage) => {
              const active = shortStage(record.growth_stage) === stage
              return <span className={active ? 'active' : ''} key={stage}><i />{stage}</span>
            })}
          </div>
        </div>

        <div className="drawer__timestamp"><Clock3 size={15} /> Last updated {formatTimestamp(record.updated_at)}</div>
        <button className="button button--primary button--full" onClick={() => onEdit(record)}><PencilLine size={17} /> Edit this record</button>
      </aside>
    </div>
  )
}
