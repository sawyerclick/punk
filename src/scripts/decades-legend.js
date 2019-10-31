import * as d3 from 'd3'

const margin = { top: 0, left: 2, right: 10, bottom: 0 }
const height = 50 - margin.top - margin.bottom
const width = 200 - margin.left - margin.right

const key = d3
  .select('#decades-legend')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const legend = key
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
  .attr('stop-color', '#C7493A')
  .attr('stop-opacity', 1)

key
  .append('rect')
  .attr('width', width)
  .attr('height', height - 30)
  .style('fill', 'url(#gradient)')
  .attr('transform', 'translate(0,10)')

const x = d3
  .scaleLinear()
  .range([width, 0])
  .domain([750, 0])

const xAxis = d3
  .axisBottom()
  .scale(x)
  .tickValues([0, 250, 500, 750])

key
  .append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0,30)')
  .call(xAxis)
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', 0)
  .attr('dy', '.71em')
  .style('text-anchor', 'end')
  .text('axis title')
