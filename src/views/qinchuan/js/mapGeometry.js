/**
 * Pure geometry helpers shared by the Overview and SiteMapPage map views.
 * Keep these functions side-effect free so map rendering can reuse them safely.
 */
export function ensureClosed(ring) {
  if (!ring || ring.length < 3) return ring
  const first = ring[0]
  const last = ring[ring.length - 1]
  return first[0] === last[0] && first[1] === last[1]
    ? ring
    : [...ring, [first[0], first[1]]]
}

export function ringSignedArea(ring) {
  if (!ring || ring.length < 3) return 0
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return area / 2
}

export function ensureOuterCCW(ring) {
  const closedRing = ensureClosed(ring)
  return ringSignedArea(closedRing) >= 0 ? closedRing : closedRing.slice().reverse()
}

export function ensureHoleCW(ring) {
  const closedRing = ensureClosed(ring)
  return ringSignedArea(closedRing) <= 0 ? closedRing : closedRing.slice().reverse()
}

export function smoothstep(edge0, edge1, value) {
  if (edge1 <= edge0) return value >= edge1 ? 1 : 0
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
