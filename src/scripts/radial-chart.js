import * as d3 from 'd3'

const margin = { top: 100, left: 20, right: 20, bottom: 20 }
const height = 550 - margin.top - margin.bottom
const width = 500 - margin.left - margin.right

const svg = d3
  .select('#radial-chart')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`)

const radius = width / 2.2
const radiusScale = d3
  .scaleLinear()
  .domain([0, 750])
  .range([0, radius])

const angleScale = d3.scaleBand().range([0, Math.PI * 2])
const colorScale = d3.scaleLinear().range(['#5580b6', 'indianred'])

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => radiusScale(+d.count))
  .startAngle(d => angleScale(d.decade) + angleScale.bandwidth())
  .endAngle(d => angleScale(d.decade))

const t = d3
  .transition()
  .duration(800)
  .ease(d3.easeQuadInOut)

Promise.all([
  d3.csv(require('/data/decades_in_playlists_counts.csv')),
  d3.csv(require('/data/song_features.csv'))
])
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready([decadeCount, songFeatures]) {
  // console.log(decadeCount)

  angleScale.domain(decadeCount.map(d => d.decade))
  const colorScaleDomain = decadeCount.map(d => +d.artist_followers)
  colorScale.domain([d3.min(colorScaleDomain), d3.max(colorScaleDomain)])

  svg
    .selectAll('.features-chart')
    .data(decadeCount)
    .enter()
    .append('path')
    .attr('class', 'decade-wedge')
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
    .attr('class', 'decade-labels')
    .attr('y', -radius / 2)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .style('font-size', 18)
    .style('font-weight', 400)
    .style('transform', function(d) {
      return `rotate(${angleScale(d) + 0.45}rad)`
    })
    .style('fill', 'silver')
    .raise()

  const bands = d3.range(
    0,
    radiusScale.domain()[1] + 10,
    radiusScale.domain()[1] / 3
  )

  svg
    .selectAll('.band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('class', 'band')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', d => radiusScale(d))
    .style('fill', 'none')
    .style('stroke', 'gray')
    .style('stroke-dasharray', '10,15')
    .lower()

  svg
    .selectAll('.band-text')
    .data(bands)
    .enter()
    .append('text')
    .attr('class', 'band-text')
    .text(function(d) {
      if (d === 750) {
        return d + ' songs'
      } else {
        return null
      }
    })
    .attr('y', function(d) {
      return -radiusScale(d)
    })
    .attr('dy', -10)
    .attr('dx', -5)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .style('font-size', 12)
    .style('fill', 'silver')
    .style('opacity', 0.5)
    .lower()

  /* 
  Buttons to click and scrollys to tell
  */

  d3.select('#decade-count-step').on('stepin', function() {
    // console.log('step 1')

    // reset scales
    radiusScale.domain([0, 750])
    const colorScaleDomain = decadeCount.map(d => +d.artist_followers)
    colorScale.domain(d3.extent(colorScaleDomain))
    // console.log(d3.extent(colorScaleDomain))

    // reset the arc
    arc.outerRadius(d => radiusScale(+d.count))

    // redraw everything but the bands and decade labels
    svg
      .selectAll('.decade-wedge')
      .data(decadeCount)
      .transition()
      .duration(800)
      .ease(d3.easeQuadInOut)
      .attr('d', arc)
      .attr('fill', d => colorScale(+d.artist_followers))

    const bands = d3.range(
      0,
      radiusScale.domain()[1] + 10,
      radiusScale.domain()[1] / 3
    )

    svg
      .selectAll('.band')
      .data(bands)
      .attr('r', d => radiusScale(d))

    svg
      .selectAll('.band-text')
      .data(bands)
      .text(function(d) {
        if (d === 750) {
          return d + ' songs'
        } else {
          return null
        }
      })
      .attr('y', function(d) {
        return -radiusScale(d)
      })
    // .attr('dy', -10)
  })

  d3.select('#decade-energy-step').on('stepin', function() {
    // console.log('step 2')

    // re-do scales
    radiusScale.domain([0, 50])
    const colorScaleDomain = songFeatures.map(d => +d.energy)
    colorScale.domain(d3.extent(colorScaleDomain))

    // re-do arc
    arc.outerRadius(d => radiusScale(+d.popularity))

    svg
      .selectAll('.decade-wedge')
      .data(songFeatures)
      .transition()
      .duration(800)
      .ease(d3.easeQuadInOut)
      .attr('d', arc)
      .attr('fill', d => colorScale(+d.energy))

    const bands = d3.range(
      0,
      radiusScale.domain()[1] + 10,
      radiusScale.domain()[1] / 3
    )

    svg
      .selectAll('.band')
      .data(bands)
      .attr('r', d => radiusScale(d))

    svg
      .selectAll('.band-text')
      .data(bands)
      .text(function(d) {
        if (d === 50) {
          return d3.format('.0f')(d) + '% popularity'
        } else {
          return d3.format('.1f')(d) + '%'
        }
      })
      .attr('y', function(d) {
        return -radiusScale(d)
      })
  })

  function render() {
    // standardize the transitions
    const t = d3
      .transition()
      .duration(800)
      .ease(d3.easeQuadInOut)

    const svgContainer = svg.node().closest('div')
    const svgWidth = svgContainer.offsetWidth

    const svgHeight = svgContainer.offsetHeight

    const actualSvg = d3.select(svg.node().closest('svg'))
    actualSvg.attr('width', svgWidth).attr('height', svgHeight)

    const newWidth = svgWidth - margin.left - margin.right

    svg.attr('transform', `translate(${newWidth / 2},${svgHeight / 3})`)

    function newRadius() {
      if (window.innerWidth < 900) {
        return newWidth / 2.32
      } else {
        return newWidth / 2
      }
    }

    // Update our scale
    radiusScale.range([0, newRadius()])

    // Update things you draw
    svg
      .selectAll('.decade-wedge')
      .transition()
      .attr('d', arc)
    svg.selectAll('.band').attr('r', d => radiusScale(d))
    svg.selectAll('.band-text').attr('y', d => -radiusScale(d))
    svg.selectAll('.decade-labels').attr('y', -newRadius() / 2)
  }

  window.addEventListener('resize', render)

  render()
}
