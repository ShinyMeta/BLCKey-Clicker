<template>
  <v-tooltip
    v-bind="tooltipProps"
    :disabled="!hasTooltip"
    location="top"
  >
    <template #activator="{ props: activatorProps }">
      <div
        v-bind="{ ...rootAttrs, ...activatorProps }"
        :class="rootClasses"
        :style="rootStyles"
      >
        <v-avatar
          v-bind="avatarProps"
          :size="normalizedSize"
          :rounded="rounded"
          class="item-image__avatar"
        >
          <v-img
            v-bind="imageProps"
            :src="currentImageSrc"
            :alt="altText"
            cover
            class="item-image__img"
            @error="handleImageError"
          />
        </v-avatar>

        <div
          v-if="showTextOverlay"
          :class="textOverlayClasses"
        >
          <v-chip
            v-if="usesChipOverlay"
            v-bind="textOverlayProps"
            size="small"
            class="item-image__text-chip text-subtitle-2 font-weight-black"
          >
            {{ resolvedTextOverlay }}
          </v-chip>
          <span
            v-else
            class="item-image__text-shadow text-subtitle-1 font-weight-black"
          >
            {{ resolvedTextOverlay }}
          </span>
        </div>

        <span
          v-if="showBadge"
          v-bind="badgeProps"
          class="item-image__badge"
        >
          {{ resolvedBadgeText }}
        </span>

        <div
          v-if="showCompletedOverlay"
          class="item-image__completed-overlay"
        >
          <v-icon
            :color="completedColor"
            :size="completedIconSize"
          >
            {{ completedIcon }}
          </v-icon>
        </div>
      </div>
    </template>

    <div class="item-image__tooltip">
      <div
        v-for="(line, index) in tooltipLines"
        :key="`${index}-${line}`"
        class="item-image__tooltip-line"
      >
        {{ line }}
      </div>
    </div>
  </v-tooltip>
</template>

<script setup>
import { computed, ref, useAttrs, watch } from "vue";
import noRewardImage from "@/assets/item/noReward.png";
import unknownImage from "@/assets/item/unknown.png";
import { fetchItemLikeMetadata } from "@/utils/gw2api";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  size: {
    type: [Number, String],
    default: 64,
  },
  rounded: {
    type: [Boolean, Number, String],
    default: "0",
  },
  badgeText: {
    type: String,
    default: null,
  },
  badgeColor: {
    type: String,
    default: "primary",
  },
  badgeProps: {
    type: Object,
    default: () => ({}),
  },
  completed: {
    type: null,
    default: null,
  },
  showCompletedOverlay: {
    type: Boolean,
    default: true,
  },
  completedIcon: {
    type: String,
    default: "mdi-check-circle",
  },
  completedIconSize: {
    type: [Number, String],
    default: 20,
  },
  completedColor: {
    type: String,
    default: "success",
  },
  textOverlay: {
    type: null,
    default: undefined,
  },
  textOverlayStyle: {
    type: String,
    default: "chip",
  },
  textOverlayPosition: {
    type: String,
    default: "center",
  },
  textOverlayProps: {
    type: Object,
    default: () => ({}),
  },
  tooltip: {
    type: null,
    default: undefined,
  },
  tooltipProps: {
    type: Object,
    default: () => ({}),
  },
  avatarProps: {
    type: Object,
    default: () => ({}),
  },
  imageProps: {
    type: Object,
    default: () => ({}),
  },
  fallback: {
    type: String,
    default: "unknown",
  },
  fallbackSrc: {
    type: String,
    default: "",
  },
});

const POSITION_ALIASES = {
  center: "center-center",
  top: "top-center",
  bottom: "bottom-center",
  left: "center-left",
  right: "center-right",
  "top-left": "top-left",
  "top-center": "top-center",
  "top-right": "top-right",
  "center-left": "center-left",
  "center-center": "center-center",
  "center-right": "center-right",
  "bottom-left": "bottom-left",
  "bottom-center": "bottom-center",
  "bottom-right": "bottom-right",
};

const attrs = useAttrs();
const metadata = ref(null);
const currentImageSrc = ref("");

const normalizedSize = computed(() =>
  typeof props.size === "number" ? `${props.size}px` : props.size
);

const rootBorderRadius = computed(() => {
  if (props.rounded === true) {
    return "9999px";
  }

  if (props.rounded === false || props.rounded === 0 || props.rounded === "0") {
    return "0";
  }

  if (typeof props.rounded === "number") {
    return `${props.rounded}px`;
  }

  const roundedValue = String(props.rounded);

  if (/^\d+$/.test(roundedValue)) {
    return `${roundedValue}px`;
  }

  return {
    xs: "2px",
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    pill: "9999px",
    circle: "50%",
  }[roundedValue];
});

