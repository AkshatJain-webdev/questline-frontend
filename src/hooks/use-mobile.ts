import * as React from "react"

const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

function subscribeToScreenSize(onChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
  mediaQuery.addEventListener("change", onChange)
  return () => mediaQuery.removeEventListener("change", onChange)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeToScreenSize,
    () => window.matchMedia(MOBILE_MEDIA_QUERY).matches,
    () => false,
  )
}
