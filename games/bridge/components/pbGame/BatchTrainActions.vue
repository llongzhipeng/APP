<script>
import { leave } from '../../session'
export default {
  props: { homeText: String, homeButtonClass: String },
  methods: {
    returnToPlan() {
      leave()
      this.$emit('home')
    },
  },
}
</script>

<template>
  <button :class="homeButtonClass || 'return-to-plan'" type="button" @click="returnToPlan">
    {{ homeText || '返回今日训练' }}
  </button>
</template>

<style scoped>
.return-to-plan { border: 0; border-radius: 10px; padding: 10px 16px; background: #006fa6; color: #fff; font: inherit; cursor: pointer; }
</style>
