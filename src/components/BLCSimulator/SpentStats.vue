<template>
  <v-table density="compact">
    <thead>
      <tr>
        <th class="text-left"></th>
        <th class="text-left">Theoretically Spent...</th>
        <th class="text-left">Exchange Rate</th>
      </tr>
    </thead>
    <tbody class="text-left">
      <tr>
        <td>Keys</td>
        <td>{{ chestStore.chestCount }}</td>
        <td></td>
      </tr>
      <tr>
        <td>Gems</td>
        <td>{{ theoreticallySpent.gems }}</td>
        <td>25 keys for 2100 gems ({{ gemsPerKey }} gems per key)</td>
      </tr>
      <tr>
        <td>USD</td>
        <td>${{ theoreticallySpent.dollars.toFixed(2) }}</td>
        <td>
          800 gems for $10 USD (${{ (dollarsPerGem * gemsPerKey).toFixed(2) }}
          USD per key)
        </td>
      </tr>
      <tr v-show="exchangeRateReturned">
        <td>Gold</td>
        <td>{{ theoreticallySpent.gold.toFixed(1) }}</td>
        <td>
          {{ goldPerGem * 400 }} gold for 400 gems ({{
            (goldPerGem * gemsPerKey).toFixed(1)
          }}
          gold per key)
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
<script setup>
import { computed, ref } from "vue";
import api from "@/utils/gw2api";
import { useChestStore } from "@/store/chestStore";
const chestStore = useChestStore();

const dollarsPerGem = 10 / 800;
const gemsPerKey = 2100 / 25;
let goldPerGem = ref(0);
let exchangeRateReturned = ref(false);
api
  .commerce()
  .exchange()
  .coins(1000 * 10000)
  .then((response) => {
    goldPerGem.value = response.coins_per_gem / 10000;
    exchangeRateReturned.value = true;
  });
const theoreticallySpent = computed(() => {
  const result = {
    gems: chestStore.chestCount * gemsPerKey,
    dollars: 0,
    gold: 0,
  };
  result.dollars = result.gems * dollarsPerGem;
  result.gold = result.gems * goldPerGem.value;
  return result;
});
</script>
