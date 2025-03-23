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

function generateScales(years) {
    xScale = d3.scaleLinear()
                .domain([d3.min(years), d3.max(years)+ 1])
                .range([padding, width - padding]);

    yScale = d3.scaleTime()
                .domain([new Date(0,0,0,0,0,0,0), new Date(0,12,0,0,0,0,0)])
                .range([padding, height - padding]);
}

function colorScale(variance){
    if (variance <= -1) {
        return 'SteelBlue'
    }else if (variance <= 0) {
        return 'LightSteelBlue'
    }else if (variance <= 1) {
        return 'Orange'
    }else {
        return 'Crimson'   
    }
}

function generateAxes() {
    let xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format('d'));

    let yAxis = d3.axisLeft(yScale)
                  .tickFormat(d3.timeFormat('%B'));

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate("+ padding + ",0)")
        .call(yAxis);
}

function drawCells(data, baseTemp) {
    let tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden')

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", "navy")
        .attr("class", "cell")
        .attr("x", (d, i) => xScale(d['year']))
        .attr("y", (d, i) => yScale(new Date(0, d['month'] - 1, 0,0,0,0,0)))
        .attr("width", ((width - (2 * padding))/(data.length/12)))
        .attr("height", ((height - (2 * padding))/(12)))
        .attr("data-month", (d, i) => d['month'] - 1)
        .attr("data-year", (d, i) => d['year'])
        .attr("data-temp", (d, i) => baseTemp + d['variance'])
        .style('fill', function (d, i) {
            return colorScale(d['variance'])
        })
        .on('mouseover', (e, d) => {
            tooltip.transition()
                .style('visibility', 'visible');

            let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            tooltip.html(`${d['year']} ${monthNames[d['month'] -1]}` + '</br>' +  `Variance : ${d['variance']}`+ '</br>'+  `Temperature : ${baseTemp + d['variance']}`)
                .style('left', (event.pageX + 10) + 'px')  // Position near cursor
                .style('top', (event.pageY - 30) + 'px');  // Slightly above cursor
                
            tooltip.attr('data-year', d['year'])

        })
        .on('mouseout', (e, d) => {
            tooltip.style('visibility', 'hidden')
            //tooltip.transition().duration(200).style('opacity', 0);
        })
        ;
}


async function main() {
    console.log('Start Main');
    drawCanvas(width, height);
    let dataset = await fetchData(url);
    let baseTemp = dataset['baseTemperature']
    let [data, years, months, variances] = prepareData(dataset);
    console.log(data)
    generateScales(years);
    generateAxes();
    drawCells(data, baseTemp)
}

main()