<template>
  <div :class="['teacher', size, {speaking}]">
    <svg viewBox="0 0 260 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Skin -->
        <linearGradient id="skinG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f7d6b3"/>
          <stop offset="1" stop-color="#e5b48c"/>
        </linearGradient>
        <linearGradient id="skinShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e5b48c" stop-opacity="0"/>
          <stop offset="1" stop-color="#c78a5e" stop-opacity=".55"/>
        </linearGradient>
        <!-- Blazer / suit -->
        <linearGradient id="blazerG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3d4a7a"/>
          <stop offset=".55" stop-color="#293557"/>
          <stop offset="1" stop-color="#1a2340"/>
        </linearGradient>
        <linearGradient id="blazerHL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".18"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <!-- Hair (black-brown, side-parted) -->
        <linearGradient id="hairG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a1a12"/>
          <stop offset="1" stop-color="#150a06"/>
        </linearGradient>
        <linearGradient id="hairShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5a3a25" stop-opacity=".8"/>
          <stop offset="1" stop-color="#5a3a25" stop-opacity="0"/>
        </linearGradient>
        <!-- Mouth interior -->
        <radialGradient id="mouthG" cx=".5" cy=".35" r=".7">
          <stop offset="0" stop-color="#7a1524"/>
          <stop offset=".75" stop-color="#4a0e18"/>
          <stop offset="1" stop-color="#2a060c"/>
        </radialGradient>
        <!-- Tie stripe -->
        <linearGradient id="tieG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#c8384a"/>
          <stop offset="1" stop-color="#7a1c2c"/>
        </linearGradient>
      </defs>

      <!-- Ground shadow -->
      <ellipse cx="130" cy="326" rx="94" ry="8" fill="rgba(0,0,0,.22)"/>

      <!-- ===== Suit / Body ===== -->
      <path d="M38 328 Q34 232 88 210 L130 220 L172 210 Q226 232 222 328 Z" fill="url(#blazerG)"/>
      <!-- Lapels -->
      <path d="M88 210 L120 250 L112 306 L88 292 Z" fill="#1a2340"/>
      <path d="M172 210 L140 250 L148 306 L172 292 Z" fill="#1a2340"/>
      <!-- Highlight -->
      <path d="M38 328 Q34 232 88 210 L96 218 Q62 240 58 320 Z" fill="url(#blazerHL)"/>
      <!-- Shirt (white V) -->
      <path d="M112 214 L130 250 L148 214 L148 236 L130 262 L112 236 Z" fill="#ffffff"/>
      <path d="M112 214 L130 250 L148 214" fill="none" stroke="#d9dfee" stroke-width="1"/>
      <!-- Tie knot -->
      <path d="M124 250 L136 250 L142 272 L130 282 L118 272 Z" fill="url(#tieG)"/>
      <path d="M124 250 L136 250 L138 258 L122 258 Z" fill="#e2536a" opacity=".65"/>
      <!-- Tie body -->
      <path d="M126 282 L134 282 L140 328 L130 336 L120 328 Z" fill="url(#tieG)"/>
      <!-- Tie diagonal stripes -->
      <line x1="122" y1="296" x2="138" y2="292" stroke="#f2a0ac" stroke-width="1.5" opacity=".7"/>
      <line x1="122" y1="310" x2="138" y2="306" stroke="#f2a0ac" stroke-width="1.5" opacity=".7"/>
      <line x1="122" y1="324" x2="138" y2="320" stroke="#f2a0ac" stroke-width="1.5" opacity=".7"/>
      <!-- Pocket square (subtle) -->
      <path d="M72 244 L88 244 L86 254 L74 254 Z" fill="#ffffff" opacity=".7"/>

      <!-- Neck (male: broader, more angular) -->
      <path d="M108 196 Q108 218 130 224 Q152 218 152 196 Z" fill="url(#skinG)"/>
      <path d="M108 210 Q130 220 152 210 L152 218 Q130 228 108 218 Z" fill="url(#skinShade)"/>
      <!-- Adam's apple hint -->
      <ellipse cx="130" cy="216" rx="2.5" ry="4" fill="#c78a5e" opacity=".4"/>

      <!-- ===== Back hair (short male cut) ===== -->
      <path d="M60 130 Q64 68 130 60 Q196 68 200 130 Q202 150 196 168 L192 158 Q188 128 130 122 Q72 128 68 158 L64 168 Q58 150 60 130 Z" fill="url(#hairG)"/>

      <!-- ===== Face (slightly more angular jaw) ===== -->
      <path d="M70 138 Q70 90 130 82 Q190 90 190 138 Q190 190 174 210 Q152 224 130 224 Q108 224 86 210 Q70 190 70 138 Z" fill="url(#skinG)"/>
      <!-- Cheekbone / jaw shading -->
      <path d="M76 180 Q86 210 130 224 Q174 210 184 180 Q180 210 130 226 Q80 210 76 180 Z" fill="#c78a5e" opacity=".3"/>
      <!-- Chin shade -->
      <ellipse cx="130" cy="212" rx="18" ry="8" fill="#c78a5e" opacity=".25"/>

      <!-- Ears (male, more visible) -->
      <path d="M66 148 Q60 150 60 164 Q60 178 68 180 Q72 172 70 160 Z" fill="url(#skinG)"/>
      <path d="M66 158 Q64 164 66 172" stroke="#c78a5e" stroke-width="1.2" fill="none" opacity=".7"/>
      <path d="M194 148 Q200 150 200 164 Q200 178 192 180 Q188 172 190 160 Z" fill="url(#skinG)"/>
      <path d="M194 158 Q196 164 194 172" stroke="#c78a5e" stroke-width="1.2" fill="none" opacity=".7"/>

      <!-- ===== Front hair (side-parted, masculine) ===== -->
      <!-- Base fringe -->
      <path d="M72 130 Q70 76 130 68 Q190 76 188 130 Q184 108 158 106 Q150 130 132 128 Q106 130 96 106 Q78 108 72 130 Z" fill="url(#hairG)"/>
      <!-- Side part sweep (left heavy) -->
      <path d="M76 118 Q100 84 156 96 Q170 100 178 118 Q160 106 128 108 Q100 108 76 118 Z" fill="url(#hairG)"/>
      <!-- Sweep strand highlight -->
      <path d="M96 100 Q130 88 172 106" fill="none" stroke="url(#hairShine)" stroke-width="4" stroke-linecap="round" opacity=".7"/>
      <!-- Short sideburns -->
      <path d="M72 136 Q68 154 74 168 L82 160 Q80 146 82 138 Z" fill="url(#hairG)"/>
      <path d="M188 136 Q192 154 186 168 L178 160 Q180 146 178 138 Z" fill="url(#hairG)"/>

      <!-- ===== Eyebrows (thicker, male) ===== -->
      <path d="M84 140 Q102 132 120 140 Q120 144 118 144 Q102 138 86 144 Q84 144 84 140 Z" fill="#1a0a04"/>
      <path d="M140 140 Q158 132 176 140 Q176 144 174 144 Q158 138 142 144 Q140 144 140 140 Z" fill="#1a0a04"/>

      <!-- ===== Glasses (rectangular, masculine) ===== -->
      <g>
        <!-- Lens fill -->
        <rect x="80" y="146" width="40" height="26" rx="6" fill="rgba(220,235,255,.28)"/>
        <rect x="140" y="146" width="40" height="26" rx="6" fill="rgba(220,235,255,.28)"/>
        <!-- Frames -->
        <rect x="80" y="146" width="40" height="26" rx="6" fill="none" stroke="#0d0d1a" stroke-width="3"/>
        <rect x="140" y="146" width="40" height="26" rx="6" fill="none" stroke="#0d0d1a" stroke-width="3"/>
        <line x1="120" y1="156" x2="140" y2="156" stroke="#0d0d1a" stroke-width="3"/>
        <line x1="80" y1="150" x2="70" y2="148" stroke="#0d0d1a" stroke-width="3" stroke-linecap="round"/>
        <line x1="180" y1="150" x2="190" y2="148" stroke="#0d0d1a" stroke-width="3" stroke-linecap="round"/>
        <!-- Lens shine -->
        <path d="M86 152 Q92 148 100 150" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>
        <path d="M146 152 Q152 148 160 150" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>
      </g>

      <!-- ===== Eyes ===== -->
      <ellipse cx="100" cy="160" rx="4.5" ry="5.5" fill="#0f0f1e"/>
      <ellipse cx="160" cy="160" rx="4.5" ry="5.5" fill="#0f0f1e"/>
      <circle cx="101.5" cy="158" r="1.8" fill="#ffffff"/>
      <circle cx="161.5" cy="158" r="1.8" fill="#ffffff"/>

      <!-- Nose (more prominent, male) -->
      <path d="M130 158 Q126 176 126 182 Q128 186 130 186 Q132 186 134 182 Q134 176 130 158 Z" fill="#d29968" opacity=".6"/>
      <ellipse cx="127" cy="184" rx="2" ry="1.2" fill="#b57848" opacity=".6"/>
      <ellipse cx="133" cy="184" rx="2" ry="1.2" fill="#b57848" opacity=".6"/>
      <path d="M124 178 Q126 186 130 187 Q134 186 136 178" stroke="#c78a5e" stroke-width="1" fill="none" opacity=".5"/>

      <!-- Cheek subtle shading (no blush) -->
      <ellipse cx="86" cy="184" rx="8" ry="5" fill="#e08a70" opacity=".18"/>
      <ellipse cx="174" cy="184" rx="8" ry="5" fill="#e08a70" opacity=".18"/>

      <!-- ===== Mouth (male, thinner lips) ===== -->
      <g v-if="!speaking" class="mouth-closed">
        <path d="M116 200 Q130 206 144 200" stroke="#8a3040" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M120 198 Q130 195 140 198" stroke="#a0384a" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6"/>
      </g>
      <g v-if="speaking" class="mouth-open">
        <!-- Mouth cavity -->
        <ellipse class="mouth-hole" cx="130" cy="202" rx="11" ry="6" fill="url(#mouthG)"/>
        <!-- Top teeth -->
        <rect class="teeth" x="121" y="197" width="18" height="3.5" rx="1.2" fill="#ffffff"/>
        <!-- Tongue -->
        <ellipse class="tongue" cx="130" cy="206" rx="6" ry="2.5" fill="#d0586c" opacity=".9"/>
        <!-- Thin upper lip line -->
        <path d="M118 197 Q130 195 142 197" stroke="#8a3040" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <!-- Thin lower lip line -->
        <path d="M118 208 Q130 212 142 208" stroke="#8a3040" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </g>

      <!-- ===== Arm / Pointer ===== -->
      <path d="M200 240 Q236 232 244 208" stroke="url(#blazerG)" stroke-width="22" fill="none" stroke-linecap="round"/>
      <ellipse cx="244" cy="208" rx="10" ry="8" fill="#0d1224" transform="rotate(-30 244 208)"/>
      <!-- Hand -->
      <circle cx="248" cy="200" r="9" fill="url(#skinG)"/>
      <path d="M248 200 Q252 202 254 200" stroke="#c78a5e" stroke-width="1" fill="none" opacity=".6"/>
      <!-- Pointer stick -->
      <rect x="245" y="148" width="4" height="60" rx="2" fill="#8b5a2b" transform="rotate(18 247 178)"/>
      <circle cx="273" cy="140" r="4" fill="#c98a4b"/>
    </svg>
    <!-- Speech waves -->
    <div v-if="speaking" class="waves">
      <span class="w w1"></span>
      <span class="w w2"></span>
      <span class="w w3"></span>
      <span class="w w4"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Teacher',
  props: {
    speaking: { type: Boolean, default: false },
    size: { type: String, default: 'game' }
  }
}
</script>

