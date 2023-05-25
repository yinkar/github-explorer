<script setup>
import { ref } from 'vue';

defineProps({
  url: String,
  name: String,
});

const zoom = ref(false);

const toggleZoom = () => zoom.value = !zoom.value;
</script>

<template>
  <div class="container" @click="toggleZoom" :class="{ 'zoom': zoom }">
    <img :src="url" :alt="name" class="image">
  </div>
</template>

<style>
.container {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  cursor: zoom-out;
}

.image {
  max-width: 100%;
  max-height: 100%;
}

.zoom {
  text-align: unset;
  justify-content: flex-start;
  align-items: flex-start;
  cursor: zoom-in;
}

.zoom .image {
  max-width: unset;
  max-height: unset;
}
</style>