import {random_element} from "@/scripts/helpers";

export const CubeColors = ['white', 'yellow', 'blue', 'green', 'orange', 'red']
export const colorNameByLetter = l => {
    return CubeColors.find(color => color[0] === l)
}
export const DefaultAllowedCrossColors = ['w']

export const randomCrossColor = allowedCrossColors => {
    return random_element(allowedCrossColors.length === 0 ? DefaultAllowedCrossColors : allowedCrossColors)
}

export const DefaultColorScheme = {
    "U": {
        "value": "#FFFF00",
        "name": "YELLOW"
    },
    "R": {
        "value": "#FF0000",
        "name": "RED"
    },
    "F": {
        "value": "#0000FF",
        "name": "BLUE"
    },
    "D": {
        "value": "#FFFFFF",
        "name": "WHITE"
    },
    "L": {
        "value": "#FFA500",
        "name": "ORANGE"
    },
    "B": {
        "value": "#32CD32",
        "name": "LIGHT_GREEN"
    }
}

export const CubeViews = {
    "Right": [{"x": 35, "y": 50, "z": 29}],
    "Left": [{"x": 25, "y": 30, "z": 13}],
    "Center": [{"x": 29, "y": 40, "z": 20}],
    "Center (CubeSkills)": [{"x": 43, "y": 35, "z": 29}]
}

export const topViewAdjustment = (puzzleRotations) => {
    const right = CubeViews["Right"][0]
    const current = puzzleRotations?.[0]
    if (!current) return ""
    if (current.x === right.x && current.y === right.y && current.z === right.z) return ""
    return "y"
}

export const strokeWidthOptions = {
    "0": 0,
    "1/2": 0.005,
    "1/4": 0.0025,
    "1": 0.01,
    "2": 0.02,
    "3": 0.03,
    "4": 0.04,
}