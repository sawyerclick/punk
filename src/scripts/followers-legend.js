import * as d3 from 'd3'

const margin = { top: 50, left: 20, right: 20, bottom: 0 }
const height = 100 - margin.top - margin.bottom
const width = 200 - margin.left - margin.right

const svg = d3
  .select('#followers-legend')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', '100%')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const legend = svg
  .append('defs')
  .append('svg:linearGradient')
  .attr('id', 'gradient')
  .attr('x1', '0%')
  .attr('y1', '100%')
  .attr('x2', '100%')
  .attr('y2', '100%')
  .attr('spreadMethod', 'pad')

legend
  .append('stop')
  .attr('offset', '0%')
  .attr('stop-color', '#5580b6')
  .attr('stop-opacity', 1)
legend
  .append('stop')
  .attr('offset', '100%')
  .attr('stop-color', 'indianred')
  .attr('stop-opacity', 1)

svg
  .append('rect')
  .attr('width', width)
  .attr('height', height - 30)
  .style('fill', 'url(#gradient)')
  .attr('transform', 'translate(0,10)')

const xPositionScale = d3.scaleLinear().domain([138480, 1620189])

const xAxis = d3
  .axisBottom()
  .scale(xPositionScale)
  .ticks(4)
  .tickFormat(d3.format('.2s'))

svg
  .append('text')
  .attr('class', 'follower-text')
  .style('text-anchor', 'middle')
  .style('fill', 'lightgray')
  .style('font-weight', 600)
  .style('font-size', 16)
  .text('Average Followers')

svg
  .append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0,30)')
  .call(xAxis)

function render() {
  const svgContainer = svg.node().closest('div')
  const svgWidth = svgContainer.offsetWidth

  const svgHeight = height + margin.top + margin.bottom

  const actualSvg = d3.select(svg.node().closest('svg'))

  const newWidth = svgWidth - margin.left - margin.right

  actualSvg.attr('width', svgWidth).attr('height', svgHeight)

  // Update our scale
  xPositionScale.range([0, newWidth])

  // Update things you draw
  // house.attr('width', newWidth)
  svg.selectAll('rect').attr('width', newWidth)

  svg
    .select('.axis')
    .call(xAxis)
    .style('font-size', 12)

  svg
    .select('.follower-text')
    .attr('x', newWidth / 2)
    .attr('y', 0)
}

window.addEventListener('resize', render)

render()
