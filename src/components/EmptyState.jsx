import { Sprout } from 'lucide-react'

export default function EmptyState({ onAdd, compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'empty-state--compact' : ''}`}>
      <span className="empty-state__icon"><Sprout size={24} /></span>
      <h3>No farm records yet</h3>
      <p>Add Sugarcane Farm - Plot A to begin the farm data demonstration.</p>
      {onAdd && <button className="button button--primary" onClick={onAdd}>Add first record</button>}
    </div>
  )
}
