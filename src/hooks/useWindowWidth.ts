import { useEffect, useState } from 'react'

export function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => setWidth(window.innerWidth)

    window.addEventListener('resize', handleResize)

    // Initial check (in case the effect runs after mount)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width
}
