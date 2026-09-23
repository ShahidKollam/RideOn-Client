import { useEffect } from 'react'

const SITE = 'RideOn'

/**
 * Sets document.title for basic SEO / browser tab clarity.
 * Restores previous title on unmount when `restore` is true (default).
 */
export function useDocumentTitle(title, { restore = false } = {}) {
    useEffect(() => {
        if (!title) return
        const previous = document.title
        document.title = title.includes(SITE) ? title : `${title} · ${SITE}`
        return () => {
            if (restore) document.title = previous
        }
    }, [title, restore])
}
