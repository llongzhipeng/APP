<template>
  <!-- Square paper dossier card, official-document style -->
  <div v-if="profile" class="dossier" :style="sizeStyle">
    <div class="paper">
      <!-- Header strip -->
      <div class="header">
        <div class="header-left">
          <div class="agency">{{ lang === 'zh' ? '人物档案' : 'CHARACTER DOSSIER' }}</div>
          <div class="agency-sub">{{ lang === 'zh' ? 'PERSONAL RECORD · 人事资料' : 'Personal Record · No.' }} {{ fileNo }}</div>
        </div>
      </div>

      <div class="hr"></div>

      <!-- Body: photo + primary fields -->
      <div class="body">
        <!-- Photo block -->
        <div class="photo-wrap">
          <div class="photo">
            <img v-if="profile.avatar" :src="profile.avatar" :alt="localized(profile.name)" />
            <div class="photo-tag">
              <span>{{ lang === 'zh' ? '证件照' : 'PHOTO' }}</span>
            </div>
          </div>
          <div class="photo-caption">{{ lang === 'zh' ? '本人近照' : 'Recent photograph' }}</div>
        </div>

        <!-- Info block -->
        <div class="info">
          <!-- Primary line: name -->
          <div class="row primary">
            <div class="label">{{ t('fieldName') }} · Name</div>
            <div class="value big">{{ localized(profile.name) }}</div>
          </div>

          <div class="hr thin"></div>

          <!-- Grid of fields (always shows age + gender at minimum) -->
          <div class="grid" :style="gridStyle">
            <div v-for="f in fields" :key="f.key" class="cell">
              <div class="cell-label">{{ t(f.label) }}</div>
              <div class="cell-value">{{ f.display }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="foot-left">
          <span class="foot-k">FILE ID</span>
          <span class="foot-v">{{ fileNo }}</span>
        </div>
        <div class="foot-line"></div>
        <div class="foot-right">
          <span class="foot-k">DATE</span>
          <span class="foot-v">{{ today }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t, i18n } from '../i18n.js'

// Displays a character profile as a square, paper-style dossier.
// Fields is an array of { key, label, display } — see Game.vue::buildDisplay.
export default {
  name: 'ProfileCard',
  props: {
    profile: { type: Object, required: true },
    fields: { type: Array, required: true },  // fields to show in the grid (excluding name)
    size:   { type: String, default: 'calc(var(--u) * 46)' } // side length of the square
  },
  computed: {
    lang() { return i18n.lang },
    sizeStyle() { return { width: this.size, height: this.size } },
    gridStyle() {
      const n = this.fields.length
      const cols = n <= 2 ? 1 : 2
      return { gridTemplateColumns: `repeat(${cols}, 1fr)` }
    },
    fileNo() {
      // Deterministic-looking file number derived from name+age for realism.
      const nameZh = this.profile && this.profile.name && this.profile.name.zh
      const seed = (nameZh || '') + (this.profile && this.profile.age != null ? this.profile.age : '')
      let h = 0
      for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
      const yr = new Date().getFullYear()
      return `${yr}-${String(h % 100000).padStart(5, '0')}`
    },
    today() {
      const d = new Date()
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}.${p(d.getMonth()+1)}.${p(d.getDate())}`
    }
  },
  methods: {
    t,
    localized(o) {
      if (!o || typeof o !== 'object') return o
      if (o[this.lang] != null) return o[this.lang]
      if (o.zh != null) return o.zh
      return o
    }
  }
}
</script>

<style scoped>
.dossier {
  /* The wrapper is always a square, sized by the parent via the size prop. */
  aspect-ratio: 1 / 1;
  display: flex;
}

.paper {
  flex: 1;
  background: var(--paper);
  color: var(--paper-ink);
  border: 1px solid var(--paper-line);
  border-radius: 2px;
  padding: calc(var(--u) * 2.2);
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: var(--font-serif);
  box-shadow:
    0 30px 60px -25px rgba(0,0,0,0.6),
    0 8px 18px -8px rgba(0,0,0,0.35),
    inset 0 0 0 1px rgba(255,255,255,0.4);
  /* Subtle paper grain */
  background-image:
    repeating-linear-gradient(0deg,
      rgba(0,0,0,0.02) 0 1px, transparent 1px 4px),
    radial-gradient(ellipse at 20% 10%, rgba(0,0,0,0.03), transparent 50%);
}

/* Header */
.header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: calc(var(--u) * 2);
}
.agency {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 1.9);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--paper-ink);
}
.agency-sub {
  font-family: var(--font-sans);
  font-size: calc(var(--u) * 0.95);
  letter-spacing: 0.24em;
  color: var(--paper-ink-2);
  margin-top: calc(var(--u) * 0.4);
  text-transform: uppercase;
}

/* Red official-style stamp */
.stamp {
  width: calc(var(--u) * 6.8);
  height: calc(var(--u) * 6.8);
  border: 2px solid var(--paper-red);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transform: rotate(-8deg);
  color: var(--paper-red);
  opacity: 0.85;
}
.stamp::before {
  content: '';
  position: absolute;
  width: calc(var(--u) * 5.6);
  height: calc(var(--u) * 5.6);
  border: 1px dashed var(--paper-red);
  border-radius: 50%;
}
.stamp-txt {
  text-align: center;
  font-family: var(--font-serif);
  line-height: 1.15;
}
.stamp-txt > div:first-child {
  font-size: calc(var(--u) * 0.9);
  font-weight: 700;
  letter-spacing: 0.14em;
}
.stamp-sub {
  font-size: calc(var(--u) * 1.5);
  font-weight: 700;
  letter-spacing: 0.28em;
  margin-top: 2px;
}

.hr {
  height: 1px;
  background: var(--paper-ink);
  opacity: 0.55;
  margin: calc(var(--u) * 1.4) 0;
}
.hr.thin { opacity: 0.25; margin: calc(var(--u) * 1.2) 0; }

/* Body */
.body {
  flex: 1;
  display: flex;
  gap: calc(var(--u) * 2.2);
  min-height: 0;
}

/* Photo */
.photo-wrap {
  display: flex; flex-direction: column; align-items: center;
  flex-shrink: 0;
}
.photo {
  width: calc(var(--u) * 12);
  height: calc(var(--u) * 15);   /* 4:5 ID-photo ratio */
  border: 1px solid var(--paper-ink);
  background: var(--paper-2);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 0 3px var(--paper), inset 0 0 0 4px rgba(0,0,0,0.15);
}
.photo img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  filter: contrast(0.98) saturate(0.9);
}
.photo-tag {
  position: absolute;
  bottom: calc(var(--u) * 0.4);
  right: calc(var(--u) * 0.4);
  background: rgba(255,255,255,0.85);
  color: var(--paper-ink-2);
  padding: 2px 6px;
  font-family: var(--font-sans);
  font-size: calc(var(--u) * 0.75);
  letter-spacing: 0.14em;
  border: 1px solid var(--paper-line);
}
.photo-caption {
  font-family: var(--font-sans);
  font-size: calc(var(--u) * 0.9);
  color: var(--paper-ink-2);
  margin-top: calc(var(--u) * 0.8);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* Info */
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.row.primary {
  display: flex;
  align-items: baseline;
  gap: calc(var(--u) * 1.2);
}
.label {
  font-family: var(--font-sans);
  font-size: calc(var(--u) * 0.95);
  color: var(--paper-ink-2);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  min-width: calc(var(--u) * 10);
}
.value.big {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 3);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--paper-ink);
  padding-bottom: calc(var(--u) * 0.2);
  border-bottom: 1px solid rgba(0,0,0,0.25);
  flex: 1;
}

.grid {
  display: grid;
  gap: calc(var(--u) * 1.2) calc(var(--u) * 2);
  flex: 1;
  align-content: start;
}
.cell {
  display: flex;
  flex-direction: column;
  gap: calc(var(--u) * 0.3);
  padding-bottom: calc(var(--u) * 0.7);
  border-bottom: 1px dashed rgba(0,0,0,0.2);
}
.cell-label {
  font-family: var(--font-sans);
  font-size: calc(var(--u) * 0.9);
  color: var(--paper-ink-2);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.cell-value {
  font-family: var(--font-serif);
  font-size: calc(var(--u) * 1.7);
  font-weight: 600;
  color: var(--paper-ink);
  letter-spacing: 0.04em;
}

/* Footer */
.footer {
  display: flex; align-items: center;
  gap: calc(var(--u) * 1.4);
  margin-top: calc(var(--u) * 1.4);
  padding-top: calc(var(--u) * 1);
  border-top: 1px solid rgba(0,0,0,0.35);
  font-family: var(--font-sans);
  font-size: calc(var(--u) * 0.95);
}
.foot-left, .foot-right {
  display: flex; gap: calc(var(--u) * 0.8); align-items: baseline;
}
.foot-k {
  letter-spacing: 0.24em;
  color: var(--paper-ink-2);
  text-transform: uppercase;
  font-weight: 500;
}
.foot-v {
  font-family: var(--font-serif);
  color: var(--paper-ink);
  letter-spacing: 0.06em;
}
.foot-line {
  flex: 1;
  height: 1px;
  background: rgba(0,0,0,0.25);
}
</style>
