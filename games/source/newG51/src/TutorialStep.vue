<template>
  <div class="tut-step">
    <!-- Step 0: Read task -->
    <div v-if="step === 0" class="tut-slide">
      <div class="tut-task-bar">
        <span class="tag">{{ t.task }}</span>
        <span class="task-name">{{ demoTaskName }}</span>
      </div>
      <div class="tut-arrow-up">👆</div>
      <p class="tut-tip">{{ lang==='zh' ? '① 首先看清屏幕上方的任务名称' : '① Read the task name at the top' }}</p>
    </div>

    <!-- Step 1: Look at palette -->
    <div v-else-if="step === 1" class="tut-slide">
      <div class="tut-palette">
        <div v-for="(u,i) in shuffledUrls" :key="i" class="chip-demo">
          <img :src="u"/>
          <div class="chip-cap">{{ shuffledLabels[i] }}</div>
        </div>
      </div>
      <p class="tut-tip">{{ lang==='zh' ? '② 观察中间的图片，思考它们的正确顺序' : '② Look at the images in the middle and think about the correct order' }}</p>
    </div>

    <!-- Step 2: Drag animation -->
    <div v-else-if="step === 2" class="tut-slide">
      <div class="tut-slots">
        <div v-for="(u,i) in urls" :key="i" class="slot-demo">
          <div class="slot-badge">{{ t.step.replace('{n}', i+1) }}</div>
          <div class="slot-body">
            <img v-if="i===0" :src="urls[0]" class="drag-anim"/>
          </div>
        </div>
      </div>
      <div class="tut-hand">✋</div>
      <p class="tut-tip">{{ lang==='zh' ? '③ 将图片拖入对应的步骤框中' : '③ Drag each image into its correct step slot' }}</p>
    </div>

    <!-- Step 3: All correct -->
    <div v-else class="tut-slide">
      <div class="tut-slots">
        <div v-for="(u,i) in urls" :key="i" class="slot-demo done">
          <div class="slot-badge">{{ t.step.replace('{n}', i+1) }}</div>
          <div class="slot-body"><img :src="u"/></div>
        </div>
      </div>
      <div class="tut-check">✓</div>
      <p class="tut-tip">{{ lang==='zh' ? '④ 全部正确则得分，自动进入下一题！' : '④ All correct = score! Auto-load next question.' }}</p>
    </div>
  </div>
</template>

<script>
import { taskImages } from './tasks.js'
import { dict } from './i18n.js'

export default {
  props: {
    step: { type: Number, default: 0 },
    lang: { type: String, default: 'zh' },
    t: { type: Object, required: true }
  },
  data() {
    return { demoKey: 'brush_teeth' }
  },
  computed: {
    urls() { return taskImages(this.demoKey) },
    labels() { return dict[this.lang].tasks[this.demoKey].steps },
    demoTaskName() { return dict[this.lang].tasks[this.demoKey].name },
    shuffledUrls() { return [this.urls[1], this.urls[2], this.urls[0]] },
    shuffledLabels() { return [this.labels[1], this.labels[2], this.labels[0]] }
  }
}
</script>

<style scoped>
.tut-step { display: flex; align-items: center; justify-content: center; min-height: 40vmin; }
.tut-slide { text-align: center; width: 100%; position: relative; }
.tut-tip { margin-top: 3vmin; font-size: 2.2vmin; color: #4a5fd6; font-weight: 600; }
.tut-task-bar {
  display: inline-flex; align-items: center; gap: 2vmin;
  background: linear-gradient(135deg, #6a82f0, #4a5fd6);
  color: #fff; padding: 2vmin 4vmin; border-radius: 999px;
  box-shadow: 0 6px 18px rgba(74,95,214,.3);
}
.tut-task-bar .tag { font-size: 1.6vmin; opacity: .8; letter-spacing: .2vmin; }
.tut-task-bar .task-name { font-size: 3vmin; font-weight: 700; }
.tut-arrow-up { font-size: 5vmin; margin-top: 3vmin; animation: nod 1s ease-in-out infinite; }
@keyframes nod { 50% { transform: translateY(-1.5vmin); } }

.tut-palette { display: flex; gap: 2vmin; justify-content: center; margin-top: 2vmin; }
.chip-demo {
  width: 18vmin; height: 22vmin;
  background: #fff; border-radius: 12px; border: 1px solid #e4e9f5;
  box-shadow: 0 4px 14px rgba(0,0,0,.08);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.chip-demo img { flex: 1; width: 100%; object-fit: contain; padding: .6vmin; min-height: 0; }
.chip-cap { padding: .8vmin; font-size: 1.6vmin; font-weight: 600; background: linear-gradient(180deg, #f8faff, #eef2fb); border-top: 1px solid #e4e9f5; }

.tut-slots { display: flex; gap: 2vmin; justify-content: center; margin-top: 2vmin; }
.slot-demo {
  width: 18vmin; height: 20vmin;
  background: linear-gradient(160deg, #ffffff, #f0f4ff);
  border: 2px dashed #c5d0eb;
  border-radius: 14px; position: relative;
  padding: 1vmin;
}
.slot-demo.done { border-style: solid; border-color: #28c665; background: linear-gradient(160deg, #e9fbee, #d0f4dc); }
.slot-badge {
  position: absolute; top: -1.2vmin; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, #6a82f0, #4a5fd6);
  color: #fff; padding: .4vmin 1.4vmin; border-radius: 999px;
  font-size: 1.4vmin; font-weight: 700;
  white-space: nowrap;
}
.slot-body { height: 100%; display: flex; align-items: center; justify-content: center; }
.slot-body img { max-width: 100%; max-height: 100%; object-fit: contain; }
.drag-anim { animation: dropIn 1.6s ease-in-out infinite; }
@keyframes dropIn { 0% { transform: translate(-6vmin, -8vmin) scale(1.05); opacity: .3; } 60% { transform: none; opacity: 1; } 100% { transform: none; opacity: 1; } }

.tut-hand { font-size: 5vmin; position: absolute; top: 10%; left: 30%; animation: hand 1.6s ease-in-out infinite; }
@keyframes hand { 0% { transform: translate(0,0); } 60% { transform: translate(-8vmin, 5vmin); } 100% { transform: translate(-8vmin, 5vmin); } }
.tut-check { font-size: 8vmin; color: #28c665; margin-top: 2vmin; text-shadow: 0 4px 20px rgba(40,198,101,.4); }
</style>
