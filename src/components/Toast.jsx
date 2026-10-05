import { CheckCircle2, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  if (!toast) return null
  return (
    <div className={`toast toast--${toast.type || 'success'}`} role="status">
      <CheckCircle2 size={19} />
      <div><strong>{toast.title}</strong><span>{toast.message}</span></div>
      <button onClick={onClose} aria-label="Dismiss notification"><X size={17} /></button>
    </div>
  )
}
