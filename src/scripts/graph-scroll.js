;(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('d3'))
    : typeof define === 'function' && define.amd
    ? define(['exports', 'd3'], factory)
    : factory((global.d3 = global.d3 || {}), global.d3)
})(this, function(exports, d3) {
  'use strict'

  function graphScroll() {
    let windowHeight
    const dispatch = d3.dispatch('scroll', 'active')
    let sections = d3.select('null')
    let i = NaN
    let sectionPos = []
    let n
    let graph = d3.select('null')
    let isFixed = null
    let isBelow = null
    let container = d3.select('body')
    let containerStart = 0
    let belowStart
    let eventId = Math.random()
    let offset = 0

    function reposition() {
      let i1 = 0
      sectionPos.forEach(function(d, i) {
        if (d < pageYOffset - containerStart + offset) i1 = i
      })
      i1 = Math.min(n - 1, i1)
      if (i != i1) {
        sections.classed('graph-scroll-active', function(d, i) {
          return i === i1
        })

        dispatch.call('active', null, i1)

        i = i1
      }

      const isBelow1 = pageYOffset > belowStart
      if (isBelow != isBelow1) {
        isBelow = isBelow1
        graph.classed('graph-scroll-below', isBelow)
      }
      const isFixed1 = !isBelow && pageYOffset > containerStart
      if (isFixed != isFixed1) {
        isFixed = isFixed1
        graph.classed('graph-scroll-fixed', isFixed)
      }
    }

    function resize() {
      sectionPos = []
      let startPos
      sections.each(function(d, i) {
        if (!i) startPos = this.getBoundingClientRect().top
        sectionPos.push(this.getBoundingClientRect().top - startPos)
      })

      const containerBB = container.node().getBoundingClientRect()
      const graphBB = graph.node().getBoundingClientRect()

      containerStart = containerBB.top + pageYOffset
      belowStart = containerBB.bottom - graphBB.height + pageYOffset
    }

    function keydown() {
      if (!isFixed) return
      let delta
      switch (d3.event.keyCode) {
        case 39: // right arrow
          if (d3.event.metaKey) return
        case 40: // down arrow
        case 34: // page down
          delta = d3.event.metaKey ? Infinity : 1
          break
        case 37: // left arrow
          if (d3.event.metaKey) return
        case 38: // up arrow
        case 33: // page up
          delta = d3.event.metaKey ? -Infinity : -1
          break
        case 32: // space
          delta = d3.event.shiftKey ? -1 : 1
          break
        default:
          return
      }

      const i1 = Math.max(0, Math.min(i + delta, n - 1))
      d3.select(document.documentElement)
        .interrupt()
        .transition()
        .duration(500)
        .tween('scroll', function() {
          const i = d3.interpolateNumber(
            pageYOffset,
            sectionPos[i1] + containerStart
          )
          return function(t) {
            scrollTo(0, i(t))
          }
        })

      d3.event.preventDefault()
    }

    const rv = {}

    rv.container = function(_x) {
      if (!_x) return container

      container = _x
      return rv
    }

    rv.graph = function(_x) {
      if (!_x) return graph

      graph = _x
      return rv
    }

    rv.eventId = function(_x) {
      if (!_x) return eventId

      eventId = _x
      return rv
    }

    rv.sections = function(_x) {
      if (!_x) return sections

      sections = _x
      n = sections.size()

      d3.select(window)
        .on('scroll.gscroll' + eventId, reposition)
        .on('resize.gscroll' + eventId, resize)
        .on('keydown.gscroll' + eventId, keydown)

      resize()
      d3.timer(function() {
        reposition()
        return true
      })

      return rv
    }

    rv.on = function() {
      const value = dispatch.on.apply(dispatch, arguments)
      return value === dispatch ? rv : value
    }

    rv.offset = function(_x) {
      if (!_x) return rv

      offset = _x
      return rv
    }

    return rv
  }

  exports.graphScroll = graphScroll

  Object.defineProperty(exports, '__esModule', { value: true })
})
