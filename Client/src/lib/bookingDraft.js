/**
 * Temporary booking form draft in localStorage.
 * Stores only pickup/return date-time + helmet count + lastActivityAt.
 * Cleared after 10 minutes of inactivity or successful booking.
 */

const STORAGE_KEY = 'rideon_booking_draft'
const TTL_MS = 10 * 60 * 1000

export function loadBookingDraft() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const data = JSON.parse(raw)
        if (!data || typeof data.lastActivityAt !== 'number') {
            clearBookingDraft()
            return null
        }
        if (Date.now() - data.lastActivityAt > TTL_MS) {
            clearBookingDraft()
            return null
        }
        return {
            pickupDate: typeof data.pickupDate === 'string' ? data.pickupDate : '',
            pickupTime: typeof data.pickupTime === 'string' ? data.pickupTime : '',
            returnDate: typeof data.returnDate === 'string' ? data.returnDate : '',
            returnTime: typeof data.returnTime === 'string' ? data.returnTime : '',
            helmetCount: Number.isFinite(data.helmetCount) ? Number(data.helmetCount) : 0,
            lastActivityAt: data.lastActivityAt,
        }
    } catch {
        clearBookingDraft()
        return null
    }
}

export function saveBookingDraft({ pickupDate, pickupTime, returnDate, returnTime, helmetCount }) {
    try {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                pickupDate: pickupDate || '',
                pickupTime: pickupTime || '',
                returnDate: returnDate || '',
                returnTime: returnTime || '',
                helmetCount: Number(helmetCount) || 0,
                lastActivityAt: Date.now(),
            }),
        )
    } catch {
        // ignore quota / private mode
    }
}

export function clearBookingDraft() {
    try {
        window.localStorage.removeItem(STORAGE_KEY)
    } catch {
        // ignore
    }
}

/** Returns true if a draft exists and is still within the TTL window. */
export function isBookingDraftFresh() {
    return loadBookingDraft() !== null
}
