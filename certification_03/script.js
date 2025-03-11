// SVG
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
const height = 500;
const width = 1100;
const padding = 60;

let xScale
let yScale

let svg = d3.select('svg')

let color = d3.scaleOrdinal(d3.schemeCategory10);

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
    data['monthlyVariance'].forEach(row => {
        years.push(row['year'])
        months.push(row['month'])
    })
    return [years, months]
}

function generateScales(years, months) {
    xScale = d3.scaleLinear()
                .domain([d3.min(years), d3.max(years)])
                .range([padding, width - padding]);

    yScale = d3.scaleLinear()
                .domain([d3.min(months), d3.max(months)])
                .range([padding, height - padding]);
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



async function main() {
    console.log('Start Main');
    drawCanvas(width, height);
    let dataset = await fetchData(url);
    let [years, months] = prepareData(dataset);
    generateScales(years, months);
    generateAxes();
}

main()