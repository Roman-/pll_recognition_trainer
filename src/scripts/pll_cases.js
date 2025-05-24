import pllMap from "@/assets/algs/pll.json"
import {random_element, shuffle} from "@/scripts/helpers";
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

const keyToCase = (key, dTurn, colorShift, crossColor) => {
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

export const keysToCases = (keys, allowedCrossColors, includeNoAuf = true) => {
    const dTurnOptions = includeNoAuf ? ['', 'd', 'd2', 'd\''] : ['d', 'd2', 'd\'']
    return keys.map(k => keyToCase(k,
        random_element(dTurnOptions),
        random_element([0, 1, 2, 3]),
        randomCrossColor(allowedCrossColors)))
}

export const resultTimeMs = r => {
    return new Date(r.finished) - new Date(r.started)
}

// returns true if r1 is better than r2
const isBetter = (r1, r2) => {
    if (!r1.mistake && r2.mistake) {
        return true
    } else if (r1.mistake && !r2.mistake) {
        return false
    } else {
        return resultTimeMs(r1) < resultTimeMs(r2)
    }
}

export const resultsToEvalResults = results => {
    let keyToWorstResult = {}
    for (let r of results) {
        const key = r.pllCase.name + "/" + r.pllCase.rotation;
        if (!keyToWorstResult[key] || isBetter(keyToWorstResult[key], r)) {
            keyToWorstResult[key] = r
        }
    }
    // return array of results sorted worst to best
    return Object.values(keyToWorstResult).sort((a, b) => isBetter(b, a) ? -1 : 1)
}

/// @param resultsSorted - results sorted worst to best with no duplicate keys
export const evalResultsToNewQueue = (resultsSorted, allowedCrossColors) => {
    let queue = []
    const addCases = (key, numResults) => {
        // avoid including no-auf whenever possible
        const dTurnsOptions = numResults === 4  ? ["", "d", "d2", "d'"] : ["d", "d2", "d'"]
        const dTurns = shuffle(dTurnsOptions).slice(0, numResults)
        const colorShifts = shuffle([0, 1, 2, 3]).slice(0, numResults)
        for (let i = 0; i < numResults; i++) {
            queue.push(keyToCase(key, dTurns[i], colorShifts[i], randomCrossColor(allowedCrossColors)))
        }
    }

    const resultKey = r => `${r.pllCase.name}/${r.pllCase.rotation}`

    // in case resultsSorted missing some keys, add them to queue (in single instance each) as well
    let remainingKeysSet = new Set(allPllKeys())
    resultsSorted.forEach(r => remainingKeysSet.delete(resultKey(r)))

    const top15 = Math.ceil(resultsSorted.length * 0.15)
    const top30 = Math.ceil(resultsSorted.length * 0.3)
    const top50 = Math.ceil(resultsSorted.length * 0.5)
    const top100 = Math.ceil(resultsSorted.length * 1.0)
    resultsSorted.slice(0,     top15 ).forEach(r => addCases(resultKey(r), 4))
    resultsSorted.slice(top15, top30 ).forEach(r => addCases(resultKey(r), 3))
    resultsSorted.slice(top30, top50 ).forEach(r => addCases(resultKey(r), 2))
    resultsSorted.slice(top50, top100).forEach(r => addCases(resultKey(r), 1));
    [...remainingKeysSet].forEach(k => addCases(k, 1))

    return shuffle(queue)
}