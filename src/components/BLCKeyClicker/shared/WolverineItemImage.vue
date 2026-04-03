<template>
  <div class="wolverine-item-image">
    <div class="missed-item-image">
      <ItemImage
        :item="props.item"
        size="196px"
      />
    </div>
    <v-img 
      :src="wolverineMemeSrc"
      class="wolverine-meme"
    />
  </div>
</template>

<script setup>
import ItemImage from './ItemImage.vue';
import wolverineMemeSrc from '@/assets/wolverineMeme.png';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});


</script>


<style scoped>
.wolverine-item-image {
  position: relative;
  width: 400px;
}

.missed-item-image {
  position: absolute;
  left: 110px;
  top: 340px;
  transform: rotate(-5deg);
}

</style>