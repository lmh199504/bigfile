<template>
  <el-col v-bind="getActionCol">
    <el-button @click="handleReset">重置</el-button>
    <el-button @click="handleSearh" type="primary">查询</el-button>
    <el-button v-if="showOpenBtn" type="primary" link @click="toggleOpen">{{
      isOpen ? '收起' : '展开'
    }}</el-button>
  </el-col>
</template>
<script setup lang="ts">
import type { ColProps } from 'element-plus'
import { computed } from 'vue'
import type { FormSchema } from '../types/form'

export interface FormActionProps {
  actionCol: Partial<ColProps>
  isOpen: boolean
  schema: FormSchema[]
  baseCol: Partial<ColProps>
  formModel: Record<string, any>
  showOpenBtn: boolean
}

const emit = defineEmits(['toggle'])

const props = withDefaults(defineProps<FormActionProps>(), {
  actionCol: () => ({}),
  isOpen: false,
  schema: () => [],
  baseCol: () => ({})
})

const handleReset = () => {}
const toggleOpen = () => {
  emit('toggle')
}
const handleSearh = () => {
  console.log('')
}

const getShowSchema = computed(() => {
  const res = props.schema.filter((item) => {
    const showFn = item.ifShow
    if (showFn && typeof showFn == 'function') {
      const res = showFn.call(null, { formModel: props.formModel, field: item.field })
      return res
    } else {
      return item.ifShow === false ? false : true
    }
  })
  return res
})

const getActionCol = computed(() => {
  let BASE_COL_SPAN = 24
  if (props.baseCol.span) {
    BASE_COL_SPAN = props.baseCol.span
  }
  let actionSpan = 6
  if (props.isOpen == false) {
    // 收起状态
    let colSum = 0
    for (let i = 0; i < getShowSchema.value.length; i++) {
      const item = getShowSchema.value[i]
      colSum += item.colProps?.span || BASE_COL_SPAN
      if (colSum >= 24) {
        actionSpan = 24 - (colSum - (item.colProps?.span || BASE_COL_SPAN))
        break
      }
    }
  } else {
    // 展开状态
    let colSum = 0
    for (let i = 0; i < getShowSchema.value.length; i++) {
      const item = getShowSchema.value[i]
      colSum += item.colProps?.span || BASE_COL_SPAN
      if (colSum >= 24 && i != getShowSchema.value.length) {
        colSum = 0
      } else if (colSum >= 24 && i == getShowSchema.value.length) {
        colSum = item.colProps?.span || BASE_COL_SPAN
      }
    }
    actionSpan = 24 - colSum
  }
  const actionCol = {
    style: {
      textAlign: 'right'
    },
    span: actionSpan,
    ...props.actionCol
  }
  return actionCol
})
</script>
