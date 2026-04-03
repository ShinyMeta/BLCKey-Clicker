import { defineStore } from "pinia";
import { useInventoryStore } from "@/store/inventoryStore";
import { useLootStore } from "@/store/loot/lootStore";
import { useMapCompStore } from "@/store/mapCompStore";
import { useStatStore } from "@/store/statStore";
import { useTimerStore } from "@/store/timerStore";
import { emitSoundEvent } from "@/services/sound";
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";

const GAME_STATES = Object.freeze({
  NEW_GAME: "newGame",
  ACTIVE_CHEST_CYCLE: "activeChestCycle",
  BETWEEN_CHEST_CYCLES: "betweenChestCycles",
  GAME_OVER: "gameOver",
});

export const useBLCKeyClickerController = defineStore(
  "blcKeyClickerController",
  () => {
    const inventoryStore = useInventoryStore();
    const lootStore = useLootStore();
    const mapCompStore = useMapCompStore();
    const statStore = useStatStore();
    const timer = useTimerStore();

    const { currentChestConfig } = storeToRefs(lootStore);
    const { remainingMs, isPaused: timerPaused } = storeToRefs(timer);

    const gameState = ref(GAME_STATES.NEW_GAME);

    function setGameState(nextState) {
      gameState.value = nextState;

      if (nextState === GAME_STATES.BETWEEN_CHEST_CYCLES) {
        lootStore.prepareNextChestConfig();
      }

      return gameState.value;
    }

    function getPostCycleState() {
      if (!currentChestConfig.value) {
        return GAME_STATES.NEW_GAME;
      }

      const returningExclusive = currentChestConfig.value?.sets?.returningExclusive?.items?.[0];
      const missedReturningExclusive =
        returningExclusive && !lootStore.hasExclusiveDropped(returningExclusive.itemId);

      if (missedReturningExclusive) {
        return GAME_STATES.GAME_OVER;
      }

      return GAME_STATES.BETWEEN_CHEST_CYCLES;
    }

    function syncStateFromStores() {
      if (remainingMs.value > 0) {
        setGameState(GAME_STATES.ACTIVE_CHEST_CYCLE);
        return;
      }

      setGameState(getPostCycleState());
    }

    function handleChestCycleTimerExpired() {
      if (!isGameInState(GAME_STATES.ACTIVE_CHEST_CYCLE)) {
        return gameState.value;
      }

      return setGameState(getPostCycleState());
    }

    // Keep controller state in sync when the timer naturally reaches zero.
    watch(remainingMs, (nextMs, prevMs) => {
      if (prevMs > 0 && nextMs <= 0) {
        handleChestCycleTimerExpired();
      }
    });

    syncStateFromStores();

    function isGameInState(state) {
      return gameState.value === state;
    }

    const isNewGame = computed(() => {
      return gameState.value === GAME_STATES.NEW_GAME;
    });

    const isActiveChestCycle = computed(() => {
      return gameState.value === GAME_STATES.ACTIVE_CHEST_CYCLE;
    });

    const isBetweenChestCycles = computed(() => {
      return gameState.value === GAME_STATES.BETWEEN_CHEST_CYCLES;
    });

    const isGameOver = computed(() => {
      return gameState.value === GAME_STATES.GAME_OVER;
    });

    const isPaused = computed(() => {
      return timerPaused.value;
    });

    // Whether the user can currently interact with the chest cycle (e.g. open chests, advance map completion).
    // Only true during an active chest cycle that's not paused.
    const isActiveInteractionEnabled = computed(() => {
      return isActiveChestCycle.value && !isPaused.value;
    });

    function startChestCycle(source = "unknown") {
      if (!isGameInState(GAME_STATES.NEW_GAME) && !isGameInState(GAME_STATES.BETWEEN_CHEST_CYCLES)) {
        return null;
      }

      const chestConfig = lootStore.generateCurrentChestConfig();

      // Ensure each new cycle always starts unpaused.
      timerPaused.value = false;
      timer.reset();
      emitSoundEvent("timerStart");
      setGameState(GAME_STATES.ACTIVE_CHEST_CYCLE);

      return {
        chestConfig,
        source,
      };
    }

    function togglePause() {
      if (!isGameInState(GAME_STATES.ACTIVE_CHEST_CYCLE)) {
        return false;
      }

      timer.togglePause();
      return true;
    }

    function advanceMapCompletion(source = "unknown") {
      if (!isActiveInteractionEnabled.value) {
        return null;
      }

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
      if (!isActiveInteractionEnabled.value) {
        return null;
      }

      const spentKey = inventoryStore.spendInventory(keyType, 1);
      if (!spentKey) {
        return null;
      }

      statStore.addKeySpent(keyType);      

      return lootStore.open(keyType);
    }


    function newGameReset() {
      setGameState(GAME_STATES.NEW_GAME);

      timerPaused.value = false;
      timer.stop();

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
      timer,
      
      gameStates: GAME_STATES,
      gameState,
      isGameInState,
      isNewGame,
      isActiveChestCycle,
      isBetweenChestCycles,
      isGameOver,
      isPaused,
      isActiveInteractionEnabled,

      startChestCycle,
      togglePause,

      advanceMapCompletion,
      openChest,

      newGameReset,
    };
  }
);
