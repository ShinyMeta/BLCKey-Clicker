<template>
  <div>
    <v-card max-width="500">
      <v-card-title class="text-h5">
        {{ ListOfExclusives.length }} Exclusives Seen So Far
      </v-card-title>
      <v-card-text>
        <div class="d-flex align-center ga-2 flex-wrap justify-center pa-2">
          <div
            v-for="exclusive in ListOfExclusives"
            :key="exclusive.id"
          >
            <ItemImage
              :item="exclusive"
              :size="50"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import ItemImage from '../shared/ItemImage.vue';
  import { useLootStore } from '@/store/loot/lootStore';
  import { storeToRefs } from 'pinia';

  const lootStore = useLootStore();
  const { exclusiveLookup } = storeToRefs(lootStore);
  const ListOfExclusives = computed(() => {
    return Array.from(exclusiveLookup.value.values());
  });
</script>