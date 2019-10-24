/* 
	I've created a function here that is a simple d3 chart.
	This could be anthing that has discrete steps, as simple as changing
	the background color, or playing/pausing a video.
	The important part is that it exposes and update function that
	calls a new thing on a scroll trigger.
*/

import * as d3 from 'd3'
import { graphScroll } from 'graph-scroll'

function graphscroll() {
  // select elements using d3 here since this is a d3 library...
  const graphicEl = d3.select('.graphic')
  const graphicVisEl = graphicEl.select('.graphic__vis')
  const triggerEls = graphicEl.selectAll('.trigger')

  // viewport height
  const viewportHeight = window.innerHeight
  const halfViewportHeight = viewportHeight / 2

  // a global function creates and handles all the vis + updates
  const graphic = createGraphic('.graphic')

  // this is it, graph-scroll handles pretty much everything
  // it will automatically add class names to the elements,
  // so you just need to handle the fixed positions with css
  graphScroll()
    .container(graphicEl)
    .graph(graphicVisEl)
    .sections(triggerEls)
    .offset(halfViewportHeight)
    .on('active', function(i) {
      graphic.update(i)
    })
}

window.createGraphic = function(graphicSelector) {
  const graphicEl = d3.select('.graphic')
  const graphicVisEl = graphicEl.select('.graphic__vis')
  const graphicProseEl = graphicEl.select('.graphic__prose')

  const margin = 20
  const size = 400
  const chartSize = size - margin * 2
  let scaleX = null
  let scaleR = null
  const data = [8, 6, 7, 5, 3, 0, 9]
  const extent = d3.extent(data)
  const minR = 10
  const maxR = 24

  // actions to take on each step of our scroll-driven story
  const steps = [
    function step0() {
      // circles are centered and small
      const t = d3
        .transition()
        .duration(800)
        .ease(d3.easeQuadInOut)

      const item = graphicVisEl.selectAll('.item')

      item
        .transition(t)
        .attr('transform', translate(chartSize / 2, chartSize / 2))

      item
        .select('circle')
        .transition(t)
        .attr('r', minR)

      item
        .select('text')
        .transition(t)
        .style('opacity', 0)
    },

    function step1() {
      const t = d3
        .transition()
        .duration(800)
        .ease(d3.easeQuadInOut)

      // circles are positioned
      const item = graphicVisEl.selectAll('.item')

      item.transition(t).attr('transform', function(d, i) {
        return translate(scaleX(i), chartSize / 2)
      })

      item
        .select('circle')
        .transition(t)
        .attr('r', minR)

      item
        .select('text')
        .transition(t)
        .style('opacity', 0)
    },

    function step2() {
      const t = d3
        .transition()
        .duration(800)
        .ease(d3.easeQuadInOut)

      // circles are sized
      const item = graphicVisEl.selectAll('.item')

      item
        .select('circle')
        .transition(t)
        .delay(function(d, i) {
          return i * 200
        })
        .attr('r', function(d, i) {
          return scaleR(d)
        })

      item
        .select('text')
        .transition(t)
        .delay(function(d, i) {
          return i * 200
        })
        .style('opacity', 1)
    }
  ]

  // update our chart
  function update(step) {
    steps[step].call()
  }

  // little helper for string concat if using es5
  function translate(x, y) {
    return 'translate(' + x + ',' + y + ')'
  }

  function setupCharts() {
    const svg = graphicVisEl
      .append('svg')
      .attr('width', size + 'px')
      .attr('height', size + 'px')

    const chart = svg
      .append('g')
      .classed('chart', true)
      .attr('transform', 'translate(' + margin + ',' + margin + ')')

    scaleR = d3.scaleLinear()
    scaleX = d3.scaleBand()

    const domainX = d3.range(data.length)

    scaleX
      .domain(domainX)
      .range([0, chartSize])
      .padding(1)

    scaleR.domain(extent).range([minR, maxR])

    const item = chart
      .selectAll('.item')
      .data(data)
      .enter()
      .append('g')
      .classed('item', true)
      .attr('transform', translate(chartSize / 2, chartSize / 2))

    item
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)

    item
      .append('text')
      .text(function(d) {
        return d
      })
      .attr('y', 1)
      .style('opacity', 0)
  }

  function setupProse() {
    const height = window.innerHeight * 0.5
    graphicProseEl.selectAll('.trigger').style('height', height + 'px')
  }

  function init() {
    setupCharts()
    setupProse()
    update(0)
  }

  init()

  return {
    update: update
  }
}

graphscroll()
