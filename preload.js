/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const selectTag = document.getElementById('exampleEquations')
        const response = await fetch('./data/exampleEquations.json')
        const data = await response.json()

        data.examples.forEach((e, i) => {
            const optionChild = document.createElement('option')
            optionChild.value = `example${i}`
            optionChild.id = `example${i}`
            optionChild.textContent = e.title
            optionChild.dataset.functionEquation = e.functionEquation
            optionChild.dataset.equationSolution = e.equationSolution
            optionChild.dataset.startingPoint = e.startingPoint
            optionChild.dataset.range = e.range
            optionChild.dataset.n = e.n
            optionChild.dataset.epsilon = e.epsilon
            selectTag.appendChild(optionChild)
        })

        const alertTrigger = document.querySelector('input[name="alertEpsilon"]')
        alertTrigger.addEventListener('click', () => {
            ipcRenderer.invoke('show-error-box', 'Uwaga', 'Osiągnięto przybliżenie zgodne z zadanym epsilonem.')
        })
    } catch (error) {
        console.error(error)
    }
})