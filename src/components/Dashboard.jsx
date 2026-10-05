import {
  ArrowRight,
  Check,
  Database,
  Leaf,
  MapPinned,
  PencilLine,
  Plus,
  Sprout,
  Tractor,
} from 'lucide-react'
import EmptyState from './EmptyState'
import { formatDate, shortStage } from '../constants'

function MetricCard({ icon: Icon, label, value, note, tone }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__icon"><Icon size={20} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  )
}

function StageDistribution({ items, total }) {
  if (!items.length) {
    return <EmptyState compact />
  }

  return (
    <div className="distribution-list">
      {items.map((item, index) => {
        const percentage = total ? Math.round((item.count / total) * 100) : 0
        return (
          <div className="distribution-row" key={item.growth_stage} style={{ '--delay': `${index * 70}ms` }}>
            <div className="distribution-row__label">
              <span>{shortStage(item.growth_stage)}</span>
              <strong>{item.count} {item.count === 1 ? 'farm' : 'farms'}</strong>
            </div>
            <div className="distribution-row__track" aria-label={`${percentage}%`}>
              <span style={{ width: `${percentage}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard({ data, loading, onAdd, onOpenRecords, onViewRecord }) {
  const topStage = data.stage_distribution?.[0]
  const topVariety = data.variety_distribution?.[0]

  return (
    <div className="page-stack page-enter">
      <section className="hero-panel">
        <div className="hero-panel__content">
          <span className="hero-panel__badge"><Leaf size={14} /> Focused FR-02 implementation</span>
          <h2>Farm data that is ready for the field.</h2>
          <p>
            Register, retrieve, and update sugarcane farm records with clear validation and reliable
            SQLite storage.
          </p>
          <div className="hero-panel__actions">
            <button className="button button--light" onClick={onAdd}>
              <Plus size={17} /> Add farm record
            </button>
            <button className="button button--ghost-light" onClick={onOpenRecords}>
              View records <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="hero-panel__visual" aria-hidden="true">
          <div className="field-orbit field-orbit--one" />
          <div className="field-orbit field-orbit--two" />
          <span className="hero-sprout"><Sprout size={46} /></span>
          <span className="hero-coordinate">18.52° N · 73.86° E</span>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Farm overview">
        <MetricCard icon={Tractor} label="Registered farms" value={loading ? '—' : data.total_farms} note="SQLite records" tone="green" />
        <MetricCard icon={MapPinned} label="Cultivated area" value={loading ? '—' : `${data.total_area} ac`} note="Across all plots" tone="blue" />
        <MetricCard icon={Sprout} label="Leading stage" value={loading ? '—' : topStage ? shortStage(topStage.growth_stage) : 'Not set'} note={topStage ? `${topStage.count} active record${topStage.count === 1 ? '' : 's'}` : 'Add a record to begin'} tone="amber" />
        <MetricCard icon={Leaf} label="Top variety" value={loading ? '—' : topVariety?.sugarcane_variety || 'Not set'} note={topVariety ? 'Most recorded variety' : 'No variety data'} tone="violet" />
      </section>

      <section className="dashboard-grid">
        <article className="panel panel--distribution">
          <div className="panel__header">
            <div>
              <span className="eyebrow">Crop overview</span>
              <h3>Growth stage distribution</h3>
            </div>
            <span className="panel__badge">Live records</span>
          </div>
          <StageDistribution items={data.stage_distribution || []} total={data.total_farms || 0} />
        </article>

        <article className="panel demo-panel">
          <div className="panel__header">
            <div>
              <span className="eyebrow">Live demonstration</span>
              <h3>FR-02 workflow</h3>
            </div>
            <span className="panel__badge panel__badge--mint">4 steps</span>
          </div>
          <div className="workflow-list">
            {[
              [Plus, 'Enter details', 'Use the Plot A demo values'],
              [Database, 'Save record', 'Persist all fields in SQLite'],
              [Check, 'Retrieve record', 'Open it from the records table'],
              [PencilLine, 'Update stage', 'Edit and verify the saved change'],
            ].map(([Icon, title, copy], index) => (
              <div className="workflow-step" key={title}>
                <span className="workflow-step__number"><Icon size={16} /></span>
                <div><strong>{title}</strong><small>{copy}</small></div>
                <span className="workflow-step__index">0{index + 1}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel recent-panel">
        <div className="panel__header">
          <div>
            <span className="eyebrow">Recently updated</span>
            <h3>Farm & crop records</h3>
          </div>
          <button className="text-button" onClick={onOpenRecords}>View all <ArrowRight size={16} /></button>
        </div>
        {data.recent_records?.length ? (
          <div className="recent-records">
            {data.recent_records.map((record) => (
              <button className="recent-record" key={record.id} onClick={() => onViewRecord(record)}>
                <span className="recent-record__mark"><Sprout size={19} /></span>
                <span className="recent-record__primary">
                  <strong>{record.farm_name}</strong>
                  <small><MapPinned size={13} /> {record.location}</small>
                </span>
                <span className="stage-chip">{shortStage(record.growth_stage)}</span>
                <span className="recent-record__date">Planted {formatDate(record.plantation_date)}</span>
                <ArrowRight className="recent-record__arrow" size={17} />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState onAdd={onAdd} />
        )}
      </section>
    </div>
  )
}
