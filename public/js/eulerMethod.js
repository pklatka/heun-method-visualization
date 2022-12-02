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
                label: "Wykres rozwiązania równania y' = f(x,y)"
            }, {
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(0,0,255,0.5)",
                data: equationOY,
                label: "Wykres rozwiązania w wyniku działania metody Eulera dla równania y' = f(x,y)"
            },
            ]
        },
        options: {
            animation: {
                duration: 0
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'y(x)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'x'
                    }
                },
            }


        }
    });
}

// Use Euler's method
const calculateFunctionValues = async (equation, solution, a, b, y0, n) => {
    let h = (b - a) / n

    let eulerOX = [a]
    let eulerOY = [y0]
    let fnOY = [y0]

    for (let i = 0; i < n; i++) {
        // Calculate using Euler's method
        let xi = Number(eulerOX.at(-1))
        let yi = Number(eulerOY.at(-1))

        eulerOX.push((xi + h).toFixed(2))
        eulerOY.push(yi + (h * equation.evaluate({ x: xi, y: yi })))

        // // Calculate values using exact solution
        yi = fnOY.at(-1)
        fnOY.push(solution.evaluate({ x: xi + h }))
    }

    return { valuesOX: eulerOX, equationOY: eulerOY, solutionOY: fnOY }
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

// Draw's chart
const loadData = async () => {
    const { eq, sol, a, b, y0, n } = await getVariables()

    const { valuesOX, equationOY, solutionOY } = await calculateFunctionValues(eq, sol, a, b, y0, n)
    drawChart(valuesOX, equationOY, solutionOY)
}

// Get tags
const ctx = document.getElementById('myChart');
const loadDataButton = document.getElementById('loadData')
const increaseNButton = document.getElementById('increaseN')
const decreaseNButton = document.getElementById('decreaseN')
const hDynamicValueSpan = document.getElementById('h')
const nValueInput = document.getElementById('n')
const selectTag = document.getElementById('exampleEquations')

// Refresh data
loadDataButton.addEventListener('click', loadData)

// Increase n value
increaseNButton.addEventListener('click', async e => {
    const currentN = document.getElementById("n")
    currentN.value = Number(currentN.value) * 2

    // Update H value
    nValueInput.dispatchEvent(new Event("input"))

    await loadData()
})

// Decrease n value
decreaseNButton.addEventListener('click', async e => {
    const currentN = document.getElementById("n")
    currentN.value = Number(currentN.value) / 2

    // Update H value
    nValueInput.dispatchEvent(new Event("input"))

    await loadData()
})

// Update H value
nValueInput.addEventListener('input', e => {
    let range = document.getElementById("range").value
    range = range.slice(1, range.length - 1).split(",")
    const a = Number(range[0])
    const b = Number(range[1])

    hDynamicValueSpan.textContent = (b - a) / Number(e.target.value)
})

// Autofill example values
selectTag.addEventListener('change', e => {
    const option = document.getElementById(e.target.value)

    // Load option values
    document.getElementById("functionEquation").value = option.dataset.functionEquation
    document.getElementById("equationSolution").value = option.dataset.equationSolution
    document.getElementById("startingPoint").value = option.dataset.startingPoint
    document.getElementById("range").value = option.dataset.range
    document.getElementById("n").value = option.dataset.n

    // Update H value
    nValueInput.dispatchEvent(new Event("input"))

    // Refresh data
    loadData()
})

// Load default data
loadData()
