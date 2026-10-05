import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, FlaskConical, LoaderCircle, MapPin, Ruler, Sprout, X } from 'lucide-react'
import { demoRecord, emptyRecord, growthStages, locationSuggestions, soilTypes, varieties } from '../constants'

function Field({ label, name, error, children, hint, icon: Icon }) {
  return (
    <label className={`form-field ${error ? 'form-field--error' : ''}`}>
      <span className="form-field__label">{label} <b>*</b></span>
      <span className="form-field__control">
        {Icon && <Icon size={17} />}
        {children}
      </span>
      {error ? <small className="form-field__error">{error}</small> : hint && <small className="form-field__hint">{hint}</small>}
    </label>
  )
}

function LocationAutocomplete({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const matches = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (!query) return locationSuggestions.slice(0, 6)
    return locationSuggestions
      .filter((location) => location.toLowerCase().includes(query) && location !== value)
      .slice(0, 6)
  }, [value])

  return (
    <div className="location-autocomplete">
      <input
        name="location"
        value={value}
        onChange={(event) => { onChange(event.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        placeholder="Start typing a village, taluka, or district"
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <div className="location-suggestions" role="listbox" aria-label="Location suggestions">
          {matches.map((location) => (
            <button
              type="button"
              role="option"
              key={location}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onChange(location); setOpen(false) }}
            >
              <MapPin size={15} />
              <span>{location}</span>
            </button>
          ))}
          <small>Suggestions are stored locally; custom locations are also accepted.</small>
        </div>
      )}
    </div>
  )
}

export default function FarmFormModal({ record, onClose, onSubmit }) {
  const [values, setValues] = useState(emptyRecord)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const isEditing = Boolean(record?.id)

  useEffect(() => {
    if (record) {
      setValues({
        farm_name: record.farm_name,
        location: record.location,
        area: String(record.area),
        sugarcane_variety: record.sugarcane_variety,
        soil_type: record.soil_type,
        plantation_date: record.plantation_date,
        growth_stage: record.growth_stage,
      })
    } else {
      setValues(emptyRecord)
    }
  }, [record])

  const title = useMemo(() => isEditing ? 'Update farm record' : 'Add farm & crop record', [isEditing])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleLocationChange = (location) => {
    setValues((current) => ({ ...current, location }))
    if (errors.location) setErrors((current) => ({ ...current, location: undefined }))
  }

  const validateClient = () => {
    const nextErrors = {}
    Object.entries(values).forEach(([key, value]) => {
      if (!String(value).trim()) nextErrors[key] = 'This field is required.'
    })
    if (values.area && Number(values.area) <= 0) nextErrors.area = 'Farm area must be greater than zero.'
    if (values.plantation_date && values.plantation_date > new Date().toISOString().slice(0, 10)) {
      nextErrors.plantation_date = 'Plantation date cannot be in the future.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateClient()) return
    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      setErrors(error.details || { form: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="farm-form-title">
        <header className="modal__header">
          <div>
            <span className="eyebrow">Mandatory farm information</span>
            <h2 id="farm-form-title">{title}</h2>
            <p>{isEditing ? 'Modify the saved farm or crop information.' : 'Complete all fields to create a validated SQLite record.'}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close form"><X size={20} /></button>
        </header>

        {!isEditing && (
          <button className="demo-fill" type="button" onClick={() => { setValues(demoRecord); setErrors({}) }}>
            <span><FlaskConical size={18} /></span>
            <div><strong>Live demo shortcut</strong><small>Fill Sugarcane Farm - Plot A values</small></div>
            <span className="demo-fill__action">Use demo data</span>
          </button>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {errors.form && <div className="form-alert">{errors.form}</div>}
          <div className="form-section">
            <div className="form-section__title"><span>01</span><div><strong>Farm information</strong><small>Physical plot identity and cultivated area</small></div></div>
            <div className="form-grid">
              <Field label="Farm name" name="farm_name" error={errors.farm_name} icon={Sprout}>
                <input name="farm_name" value={values.farm_name} onChange={handleChange} placeholder="e.g. Sugarcane Farm - Plot A" autoFocus />
              </Field>
              <Field label="Location" name="location" error={errors.location} hint="Type to see matching Maharashtra locations." icon={MapPin}>
                <LocationAutocomplete value={values.location} onChange={handleLocationChange} />
              </Field>
              <Field label="Farm area" name="area" error={errors.area} hint="Area is stored in acres." icon={Ruler}>
                <div className="input-with-suffix"><input name="area" type="number" min="0.01" step="0.01" value={values.area} onChange={handleChange} placeholder="0.00" /><span>acres</span></div>
              </Field>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__title"><span>02</span><div><strong>Crop profile</strong><small>Sugarcane variety, soil, date, and growth stage</small></div></div>
            <div className="form-grid form-grid--two">
              <Field label="Sugarcane variety" name="sugarcane_variety" error={errors.sugarcane_variety} icon={Sprout}>
                <select name="sugarcane_variety" value={values.sugarcane_variety} onChange={handleChange}>
                  <option value="">Select variety</option>
                  {varieties.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Soil type" name="soil_type" error={errors.soil_type}>
                <select name="soil_type" value={values.soil_type} onChange={handleChange}>
                  <option value="">Select soil type</option>
                  {soilTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Plantation date" name="plantation_date" error={errors.plantation_date} icon={CalendarDays}>
                <input name="plantation_date" type="date" max={new Date().toISOString().slice(0, 10)} value={values.plantation_date} onChange={handleChange} />
              </Field>
              <Field label="Crop growth stage" name="growth_stage" error={errors.growth_stage}>
                <select name="growth_stage" value={values.growth_stage} onChange={handleChange}>
                  <option value="">Select growth stage</option>
                  {growthStages.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <footer className="modal__footer">
            <span className="validation-note"><Check size={15} /> All fields are validated before saving</span>
            <div>
              <button className="button button--secondary" type="button" onClick={onClose}>Cancel</button>
              <button className="button button--primary" type="submit" disabled={submitting}>
                {submitting ? <LoaderCircle className="spin" size={17} /> : <DatabaseIcon />}
                {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Save record'}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  )
}

function DatabaseIcon() {
  return <span className="save-icon" aria-hidden="true" />
}
