<template>
  <div>
    <v-card max-width=500>
      <v-card-title class="text-h5">Current Run Stats</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item><v-chip>{{ statStore.totalMapComps }}</v-chip> Total Map Completions</v-list-item>
          <v-list-item><v-chip>{{ statStore.totalKeysSpent.blcKey }}</v-chip> BLC Keys Spent</v-list-item>
          <v-list-item><v-chip>{{ statStore.totalKeysSpent.goldenKey }}</v-chip> Golden Keys Spent</v-list-item>
          <v-list-item><v-chip>{{ statStore.chestsSinceLastFifthDrop }}</v-chip> Chests Since Last 5th Drop
            (Unluckiest Streak: <v-chip>{{ statStore.unluckiestStreak }}</v-chip>)</v-list-item>
        </v-list>
      </v-card-text>
      
    </v-card>
  </div>

</template>

<script setup>  
  import { useStatStore } from "@/store/statStore";
  const statStore = useStatStore();
</script>