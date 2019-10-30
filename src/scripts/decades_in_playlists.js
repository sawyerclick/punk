import * as d3 from 'd3'

const margin = { top: 0, left: 20, right: 20, bottom: 20 }
const height = 460 - margin.top - margin.bottom
const width = 400 - margin.left - margin.right

const svg = d3
  .select('#DecadesInPlaylists')
  .append('svg')
  .attr('class', 'sticky')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`)

const radius = 150
const radiusScale = d3
  .scaleLinear()
  .domain([0, 750])
  .range([0, radius])

const angleScale = d3.scaleBand().range([0, Math.PI * 2])
const colorScale = d3.scaleLinear().range(['#5580b6', '#C7493A'])

// const xPositionScale = d3.scalePoint().range([radius, width - radius])

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => radiusScale(+d.count))
  .startAngle(d => angleScale(d.decade) + angleScale.bandwidth())
  .endAngle(d => angleScale(d.decade))

d3.csv(require('/data/decades_in_playlists_counts.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  console.log(datapoints)
  angleScale.domain(datapoints.map(d => d.decade))
  // console.log(angleScale.domain())
  const colorScaleDomain = datapoints.map(d => d.artist_followers)
  colorScale.domain([d3.min(colorScaleDomain), d3.max(colorScaleDomain)])
  // console.log(colorScale.domain())
  // radiusScale.domain(d3.extent(datapoints.map(d => d.energy)))

  svg
    .selectAll('.features-chart')
    .data(datapoints)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d) {
      return colorScale(+d.artist_followers)
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
    .attr('y', -radius + 80)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .style('font-size', 18)
    .style('font-weight', 400)
    .style('transform', function(d) {
      return `rotate(${angleScale(d) + 0.5}rad)`
    })
    .style('fill', 'silver')
    .raise()

  console.log(radiusScale.domain()[1])
  const bands = d3.range(0, radiusScale.domain()[1] + 10, 250)
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
    .text(function(d) {
      if (d === 750) {
        return d + ' songs'
      } else {
        return null
      }
    })
    .attr('y', function(d) {
      return -radiusScale(d + 75)
    })
    .attr('dx', -5)
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
    .text('New Artists, No Fans')
    .attr('x', 0)
    .attr('y', -radius - 60)
    .style('font-size', 20)
    .style('font-weight', 700)
    .style('fill', '#ADD8E6')
    .style('fill-opacity', 0.9)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
}
