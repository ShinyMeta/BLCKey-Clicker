<template>
  <v-card
    class="dex-collection-card"
    :ripple="clickable"
    variant="flat"
    v-bind="clickable ? { onClick: handleClick } : {}"
  >
    <v-card-text class="pa-3">
      <div class="d-flex align-center ga-3">
        <div class="dex-collection-card__media">
          <slot name="media">
            <v-avatar
              size="44"
              rounded="circle"
              color="surface-lighten-2"
              class="ma-1"
            >
              <v-img
                v-if="node?.icon"
                :src="node.icon"
                :alt="node.label"
              />
              <v-icon
                v-else
              >
                mdi-notebook
              </v-icon>
            </v-avatar>
          </slot>
        </div>

        <div class="d-flex flex-column ga-2 flex-grow-1 dex-collection-card__body">
          <div class="text-subtitle-2 text-truncate text-capitalize">
            {{ node?.label ?? "Unknown" }}
          </div>

          <div
            class="dex-collection-card__progress"
          >
            <v-progress-linear
              :model-value="collectedCount"
              :buffer-value="seenCount"
              :min="0"
              :max="progressMax"
              color="success"
              buffer-color="success"
              bg-color="surface-lighten-2"
              height="10"
              rounded
            />
          </div>

          <div class="dex-collection-card__counts text-caption">
            <span :class="collectedCountComplete ? 'text-success' : 'text-medium-emphasis'">
              Collected: {{ collectedCount }}
            </span>
            <span :class="seenCountComplete ? 'text-success' : 'text-medium-emphasis'">
              Seen: {{ seenCount }}
            </span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { DEX_DISPLAY_BEHAVIOR } from "@/services/settings/miscSettingsStore";

const props = defineProps({
  reactiveNode: {
    type: Object,
    default: null,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  displayBehavior: {
    type: String,
    default: DEX_DISPLAY_BEHAVIOR.SHOW_COLLECTED,
  },
});

const emit = defineEmits(["click"]);

const node = computed(() => props.reactiveNode?.node ?? null);
const collectedCount = computed(() => props.reactiveNode?.collectedCount.value ?? 0);
const seenCount = computed(() => props.reactiveNode?.seenCount.value ?? 0);
const totalCount = computed(() => props.reactiveNode?.totalCount.value ?? 0);
const collectedCountComplete = computed(() => totalCount.value > 0 && collectedCount.value === totalCount.value);
const seenCountComplete = computed(() => totalCount.value > 0 && seenCount.value === totalCount.value);
const progressMax = computed(() =>
  props.displayBehavior === DEX_DISPLAY_BEHAVIOR.SHOW_ALL ? totalCount.value : seenCount.value
);

function handleClick(event) {
  emit("click", event);
}
</script>

<style scoped>
.dex-collection-card {
  overflow: hidden;
}

.dex-collection-card__body {
  min-width: 0;
  overflow: hidden;
}

.dex-collection-card__progress {
  min-width: 0;
  overflow: hidden;
}

.dex-collection-card__counts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
</style>