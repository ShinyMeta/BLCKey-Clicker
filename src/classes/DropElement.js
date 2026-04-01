import api from "@/utils/gw2api";

export class DropElement {
  constructor(
    id,
    label,
    weight,
    quantity = 1,
    idLocked = true,
    onlyOnce = false,
    exclude = false
  ) {
    this.label = label;
    this.id = id;
    this.weight = weight;
    this.quantity = quantity;
    this.idLocked = idLocked;
    this.onlyOnce = onlyOnce;
    this.exclude = exclude;
    this.dropCount = 0;

    api
      .items()
      .get(id)
      .then((x) => {
        this.item = x;
      });
  }

  setItemId(id) {
    this.id = id;
    api
      .items()
      .get(id)
      .then((x) => {
        this.item = x;
      });
  }

  getWeight() {
    if (this.exclude) return 0;
    else return this.weight;
  }

  resetHistory() {
    this.dropCount = 0;
    this.exclude = false;
  }

  randomDrop(chestsOpened) {
    this.dropCount++;
    if (this.onlyOnce) {
      this.dropCount = `${chestsOpened} keys`;
      this.exclude = true;
    }
    return this;
  }
}
