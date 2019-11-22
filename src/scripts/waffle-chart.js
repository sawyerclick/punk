import * as d3 from 'd3'

const waffle = d3.select('#waffle')

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

  // console.log(punk, rock, core, pop)
  // console.log(filtered)

  waffle
    .selectAll('.block')
    .data(filtered)
    .enter()
    .append('div')
    .attr('class', 'block')
    .style('background-color', '#C7493A')
    .attr('id', function(d) {
      if (d.key.search('punk') !== -1) {
        return 'punk'
      } else if (d.key.search('rock') !== -1) {
        return 'rock'
      } else if (d.key.search('core') !== -1) {
        return 'core'
      }
    })

  function selectButton(keyword, variable) {
    d3.select(`#${keyword}-button`).on('click', function(d) {
      waffle.selectAll('.block').style('background-color', '#C7493A')

      waffle.selectAll('.block').style('background-color', function(d, i) {
        if (i < variable) {
          return '#C7493A'
        } else {
          return '#CCCCCC'
        }
      })

      d3.select('.genre-count').text('')
      d3.select('.genre-count')
        .text(variable + ' genres')
        .style('visibility', 'visible')
        .attr('alignment-baseline', 'bottom')
        .attr('text-anchor', 'middle')
    })
  }

  selectButton('punk', punk)
  selectButton('rock', rock)
  selectButton('core', core)
  selectButton('pop', pop)
}
