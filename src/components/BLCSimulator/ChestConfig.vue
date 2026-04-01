<template>
  <v-card title="Chest Configuration">
    <v-tabs v-model="tab" bg-color="primary">
      <v-tab value="leftConfig">Left Common</v-tab>
      <v-tab value="rightConfig">Right Common</v-tab>
      <v-tab value="fifthConfig">5th Drop</v-tab>
      <v-tab value="toggles">Cheat Codes</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="leftConfig">
          <drop-config-table
            :dropPool="chestStore.leftDrops"
            :dropPath="[`leftDrops`]"
          />
        </v-tabs-window-item>

        <v-tabs-window-item value="rightConfig">
          <drop-config-table
            :dropPool="chestStore.rightDrops"
            :dropPath="[`rightDrops`]"
          />
        </v-tabs-window-item>

        <v-tabs-window-item value="fifthConfig">
          <drop-config-table
            :dropPool="chestStore.fifthDrops"
            :dropPath="[`fifthDrops`]"
          />
        </v-tabs-window-item>

        <v-tabs-window-item value="toggles">
          <v-switch
            v-model="goldenKeyMode"
            label="Golden Key Mode"
            color="orange"
          ></v-switch>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>
<script setup>
import DropConfigTable from "@/components/BLCSimulator/DropConfigTable.vue";
import { useChestStore } from "@/store/chestStore";
import { ref, toRefs } from "vue";

let tab = ref("left");

const chestStore = useChestStore();
const { goldenKeyMode } = toRefs(chestStore);
</script>
