<template>
  <!-- 虚拟列表可视区域 -->
  <div class="virtual-row" ref="virtualRowRef">{{ name }}</div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps({
  // 每一行展示的内容
  name: {
    type: String,
    default: "",
  },
  // 数据在总列表的下标
  index: {
    type: Number,
    default: 0,
  },
});

const emits = defineEmits(["changeSize"]);

const virtualRowRef = ref(null);
let observe = null;
onMounted(() => {
  // 监视元素变化
  observe = new ResizeObserver(() => {
    emits("changeSize", {
      index: props.index,
      height: virtualRowRef.value.offsetHeight,
    });
  });

  // 监视行元素
  observe.observe(document.querySelector(".virtual-row"));
});

onUnmounted(() => {
  // 销毁监听
  observe?.disconnect?.();
});
</script>

<style>
.virtual-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: dashed 1px blueviolet;
}
</style>