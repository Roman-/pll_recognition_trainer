import pllMap from "@/assets/algs/pll.json";

export const PLL_LETTERS = ['A', 'E', 'F', 'G', 'H', 'J', 'N', 'R', 'T', 'U', 'V', 'Y', 'Z']

const PLL_LETTER_SET = new Set(PLL_LETTERS)
const SINGLE_LETTER_PLL_SET = new Set(['E', 'F', 'H', 'T', 'V', 'Y', 'Z'])
const TWO_LETTER_PLL_PREFIX_SET = new Set(['A', 'G', 'J', 'N', 'R', 'U'])

export const isPllLetter = l => PLL_LETTER_SET.has(l)

export const isSingleLetterPll = l => SINGLE_LETTER_PLL_SET.has(l)

export const isTwoLetterPllPrefix = l => TWO_LETTER_PLL_PREFIX_SET.has(l)

export const validPllSuffixes = {
    A: ['a', 'b'],
    G: ['a', 'b', 'c', 'd'],
    J: ['a', 'b'],
    N: ['a', 'b'],
    R: ['a', 'b'],
    U: ['a', 'b']
}

export const allPllCaseNames = new Set(Object.keys(pllMap))

export const isHelpKey = key => {
    return new Set(['-', 'F1', '?', 's', 'S', '/']).has(key)
}

export const aufByDturn = d => {
    switch (d) {
        case "d'": return "U";
        case "d2": return "U2";
        case "d": return "U'";
        default:
        case "": return "";
    }
}
