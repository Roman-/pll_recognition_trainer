import {random_element} from "@/scripts/helpers";

export const CubeColors = ['white', 'yellow', 'blue', 'green', 'orange', 'red']
export const colorNameByLetter = l => {
    return CubeColors.find(color => color[0] === l)
}
export const DefaultAllowedCrossColors = ['w']

export const randomCrossColor = allowedCrossColors => {
    return random_element(allowedCrossColors.length === 0 ? DefaultAllowedCrossColors : allowedCrossColors)
}

