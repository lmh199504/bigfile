<template>
  <!-- 虚拟列表可视区域 -->
  <div class="virtual-list" :style="{ height: `${height}px` }" @scroll="onScroll">
    <!-- 撑起出现滚动条的元素 -->
    <div class="total-height" :style="{ height: `${state.totalHeight}px` }"></div>
    <!-- 虚拟列表内容区域 -->
    <div class="virtual-body" :style="{ transform: `translateY(${state.scrollY}px` }">
      <!-- item 具有 index 及 name属性 与 VirtualRowVue 的props一致可以v-bind直接绑定 item-->
      <VirtualRowVue v-for="item in state.showList" v-bind="item" @changeSize="onChangeSize" :key="item.name" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import VirtualRowVue from './row.vue'

const props = defineProps({
  // 列表所有数据
  data: {
    type: Array,
    default: () => []
  },
  // 可视区域的高度
  height: {
    type: Number,
    default: 300
  },
  // 每一项的预估高度
  estimatedHeight: {
    type: Number,
    default: 50
  }
})

const state = ref({
  // 滚动距离
  scrollY: 0,
  showList: [],
  totalHeight: 0,
  endIndex: 0
})

// 记录渲染渲染过的项、会保存项的高度及相对于顶部的偏移量 类似 mapObj[index] = {offset: 20, height: 66}
const displayedData = {
  mapObj: {}, // 记录出现过的项的高度及相对于顶部的偏移量
  lastIndex: -1 // 记录上一次渲染的最后一个索引
}

watch(props.data, () => {
  // 渲染预估搞定的虚拟列表
  refreshShowList()
})

onMounted(async () => {
  // 等待子组件渲染完成，重新刷新可视区域列表、此时列表项高度才是真实的高度
  await nextTick()
  refreshShowList()
})

// 刷新可视区域的元素
const refreshShowList = () => {
  // 刷新总高度
  refreshTotalHeight()

  // 获取开始结束索引
  const [startIndex, endIndex] = getRangeIndex()

  // 遍历赋值可视区域数据
  state.value.showList = props.data.slice(startIndex, endIndex + 1)
}

// 获取开始结束索引
const getRangeIndex = () => {
  // 获取可视区域开始索引
  const startIndex = getStartIndex()
  // 获取可视区域结束索引
  const endIndex = getEndIndex(startIndex)

  return [Math.max(startIndex, 0), Math.min(endIndex, props.data.length - 1)]
}

// 获取可视区域开始索引
const getStartIndex = () => {
  // 找到偏移量大于等于滚动距离的第一个元素
  let startIndex = 0
  for (let i = 0; i < props.data.length; i++) {
    // 获取每一项的信息, 如果没有就使用预估高度
    const item = getItemInfo(i)
    if (item.offset >= state.value.scrollY) {
      startIndex = i
      break
    }
  }
  return startIndex
}

// 获取每一项的信息, 如果没有就使用预估高度
const getItemInfo = (index) => {
  const { mapObj, lastIndex } = displayedData
  // 如果是往下滚就是需要计算新的开始偏移量
  if (index > lastIndex) {
    // 第一项的时候 mapObj[lastIndex] 是 undefined 需要给个默认值
    const lastItem = mapObj[lastIndex] || {
      offset: 0,
      height: 0
    }

    // 计算新的开始偏移量没有记录的项统计使用预估高度
    let offset = lastItem.offset + lastItem.height
    for (let i = lastIndex + 1; i <= index; i++) {
      mapObj[i] = {
        offset,
        height: props.estimatedHeight
      }
      offset += props.estimatedHeight
    }

    // 更新最后一个索引
    displayedData.lastIndex = index
  }

  return mapObj[index]
}

// 获取可视区域结束索引
const getEndIndex = (startIndex) => {
  // 获取开始下标的项
  const startItem = getItemInfo(startIndex)
  // 计算最后的下标的偏移量
  const endOffset = startItem.offset + props.height

  // 遍历计算结束下标
  let endIndex = startIndex
  let offset = startItem.offset
  while (offset < endOffset && endIndex < props.data.length) {
    const item = getItemInfo(++endIndex)
    offset += item.height
  }

  return endIndex
}

// 计算总高度
const refreshTotalHeight = () => {
  // 获取已记录的最后一个元素
  const { mapObj, lastIndex } = displayedData
  const lastItem = mapObj[lastIndex] || {
    offset: 0,
    height: 0
  }
  // 计算已记录的总高度
  const displayedTotalHeight = lastItem.offset + lastItem.height
  // 计算未记录的总高度
  const unDisplayedTotalHeight = (props.data.length - lastIndex - 1) * props.estimatedHeight
  // 得到总高度
  state.value.totalHeight = displayedTotalHeight + unDisplayedTotalHeight
}

// 滚动的时候, 刷新可视区域列表
const onScroll = (e) => {
  if (state.value.endIndex >= props.data.length) {
    return
  }
  state.value.scrollY = e.target.scrollTop
  refreshShowList()
}

// 子元素大小改变
const onChangeSize = ({ index, height }) => {
  // 更新子元素高度
  const item = getItemInfo(index)
  item.height = height

  // 更新子元素偏移量
  const { lastIndex } = displayedData
  let offset = item.offset + item.height
  for (let i = index + 1; i <= lastIndex; i++) {
    const curItem = getItemInfo(i)
    curItem.offset = offset
    offset += curItem.height
  }
}
</script>

<style>
.virtual-list {
  overflow-y: auto;
  width: 100%;
  position: relative;
  border: dashed 1px blueviolet;
}

.total-height {
  width: 100%;
  position: absolute;
}

.virtual-body {
  position: relative;
  width: 100%;
}

.virtual-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: dashed 1px blueviolet;
}
</style>
