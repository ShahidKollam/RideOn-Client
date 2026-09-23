/**
 * Display-only date/time helpers.
 * API values remain ISO; UI shows DD-MM-YYYY consistently.
 */

/** @param {Date|string|number|null|undefined} value */
export function formatDisplayDate(value) {
    if (value == null || value === '') return '—'
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}-${mm}-${yyyy}`
}

/** @param {Date|string|number|null|undefined} value */
export function formatDisplayTime(value) {
    if (value == null || value === '') return '—'
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    let h = d.getHours()
    const m = String(d.getMinutes()).padStart(2, '0')
    const period = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${h}:${m} ${period}`
}

/** @param {Date|string|number|null|undefined} value */
export function formatDisplayDateTime(value) {
    if (value == null || value === '') return '—'
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    return `${formatDisplayDate(d)} · ${formatDisplayTime(d)}`
}

/** HH:MM 24h string → display time */
export function formatTimeInputDisplay(time) {
    if (!time) return 'Select time'
    const [hour, minute] = time.split(':').map(Number)
    if (Number.isNaN(hour) || Number.isNaN(minute)) return time
    return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
}

/** ISO string → local date input YYYY-MM-DD (for <input type="date"> value) */
export function toDateInputValue(isoOrDate) {
    const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
    if (Number.isNaN(d.getTime())) return ''
    const offset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

/** ISO string → local HH:MM for time inputs */
export function toTimeInputValue(isoOrDate) {
    const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
    if (Number.isNaN(d.getTime())) return ''
    return d.toTimeString().slice(0, 5)
}
