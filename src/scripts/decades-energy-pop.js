import * as d3 from 'd3'

const margin = { top: 80, left: 20, right: 20, bottom: 20 }
const height = 460 - margin.top - margin.bottom
const width = 400 - margin.left - margin.right

const svg = d3
  .select('#PopAndEnergy')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`)

const categories = {
  energy: 100,
  popularity: 100,
  length: 4,
  danceability: 100,
  valence: 100,
  loudness: -10
}

const radius = 150
const radiusScale = d3
  .scaleLinear()
  .domain([0, 50])
  .range([0, radius])

const angleScale = d3.scaleBand().range([0, Math.PI * 2])
const colorScale = d3.scaleLinear().range(['lightblue', 'indianred'])

// const xPositionScale = d3.scalePoint().range([radius, width - radius])

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => radiusScale(+d.popularity))
  .startAngle(d => angleScale(d.decade) + angleScale.bandwidth())
  .endAngle(d => angleScale(d.decade))

d3.csv(require('/data/song_features.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  console.log(datapoints)
  // xPositionScale.domain(Object.keys(slicedData))
  angleScale.domain(datapoints.map(d => d.decade))
  // console.log(angleScale.domain())
  const colorScaleDomain = datapoints.map(d => d.energy)
  colorScale.domain(d3.extent(colorScaleDomain))
  // console.log(colorScale.domain())
  // radiusScale.domain(d3.extent(datapoints.map(d => d.energy)))

  svg
    .selectAll('.features-chart')
    .data(datapoints)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d) {
      return colorScale(+d.energy)
    })
    .attr('fill-opacity', 1)
    .attr('stroke', 'none')

  svg
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 7)

  svg
    .selectAll('.decade-labels')
    .data(angleScale.domain())
    .enter()
    .append('text')
    .text(d => d)
    .attr('y', -radius - 25)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .style('font-size', 18)
    .style('font-weight', 400)
    .style('transform', function(d) {
      return `rotate(${angleScale(d) + 0.5}rad)`
    })
    .style('fill', 'lightgray')
    .lower()

  console.log(radiusScale.domain()[1])
  const bands = d3.range(0, radiusScale.domain()[1] + 10, 10)
  svg
    .selectAll('.band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('fill', 'none')
    .attr('stroke', 'silver')
    .style('stroke-dasharray', '15,10')
    .attr('stroke-opacity', 0.2)
    .lower()

  svg
    .selectAll('.band-text')
    .data(bands)
    .enter()
    .append('text')
    .text(d => d + '%')
    .attr('y', function(d) {
      return -radiusScale(d + 5)
    })
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .style('font-size', 12)
    .style('fill', 'silver')
    .style('opacity', 0.5)
    .lower()

  // svg.append('text').text(datapoints)
  // console.log(Object.keys(datapoints[0])[1])

  svg
    .append('text')
    .text('pop size, energy color')
    .attr('x', 0)
    .attr('y', -radius - 80)
    .style('font-size', 28)
    .style('fill', 'white')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
}
