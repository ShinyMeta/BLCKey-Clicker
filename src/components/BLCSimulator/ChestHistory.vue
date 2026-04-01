<template>
  <div>
    <v-btn @click="chestStore.resetHistory" class="mb-4">
      <v-icon icon="mdi-restore" size="large" start />Reset History</v-btn
    >
    <v-expansion-panels v-model="expandedPanels" variant="accordion" multiple>
      <v-expansion-panel
        v-for="{ value, title, list } in expandConfig"
        :value="value"
        :key="value"
        :title="title"
      >
        <template #text>
          <v-container>
            <v-row dense justify="center">
              <v-col
                v-for="(drop, index) in list"
                :key="`left${index}`"
                class="flex-grow-0"
              >
                <DropDisplay
                  :drop-element="drop"
                  with-count="true"
                  hide-name="true"
                />
              </v-col>
            </v-row>
          </v-container>
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
<script setup>
import { useChestStore } from "@/store/chestStore";
import DropDisplay from "./DropDisplay.vue";
import { computed, ref } from "vue";

const expandedPanels = ref([
  // "left",
  // "right",
  // "exclusive",
  // "uncommon",
  // "rare",
  // "superRare",
]);
const chestStore = useChestStore();

const leftFlatDropList = computed(() => {
  return flatDropList(chestStore.leftDrops);
});
const rightFlatDropList = computed(() => {
  return flatDropList(chestStore.rightDrops);
});
const exclusiveFlatDropList = computed(() => {
  return flatDropList(chestStore.exclusiveDrops);
});
const uncommonFlatDropList = computed(() => {
  return flatDropList(chestStore.uncommonDrops);
});
const rareFlatDropList = computed(() => {
  return flatDropList(chestStore.rareDrops);
});
const superRareFlatDropList = computed(() => {
  return flatDropList(chestStore.superRareDrops);
});

const expandConfig = ref([
  { value: "left", title: "Left Common Drops", list: leftFlatDropList },
  { value: "right", title: "Right Common Drops", list: rightFlatDropList },
  {
    value: "exclusive",
    title: computed(
      () => `Exclusive Drops (${chestStore.exclusiveDrops.dropCount})`
    ),
    list: exclusiveFlatDropList,
  },
  {
    value: "uncommon",
    title: computed(
      () => `Uncommon Drops (${chestStore.uncommonDrops.dropCount})`
    ),
    list: uncommonFlatDropList,
  },
  {
    value: "rare",
    title: computed(() => `Rare Drops (${chestStore.rareDrops.dropCount})`),
    list: rareFlatDropList,
  },
  {
    value: "superRare",
    title: computed(
      () => `Super Rare Drops (${chestStore.superRareDrops.dropCount})`
    ),
    list: superRareFlatDropList,
  },
]);

function flatDropList(dropPool) {
  const result = [];
  for (let drop of dropPool.dropList) {
    if (drop.id) {
      result.push(drop);
    } else {
      result.push(...flatDropList(drop));
    }
  }
  return result;
}
</script>
<style></style>
