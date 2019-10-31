import enterView from 'enter-view'
import * as d3 from 'd3'

enterView({
  selector: '.step',
  offset: 0.4,
  enter: function(element) {
    element.classList.add('entered')

    // Trigger stepin for current step
    d3.select(element).dispatch('stepin')
  },
  exit: function(element) {
    element.classList.remove('entered')

    // Trigger stepout for current step
    d3.select(element).dispatch('stepout')

    // Trigger stepin for previous step (if it exists)
    const previous = element.previousElementSibling
    if (previous && previous.classList.contains('step')) {
      d3.select(previous).dispatch('stepin')
    }
  }
})
