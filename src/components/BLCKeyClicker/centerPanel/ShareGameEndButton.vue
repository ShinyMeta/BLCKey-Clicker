<template>
  <div>
    <v-btn
      prepend-icon="mdi-share"
      color="primary"
      variant="tonal"
      @click="dialog = true"
    >
      Share
    </v-btn>

    <v-dialog
      v-model="dialog"
      max-width="600"
    >
      <v-card>
        <v-card-title>Share your run</v-card-title>
        <v-card-text>
          <div>{{ sharableString }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-tooltip
            v-model="tooltipVisible"
            location="top"
            :open-on-hover="false"
            open-on-click
          >
            <template #activator="{ props: tooltipProps }">
              <v-btn
                color="primary"
                v-bind="tooltipProps"
                @click="copyToClipboard"
              >
                Copy
              </v-btn>
            </template>
            <span>Copied to clipboard!</span>
          </v-tooltip>
          <v-btn
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useLootStore } from '@/store/loot/lootStore';
import { storeToRefs } from 'pinia';


const props = defineProps({
  missedExclusive: {
    type: Object,
    default: null,
  },
});

const lootStore = useLootStore();
const { exclusiveLookup } = storeToRefs(lootStore);

const dialog = ref(false);
const tooltipVisible = ref(false);

const sharableString = computed(() => {
  const unlockedExclusives = Array.from(exclusiveLookup.value.values())
    .filter(exclusive => exclusive.dropped);
  if (props.missedExclusive) {
    return `I unlocked ${unlockedExclusives.length} exclusives, but lost my one true love, ${props.missedExclusive.label}. #BLCKeyClicker https://shinymeta.github.io/BLCKey-Clicker`;
  }
  return `I unlocked all ${unlockedExclusives.length} exclusives without missing a single one. My soul is complete. #BLCKeyClicker https://shinymeta.github.io/BLCKey-Clicker`;
});

function copyToClipboard() {
  const text = sharableString.value || '';
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      setTimeout(() => (tooltipVisible.value = false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
}
</script>