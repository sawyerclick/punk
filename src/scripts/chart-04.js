import * as d3 from 'd3'
// var audio = d => song_preview)

// Build your SVG here
// using all of that cut-and-paste magic
const margin = { top: 50, right: 50, bottom: 50, left: 50 }
// var padding = { top: '25%', bottom: '25%' }
const width = 920 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

const svg = d3
  .select('#chart4')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Build your scales here
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([height, 0])

const colorBrewer = ['#33a02c', '#a6cee3', '#1f78b4', '#b2df8a', '#fb9a99']

d3.csv(require('/data/spotify_punk_playlists_post90s.csv'))
  .then(ready)
  .catch(function(err) {
    console.log('Failed with', err)
  })

function ready(datapoints) {
  const allDates = datapoints.map(d => d.song_release_date)
  xPositionScale.domain(d3.extent(allDates))

  const xAxis = d3.axisBottom(xPositionScale).ticks(5, 'Y')

  svg
    .append('g')
    .attr('class', 'axis x-axis axisWhite')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickSize(-width)
    .ticks(5)
    .tickFormat(d => d + '%')
    .tickPadding(10)

  svg
    .append('g')
    .attr('class', 'axis y-axis axisWhite')
    .call(yAxis)

  svg.selectAll('.y-axis path').remove()
  svg
    .selectAll('.y-axis line')
    .attr('stroke-dasharray', 2)
    .attr('stroke', '#333333')

  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('cy', d => yPositionScale(d.song_popularity))
    .attr('cx', d => xPositionScale(d.song_release_date))
    .attr('fill', function(d) {
      if (d.artist_name === 'Green Day') {
        return 'green'
      } else {
        return 'lightgray'
      }
    })
    .attr('r', function(d) {
      if (d.artist_name === 'Green Day') {
        return 5
      } else {
        return 2
      }
    })
    .attr('class', function(d) {
      if (d.artist_name === 'Green Day') {
        return 'greenday'
      } else {
        return 'other'
      }
    })
    .attr('fill-opacity', function(d) {
      if (d.artist_name === 'Green Day') {
        return 1
      } else {
        return 0.2
      }
    })
    .on('mouseover', function(d) {
      d3.select('.tooltip')
        .style('opacity', 0)
        .transition()
        .duration(350)
        .style('opacity', 0.9)
      d3.select('.tooltip')
        .style('opacity', 0)
        .html(
          d.song_release_date + '<br/>' + d.artist_name + '<br/>' + d.song_name
        )
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY - 28 + 'px')
      d3.select(this).attr('r', '9')
    })
    .on('mouseout', function(d) {
      d3.select('.tooltip')
        .transition()
        .duration(350)
        .style('opacity', 0)
      d3.select(this)
        .transition()
        .duration(350)
        .attr('r', function(d) {
          if (d.artist_name === 'Green Day') {
            return 5
          } else {
            return 2
          }
        })
    })
    .on('click', d => {
      if (audio) {
        audio.pause()
      }
      audio = new Audio(d.song_preview)
      return audio.play()
    })

  svg.selectAll('.greenday').raise()

  svg.selectAll('circle').on('click', d => {
    if (audio) {
      audio.pause()
    }
    audio = new Audio(d.song_preview)
    return audio.play()
  })
}
