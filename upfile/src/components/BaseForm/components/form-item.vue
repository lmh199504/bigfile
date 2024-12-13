<template>
  <ElCol v-bind="colProps">
    <el-form-item :label="schema.label" :prop="schema.field" :rules="rules">
      <component
        v-bind="componentProps"
        :is="componentMap[schema.component]"
        v-model="formModel[schema.field]"
      />
    </el-form-item>
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
    component: 'ElInput'
  }),
  formModel: () => ({})
})
const colProps = computed(() => {
  return props.schema.colProps || {}
})

const componentProps = computed(() => {
  return props.schema.componentProps || {}
})

const rules = computed(() => {
  return props.schema.rules || []
})
</script>
