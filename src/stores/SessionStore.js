import {computed, reactive, ref, watch} from 'vue'
import {defineStore} from 'pinia'
import {keysToCases, allPllKeys, resultsToEvalResults, evalResultsToNewQueue} from "@/scripts/pll_cases";
import {isPllLetter, allPllCaseNames, shuffle} from "@/scripts/helpers";
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

    allowedCrossColors: DefaultAllowedCrossColors,

    showResultsModal: false
}

export const useSessionStore = defineStore('session', () => {
    const store = reactive(JSON.parse(localStorage.getItem(storeKey)) || defaultStore)

    // Non-persisted: signals the most recent answer submission for UI feedback
    const lastSubmission = ref(null)

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
        store.showResultsModal = false
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

    const submitAnswer = (answer, fullNameMode = false) => {
        if (store.state !== GameState.Playing || !currentCase.value) {
            return
        }
        if (fullNameMode) {
            if (!allPllCaseNames.has(answer)) return
        } else {
            if (!isPllLetter(answer.toUpperCase())) return
            answer = answer.toUpperCase()
        }
        const isCorrect = fullNameMode ? currentCase.value.name === answer : currentCase.value.name[0] === answer
        // Signal feedback for on-screen keyboard (first attempt or correct retry)
        if (!store.mistake || isCorrect) {
            lastSubmission.value = { key: answer, type: isCorrect ? 'correct' : 'wrong' }
        }
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

    const giveUpOnCase = () => {
        if (store.mistake || !currentCase.value) return
        store.results.unshift({
            pllCase: currentCase.value,
            started: store.currentRecognitionStarted,
            finished: new Date(),
            mistake: "-"
        })
        store.mistake = "-"
    }

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

    return {store, currentCase, lastSubmission, setInitial,
        restartEvaluation, startPersonalized, setAllowedCrossColors,
        pausePlay, resumePlay, submitAnswer, giveUpOnCase}
});
