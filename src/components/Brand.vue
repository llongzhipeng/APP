<script setup>
defineProps({ compact: Boolean })
</script>

<template>
  <view class="brand">
    <view class="icon-tile"><image class="icon" src="/static/icons/brain.png" mode="aspectFit" /></view>
    <text>{{ compact ? '医未 ADHD' : '医未ADHD康复系统' }}</text>
  </view>
</template>
