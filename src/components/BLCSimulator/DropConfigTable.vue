<template>
  <div>
    <v-data-table
      :headers="configHeaders"
      :items="dropPool.dropList"
      density="compact"
      items-per-page="25"
      item-value="label"
      show-expand
      :hide-default-header="isSubTable"
      :hide-default-footer="true"
      :class="isSubTable ? `isSubTable` : ``"
    >
      <!-- expand row slot (sub table) -->
      <template v-slot:expanded-row="{ columns, item, index }">
        <tr>
          <td :colspan="columns.length" class="pr-0">
            <drop-config-table
              :dropPool="item"
              :isSubTable="true"
              :dropPath="[...dropPath, index]"
            />
          </td>
        </tr>
      </template>

      <!-- expand row button -->
      <template
        #[`item.data-table-expand`]="{
          item,
          internalItem,
          toggleExpand,
          isExpanded,
        }"
      >
        <td v-if="item?.dropList" class="text-start lastColumnWidth">
          <v-btn
            variant="text"
            :icon="
              isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'
            "
            density="comfortable"
            @click="toggleExpand(internalItem)"
            class="v-data-table__expand-icon"
            :class="{ 'v-data-table__expand-icon--active': isExpanded }"
          >
          </v-btn>
        </td>
      </template>

      <!-- edit button -->
      <template #[`item.actions`]="{ item }">
        <v-icon class="me-2" size="small" @click="editDrop(item)">
          mdi-pencil
        </v-icon>
      </template>
    </v-data-table>
    <!-- edit modal -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedDrop.label }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col v-if="!editedDrop.dropList" cols="12" md="4" sm="6">
                <v-text-field
                  v-model.number="editedDrop.id"
                  label="Item Id"
                  type="number"
                  :disabled="editedDrop.idLocked"
                ></v-text-field>
              </v-col>
              <v-col v-if="editedDrop.dropList" cols="12" md="4" sm="6">
                <v-checkbox
                  label="Normalize"
                  v-model="editedDrop.normalize"
                ></v-checkbox>
              </v-col>
              <v-col cols="12" md="4" sm="6">
                <v-text-field
                  v-model.number="editedDrop.weight"
                  label="Drop Weight"
                  type="number"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="close">
            Cancel
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveDrop">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
// import useChestStore from "@/store/chestStore.js";
import { useChestStore } from "@/store/chestStore";
import { computed, ref } from "vue";
const props = defineProps(["dropPool", "dropPath", "isSubTable"]);

const poolWeight = computed(() => {
  return props.dropPool.getWeight(true);
});

const numberColWidth = "15%";

const configHeaders = [
  { title: "Drop Name/Type", key: "label" },
  {
    title: "Item Id",
    key: "id",
    width: numberColWidth,
    sortable: false,
  },
  {
    title: "Drop%",
    key: "dropPercent",
    width: numberColWidth,
    sortable: false,
    value: (drop) =>
      `${((drop.getWeight() / poolWeight.value) * 100).toFixed(2)}%`,
  },
  {
    title: "Weight",
    width: numberColWidth,
    key: "weight",
    value: (drop) => drop.getWeight(),
  },

  { title: "Edit", key: "actions", sortable: false, width: "5%" },
];

//stuff for edit
let editDialog = ref(false);
let editedIndex = -1;
let editedDrop = ref({});
const chestStore = useChestStore();

function editDrop(item) {
  editedIndex = props.dropPool.dropList.indexOf(item);
  editedDrop.value = Object.assign({}, item);
  editDialog.value = true;
}

function close() {
  editDialog.value = false;
}

function saveDrop() {
  //send editedDrop back to store somehow
  close();
  chestStore.updateDrop([...props.dropPath, editedIndex], editedDrop.value);
}
</script>
<style scoped>
.isSubTable {
  /* .isSubTable:deep(td) { */
  background-color: rgb(var(--v-theme-surface-light));
}
.isSubTable .isSubTable {
  background-color: rgb(var(--v-theme-surface));
}
</style>
