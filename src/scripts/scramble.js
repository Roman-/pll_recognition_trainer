import pllMap from "@/assets/algs/pll.json";

export const llPuzzleMask = {
    "F": [3,4,5,6,7,8],
    "B": [3,4,5,6,7,8],
    "R": [3,4,5,6,7,8],
    "L": [3,4,5,6,7,8],
    "D": [0,1,2,3,4,5,6,7,8]
}

export const noCubePuzzleMask = {
    "U": [0,1,2,3,4,5,6,7,8],
    "F": [0,1,2,3,4,5,6,7,8],
    "B": [0,1,2,3,4,5,6,7,8],
    "R": [0,1,2,3,4,5,6,7,8],
    "L": [0,1,2,3,4,5,6,7,8],
    "D": [0,1,2,3,4,5,6,7,8]
}

export const crossColorToCubeRotation = c => {
    // sr-puzzlegen default orientation is yellow top blue front
    switch (c) {
        case 'y': return 'x2'
        case 'b': return 'x\''
        case 'r': return 'z'
        case 'g': return 'x'
        case 'o': return 'z\''
        case 'w': return ''
        default:
            console.error("crossColorToCubeRotation: invalid color", c)
            return ''
    }
}

export const inverseScramble = s => {
    const arr = s.split(" ");

    return arr.map((it) => {
        if (it.length === 0) {
            return "";
        }

        if (it[it.length - 1] === '2') {
            return it;
        } else if (it[it.length - 1] === '\'') {
            return it.slice(0, -1);
        } else {
            return `${it}'`;
        }
    }).reverse().join(" ");
};

// crossColorOverride - if not specified, cross color will be taken from pllCase
export const scrambleForCase = (pllCase, crossColorOverride) => {
    if (!pllCase) return ""
    const crossColor = crossColorOverride ? crossColorOverride[0].toLowerCase() : pllCase.crossColor
    const solution = pllMap[pllCase.name]["noAuf"] || ""
    const crossColorChange = crossColorToCubeRotation(crossColor)
    const colorShift = "y ".repeat(parseInt(pllCase.colorShift)).trim()
    const inversedRotation = inverseScramble(pllCase.rotation)
    return `${crossColorChange} ${colorShift} ${pllCase.dTurn} ${solution} ${inversedRotation} `.replace(/\s+/g, " ").trim()
}
