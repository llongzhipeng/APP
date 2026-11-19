// Game logic helpers: difficulty spec, question generation, scoring.

export const DIFFICULTY = {
  1: { type: 'hour',      minuteStep: 60, minuteTol: 15, hourTol: 15, coef: 1,   hasSecond: false },
  2: { type: 'half',      minuteStep: 30, minuteTol: 10, hourTol: 10, coef: 1.5, hasSecond: false },
  3: { type: 'quarter',   minuteStep: 15, minuteTol: 5,  hourTol: 5,  coef: 2,   hasSecond: false },
  4: { type: 'exactMin',  minuteStep: 5,  minuteTol: 3,  hourTol: 3,  coef: 2.5, hasSecond: false },
  5: { type: 'exactMin',  minuteStep: 1,  minuteTol: 1,  hourTol: 1,  coef: 3,   hasSecond: false },
  6: { type: 'exactSec',  minuteStep: 1,  minuteTol: 1,  hourTol: 1,  coef: 3.5, hasSecond: true, secondTol: 6 }
}

export const MAX_ANSWER_MS = 30000
export const ADJUST_WINDOW_MS = 60000

// Uniformly generates a target (h, m, s) for the given difficulty.
export function makeTarget(level) {
  const spec = DIFFICULTY[level] || DIFFICULTY[1]
  const h = Math.floor(Math.random() * 12) // 0..11
  let m = 0
  let s = 0
  switch (spec.type) {
    case 'hour':    m = 0; break
    case 'half':    m = Math.random() < 0.5 ? 0 : 30; break
    case 'quarter': m = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; break
    case 'exactMin':
      // For step=5 pick multiple of 5, for step=1 any minute
      if (spec.minuteStep === 5) m = Math.floor(Math.random() * 12) * 5
      else m = Math.floor(Math.random() * 60)
      break
    case 'exactSec':
      m = Math.floor(Math.random() * 60)
      s = Math.floor(Math.random() * 60)
      break
  }
  return { h, m, s }
}

// Convert target time to canonical hand angles (in degrees, 0 = up = 12 o'clock, clockwise).
export function targetAngles({ h, m, s }) {
  const hourDeg = ((h % 12) + m / 60 + s / 3600) * 30
  const minuteDeg = (m + s / 60) * 6
  const secondDeg = s * 6
  return { hourDeg, minuteDeg, secondDeg }
}

// Minimal absolute angular difference (in [0,180]).
export function angleDelta(a, b) {
  let d = Math.abs(((a - b) % 360 + 360) % 360)
  if (d > 180) d = 360 - d
  return d
}

// Judge whether a user attempt matches the target within tolerance.
export function judge(level, target, user) {
  const spec = DIFFICULTY[level] || DIFFICULTY[1]
  const t = targetAngles(target)
  const dMin = angleDelta(user.minuteDeg, t.minuteDeg)
  const dHr = angleDelta(user.hourDeg, t.hourDeg)
  const passMin = dMin <= spec.minuteTol
  const passHr = dHr <= Math.max(spec.hourTol, 5) // hour hand a bit looser
  if (!spec.hasSecond) return passMin && passHr
  const dSec = angleDelta(user.secondDeg, t.secondDeg)
  return passMin && passHr && dSec <= spec.secondTol
}

export function scoreFor(level) {
  const diff = DIFFICULTY[level]
  return 5 * ((diff && diff.coef) || 1)
}

export function formatClock({ h, m, s }, showSec) {
  const hh = String(h === 0 ? 12 : h).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return showSec ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`
}