const rootAttrs = computed(() => {
  return Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== "class" && key !== "style")
  );
});

const sourceItem = computed(() => props.item ?? {});

const resolvedIdInfo = computed(() => {
  if (sourceItem.value.skinId != null) {
    return { label: "skinId", value: sourceItem.value.skinId };
  }

  if (sourceItem.value.itemId != null) {
    return { label: "itemId", value: sourceItem.value.itemId };
  }

  if (sourceItem.value.id != null) {
    return { label: "id", value: sourceItem.value.id };
  }

  return null;
});

const metadataKey = computed(() =>
  JSON.stringify({
    skinId: sourceItem.value.skinId ?? null,
    itemId: sourceItem.value.itemId ?? null,
    id: sourceItem.value.id ?? null,
  })
);

watch(
  metadataKey,
  async () => {
    const requestKey = metadataKey.value;

    if (!resolvedIdInfo.value) {
      metadata.value = null;
      return;
    }

    const nextMetadata = await fetchItemLikeMetadata(sourceItem.value);

    if (requestKey !== metadataKey.value) {
      return;
    }

    metadata.value = nextMetadata;
  },
  { immediate: true }
);

const resolvedName = computed(
  () => sourceItem.value.name ?? sourceItem.value.label ?? metadata.value?.name ?? ""
);

const resolvedDescription = computed(() => sourceItem.value.description ?? "");

const fallbackImage = computed(() => {
  if (props.fallbackSrc) {
    return props.fallbackSrc;
  }

  return props.fallback === "noReward" ? noRewardImage : unknownImage;
});

const resolvedIcon = computed(
  () => sourceItem.value.icon ?? metadata.value?.icon ?? fallbackImage.value
);

watch(
  [resolvedIcon, fallbackImage],
  () => {
    currentImageSrc.value = resolvedIcon.value || fallbackImage.value;
  },
  { immediate: true }
);

const resolvedQuantity = computed(() => {
  const quantity = sourceItem.value.quantity;
  return quantity === "" ? null : quantity ?? null;
});

const isCompleted = computed(() => {
  if (typeof props.completed === "boolean") {
    return props.completed;
  }

  return Boolean(
    sourceItem.value.completed ?? sourceItem.value.obtained ?? sourceItem.value.dropped
  );
});

const resolvedBadgeText = computed(() => {
  if (isCompleted.value) {
    return "";
  }

  return props.badgeText ?? sourceItem.value.badgeText ?? "";
});

const normalizedOverlayPosition = computed(() => {
  const rawPosition = String(props.textOverlayPosition ?? "center")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  return POSITION_ALIASES[rawPosition] ?? "center-center";
});

const usesChipOverlay = computed(
  () => !["text", "shadow", "text-shadow"].includes(props.textOverlayStyle)
);

const resolvedTextOverlay = computed(() => {
  if (isCompleted.value || props.textOverlay === false) {
    return "";
  }

  if (
    props.textOverlay !== undefined &&
    props.textOverlay !== null &&
    props.textOverlay !== ""
  ) {
    return String(props.textOverlay);
  }

  const quantity = resolvedQuantity.value;
  const numericQuantity = Number(quantity);

  if (!quantity) {
    return "";
  }

  if (!Number.isNaN(numericQuantity) && numericQuantity === 1) {
    return "";
  }

  return String(quantity);
});

const showTextOverlay = computed(() => Boolean(resolvedTextOverlay.value));
const showBadge = computed(() => Boolean(resolvedBadgeText.value) && !isCompleted.value);
const showCompletedOverlay = computed(
  () => props.showCompletedOverlay && isCompleted.value
);

const defaultTooltipLines = computed(() => {
  const lines = [];
  const quantity = resolvedQuantity.value;

  if (resolvedName.value) {
    lines.push(
      quantity !== null && quantity !== false
        ? `${quantity} x ${resolvedName.value}`
        : resolvedName.value
    );
  }

  if (resolvedIdInfo.value) {
    lines.push(`${resolvedIdInfo.value.label}: ${resolvedIdInfo.value.value}`);
  }

  if (resolvedDescription.value) {
    lines.push(resolvedDescription.value);
  }

  return lines;
});

