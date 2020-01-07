import * as d3 from 'd3'
import d3Annotation from 'd3-svg-annotation'

const svg = d3.select('#div-chart')

d3.csv(require('/data/genres_dict.csv'))
  .then(ready)
  .catch(function(err) {
    console.log('Failed with', err)
  })

function ready(datapoints) {
  // nested based on the genre name
  const nested = d3
    .nest()
    .key(d => d.genre)
    .entries(datapoints)

  // sorting it based on the number of times the genre appears
  const sorted = nested.sort(function(a, b) {
    return d3.descending(a.values.length, b.values.length)
  })

  // getting rid of the [''] genre
  const filtered = sorted.filter(function(d) {
    if (d.key !== ['']) {
      return d.key
    }
  })

  let punk = 0
  let rock = 0
  let core = 0
  let pop = 0

  filtered.forEach(function(d) {
    if (d.key.search('punk') !== -1) {
      return (punk = punk + 1)
    } else if (d.key.search('rock') !== -1) {
      return (rock = rock + 1)
    } else if (d.key.search('core') !== -1) {
      return (core = core + 1)
    } else if (d.key.search('pop') !== -1) {
      return (pop = pop + 1)
    }
  })

  const topDatapoints = filtered.slice(0, 25)
  // console.log(topDatapoints)

  const group = svg
    .selectAll('.group')
    .data(topDatapoints)
    .enter()
    .append('div')
    .attr('class', 'group')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('margin', '0 0.5rem')

  group
    .selectAll('.div-block')
    .data(d => d.values)
    .enter()
    .append('div')
    .attr('class', function(d) {
      return 'div-block ' + d.genre.replace(/[^a-z]*/g, '')
    })
    .style('background-color', '#C7493A')
    .attr('id', d => d.artist)
  // .on('mouseover', function(d) {
  //   d3.select(this).style('background', '#444')
  // })
  // .on('mouseout', function(d) {
  //   d3.select(this).style('background', '#C7493A')
  // })

  d3.select('.poppunk')
    .append('text')
    .text(
      'Pop punk is the most popular genre among the songs in the playlists, above even punk itself'
    )
    .attr('id', 'step-poppunk')
    .style('color', 'white')
    .style('position', 'absolute')
    .style('width', '50%')
    .style('padding', '0 10%')

  d3.select('#step-poppunk').on('stepin', function(d) {
    d3.selectAll('.poppunk').style('background-color', 'white')
  })

  // group
  //   .append('text')
  //   .text(d => d.key)
  //   // .style('position', 'absolute')
  //   .style('color', 'whitesmoke')
  //   .attr('alignment-baseline', 'bottom')
  //   .attr('text-anchor', 'bottom')
  //   .style('font-size', 12)
}
