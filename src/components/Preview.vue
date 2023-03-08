<script setup>
import { ref, onMounted } from 'vue';
import { drag } from '../draggable';

defineProps({
  preview: Boolean,
  closePreview: Function,
  content: String,
  title: String,
});

const previewPopup = ref(null);

const {
  positionX,
  positionY,
  titleMouseDown,
} = drag();

onMounted(() => {
  const boundingRect = previewPopup.value.getBoundingClientRect();

  positionX.value = boundingRect.x;
  positionY.value = boundingRect.y;

  if (window.innerWidth > 900) {
    positionX.value = window.innerWidth / 2 - boundingRect.width / 2;
    positionY.value = window.innerHeight / 2 - boundingRect.height / 2;
  }
});
</script>

<template>
  <div class="preview-popup window violet glass" ref="previewPopup" :class="{ active: preview }" :style="{ left: `${positionX}px`, top: `${positionY}px` }">
    <div class="title-bar" style="padding: 0">
      <div class="title-bar-text" style="display: block; width: 100%; padding: 6px;" @mousedown="titleMouseDown">{{ title }} - Önizleme</div>
      <div class="title-bar-controls" style="margin-right: 6px;">
        <button aria-label="Minimize" disabled></button>
        <button aria-label="Maximize" disabled></button>
        <button aria-label="Close" @click="closePreview"></button>
      </div>
    </div>
    <div class="window-body">
      <iframe :srcdoc="content" frameborder="0" style="pointer-events: none;"></iframe>
    </div>
  </div>
</template>

<style scoped>
.preview-popup {
  width: 500px;
  height: 400px;
  position: fixed;
  left: calc(50vw - 250px);
  top: calc(50vh - 200px);
}

iframe {
  width: 100%;
  height: 100%;
}

.window-body {
  height: calc(100% - 35px);
}

.violet::before,
.violet > .title-bar {
  background-color: #805ba5;
}

@media screen and (max-width: 900px) {
  .preview-popup {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
  }
}
</style>