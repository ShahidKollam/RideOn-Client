import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * On every route change:
 * - scroll window to top
 * - clear any leftover body overflow lock from modals / full-page loaders
 *   (e.g. after booking confirm → navigate away while overflow was still hidden)
 */
export default function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
        // Always restore scrolling when the route changes so a previous
        // page's body overflow:hidden cannot stick across navigation.
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
    }, [pathname])

    return null
}
