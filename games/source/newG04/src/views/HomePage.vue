<template>
  <div class="home">
    <button class="lang-btn" @click="$emit('toggle-lang')">{{ T.langBtn }}</button>
    <div class="hero">
      <h1>{{ T.title }}</h1>
      <div class="brain-icon">🧠</div>
    </div>
    <div class="btns">
      <button class="btn-primary" @click="showTutorial=true">{{ T.start }}</button>
      <button class="btn-secondary" @click="showRules=true">{{ T.rules }}</button>
      <button class="btn-secondary" @click="$emit('history')">{{ T.history }}</button>
    </div>

    <RulesModal v-if="showRules" :lang="lang" @close="showRules=false" />
    <TutorialModal v-if="showTutorial" :lang="lang" @skip="onTutorialDone" @done="onTutorialDone" />
    <DurationModal v-if="showDuration" :lang="lang" @choose="onChoose" @close="showDuration=false" />
  </div>
</template>

<script>
import { t } from '../i18n.js'
import RulesModal from '../components/RulesModal.vue'
import TutorialModal from '../components/TutorialModal.vue'
import DurationModal from '../components/DurationModal.vue'
import { afterBatchTutorial } from '@/utils/pbGameBatchEntry'

export default {
  components: { RulesModal, TutorialModal, DurationModal },
  props: ['lang', 'batchOpenTutorial'],
  data() { return { showRules: false, showTutorial: false, showDuration: false } },
  computed: { T() { return t[this.lang] } },
  watch: {
    batchOpenTutorial(val) {
      if (val) this.showTutorial = true
    },
  },
  methods: {
    onChoose(dur) { this.showDuration = false; this.$emit('start', dur) },
    onTutorialDone() {
      this.showTutorial = false
      if (afterBatchTutorial('yshy', (dur) => this.$emit('start', dur))) return
      this.showDuration = true
    },
  },
}
</script>

<style scoped>
.home {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 4vmin; position: relative;
  padding: 4vh 3vw;
  overflow-y: auto;
}
.lang-btn {
  position: absolute; top: 2.5vmin; right: 2.5vmin;
  background: rgba(255,255,255,0.12); color: #e8e8f0;
  border-radius: 1.2vmin; padding: 0.8vmin 2vmin;
  font-size: 2vmin; font-weight: 600;
  transition: background .2s;
}
.lang-btn:hover { background: rgba(255,255,255,0.22); }
.hero { text-align: center; }
.hero h1 { font-size: 6vmin; font-weight: 700; letter-spacing: .05em; color: #7eb8f7; }
.brain-icon { font-size: 8vmin; margin-top: 1.5vmin; }
.btns {
  display: flex; flex-direction: column; align-items: center;
  gap: 2.8vmin; width: 100%; max-width: 44vmin;
}
.btn-primary {
  width: 100%; padding: 2.2vmin 0;
  background: #3a7bd5; color: #fff;
  border-radius: 1.5vmin;
  font-size: 3.2vmin; font-weight: 700;
  transition: background .2s, transform .1s;
  margin-bottom: 2.2vmin;
}
.btn-primary:hover { background: #4e8fe0; transform: scale(1.03); }
.btn-secondary {
  width: 100%; padding: 1.8vmin 0;
  background: rgba(255,255,255,0.1); color: #c5d8f5;
  border-radius: 1.5vmin;
  font-size: 2.6vmin; font-weight: 700;
  transition: background .2s, transform .1s;
  margin-bottom: 2.2vmin;
}
.btn-secondary:last-child { margin-bottom: 0; }
.btn-secondary:hover { background: rgba(255,255,255,0.18); transform: scale(1.03); }

/* ===== Portrait (mobile / WeChat web-view) ===== */
@media (orientation: portrait) {
  .home {
    gap: 6vw;
    padding: calc(4vh + env(safe-area-inset-top)) 5vw calc(4vh + env(safe-area-inset-bottom));
  }
  .lang-btn {
    top: calc(2vw + env(safe-area-inset-top));
    right: 3vw;
    padding: max(2vw, 8px) max(3.6vw, 14px);
    border-radius: 3vw;
    font-size: max(3.6vw, 14px);
  }
  .hero h1 { font-size: max(10vw, 30px); }
  .brain-icon { font-size: max(16vw, 60px); margin-top: 3vw; }
  .btns { gap: 4vw; max-width: 100%; width: 88%; }
  .btn-primary {
    padding: max(4vw, 16px) 0;
    border-radius: 3.6vw;
    font-size: max(5.2vw, 20px);
    margin-bottom: 0;
  }
  .btn-secondary {
    padding: max(3.6vw, 14px) 0;
    border-radius: 3.6vw;
    font-size: max(4.4vw, 17px);
    margin-bottom: 0;
  }
}
</style>
