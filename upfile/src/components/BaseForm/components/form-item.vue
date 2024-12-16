<template>
  <ElCol v-bind="colProps" v-show="isShow">
    <slot :name="colSlot" v-bind="{ formModel, field: schema.field }">
      <el-form-item :label="schema.label" :prop="schema.field" :rules="rules">
        <slot :name="formSlot" v-bind="{ formModel, field: schema.field }">
          <component
            v-bind="componentProps"
            :is="componentMap[schema.component]"
            v-model="formModel[schema.field]"
          />
        </slot>
      </el-form-item>
    </slot>
  </ElCol>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { componentMap } from '../types/componentMap'
import type { FormItemProps } from '../types/formItemProps'

const props = withDefaults(defineProps<FormItemProps>(), {
  schema: () => ({
    field: '',
    label: '',
    component: 'ElInput',
    ifShow: true
  }),
  formModel: () => ({}),
  formProps: () => ({}),
  isOpen: false,
  index: 0,
  masShowIndex: 0
})
const colProps = computed(() => {
  const obj = Object.assign({}, props.formProps.baseCol, props.schema.colProps)
  return obj
})

const componentProps = computed(() => {
  const componentPropsFn = props.schema.componentProps
  if (typeof componentPropsFn == 'function') {
    const res = (
      componentPropsFn as (obj: {
        formModel: Record<string, any>
        field: string
      }) => Record<string, any>
    ).call(null, { formModel: props.formModel, field: props.schema.field })
    return res || {}
  }
  return props.schema.componentProps || {}
})

const rules = computed(() => {
  return props.schema.rules || []
})

const isShow = computed(() => {
  const showFn = props.schema.ifShow
  if (typeof showFn == 'function') {
    const flag = !!showFn.call(null, { formModel: props.formModel, field: props.schema.field })
    if (flag === false) {
      return false
    }
  } else {
    if (showFn === false) {
      return false
    }
  }

  if (props.isOpen) {
    return true
  }
  if (props.index >= props.masShowIndex) {
    return false
  }
  return true
})

const colSlot = computed(() => {
  return props.schema.colSlot
})
const formSlot = computed(() => {
  return props.schema.slot
})
</script>
