<template>
  <div class="map-comp-progress">
    <div class="progress-wrapper">
      <v-progress-circular
        :model-value="(progress / clicksToComp) * 100"
        :size="200"
        :width="15"
        color="cyan-darken-3"
        rounded
        class="progress-ring"
      />
      <MapCompButton class="centered-btn" @click="handleClick" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import MapCompButton from "@/components/BLCKeyClicker/MapCompButton.vue";

const props = defineProps({
  clicksToComp: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(["click", "mapComplete"]);
const progress = ref(0);

function handleClick() {
  progress.value++;
  emit("click");

  if (progress.value >= props.clicksToComp) {
    emit("mapComplete");
    progress.value = 0;
  }
}

defineExpose({ progress });
</script>

<style scoped>
.map-comp-progress {
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-wrapper {
  position: relative;
  display: grid;
  place-items: center;
}

.progress-ring {
  grid-area: 1 / 1;
}

.centered-btn {
  grid-area: 1 / 1;
}
</style>
