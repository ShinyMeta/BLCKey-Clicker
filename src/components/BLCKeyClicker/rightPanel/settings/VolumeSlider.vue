<template>
  <div class="volume-slider">
    <div class="volume-slider__label text-caption">{{ label }}</div>
    <v-slider
      :prepend-icon="prependIcon"
      v-model="value"
      :min="0"
      :max="1"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  prependIcon: { type: String, default: 'mdi-volume-high' },
  modelValue: { type: Number, default: 1 },
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>

<style scoped>
.volume-slider {
  display: block;
}
.volume-slider__label {
  text-align: left;
  margin-bottom: 6px;
}
</style>