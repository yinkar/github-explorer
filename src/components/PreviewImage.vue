<script setup>
defineProps({
  url: String,
  name: String,
});
</script>

<template>
  <div class="container">
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
}

.image {
  max-width:100%;
  max-height:100%;
}
</style>