<style scoped>
.teacher {
  position: relative; display: inline-block;
  filter: drop-shadow(0 24px 24px rgba(30, 40, 90, .18));
}
.teacher.hero { width: 380px; height: 480px; }
.teacher.game { width: 240px; height: 310px; }
.teacher.tut { width: 150px; height: 195px; }

.mouth-open { display: none; }
.mouth-closed { display: block; }
.teacher.speaking .mouth-open { display: block; }
.teacher.speaking .mouth-closed { display: none; }

.teacher.speaking .mouth-hole {
  transform-box: fill-box;
  transform-origin: center;
  animation: mouthHole .32s ease-in-out infinite alternate;
}
.teacher.speaking .tongue {
  transform-box: fill-box;
  transform-origin: center;
  animation: tongueBob .32s ease-in-out infinite alternate;
}
.teacher.speaking .teeth {
  transform-box: fill-box;
  transform-origin: center top;
  animation: teethShow .32s ease-in-out infinite alternate;
}

@keyframes mouthHole {
  0%   { transform: scale(.35, .3); }
  100% { transform: scale(1.05, 1.15); }
}
@keyframes tongueBob {
  0%   { transform: scale(.6, .4) translateY(-2px); opacity: .5; }
  100% { transform: scale(1, 1) translateY(0);    opacity: .9; }
}
@keyframes teethShow {
  0%   { transform: scaleY(.1); opacity: .3; }
  100% { transform: scaleY(1);  opacity: 1; }
}

.waves {
  position: absolute;
  right: -6%; top: 32%;
  display: flex; flex-direction: column; gap: 6px;
  pointer-events: none;
}
.w {
  display: block; height: 4px; border-radius: 4px;
  background: linear-gradient(90deg, #ffca3a, #ff5c8a);
  transform-origin: left center;
  animation: waveGrow .7s ease-in-out infinite alternate;
  box-shadow: 0 2px 6px rgba(255, 90, 130, .35);
}
.w1 { width: 22px; }
.w2 { width: 34px; animation-delay: .12s; }
.w3 { width: 26px; animation-delay: .24s; }
.w4 { width: 18px; animation-delay: .36s; }
@keyframes waveGrow {
  from { transform: scaleX(.3); opacity: .35; }
  to   { transform: scaleX(1);  opacity: 1;   }
}
</style>
