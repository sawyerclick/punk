import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

let audio = null

const margin = { top: 50, left: 130, right: 130, bottom: 60 }
const height = 600 - margin.top - margin.bottom
const width = 750 - margin.left - margin.right

const svg = d3
  .select('#beeswarm')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const keys = ['Valence', 'Danceability', 'Energy', 'Popularity']
const colorScaleKeys = d3
  .scaleOrdinal()
  .domain(['Valence', 'Danceability', 'Energy', 'Popularity'])
  .range(['#5CDB95', '#C7493A', '#dbc269', '#566fa3'])

// Build your scales here
const xPositionScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, width])

const yPositionScale = d3
  .scaleOrdinal()
  .range([height * 0.3, height * 0.45, height * 0.6, height * 0.75])

const colorScale = d3
  .scaleOrdinal()
  .range(['#566fa3', '#dbc269', '#C7493A', '#5CDB95'])

d3.csv(require('/data/spotify_punk_playlists.csv'))
  .then(ready)
  .catch(function(err) {
    console.log('Failed with', err)
  })

function ready(datapoints) {
  d3.select('i').on('click', function() {
    if (audio) {
      audio.pause()
    }
  })

  // cleaning up the data
  const valences = datapoints.map(d => ({
    ...d,
    category: 'valence',
    amount: d.valence
  }))
  const danceabilities = datapoints.map(d => ({
    ...d,
    category: 'danceability',
    amount: d.danceability
  }))
  const energies = datapoints.map(d => ({
    ...d,
    category: 'energy',
    amount: d.energy
  }))
  const popularities = datapoints.map(d => ({
    ...d,
    category: 'popularity',
    amount: d.song_popularity
  }))

  const merged = popularities.concat(energies, danceabilities, valences)

  svg
    .append('line')
    .attr('class', 'even-line')
    .attr('x1', width / 2)
    .attr('x2', width / 2)
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', 'whitesmoke')
    .attr('stroke-dasharray', '10,20')

  const graph = svg
    .selectAll('categories')
    .data(merged)
    .enter()
    .append('circle')
    .attr('cy', d => yPositionScale(d.category))
    .attr('cx', d => xPositionScale(+d.amount))
    .attr('fill', d => colorScale(d.category))
    .attr('fill-opacity', 0.8)
    .attr('r', 2)
    .attr('class', d => 'id-' + d.id)
    .attr('id', d => 'column-' + d.category)

  // d3-force
  const simulation = d3
    .forceSimulation()
    .force('x', d3.forceX(d => xPositionScale(+d.amount)).strength(0.6))
    .force('y', d3.forceY(d => yPositionScale(d.category)).strength(0.2))
    .force('charge', d3.forceManyBody().strength(-1.5))
    .force('collide', d3.forceCollide(3))

  function ticked() {
    graph.attr('cx', d => d.x).attr('cy', d => d.y)
  }

  // audio and interactives
  svg
    .selectAll('circle')
    .on('mouseover', function(d) {
      d3.select('.songbox .band')
        .text('')
        .append()
        .text(d.artist_name)
        .style('font-family', 'Open Sans')
      d3.select('.songbox .song')
        .text('')
        .append()
        .text(d.song_name)
        .style('font-family', 'Open Sans')
      svg.selectAll('.id-' + d.id).attr('r', 15)
    })
    .on('mouseout', function() {
      svg.selectAll('circle').attr('r', 2)
    })
    .on('click', function(d) {
      svg.selectAll('circle').attr('r', 2)
      svg.selectAll('.id-' + d.id).attr('r', 15)

      if (audio) {
        audio.pause()
      }
      audio = new Audio(d.song_preview)
      return audio.play()
    })

  // text
  svg
    .append('text')
    .text('← less')
    .attr('class', 'less')
    .attr('x', xPositionScale(38))
    .attr('y', -25)
    .style('font-size', 18)
    .attr('fill', 'whitesmoke')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')

  svg
    .append('text')
    .text('50%')
    .attr('class', 'even')
    .attr('x', xPositionScale(50))
    .attr('y', -25)
    .style('font-size', 18)
    .attr('fill', 'whitesmoke')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')

  svg
    .append('text')
    .text('more →')
    .attr('class', 'more')
    .attr('x', xPositionScale(62))
    .attr('y', -25)
    .style('font-size', 18)
    .attr('fill', 'whitesmoke')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')

  function render() {
    const svgContainer = svg.node().closest('div')
    const svgWidth = svgContainer.offsetWidth

    const actualSvg = d3.select(svg.node().closest('svg'))
    actualSvg.attr('width', svgWidth)

    // fix label positioning + run simulation if bigger
    if (svgWidth > 550) {
      const newWidth = svgWidth - margin.right - margin.left

      xPositionScale.range([0, newWidth])

      // divider line
      svg
        .select('.even-line')
        .attr('x1', newWidth / 2)
        .attr('x2', newWidth / 2)

      // circles
      svg.selectAll('circle').attr('cx', d => xPositionScale(+d.amount))

      // annotations
      svg.select('.less').attr('x', xPositionScale(38))
      svg.select('.even').attr('x', xPositionScale(50))
      svg.select('.more').attr('x', xPositionScale(62))

      // the force is with me
      simulation.nodes(merged).on('tick', ticked)
    } else {
      // margin.right = 20
      // margin.left = 20
      const newWidth = svgWidth - margin.right - margin.left

      xPositionScale.range([0, newWidth])

      // divider line
      svg
        .select('.even-line')
        .attr('x1', newWidth / 2)
        .attr('x2', newWidth / 2)

      // circles
      svg
        .selectAll('circle')
        .attr('cx', d => xPositionScale(+d.amount))
        .attr('r', 1)
      // annotations
      svg.select('.less').attr('x', xPositionScale(-20))
      svg.select('.even').attr('x', xPositionScale(50))
      svg.select('.more').attr('x', xPositionScale(120))

      simulation.force('collide', d3.forceCollide(1))
      simulation.nodes(merged).on('tick', ticked)
    }
  }

  d3.select(window).on('resize', render)
  render()
}
