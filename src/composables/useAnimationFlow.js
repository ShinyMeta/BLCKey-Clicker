import { onBeforeUnmount } from "vue";

export function useAnimationFlow() {
  const scheduledTimeouts = new Map();
  let activeFlowId = 0;

  function clearScheduledSteps() {
    for (const [timeoutId, onCancel] of scheduledTimeouts.entries()) {
      window.clearTimeout(timeoutId);
      onCancel?.();
    }
    scheduledTimeouts.clear();
  }

  function beginFlow() {
    activeFlowId += 1;
    clearScheduledSteps();
    return activeFlowId;
  }

  function cancelFlow() {
    activeFlowId += 1;
    clearScheduledSteps();
    return activeFlowId;
  }

  function isFlowActive(flowId) {
    return flowId === activeFlowId;
  }

  function scheduleStep(flowId, delayMs, callback, onCancel) {
    const timeoutId = window.setTimeout(() => {
      const cancelHandler = scheduledTimeouts.get(timeoutId);
      scheduledTimeouts.delete(timeoutId);
      if (!isFlowActive(flowId)) {
        cancelHandler?.();
        return;
      }
      callback();
    }, delayMs);

    scheduledTimeouts.set(timeoutId, onCancel);
    return timeoutId;
  }

  function waitForStep(flowId, delayMs) {
    return new Promise((resolve) => {
      scheduleStep(flowId, delayMs, () => resolve(true), () => resolve(false));
    });
  }

  onBeforeUnmount(() => {
    clearScheduledSteps();
  });

  return {
    beginFlow,
    cancelFlow,
    isFlowActive,
    scheduleStep,
    waitForStep,
  };
}