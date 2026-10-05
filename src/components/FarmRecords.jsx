import { Download, Eye, MapPin, MoreHorizontal, PencilLine, Plus, Search, Sprout, Trash2 } from 'lucide-react'
import { formatDate, growthStages, shortStage } from '../constants'
import EmptyState from './EmptyState'

export default function FarmRecords({ records, loading, query, stage, onQuery, onStage, onAdd, onView, onEdit, onDelete }) {
  return (
    <div className="page-stack page-enter">
      <section className="records-toolbar">
        <div className="records-toolbar__copy">
          <span className="eyebrow">Persistent farm data</span>
          <h2>Farm & crop records</h2>
          <p>Manage every registered sugarcane plot from one verified data table.</p>
        </div>
        <div className="records-toolbar__actions">
          <a className="button button--secondary" href="/api/farms/export.csv"><Download size={17} /> Export CSV</a>
          <button className="button button--primary" onClick={onAdd}><Plus size={17} /> Add record</button>
        </div>
      </section>

      <section className="panel records-panel">
        <div className="record-filters">
          <label className="search-field">
            <Search size={18} />
            <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search farm, location, or variety…" />
          </label>
          <select value={stage} onChange={(event) => onStage(event.target.value)} aria-label="Filter by crop growth stage">
            <option value="">All growth stages</option>
            {growthStages.map((item) => <option key={item}>{item}</option>)}
          </select>
          <span className="record-count">{records.length} {records.length === 1 ? 'record' : 'records'}</span>
        </div>

        {loading ? (
          <div className="table-skeleton">
            {[1, 2, 3].map((item) => <span key={item} />)}
          </div>
        ) : records.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Farm</th>
                  <th>Area</th>
                  <th>Variety</th>
                  <th>Plantation</th>
                  <th>Growth stage</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id} style={{ '--delay': `${index * 45}ms` }}>
                    <td>
                      <button className="farm-cell" onClick={() => onView(record)}>
                        <span><Sprout size={18} /></span>
                        <div><strong>{record.farm_name}</strong><small><MapPin size={12} /> {record.location}</small></div>
                      </button>
                    </td>
                    <td><strong>{record.area}</strong> <small>acres</small></td>
                    <td>{record.sugarcane_variety}</td>
                    <td>{formatDate(record.plantation_date)}</td>
                    <td><span className="stage-chip">{shortStage(record.growth_stage)}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-button" onClick={() => onView(record)} aria-label={`View ${record.farm_name}`} title="View"><Eye size={17} /></button>
                        <button className="icon-button" onClick={() => onEdit(record)} aria-label={`Edit ${record.farm_name}`} title="Edit"><PencilLine size={17} /></button>
                        <button className="icon-button icon-button--danger" onClick={() => onDelete(record)} aria-label={`Delete ${record.farm_name}`} title="Delete"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : query || stage ? (
          <div className="empty-state empty-state--search">
            <span className="empty-state__icon"><Search size={23} /></span>
            <h3>No matching records</h3>
            <p>Try a different farm name, location, variety, or crop stage.</p>
          </div>
        ) : (
          <EmptyState onAdd={onAdd} />
        )}

        <div className="records-footer">
          <span><MoreHorizontal size={16} /> Records are ordered by latest update</span>
          <span>SQLite database · mandatory field validation</span>
        </div>
      </section>
    </div>
  )
}
