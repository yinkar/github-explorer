<script setup>
defineProps({
  preview: Boolean,
  closePreview: Function,
  content: String,
})
</script>

<template>
  <div class="preview-popup window glass" :class="{ active: preview }">
    <div class="title-bar">
      <div class="title-bar-text">Önizleme</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize" disabled></button>
        <button aria-label="Maximize" disabled></button>
        <button aria-label="Close" @click="closePreview"></button>
      </div>
    </div>
    <div class="window-body">
      <iframe :srcdoc="content" frameborder="0"></iframe>
    </div>
  </div>
</template>

<style scoped>
.preview-popup {
  width: 500px;
  height: 400px;
  position: fixed;
  left: calc(50vw - 250px);
  top: calc(50vw - 550px);
}

iframe {
  width: 100%;
  height: 100%;
}

.window-body {
  height: calc(100% - 35px);
}

@media screen and (max-width: 600px) {
  .preview-popup {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
  }
}
</style>