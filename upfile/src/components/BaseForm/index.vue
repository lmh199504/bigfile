<template>
  <div class="form-wrapper">
    <el-form
      ref="formRef"
      :model="formModel"
      :label-position="getProps.labelPosition"
      :label-width="getProps.labelWidth"
    >
      <el-row :gutter="10">
        <FormItem
          v-for="(schema, index) in getSchema"
          :schema="schema"
          :key="schema.field"
          :form-model="formModel"
          :formProps="getProps"
          :index="index"
          :mas-show-index="masShowIndex"
          :is-open="isOpen"
        >
          <template v-for="item in Object.keys($slots)" #[item]="data">
            <slot :name="item" v-bind="data || {}"></slot>
          </template>
        </FormItem>
        <FormAction
          :is-open="isOpen"
          :action-col="getProps.actionCol || {}"
          :schema="getSchema"
          :base-col="getProps.baseCol || {}"
          @toggle="toggleOpen"
          :form-model="formModel"
          :showOpenBtn="openBtn"
        />
      </el-row>
    </el-form>
  </div>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  unref,
  type ComponentInternalInstance
} from 'vue'
import { basicProps } from './props'
import type { FormProps, FormSchema } from './types/form'
import type { FormActionType } from './types/formActionType'
import FormItem from './components/form-item.vue'
import { useFormEvent } from './hooks/useFormEvent'
import FormAction from './components/form-action.vue'

function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`
}
function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object')
}
// 深度合并
function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}

export default defineComponent({
  props: basicProps,
  emits: ['register', 'submit'],
  components: {
    FormItem,
    FormAction
  },
  setup(props, { emit }) {
    let $instance: ComponentInternalInstance | null = null
    const propsRef = ref<FormProps>({})
    const formRef = ref()
    const formModel = reactive<Record<string, any>>({})
    const openBtn = ref(false)
    // 默认收起
    const isOpen = ref(props.open)
    const getProps = computed((): FormProps => {
      return { ...props, ...propsRef.value }
    })

    const getSchema = computed((): FormSchema[] => {
      return getProps.value.schemas || []
    })

    async function setProps(formProps: Partial<FormProps>): Promise<void> {
      propsRef.value = deepMerge(unref(propsRef) || {}, formProps)
      if (formProps.open !== undefined) {
        isOpen.value = !!formProps.open
      }
      if (formModel.showOpenBtn !== undefined) {
        openBtn.value = !!formProps.showOpenBtn
      }

      $instance = getCurrentInstance() || $instance
    }

    const { getFieldsValue, resetFields, validate } = useFormEvent({
      formModel,
      formRef,
      getSchema
    })

    const formActionType: Partial<FormActionType> = {
      setProps,
      getFieldsValue,
      resetFields,
      validate
    }
    onMounted(() => {
      initDefault()
      emit('register', formActionType)
    })

    onUnmounted(() => {
      $instance = null
    })
    const initDefault = () => {
      getSchema.value.forEach((item) => {
        if (item.defaultValue) {
          formModel[item.field] = item.defaultValue
        } else {
          formModel[item.defaultValue] = undefined
        }
      })
    }

    const toggleOpen = () => {
      isOpen.value = !isOpen.value
    }
    const handleReset = () => {
      resetFields()
    }
    const handleSubmit = () => {
      emit('submit', unref(formModel))
    }

    const masShowIndex = computed(() => {
      let BASE_COL_SPAN = 24
      const { baseCol } = getProps.value
      if (baseCol) {
        BASE_COL_SPAN = baseCol.span || 24
      }
      let colSum = 0
      let index = unref(getSchema).length
      for (let i = 0; i < unref(getSchema).length; i++) {
        const item = unref(getSchema)[i]
        colSum += item.colProps?.span || BASE_COL_SPAN
        if (colSum >= 24) {
          index = i - 1
        }
      }
      return index
    })

    return {
      getSchema,
      formRef,
      isOpen,
      toggleOpen,
      formModel,
      handleReset,
      handleSubmit,
      getProps,
      masShowIndex,
      openBtn
    }
  }
})
</script>
<style scoped lang="less">
.form-wrapper {
  padding: 20px;
}
</style>
