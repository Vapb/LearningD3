// SVG
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
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
    let times = []
    let years = [] 
    data.forEach(row => {
        times.push(new Date(row['Seconds'] * 1000))
        years.push(row['Year'])
    })
    return [times, years]
}

function generateScales(times, years) {
    xScale = d3.scaleLinear()
                .domain([d3.min(years) - 1, d3.max(years)])
                .range([padding, width - padding]);

    yScale = d3.scaleTime()
                .domain([d3.min(times), d3.max(times)])
                .range([padding, height - padding]);
}

function generateAxes() {
    let xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format('d'));

    let yAxis = d3.axisLeft(yScale)
                  .tickFormat(d3.timeFormat("%M:%S"));

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate("+ padding + ",0)")
        .call(yAxis);
}

function drawDots(data, times, years) {
    let tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        //.style('opacity', 0)
        .style('visibility', 'hidden')

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
        .style('fill', function (d) {
            return color(d.Doping !== '');
        })
        .on('mouseover', (e, d) => {
            tooltip.transition()
                //.duration(200).style('opacity', 0.9);
                .style('visibility', 'visible')
                .style('background-color', () => color(d.Doping !== ''));

            tooltip.html(`${d.Year}` + '</br>' +  `${d.Time}`)
                .style('left', (event.pageX + 10) + 'px')  // Position near cursor
                .style('top', (event.pageY - 30) + 'px');  // Slightly above cursor
                
            document.querySelector('#tooltip').setAttribute('data-year', d.Year)
        })
        .on('mouseout', (e, d) => {
            tooltip.style('visibility', 'hidden')
            //tooltip.transition().duration(200).style('opacity', 0);
        })
}

function drawLegend() {
    let legendContainer = svg.append('g').attr('id', 'legend');
    
    let legend = legendContainer
        .selectAll('#legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend-label')
        .attr('transform', function (d, i) {
            return 'translate('+ (-padding) + ',' + (height / 2.5 - i * 20) + ')';
        });

    legend.append('rect')
        .attr('x', width - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

    legend.append('text')
        .attr('x', width - 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(function (d) {
            if (d) {
            return 'Riders with doping allegations';
            } else {
            return 'No doping allegations';
            }
        });

}



async function main() {
    console.log('Start Main');
    drawCanvas(width, height);
    let dataset = await fetchData(url);
    let [times, years] = prepareData(dataset);
    console.log(dataset)
    generateScales(times, years);
    generateAxes();
    drawDots(dataset, times, years);
    drawLegend();
}

main()