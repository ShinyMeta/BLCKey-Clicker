import { defineStore } from "pinia";
import { useGraphicsSettingsStore } from "./graphicsSettingsStore";
import { useMiscSettingsStore } from "./miscSettingsStore";
import { useSoundSettingsStore } from "@/services/sound/soundSettingsStore";

export const useSettingsStore = defineStore("settings", () => {
  const graphics = useGraphicsSettingsStore();
  const misc = useMiscSettingsStore();
  const sound = useSoundSettingsStore();

  return { graphics, misc, sound };
});
