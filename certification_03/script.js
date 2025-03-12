// SVG
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
const height = 500;
const width = 1500;
const padding = 60;

let xScale
let yScale

let svg = d3.select('svg')


function drawCanvas(width, height) {
    svg.attr('width', width)
    svg.attr('height', height)
}

async function fetchData(url) {
    try {
        let response = await fetch(url);
        let dataset = await response.json();
        return dataset;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function prepareData(data) {
    let months = []
    let years = [] 
    let variances = []
    data['monthlyVariance'].forEach(row => {
        years.push(row['year'])
        months.push(row['month'])
        variances.push(row['variance'])
    })
    return [data['monthlyVariance'], years, months, variances]
}

function generateScales(years, months, variances) {
    xScale = d3.scaleLinear()
                .domain([d3.min(years), d3.max(years)])
                .range([padding, width - padding]);

    yScale = d3.scaleLinear()
                .domain([d3.min(months) - 1, d3.max(months)])
                .range([padding, height - padding]);

    colorScale = d3.scaleSequential()
                    .domain([d3.min(variances), d3.max(variances)])
                    .interpolator(d3.interpolateViridis);
}

function generateAxes() {
    let xAxis = d3.axisBottom(xScale);

    let yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate("+ padding + ",0)")
        .call(yAxis);
}

function drawBars(data, years, months, variances) {
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", "navy")
        .attr("class", "bar")
        .attr("x", (d, i) => xScale(years[i]))
        .attr("y", (d, i) => yScale(months[i] - 1))
        .attr("width", ((width - (2 * padding))/(data.length/12)))
        .attr("height", ((height - (2 * padding))/(12)))
        .attr("data-xvalue", (d, i) => years[i])
        .attr("data-yvalue", (d, i) => months[i])
        .style('fill', function (d, i) {
            return colorScale(variances[i])
        })
        ;
}


async function main() {
    console.log('Start Main');
    drawCanvas(width, height);
    let dataset = await fetchData(url);
    let [data, years, months, variances] = prepareData(dataset);
    console.log(data)
    generateScales(years, months, variances);
    generateAxes();
    drawBars(data, years, months, variances)
}

main()