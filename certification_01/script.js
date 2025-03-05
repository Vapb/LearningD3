// SVG
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
const height = 500
const width = 1100
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
    let dates = []
    let gdp = [] 
    data.data.forEach(row => {
        dates.push(new Date(row[0]))
        gdp.push(row[1])
    })
    return [dates, gdp]
}

function generateScales(dates, gdp) {
    xScale = d3.scaleTime()
                        .domain([d3.min(dates), d3.max(dates)])
                        .range([padding, width - padding]);

    yScale = d3.scaleLinear()
                        .domain([0, d3.max(gdp)])
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
        .call(yAxis)
}

function drawBars(data, dates, gdp) {
    let tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip')
                    //.style('opacity', 0)
                    .style('visibility', 'hidden')

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", "navy")
        .attr("class", "bar")
        .attr("x", (d, i) => xScale(dates[i]))
        .attr("y", (d, i) => yScale(gdp[i]))
        .attr("width", ((width - (2 * padding))/data.length))
        .attr("height", (d, i) => height - padding - yScale(gdp[i]))
        .attr("data-date", (d, i) => d[0])
        .attr("data-gdp", (d, i) => d[1])
        .on('mouseover', (e, d) => {
            tooltip.transition()
                //.duration(200).style('opacity', 0.9);
                .style('visibility', 'visible')

            tooltip.html(`${d[0]}` + '</br>' +  `${d[1]}`)
                .style('left', (event.pageX + 10) + 'px')  // Position near cursor
                .style('top', (event.pageY - 30) + 'px');  // Slightly above cursor
                
            document.querySelector('#tooltip').setAttribute('data-date', d[0])
        })
        .on('mouseout', (e, d) => {
            tooltip.style('visibility', 'hidden')
            //tooltip.transition().duration(200).style('opacity', 0);
        })

}

async function main() {
    console.log('Start Main');
    drawCanvas(width, height);
    let raw_dataset = await fetchData(url);
    let [dates, gdp] = prepareData(raw_dataset);
    generateScales(dates, gdp);
    generateAxes();
    drawBars(raw_dataset.data, dates, gdp);
}

main()