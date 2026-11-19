<template>
  <transition name="modal">
    <div v-if="show" class="modal-mask" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button class="x" @click="$emit('close')">✕</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Modal',
  props: { show: Boolean, title: String }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(2, 4, 15, 0.7);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vh 4vw;
}
.modal {
  background: linear-gradient(180deg, rgba(30, 40, 90, 0.95) 0%, rgba(15, 20, 55, 0.95) 100%);
  border: 2px solid rgba(140, 180, 255, 0.45);
  border-radius: 1.5em;
  color: #e8eeff;
  min-width: min(48em, 92vw);
  max-width: 94vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 100px rgba(0,0,0,.7), 0 0 60px rgba(120, 180, 255, 0.2) inset;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.4em 2em;
  border-bottom: 1px solid rgba(140, 180, 255, 0.2);
  background: linear-gradient(180deg, rgba(60, 80, 160, 0.35), transparent);
}
.modal-header h2 {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 1.7em;
  letter-spacing: 0.12em;
  background: linear-gradient(180deg, #fff, #a5c8ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.x {
  width: 2.5em; height: 2.5em;
  border-radius: 999px;
  border: 1.5px solid rgba(140, 180, 255, 0.4);
  background: rgba(255,255,255,0.06);
  color: #e0ecff;
  cursor: pointer;
  font-size: 1em;
  transition: all .2s;
}
.x:hover { background: rgba(255,80,120,0.2); border-color: #ff7a95; color: #fff; }
.modal-body { padding: 2em; overflow-y: auto; flex: 1; font-size: 1.05em; line-height: 1.6; }
.modal-footer {
  padding: 1.2em 2em;
  border-top: 1px solid rgba(140, 180, 255, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 1.2em;
}

.modal-enter-active, .modal-leave-active { transition: opacity .25s; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform .35s cubic-bezier(.34,1.56,.64,1); }
.modal-enter, .modal-leave-to { opacity: 0; }
.modal-enter .modal, .modal-leave-to .modal { transform: scale(.85) translateY(30px); }
</style>
