<script setup>
import { ref, onMounted } from 'vue';
import { drag } from '../draggable';

defineProps({
  error: Boolean,
  closeAlert: Function,
});

const alertPopup = ref(null);

const {
  positionX,
  positionY,
  titleMouseDown,
} = drag();

onMounted(() => {
  const boundingRect = alertPopup.value.getBoundingClientRect();

  positionX.value = window.innerWidth / 2 - boundingRect.width / 2;
  positionY.value = window.innerHeight / 2 - boundingRect.height / 2;
});
</script>

<template>
  <div class="error-popup window alert" ref="alertPopup" :class="{ active: error }" :style="{ left: `${positionX}px`, top: `${positionY}px` }">
    <div class="title-bar">
      <div class="title-bar-text" @mousedown="titleMouseDown">Hata</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize" disabled></button>
        <button aria-label="Maximize" disabled></button>
        <button aria-label="Close" @click="closeAlert"></button>
      </div>
    </div>
    <div class="window-body has-space">
      <p>
        Bağlantı hatası
      </p>
      <section class="field-row" style="justify-content: flex-end">
        <button class="default" @click="closeAlert">Tamam</button>
        <button @click="closeAlert">İptal</button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.error-popup {
  max-width: 300px;
  position: fixed;
  left: calc(50vw - 150px);
  top: 50vh;
}
</style>