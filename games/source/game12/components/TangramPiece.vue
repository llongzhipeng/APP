<template>
  <svg :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <path
      :d="shapePath"
      :fill="color"
      :opacity="opacity"
      stroke="#000"
      stroke-width="1"
    />
  </svg>
</template>

<script>
export default {
  name: 'TangramPiece',
  props: {
    pieceId: { type: String, required: true },
    color: { type: String, required: true },
    opacity: { type: Number, default: 1 },
  },
  computed: {
    shapePath() {
      const paths = {
        'p1': 'M 0,0 L 50,50 L 0,100 Z',
        'p2': 'M 50,50 L 100,0 L 100,100 Z',
        'p3': 'M 0,0 L 50,0 L 50,50 Z',
        'p4': 'M 50,0 L 75,25 L 50,50 Z',
        'p5': 'M 50,50 L 75,75 L 50,100 Z',
        'p6': 'M 75,25 L 100,0 L 100,50 L 75,75 Z',
        'p7': 'M 0,100 L 50,100 L 75,75 L 25,75 Z',
      }
      return paths[this.pieceId] || 'M 0,0'
    },
    viewBox() {
      const boxes = {
        'p1': '0 0 50 100',
        'p2': '50 0 50 100',
        'p3': '0 0 50 50',
        'p4': '50 0 25 50',
        'p5': '50 50 25 50',
        'p6': '75 0 25 75',
        'p7': '0 75 75 25',
      }
      return boxes[this.pieceId] || '0 0 100 100'
    }
  }
}
</script>
