import {random_element} from "@/scripts/helpers";

export const CubeColors = ['white', 'yellow', 'blue', 'green', 'orange', 'red']
export const colorNameByLetter = l => {
    return CubeColors.find(color => color[0] === l)
}
export const DefaultAllowedCrossColors = ['w']

export const randomCrossColor = allowedCrossColors => {
    return random_element(allowedCrossColors.length === 0 ? DefaultAllowedCrossColors : allowedCrossColors)
}

export function hexToHsv(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    if (d !== 0) {
        if (max === r) h = ((g - b) / d + 6) % 6
        else if (max === g) h = (b - r) / d + 2
        else h = (r - g) / d + 4
        h *= 60
    }
    const s = max === 0 ? 0 : d / max
    return { h, s, v: max }
}

export function hsvToHex(h, s, v) {
    const c = v * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = v - c
    let r, g, b
    if (h < 60)        { r = c; g = x; b = 0 }
    else if (h < 120)  { r = x; g = c; b = 0 }
    else if (h < 180)  { r = 0; g = c; b = x }
    else if (h < 240)  { r = 0; g = x; b = c }
    else if (h < 300)  { r = x; g = 0; b = c }
    else               { r = c; g = 0; b = x }
    const toHex = n => Math.round((n + m) * 255).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function mutateColorScheme(baseScheme) {
    const mutated = {}
    for (const face of Object.keys(baseScheme)) {
        const { value, name } = baseScheme[face]
        const hsv = hexToHsv(value)
        hsv.h = (hsv.h + (Math.random() * 12 - 6) + 360) % 360
        hsv.s = Math.min(1, Math.max(0.05, hsv.s + (Math.random() * 0.12 - 0.06)))
        hsv.v = Math.min(1, Math.max(0.15, hsv.v + (Math.random() * 0.12 - 0.06)))
        mutated[face] = { value: hsvToHex(hsv.h, hsv.s, hsv.v), name }
    }
    return mutated
}