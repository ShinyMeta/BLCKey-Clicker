import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useRightPanelStore = defineStore(
  "rightPanelStore",
  () => {
    const path = ref([]);

    const currentView = computed(() =>
      path.value.length === 0 ? "root" : path.value[path.value.length - 1],
    );

    const pageMetaData = ref({})

    
    function navigateTo(newPath) {
      path.value = [...newPath];
    }

    function setPageMetadata(metadata) {
      pageMetaData.value = { ...metadata };
    }


    return {
      path,
      currentView,
      pageMetaData,
      setPageMetadata,
      navigateTo,
    }
  });