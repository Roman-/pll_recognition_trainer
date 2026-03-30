import pllMap from "@/assets/algs/pll.json"
import {random_element} from "@/scripts/helpers";
import {randomCrossColor} from "@/scripts/colors";

// key is a string: name/rotation, where name is case name (Aa, Jb etc) and rotation = ["" | "y" | "y2" | "y'"]
export const allPllKeys = () => {
    const plls = Object.keys(pllMap)
    const getRotationArray = pllFirstLetter => {
        switch (pllFirstLetter) {
            case "H":
                return [""] // can position the cube in any way before solving
            case "N":
            case "E":
            case "Z":
                return ["", "y"] // y2 is the same as nothing; y' is the same as y
            default:
                return ["", "y", "y2", "y'"];
        }
    }
    let keys = []

    for (let pll of plls) {
        const rots = getRotationArray(pll[0])
        for (let rot of rots) {
            keys.push(`${pll}/${rot}`);
        }
    }
    return keys
}

export const keyToCase = (key, dTurn, colorShift, crossColor) => {
    const [name, rot] = key.split('/')
    return {
        rotation: rot,
        name: name,
        dTurn: dTurn,
        colorShift: colorShift,
        crossColor: crossColor
    }
}

export const caseToKey = pllCase => `${pllCase.name}/${pllCase.rotation}`

export const D_TURN_OPTIONS = ['', 'd', 'd2', "d'"]
export const COLOR_SHIFTS = [0, 1, 2, 3]

export const keysToCases = (keys, allowedCrossColors, includeNoAuf = true) => {
    const dTurns = includeNoAuf ? D_TURN_OPTIONS : D_TURN_OPTIONS.slice(1)
    return keys.map(k => keyToCase(k,
        random_element(dTurns),
        random_element(COLOR_SHIFTS),
        randomCrossColor(allowedCrossColors)))
}
