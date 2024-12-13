<template>
  <div class="form-wrapper">
    <el-form ref="formRef" :model="formModel">
      <el-row :gutter="10">
        <FormItem
          v-for="schema in getSchema"
          :schema="schema"
          :key="schema.field"
          :form-model="formModel"
        >
          <template v-for="item in Object.keys($slots)" #[item]="data">
            <slot :name="item" v-bind="data || {}"></slot>
          </template>
        </FormItem>
        <el-col :span="6">
          <el-button @click="handleReset">重置</el-button>
          <el-button>查询</el-button>
          <el-button type="primary" link @click="toggleOpen">{{
            isOpen ? '收起' : '展开'
          }}</el-button>
        </el-col>
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
    FormItem
  },
  setup(props, { emit }) {
    let $instance: ComponentInternalInstance | null = null
    const propsRef = ref<FormProps>({})
    const formRef = ref()

    const formModel = reactive<Record<string, any>>({})

    // 默认收起
    const isOpen = ref(false)

    const getProps = computed((): FormProps => {
      return { ...props, ...propsRef.value }
    })

    const getSchema = computed((): FormSchema[] => {
      return getProps.value.schemas || []
    })

    async function setProps(formProps: Partial<FormProps>): Promise<void> {
      propsRef.value = deepMerge(unref(propsRef) || {}, formProps)
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

    return {
      getSchema,
      formRef,
      isOpen,
      toggleOpen,
      formModel,
      handleReset,
      handleSubmit
    }
  }
})
</script>
<style scoped lang="less">
.form-wrapper {
  padding: 20px;
}
</style>
