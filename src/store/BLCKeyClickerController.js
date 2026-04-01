import { defineStore } from "pinia";
import { useInventoryStore } from "@/store/inventoryStore";
import { useLootStore } from "@/store/loot/lootStore";
import { useMapCompStore } from "@/store/mapCompStore";
import { useStatStore } from "@/store/statStore";
import { useTimerStore } from "@/store/timerStore";
import { computed } from "vue";
import { storeToRefs } from "pinia";

export const useBLCKeyClickerController = defineStore(
  "blcKeyClickerController",
  () => {
    const inventoryStore = useInventoryStore();
    const lootStore = useLootStore();
    const mapCompStore = useMapCompStore();
    const statStore = useStatStore();
    const timer = useTimerStore();

    const {currentChestConfig} = storeToRefs(lootStore);
    const { remainingMs } = storeToRefs(timer);

    const gameState = computed(() => {
      if (remainingMs.value <= 0) {
        // if there's no current chest config, it's a new game
        if (!currentChestConfig.value) {
          return "newGame";
        }

        // if time is out, check the returning exclusive. If they don't have it, it's game over.
        const returningExclusive = currentChestConfig.value?.sets?.returningExclusive?.items?.[0];
        if (returningExclusive && !lootStore.hasExclusiveDropped(returningExclusive.itemId)) {
          return "gameOver";
        }

        // otherwise, it's just between chest cycles
        return "betweenChestCycles";
      }

      // if time is still on the clock, we're in an active chest cycle
      return "activeChestCycle";
      
    })

    function isGameInState(state) {
      return gameState.value === state;
    }

    const isNewGame = computed(() => {
      return gameState.value === "newGame";
    });

    const isActiveChestCycle = computed(() => {
      return gameState.value === "activeChestCycle";
    });

    const isBetweenChestCycles = computed(() => {
      return gameState.value === "betweenChestCycles";
    });

    const isGameOver = computed(() => {
      return gameState.value === "gameOver";
    }); 

    function advanceMapCompletion(source = "unknown") {
      const reward = mapCompStore.advanceMapCompletion(source);
      if (!reward) {
        return null;
      }

      if (reward.type) {
        inventoryStore.adjustInventory(reward.type, 1);
      }

      return reward;
    }

    function openChest(keyType = "blcKey") {
      const spentKey = inventoryStore.spendInventory(keyType, 1);
      if (!spentKey) {
        return null;
      }

      statStore.addKeySpent(keyType);      

      return lootStore.open(keyType);
    }


    function newGameReset() {
      //reset inventory
      inventoryStore.resetInventory();
      //reset chest history, config/loot table
      lootStore.resetLootStore();
      //reset map comp
      mapCompStore.resetMapComp();
      //reset stats
      statStore.resetStats();
    }

    return {
      inventoryStore,
      lootStore,
      mapCompStore,
      
      gameState,
      isGameInState,
      isNewGame,
      isActiveChestCycle,
      isBetweenChestCycles,
      isGameOver,

      advanceMapCompletion,
      openChest,

      newGameReset,
    };
  }
);
