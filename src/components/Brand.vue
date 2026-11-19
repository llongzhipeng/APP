<script setup>
defineProps({ compact: Boolean })
</script>

<template>
  <image class="brand-logo" :class="{ compact }" src="/static/brand/dr-brain.png" mode="aspectFit"
    role="img" aria-label="脑医生 Dr.Brain" />
</template>

<style scoped>
.brand-logo { display: block; width: 182px; height: 76px; }
.brand-logo.compact { width: 124px; height: 49px; flex-shrink: 0; }
</style>
