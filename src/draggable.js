import { onMounted, ref } from "vue";

export function drag() {
  const moveActive = ref(false);
  const titleClickedX = ref(0);
  const titleClickedY = ref(0);

  const positionX = ref(0);
  const positionY = ref(0);

  function titleMouseDown(e) {
    moveActive.value = true;

    titleClickedX.value = e.offsetX;
    titleClickedY.value = e.offsetY;
  }

  onMounted(() => {
    window.addEventListener('mousemove', e => {
      if (moveActive.value) {
        positionX.value = e.clientX - titleClickedX.value;
        positionY.value = e.clientY - titleClickedY.value;
      }
    });

    window.addEventListener('mouseup', () => {
      moveActive.value = false;
    });
  });

  return {
    moveActive,
    titleClickedX,
    titleClickedY,
    positionX,
    positionY,
    titleMouseDown,
  }
}