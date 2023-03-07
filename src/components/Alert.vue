<script setup>
defineProps({
  error: Boolean,
  closeAlert: Function,
});
</script>

<template>
  <div class="error-popup window alert" :class="{ active: error }">
    <div class="title-bar">
      <div class="title-bar-text">Hata</div>
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