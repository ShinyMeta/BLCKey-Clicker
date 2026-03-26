/**
 * Event-driven loot drop processor.
 *
 * Subscribe handlers to specific item IDs or drop categories,
 * then feed drops through `processDrops()` to trigger matches.
 *
 * Category values correspond to the loot-table section the item
 * was drawn from: "guaranteed", "commonLeft", "commonRight",
 * or the 5th-drop categories "exclusive", "uncommon", "rare", "superRare".
 */
export class LootHandler {
  constructor() {
    this._itemIdHandlers = new Map();
    this._categoryHandlers = new Map();
    /** @type {Map<number, { itemId: number, label: string, dropped: boolean }>} */
    this._exclusiveLookup = new Map();
  }

  /**
   * Register a handler that fires when a drop matches the given item ID.
   * @param {number} itemId
   * @param {(drop: object) => void} handler
   * @returns {this}
   */
  onItemId(itemId, handler) {
    if (!this._itemIdHandlers.has(itemId)) {
      this._itemIdHandlers.set(itemId, []);
    }
    this._itemIdHandlers.get(itemId).push(handler);
    return this;
  }

  /**
   * Register a handler that fires when a drop belongs to the given category.
   * @param {string} category
   * @param {(drop: object) => void} handler
   * @returns {this}
   */
  onCategory(category, handler) {
    if (!this._categoryHandlers.has(category)) {
      this._categoryHandlers.set(category, []);
    }
    this._categoryHandlers.get(category).push(handler);
    return this;
  }

  /**
   * Adds new exclusives to the lookup for tracking,
   * should be called whenever a new chest is loaded
   * markExclusiveDropped() used to set dropped to true
   *
   * @param {Array<{ itemId: number, label: string }>} items
   */
  trackNewExclusives(items) {
    for (const item of items) {
      if (this._exclusiveLookup.has(item.itemId)) {
        continue;
      } else {
        this._exclusiveLookup.set(item.itemId, {
          itemId: item.itemId,
          label: item.label,
          dropped: false,
        });
      }
    }
  }

  /**
   * Mark an exclusive item as dropped.
   * @param {number} itemId
   * @returns {boolean} true if the item existed in the lookup
   */
  markExclusiveDropped(itemId) {
    const entry = this._exclusiveLookup.get(itemId);
    if (entry) {
      entry.dropped = true;
      return true;
    }
    return false;
  }

  /**
   * @param {number} itemId
   * @returns {boolean}
   */
  isExclusiveDropped(itemId) {
    return this._exclusiveLookup.get(itemId)?.dropped ?? false;
  }

  /** @returns {Map<number, { itemId: number, label: string, dropped: boolean }>} */
  get exclusiveLookup() {
    return this._exclusiveLookup;
  }

  /**
   * Process an array of drops, invoking all matching handlers
   * (item-ID handlers first, then category handlers).
   * @param {Array<object>} drops
   */
  processDrops(drops) {
    for (const drop of drops) {
      for (const fn of this._itemIdHandlers.get(drop.itemId) ?? []) {
        fn(drop);
      }
      for (const fn of this._categoryHandlers.get(drop.category) ?? []) {
        fn(drop);
      }
    }
  }
}
