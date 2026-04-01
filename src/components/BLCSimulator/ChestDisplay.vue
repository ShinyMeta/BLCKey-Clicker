<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <SpentStats />
      </v-col>
      <v-col cols="12" class="d-flex justify-center align-center">
        <v-btn
          size="x-large"
          rounded="pill"
          height="90"
          width="90"
          @click="chestStore.openNewChest"
        >
          <v-img
            src="@/assets/item/BLCKey.png"
            rounded="pill"
            min-width="64"
            class="buttonImage"
            v-show="!chestStore.goldenKeyMode"
          >
            <div class="d-flex justify-center align-center openButtonText">
              <span> OPEN </span>
            </div>
          </v-img>
          <v-img
            src="@/assets/item/goldenBLCKey.png"
            rounded="pill"
            min-width="64"
            class="buttonImage"
            v-show="chestStore.goldenKeyMode"
          >
            <div class="d-flex justify-center align-center openButtonText">
              <span> OPEN </span>
            </div>
          </v-img>
        </v-btn>
      </v-col>
      <v-col v-show="chestStore.chestCount">
        3rd Drop:
        <DropDisplay :drop-element="chestStore.leftDrops.lastRandom" />
      </v-col>
      <v-col v-show="chestStore.chestCount">
        4th Drop:
        <DropDisplay :drop-element="chestStore.rightDrops.lastRandom" />
      </v-col>
      <v-col v-show="chestStore.chestCount">
        5th Drop:
        <DropDisplay
          v-show="chestStore.fifthDropProc"
          :drop-element="chestStore.fifthDrops.lastRandom"
        />
        <DropDisplay
          v-show="!chestStore.fifthDropProc"
          :drop-element="noFifthDrop"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import DropDisplay from "@/components/BLCSimulator/DropDisplay.vue";
import { useChestStore } from "@/store/chestStore";
import SpentStats from "./SpentStats.vue";
import { ref } from "vue";
import { DropElement } from "@/classes/DropElement";

const noFifthDrop = ref(new DropElement(77359, "No Drop"));

const chestStore = useChestStore();
</script>

<style scoped>
.openButtonText {
  text-shadow: 2px 2px 3px black, -2px 2px 3px black, 2px -2px 3px black,
    -2px -2px 3px black;
  height: 100%;
}

.buttonImage {
  height: 100%;
}
</style>
