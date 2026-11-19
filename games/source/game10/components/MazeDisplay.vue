<template>
  <!-- Responsive wrapper: always fills available space -->
  <div class="maze-outer" ref="outerEl">
    <svg
      v-if="maze"
      :viewBox="`0 0 ${svgW} ${svgH}`"
      class="maze-svg"
      @click="handleSvgClick"
    >
      <!-- ── Grid of images (each cell is an image) ── -->
      <g v-for="r in maze.gridSize" :key="`row${r}`">
        <g v-for="c in maze.gridSize" :key="`cell${r}-${c}`">
          <image
            :x="cx(c-1)" :y="cy(r-1)"
            :width="CS + 5" :height="CS + 5"
            :href="getCellImage(r-1, c-1)"
            preserveAspectRatio="none"
          />
        </g>
      </g>

      <!-- ── Player-traced cells (overlay) ── -->
      <g v-for="(cell, idx) in maze.path" :key="`p${idx}`">
        <rect
          v-if="playerVisited.has(idx)"
          :x="cx(cell.c)" :y="cy(cell.r)"
          :width="CS" :height="CS"
          fill="rgba(25,118,210,0.75)"
          rx="3"
        />
      </g>

      <!-- ── Start marker ── -->
      <g v-if="maze.path.length > 0" style="pointer-events:none">
        <image
          :x="cx(maze.path[0].c)"
          :y="cy(maze.path[0].r)"
          :width="CS"
          :height="CS"
          :href="originImage"
        />
      </g>

      <!-- ── End marker ── -->
      <g v-if="maze.path.length > 1" style="pointer-events:none">
        <image
          :x="cx(maze.path[maze.path.length-1].c)"
          :y="cy(maze.path[maze.path.length-1].r)"
          :width="CS"
          :height="CS"
          :href="terminusImage"
        />
      </g>

      <!-- ── Robot character (watching phase) ── -->
      <transition name="robot-fade">
        <image
          v-if="phase === 'watching' && robotPos"
          :x="cx(robotPos.c)"
          :y="cy(robotPos.r)"
          :width="CS"
          :height="CS"
          :href="robotImage"
          style="pointer-events:none"
        />
      </transition>

      <!-- ── Drag overlay for player phase ── -->
      <rect
        v-if="phase === 'player'"
        width="100%"
        height="100%"
        fill="transparent"
        style="cursor:crosshair"
        @mousedown="onDragStart"
        @mousemove="onDragMove"
        @mouseup="onDragEnd"
        @mouseleave="onDragEnd"
        @touchstart.prevent="onDragStart"
        @touchmove.prevent="onDragMove"
        @touchend.prevent="onDragEnd"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Game10MazeDisplay'
};
</script>

<script setup>
import { computed, ref, watch } from '@vue/composition-api'
import originImage from '../public/image/interaction/origin.jpg'
import terminusImage from '../public/image/interaction/terminus.jpg'
import floorTileImage from '../public/image/ground/floor_tile.jpg'
import wallImage from '../public/image/wall/Horizontal_wall.jpg'
import robotImage from '../public/1.jpg'

const props = defineProps({
  maze:          { type: Object, default: null },
  phase:         { type: String, default: 'watching' }, // 'watching' | 'player' | 'idle'
  robotIndex:    { type: Number, default: 0 },
  playerVisited: {
    default: () => new Set(),
    validator: (v) => v instanceof Set
  },
  playerHead:    { type: Number, default: -1 }, // last correct player index
})

const emit = defineEmits(['cell-click'])

// ── Drag state ───────────────────────────────────────────────────────────────
const isDragging = ref(false)
const clickedInDrag = ref(new Set())

// Reset drag state when phase changes
watch(() => props.phase, (newPhase) => {
  if (newPhase === 'player') {
    clickedInDrag.value = new Set()
    isDragging.value = false
  }
})

// ── Cell/wall sizes (logical units) ─────────────────────────────────────────
const CS = 40  // cell size

const svgW = computed(() => !props.maze ? 0 : props.maze.gridSize * CS + 5)
const svgH = computed(() => !props.maze ? 0 : props.maze.gridSize * CS + 5)

function cx(c) { return c * CS }
function cy(r) { return r * CS }

// ── Get cell image based on whether it's a path or wall ────────────────────
function getCellImage(r, c) {
  if (!props.maze) return floorTileImage

  const key = `${r},${c}`
  const isPath = props.maze.pathSet.has(key)

  return isPath ? floorTileImage : wallImage
}

// ── Robot position ───────────────────────────────────────────────────────────
const robotPos = computed(() => {
  if (!props.maze || props.phase !== 'watching') return null
  const idx = Math.min(props.robotIndex, props.maze.path.length - 1)
  return props.maze.path[idx]
})

// ── Drag interaction ─────────────────────────────────────────────────────────
function getCellFromPoint(clientX, clientY) {
  if (!props.maze) return null
  const svg = document.querySelector('.maze-svg')
  if (!svg) return null

  const rect = svg.getBoundingClientRect()
  const scaleX = svgW.value / rect.width
  const scaleY = svgH.value / rect.height

  const svgX = (clientX - rect.left) * scaleX
  const svgY = (clientY - rect.top) * scaleY

  // Find which cell this point is in
  for (let i = 0; i < props.maze.path.length; i++) {
    const cell = props.maze.path[i]
    const x = cx(cell.c)
    const y = cy(cell.r)
    if (svgX >= x && svgX <= x + CS && svgY >= y && svgY <= y + CS) {
      return i
    }
  }
  return null
}

function onDragStart(e) {
  if (props.phase !== 'player') return
  isDragging.value = true
  clickedInDrag.value = new Set()

  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  const cellIdx = getCellFromPoint(clientX, clientY)
  if (cellIdx !== null && !clickedInDrag.value.has(cellIdx)) {
    clickedInDrag.value.add(cellIdx)
    emit('cell-click', cellIdx)
  }
}

function onDragMove(e) {
  if (!isDragging.value || props.phase !== 'player') return

  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  const cellIdx = getCellFromPoint(clientX, clientY)
  if (cellIdx !== null && !clickedInDrag.value.has(cellIdx)) {
    clickedInDrag.value.add(cellIdx)
    emit('cell-click', cellIdx)
  }
}

function onDragEnd() {
  isDragging.value = false
  clickedInDrag.value = new Set()
}

function handleSvgClick() {
  // handled by drag overlay
}
</script>

<style scoped>
.maze-outer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.maze-svg {
  width: min(100%, 100vh - 180px);
  height: min(100%, 100vw - 20px);
  max-width: calc(100vmin - 160px);
  max-height: calc(100vmin - 160px);
  display: block;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.robot-fade-enter-active, .robot-fade-leave-active {
  transition: opacity 0.2s;
}

.robot-fade-enter-from, .robot-fade-leave-to {
  opacity: 0;
}
</style>
