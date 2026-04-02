/**
 * hotkeys.js
 *
 * Standalone hotkey controller plugin. Not tied to a component and able
 * to reference Pinia stores. Add new bindings here.
 */
import { useBLCKeyClickerController } from '../store/BLCKeyClickerController'

export default {
  install (app) {
    function onKeydown (e) {
      // Escape toggles pause on the main timer
      if (e.key === 'Escape') {
        const controller = useBLCKeyClickerController()
        if (controller && typeof controller.togglePause === 'function') {
          controller.togglePause()
        }
      }
    }

    window.addEventListener('keydown', onKeydown)

    // Keep reference for potential future cleanup
    app.config.globalProperties.$__hotkeys_cleanup = () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }
}
