import { defineComponent, h } from 'vue'

export const LeafIcon = defineComponent({
  name: 'LeafIcon',
  setup() {
    return () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }, [
      h('path', {
        d: 'M6.5 21C4 18.5 3 15.5 3 12C3 8.5 4 5.5 6.5 3C9 5.5 10 8.5 10 12C10 15.5 9 18.5 6.5 21Z'
      }),
      h('path', {
        d: 'M17.5 21C15 18.5 14 15.5 14 12C14 8.5 15 5.5 17.5 3C20 5.5 21 8.5 21 12C21 15.5 20 18.5 17.5 21Z'
      })
    ])
  }
})

export const PeopleIcon = defineComponent({
  name: 'PeopleIcon',
  setup() {
    return () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }, [
      h('path', {
        d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'
      }),
      h('circle', {
        cx: '9',
        cy: '7',
        r: '4'
      }),
      h('path', {
        d: 'M23 21v-2a4 4 0 0 0-3-3.87'
      }),
      h('path', {
        d: 'M16 3.13a4 4 0 0 1 0 7.75'
      })
    ])
  }
})

export const ChartIcon = defineComponent({
  name: 'ChartIcon',
  setup() {
    return () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }, [
      h('line', {
        x1: '18',
        y1: '20',
        x2: '18',
        y2: '10'
      }),
      h('line', {
        x1: '12',
        y1: '20',
        x2: '12',
        y2: '4'
      }),
      h('line', {
        x1: '6',
        y1: '20',
        x2: '6',
        y2: '14'
      })
    ])
  }
}) 