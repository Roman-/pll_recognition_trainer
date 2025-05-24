import {computed, reactive, ref, watch} from 'vue'
import {defineStore} from 'pinia'
import {keysToCases, allPllKeys, resultsToEvalResults, evalResultsToNewQueue} from "@/scripts/pll_cases";
import {isPllLetter, random_element, shuffle} from "@/scripts/helpers";
import {DefaultAllowedCrossColors, randomCrossColor} from "@/scripts/colors";

const storeKey = 'pll_store';
const includeNoAufInInitialQueue = false // cases with no AUF might be easier to guess, we don't want this in evaluation
const generateEvaluationQueue = (allowedCrossColors) => {
    return shuffle(keysToCases(allPllKeys(), allowedCrossColors, includeNoAufInInitialQueue))
}

export const GameState = Object.freeze({
    Paused: 0,
    Playing: 1, // including "staring at my mistake"
    EvaluationDone: 2,
});

const defaultStore = {
    state: GameState.Paused,

    // pending cases to practice:
    queue: [],

    // array of objects: {pllCase: obj; started: datetime; finished: datetime; mistake: string (empty if none)}
    // On evaluation end, new queue will be formed from results
    results: [],

    // Mistake make on current case. If empty, no input (and hence no mistake) has been made yet
    mistake: "",

    currentRecognitionStarted: new Date(),

    allowedCrossColors: DefaultAllowedCrossColors
}

export const useSessionStore = defineStore('session', () => {
    const store = reactive(JSON.parse(localStorage.getItem(storeKey)) || defaultStore)

    const currentCase = computed(() => store.state === GameState.Playing && store.queue.length > 0 ? store.queue[0] : null)

    const setAllowedCrossColors = (crossColors) => {
        shiftMistakeIfAny() // get rid of the duplicated case in a queue
        // if allowedCrossColors and crossColors are same, don't do anything
        if (store.allowedCrossColors.length === crossColors.length && store.allowedCrossColors.every((v, i) => v === crossColors[i])) {
            return
        }
        store.allowedCrossColors = crossColors
        store.queue.forEach(c => c.crossColor = randomCrossColor(crossColors))
    }

    // when just enter the trainer screen, it's good to have the game paused
    const setInitial = () => {
        shiftMistakeIfAny()
        if (store.queue.length === 0 && store.results.length === 0) {
            store.queue = generateEvaluationQueue(DefaultAllowedCrossColors)
        }
        store.state = store.queue.length === 0 ? GameState.EvaluationDone : GameState.Paused
        shuffle(store.queue)
    }

    const pausePlay = () => {
        if (store.state !== GameState.Playing) {
            return
        }
        if (store.mistake) {
            nextCase() // push current (mistakenly answered) case to history, shift queue
        } else {
            shuffle(store.queue) // because the player has already seen the case
        }
        store.state = GameState.Paused // this will cover the cube
    }

    const resumePlay = () => {
        if (store.state !== GameState.Paused) {
            return
        }
        store.state = GameState.Playing // this will reveal the cube
        store.currentRecognitionStarted = new Date()
    }

    const submitAnswer = letter => {
        if (store.state !== GameState.Playing || !isPllLetter(letter.toUpperCase()) || !currentCase.value) {
            return
        }
        const answer = letter.toUpperCase()
        const isCorrect = currentCase.value.name[0] === answer
        // if mistake is empty, this result hasn't been added to history yet
        if (!store.mistake) {
            const currentAnswerMistake = isCorrect ? "" : answer
            store.results.unshift({
                pllCase: currentCase.value,
                started: store.currentRecognitionStarted,
                finished: new Date(),
                mistake: currentAnswerMistake
            })
            store.mistake = currentAnswerMistake
        }
        if (isCorrect) {
            nextCase()
        }
    }

    const shiftMistakeIfAny = () => {
        if (store.mistake !== "") {
            store.mistake = ""
            store.queue.shift()
        }
    }

    const nextCase = () => {
        store.mistake = ""
        store.queue.shift()
        if (store.queue.length === 0) {
            store.state = GameState.EvaluationDone
        }
        store.currentRecognitionStarted = new Date()
    }

    const giveUpOnCase = () => store.mistake = "-"

    const restartEvaluation = () => {
        store.queue = generateEvaluationQueue(store.allowedCrossColors)
        store.results = []
        store.mistake = ""
        store.state = GameState.Paused
    }

    const startPersonalized = () => {
        store.queue = evalResultsToNewQueue(resultsToEvalResults(store.results), store.allowedCrossColors)
        store.results = []
        store.mistake = ""
        store.state = GameState.Paused
    }

    watch(store, () => {
        localStorage.setItem(storeKey, JSON.stringify(store))
    }, {deep: true})

    return {store, currentCase, setInitial,
        restartEvaluation, startPersonalized, setAllowedCrossColors,
        pausePlay, resumePlay, submitAnswer, giveUpOnCase}
});
