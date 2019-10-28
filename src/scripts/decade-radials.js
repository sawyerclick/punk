import * as d3 from 'd3'
import { objectTypeSpreadProperty } from '@babel/types'

const margin = { top: 20, left: 20, right: 20, bottom: 20 }
const height = 600 - margin.top - margin.bottom
const width = 600 - margin.left - margin.right

const svg = d3
  .select('#chart5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`)

const categories = {
  popularity: 100,
  energy: 100,
  length: 4,
  danceability: 100,
  valence: 100,
  loudness: -10
}

const radius = 120
const radiusScale = d3
  .scaleLinear()
  .domain([0, 1.1])
  .range([0, radius])

const angleScale = d3.scaleBand().range([0, Math.PI * 2])
const colorScale = d3.scaleLinear().range(['lightblue', 'pink'])

const xPositionScale = d3.scalePoint().range([radius, width - radius])

// const line = d3
//   .radialArea()
//   .angle(d => angleScale(d.name))
//   .innerRadius(0)
//   .outerRadius(d => radiusScale(+d.value))

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => radiusScale(+d.value))
  .startAngle(d => angleScale(d.name))
  .endAngle(d => angleScale(d.name) + angleScale.bandwidth())

d3.csv(require('/data/song_features.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  // console.log(datapoints)
  angleScale.domain(Object.keys(categories))

  const allDict = []
  function getData(data) {
    const decadeDict = []
    Object.entries(data).forEach(function(x) {
      // console.log(x)
      if (Object.keys(categories).includes(x[0])) {
        const attributeName = x[0]
        const attributeValue = +x[1] / categories[attributeName]
        decadeDict.push({
          name: attributeName,
          value: +attributeValue
        })
        // console.log(attributeName, attributeValue)
      }
      allDict.push(decadeDict)
    })
  }

  // console.log(datapoints[2].decade)
  getData(datapoints[2])
  const year19 = allDict[4]
  console.log(allDict[0])

  // svg
  //   .append('path')
  //   .datum(year19)
  //   .attr('d', line)
  //   .attr('fill', 'lightblue')
  //   .attr('fill-opacity', 0.9)
  //   .attr('stroke', 'none')
  //   .raise()

  svg
    .selectAll('.polar-bar')
    .data(year19)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d) {
      return colorScale(+d.value)
    })
    .attr('stroke', 'none')

  svg
    .selectAll('.polar-line')
    .data(angleScale.domain())
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', -radius)
    .attr('stroke', 'gray')
    .attr('stroke-opacity', 0.7)
    .style('stroke-dasharray', (2, 4))
    .style('transform', function(d) {
      return `rotate(${angleScale(d)}rad)`
    })

  svg
    .selectAll('.labels')
    .data(angleScale.domain())
    .enter()
    .append('text')
    .text(d => d)
    .attr('y', -radius)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .style('font-size', 14)
    .style('font-weight', 400)
    .style('transform', function(d) {
      return `rotate(${angleScale(d)}rad)`
    })
    .style('fill', 'gray')
    .lower()

  const bands = d3.range(0, radiusScale.domain()[1], 0.33)
  svg
    .selectAll('.band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('fill', 'none')
    .attr('stroke', 'silver')
    .lower()

  // create an array of lists with the different band values
  const bandText = []
  Object.entries(categories).forEach(function(d) {
    for (let a = 1; a < 4; a++) {
      bandText.push({ name: d[0], value: (d[1] / 3) * a })
    }
  })

  // nest it by the column name
  const nested = d3
    .nest()
    .key(d => d.name)
    .entries(bandText)

  // runs through each column and print the values
  for (let x = 0; x < nested.length; x++) {
    const datapoints = nested[x].values

    // to check the column name
    // console.log(datapoints[0].name)
    svg
      .selectAll('.labels')
      .data(datapoints)
      .enter()
      .append('text')
      .text(d => d3.format('.0f')(d.value))
      .attr('y', function(d) {
        return -radiusScale(d.value / datapoints[2].value - 0.07)
      })
      .attr('alignment-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .style('font-size', 14)
      .style('font-weight', 400)
      .style('transform', function(d) {
        return `rotate(${angleScale(d.name)}rad)`
      })
      .style('fill', 'gray')
      .lower()
  }
}
