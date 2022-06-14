export const clamp = (value: number, min: number, max: number) => {
  return Math.max(Math.min(value, max), min)
}

export const clamp01 = (value: number) => {
  return Math.max(Math.min(value, 1), 0)
}

export const lerp = (min: number, max: number, weight: number) => {
  return min * (1 - weight) + max * weight
}

export const inverseLerp = (min: number, max: number, value: number) => {
  if (min === max) {
    return min
  }
  return clamp01((value - min) / (max - min))
}

export const easeIn = (power: number) => (progress: number) => progress ** power
export const easeOut = (power: number) => (progress: number) => 1 - Math.abs((1 - progress) ** power)
export const easeInOut = (power: number) => (progress: number) =>
  progress < 0.5 ? easeIn(power)(progress * 2) / 2 : easeOut(power)(progress * 2 - 1) / 2 + 0.5

export const easeInOut3 = easeInOut(3)
export const easeOut3 = easeOut(3)
export const easeOut5 = easeOut(5)