const tooltipLines = computed(() => {
  if (props.tooltip === false) {
    return [];
  }

  if (Array.isArray(props.tooltip)) {
    return props.tooltip.filter(Boolean).map(String);
  }

  if (typeof props.tooltip === "string") {
    return props.tooltip
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return defaultTooltipLines.value;
});

const hasTooltip = computed(() => tooltipLines.value.length > 0);

const altText = computed(() => resolvedName.value || "Item image");

const rootClasses = computed(() => [
  "item-image",
  `item-image--overlay-${normalizedOverlayPosition.value}`,
  attrs.class,
]);

const rootStyles = computed(() => [
  {
    width: normalizedSize.value,
    height: normalizedSize.value,
    borderRadius: rootBorderRadius.value,
    "--item-image-badge-background": `rgb(var(--v-theme-${props.badgeColor}))`,
    "--item-image-badge-color": `rgb(var(--v-theme-on-${props.badgeColor}))`,
  },
  attrs.style,
]);

const textOverlayClasses = computed(() => [
  "item-image__text-overlay",
  {
    "item-image__text-overlay--chip": usesChipOverlay.value,
  },
  `item-image__text-overlay--${normalizedOverlayPosition.value}`,
]);

function handleImageError() {
  if (currentImageSrc.value !== fallbackImage.value) {
    currentImageSrc.value = fallbackImage.value;
  }
}
</script>

<style scoped>
.item-image {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  justify-content: stretch;
  vertical-align: middle;
}

.item-image__avatar {
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.item-image__img {
  width: 100%;
  height: 100%;
}

.item-image__badge {
  position: absolute;
  top: -5px;
  right: -5px;
  padding: 1px 4px;
  border-radius: 999px;
  background: var(--item-image-badge-background);
  color: var(--item-image-badge-color);
  font-size: 9px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.04em;
}

.item-image__completed-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  border-radius: inherit;
}

.item-image__text-overlay {
  position: absolute;
  display: flex;
  pointer-events: none;
}

.item-image__text-overlay--chip {
  --item-image-chip-overhang: 8px;
}

.item-image__text-overlay--top-left {
  top: 4px;
  left: 4px;
}

.item-image__text-overlay--top-center {
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.item-image__text-overlay--top-right {
  top: 4px;
  right: 4px;
}

.item-image__text-overlay--center-left {
  top: 50%;
  left: 4px;
  transform: translateY(-50%);
}

.item-image__text-overlay--center-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.item-image__text-overlay--center-right {
  top: 50%;
  right: 4px;
  transform: translateY(-50%);
}

.item-image__text-overlay--bottom-left {
  bottom: 4px;
  left: 4px;
}

.item-image__text-overlay--bottom-center {
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.item-image__text-overlay--bottom-right {
  right: 4px;
  bottom: 4px;
}

.item-image__text-overlay--chip.item-image__text-overlay--top-left {
  top: calc(-1 * var(--item-image-chip-overhang));
  left: calc(-1 * var(--item-image-chip-overhang));
}

.item-image__text-overlay--chip.item-image__text-overlay--top-center {
  top: calc(-1 * var(--item-image-chip-overhang));
}

.item-image__text-overlay--chip.item-image__text-overlay--top-right {
  top: calc(-1 * var(--item-image-chip-overhang));
  right: calc(-1 * var(--item-image-chip-overhang));
}

.item-image__text-overlay--chip.item-image__text-overlay--center-left {
  left: calc(-1 * var(--item-image-chip-overhang));
}

.item-image__text-overlay--chip.item-image__text-overlay--center-right {
  right: calc(-1 * var(--item-image-chip-overhang));
}

.item-image__text-overlay--chip.item-image__text-overlay--bottom-left {
  bottom: calc(-1 * var(--item-image-chip-overhang));
  left: calc(-1 * var(--item-image-chip-overhang));
}

.item-image__text-overlay--chip.item-image__text-overlay--bottom-center {
  bottom: calc(-1 * var(--item-image-chip-overhang));
}

.item-image__text-overlay--chip.item-image__text-overlay--bottom-right {
  right: calc(-1 * var(--item-image-chip-overhang));
  bottom: calc(-1 * var(--item-image-chip-overhang));
}

.item-image__text-chip {
  background: rgba(0, 0, 0, 0.92);
  color: white;
}

.item-image__text-shadow {
  color: white;
  line-height: 1;
  text-shadow: 2px 2px 3px black, -2px 2px 3px black, 2px -2px 3px black,
    -2px -2px 3px black;
}

.item-image__tooltip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 320px;
  white-space: pre-line;
}

.item-image__tooltip-line {
  line-height: 1.35;
}
</style>
