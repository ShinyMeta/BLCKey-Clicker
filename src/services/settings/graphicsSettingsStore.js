import { defineStore } from "pinia";
import { useSaveManager } from "@/store/saveManager";

export const useGraphicsSettingsStore = defineStore("graphicsSettings", () => {
  const saveManager = useSaveManager();
  const graphicsSaveCategory = saveManager.useSaveCategory("graphics");
  const settingsResetType = saveManager.resetTypes.SETTINGS;

  const enableMapCompRain = graphicsSaveCategory.useSaveCategoryStorage("enableMapCompRain", {
    defaultValue: true,
    resetType: settingsResetType,
  });
  const mapCompBounceLevel = graphicsSaveCategory.useSaveCategoryStorage("mapCompBounceLevel", {
    defaultValue: "high",
    resetType: settingsResetType,
  });

  return { enableMapCompRain, mapCompBounceLevel };
});
