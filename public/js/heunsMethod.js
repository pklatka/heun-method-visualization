let epsilon = 0.1
let chart = null;

// Draw chart using chart.js library
const drawChart = async (valuesOX, equationOY, solutionOY) => {
    if (chart != null) {
        chart.destroy()
    }

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: valuesOX,
            datasets: [{
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(255,0,0,0.5)",
                data: solutionOY,
                label: "Rozwiązanie równania y' = f(x,y)",
                lineTension: 0
            }, {
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(0,0,255,0.5)",
                data: equationOY,
                label: "Rozwiązanie w wyniku działania metody numerycznej dla równania y' = f(x,y)",
                lineTension: 0
            },]
        },
        options: {
            pan: {
                enabled: true,
                mode: 'xy',
            },
            zoom: {
                enabled: true,
                mode: 'xy',
            },
            responsive: true,
            animation: false,
            tooltips: {
                mode: 'x'
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'y(x)'
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        type: 'linear',
                        display: true,
                        labelString: 'x'
                    }
                }],
            }
        }
    });
}

// Use Euler's method
const calculateFunctionValuesUsingEulersMethod = async (equation, solution, a, b, y0, n) => {
    let h = (b - a) / n

    let eulerOX = [a]
    let labelOX = [Number(Number(a).toFixed(2))]
    let eulerOY = [y0]
    let fnOY = [y0]

    for (let i = 0; i < n; i++) {
        // Calculate using Euler's method
        let xi = Number(eulerOX.at(-1))
        let yi = Number(eulerOY.at(-1))

        eulerOX.push(xi + h)
        eulerOY.push(yi + (h * equation.evaluate({ x: xi, y: yi })))

        // Calculate values using exact solution
        yi = fnOY.at(-1)
        fnOY.push(solution.evaluate({ x: xi + h }))

        // Add label
        labelOX.push(Number(Number(xi + h).toFixed(2)))
    }

    return { valuesOX: labelOX, equationOY: eulerOY, solutionOY: fnOY }
}

// Use Heun's method
const calculateFunctionValuesUsingHeunsMethod = async (equation, solution, a, b, y0, n) => {
    let h = (b - a) / n

    let heunOX = [a]
    let labelOX = [Number(Number(a).toFixed(2))]
    let heunOY = [y0]
    let fnOY = [y0]

    for (let i = 0; i < n; i++) {
        // Calculate using Heun's method
        let xi = Number(heunOX.at(-1))
        let yi = Number(heunOY.at(-1))

        heunOX.push(xi + h)

        let slopeLeft = equation.evaluate({ x: xi, y: yi })
        let slopeRight = equation.evaluate({ x: xi + h, y: yi + (h * slopeLeft) })
        heunOY.push(yi + (h / 2) * (slopeLeft + slopeRight))

        // Calculate values using exact solution
        yi = fnOY.at(-1)
        fnOY.push(solution.evaluate({ x: xi + h }))

        // Add label
        labelOX.push(Number(Number(xi + h).toFixed(2)))
    }

    return { valuesOX: labelOX, equationOY: heunOY, solutionOY: fnOY }
}

// Get variables from input tags, also parse equation using math.js library
const getVariables = async () => {
    const equation = document.getElementById("functionEquation").value
    const solution = document.getElementById("equationSolution").value
    let startingPoint = document.getElementById("startingPoint").value
    startingPoint = startingPoint.slice(1, startingPoint.length - 1).split(",")

    const x0 = Number(startingPoint[0])
    const y0 = Number(startingPoint[1])

    let range = document.getElementById("range").value
    range = range.slice(1, range.length - 1).split(",")
    const a = Number(range[0])
    const b = Number(range[1])

    const n = Number(document.getElementById("n").value)


    const node = math.parse(equation)
    const eq = node.compile()
    const node2 = math.parse(solution)
    const sol = node2.compile()

    return { eq, sol, a, b, y0, n }
}

// Draw chart
const loadData = async () => {
    const { eq, sol, a, b, y0, n } = await getVariables()
    // const { valuesOX, equationOY, solutionOY } = await calculateFunctionValuesUsingEulersMethod(eq, sol, a, b, y0, n)
    const { valuesOX, equationOY, solutionOY } = await calculateFunctionValuesUsingHeunsMethod(eq, sol, a, b, y0, n)

    // Check if all x values are smaller than epsilon, if true then don't update n value
    let metric = 0

    // Using maximum metric
    for (let i = 0; i < solutionOY.length; i++) {
        metric = Math.max(Math.abs(equationOY[i] - solutionOY[i]), metric)
    }

    if (metric < epsilon) {
        alertTrigger.dispatchEvent(new Event('click'))
        return false;
    }

    await drawChart(valuesOX, equationOY, solutionOY)
    return true;
}

// Get tags
const ctx = document.getElementById('myChart');
const loadDataButton = document.getElementById('loadData')
const increaseNButton = document.getElementById('increaseN')
const decreaseNButton = document.getElementById('decreaseN')
const hDynamicValueSpan = document.getElementById('h')
const nValueInput = document.getElementById('n')
const selectTag = document.getElementById('exampleEquations')
const epsilonValueTag = document.getElementById('epsilon')
const alertTrigger = document.querySelector('input[name="alertEpsilon"]')

// Refresh epsilon value every change
epsilonValueTag.addEventListener('change', e => epsilon = Number(e.target.value))

// Refresh data
loadDataButton.addEventListener('click', loadData)

// Increase n value
increaseNButton.addEventListener('click', async e => {
    const currentN = document.getElementById("n")
    currentN.value = Number(currentN.value) * 2

    // Update H value
    nValueInput.dispatchEvent(new Event("input"))

    const result = await loadData()
    if (!result) {
        currentN.value = Number(currentN.value) / 2
    }
})

// Decrease n value
decreaseNButton.addEventListener('click', async e => {
    const currentN = document.getElementById("n")
    currentN.value = Number(currentN.value) / 2

    // Update H value
    nValueInput.dispatchEvent(new Event("input"))

    const result = await loadData()
    if (!result) {
        currentN.value = Number(currentN.value) * 2
    }
})

// Update H value
nValueInput.addEventListener('input', async e => {
    let range = document.getElementById("range").value
    range = range.slice(1, range.length - 1).split(",")
    const a = Number(range[0])
    const b = Number(range[1])

    hDynamicValueSpan.textContent = (b - a) / Number(e.target.value)
})

// Autofill example values
selectTag.addEventListener('change', async e => {
    const option = document.getElementById(e.target.value)

    // Load option values
    document.getElementById("functionEquation").value = option.dataset.functionEquation
    document.getElementById("equationSolution").value = option.dataset.equationSolution
    document.getElementById("startingPoint").value = option.dataset.startingPoint
    document.getElementById("range").value = option.dataset.range
    document.getElementById("n").value = option.dataset.n
    epsilonValueTag.value = Number(option.dataset.epsilon)

    // Update H value
    nValueInput.dispatchEvent(new Event("input"))

    // Refresh data
    loadData()
})

// Load default data
loadData()
