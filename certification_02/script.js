// SVG
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
const height = 500;
const width = 1100;
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

function timeToFloat(timeStr) {
    let [hours, minutes] = timeStr.split(":").map(Number);
    return hours + minutes / 60;
}

function prepareData(data) {
    let times = []
    let years = [] 
    data.forEach(row => {
        times.push(60 - timeToFloat(row['Time']))
        years.push(row['Year'])
    })
    return [times, years]
}

function generateScales(times, years) {
    xScale = d3.scaleLinear()
                .domain([d3.min(years) - 1, d3.max(years)])
                .range([padding, width - padding]);

    yScale = d3.scaleLinear()
                .domain([d3.min(times), d3.max(times)])
                .range([height - padding, padding]);
}

function generateAxes() {
    let xAxis = d3.axisBottom(xScale)
    let yAxis = d3.axisLeft(yScale)

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate("+ padding + ",0)")
        .call(yAxis);
}

function drawBars(data, times, years) {
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('class', "dot")
        .attr('cx', (d, i) => xScale(years[i]))
        .attr('cy', (d, i) => yScale(times[i]))
        .attr('r', 5)
        .attr("data-xvalue", (d, i) => years[i])
        .attr("data-yvalue", (d, i) => times[i])
        .attr('fill', (item) => {
            if(item['URL'] === ""){
                return 'green'
            }else{
                return 'red'
            }
        })
}



async function main() {
    console.log('Start Main');
    drawCanvas(width, height);
    let dataset = await fetchData(url);
    let [times, years] = prepareData(dataset);
    console.log(dataset)
    generateScales(times, years);
    generateAxes();
    drawBars(dataset, times, years);
}

main()