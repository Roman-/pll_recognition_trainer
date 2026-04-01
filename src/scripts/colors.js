import {random_element} from "@/scripts/helpers";
import {colord} from "colord";

export const CubeColors = ['white', 'yellow', 'blue', 'green', 'orange', 'red']
export const colorNameByLetter = l => {
    return CubeColors.find(color => color[0] === l)
}
export const DefaultAllowedCrossColors = ['w']

export const randomCrossColor = allowedCrossColors => {
    return random_element(allowedCrossColors.length === 0 ? DefaultAllowedCrossColors : allowedCrossColors)
}

export function mutateColorScheme(baseScheme) {
    const mutated = {}
    for (const face of Object.keys(baseScheme)) {
        const { value, name } = baseScheme[face]
        const hsv = colord(value).toHsv()
        hsv.h = (hsv.h + (Math.random() * 12 - 6) + 360) % 360
        hsv.s = Math.min(100, Math.max(5, hsv.s + (Math.random() * 12 - 6)))
        hsv.v = Math.min(100, Math.max(15, hsv.v + (Math.random() * 12 - 6)))
        mutated[face] = { value: colord(hsv).toHex(), name }
    }
    return mutated
}