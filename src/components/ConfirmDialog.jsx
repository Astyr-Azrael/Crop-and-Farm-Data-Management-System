import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ record, onCancel, onConfirm, busy }) {
  if (!record) return null
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <button className="icon-button confirm-dialog__close" onClick={onCancel} aria-label="Close"><X size={19} /></button>
        <span className="confirm-dialog__icon"><AlertTriangle size={25} /></span>
        <h2 id="confirm-title">Delete farm record?</h2>
        <p><strong>{record.farm_name}</strong> and its crop details will be permanently removed from the SQLite database.</p>
        <div className="confirm-dialog__actions">
          <button className="button button--secondary" onClick={onCancel}>Keep record</button>
          <button className="button button--danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete record'}</button>
        </div>
      </section>
    </div>
  )
}
