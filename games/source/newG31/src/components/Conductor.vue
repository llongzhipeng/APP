<template>
  <div class="conductor" :class="{ tapping: tapping }" :style="{ transform: 'translateX(' + x + 'px)' }">
    <svg viewBox="0 0 140 160" class="rabbit">
      <!-- Shadow -->
      <ellipse cx="70" cy="152" rx="38" ry="5" fill="rgba(0,0,0,0.25)"/>

      <!-- Ears -->
      <g class="ears">
        <ellipse cx="52" cy="30" rx="10" ry="26" fill="#f8e3d9" stroke="#c88b76" stroke-width="1.5"/>
        <ellipse cx="52" cy="32" rx="5" ry="20" fill="#fbb6ce"/>
        <ellipse cx="88" cy="30" rx="10" ry="26" fill="#f8e3d9" stroke="#c88b76" stroke-width="1.5"/>
        <ellipse cx="88" cy="32" rx="5" ry="20" fill="#fbb6ce"/>
      </g>

      <!-- Head -->
      <circle cx="70" cy="72" r="34" fill="#fff" stroke="#c88b76" stroke-width="1.8"/>
      <!-- Cheeks -->
      <circle cx="50" cy="82" r="6" fill="#ffb7c5" opacity="0.7"/>
      <circle cx="90" cy="82" r="6" fill="#ffb7c5" opacity="0.7"/>
      <!-- Eyes -->
      <g class="eyes">
        <ellipse cx="58" cy="70" rx="4" ry="6" fill="#2a2a2a"/>
        <ellipse cx="82" cy="70" rx="4" ry="6" fill="#2a2a2a"/>
        <circle cx="59.5" cy="68" r="1.5" fill="#fff"/>
        <circle cx="83.5" cy="68" r="1.5" fill="#fff"/>
      </g>
      <!-- Nose -->
      <path d="M67 82 Q70 85 73 82 Q70 88 67 82 Z" fill="#ff8fab"/>
      <!-- Mouth -->
      <path d="M65 90 Q70 94 75 90" stroke="#c25b7a" stroke-width="1.5" fill="none" stroke-linecap="round"/>

      <!-- Body (bowtie collar) -->
      <path d="M55 105 Q70 100 85 105 L88 118 L52 118 Z" fill="#5c4033"/>
      <path d="M62 108 L78 108 L74 116 L66 116 Z" fill="#e63946"/>

      <!-- Arm holding stick -->
      <g class="arm" :style="{ transformOrigin: '95px 118px' }">
        <path d="M92 118 Q118 118 128 100" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M92 118 Q118 118 128 100" stroke="#c88b76" stroke-width="11" fill="none" stroke-linecap="round" opacity="0.15"/>
        <!-- Baton -->
        <line x1="128" y1="100" x2="138" y2="60" stroke="#3d2817" stroke-width="3" stroke-linecap="round"/>
        <circle cx="138" cy="60" r="3.5" fill="#f1c40f" stroke="#b7950b" stroke-width="1"/>
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Conductor',
  props: {
    x: { type: Number, default: 0 },
    tapping: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.conductor {
  width: 140px;
  height: 160px;
  transition: transform 0.5s cubic-bezier(.68,-0.2,.27,1.2);
  pointer-events: none;
}
.rabbit { width: 100%; height: 100%; }
.tapping .arm {
  animation: swing 0.4s ease-in-out;
}
.tapping .ears { animation: earwiggle 0.4s ease-in-out; }
@keyframes swing {
  0%,100% { transform: rotate(0); }
  40% { transform: rotate(35deg); }
  60% { transform: rotate(35deg); }
}
@keyframes earwiggle {
  0%,100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-3px) rotate(-3deg); }
}
</style>
