import { nextTick, ref, unref, watch } from 'vue'
import type { FormProps, UseFormReturn } from '../types/form'
import type { FormActionType } from '../types/formActionType'

function getDynamicProps<T, U>(props: T): Partial<U> {
  const ret: Record<string, any> = {}

  Object.keys(props!).map((key) => {
    ret[key] = unref((props as Record<string, any>)[key])
  })

  return ret as Partial<U>
}

export const useForm = <T = Record<string, any>>(
  props: Partial<FormProps<T>>
): UseFormReturn<T> => {
  const formRef = ref<FormActionType<T>>()

  const getForm = async (): Promise<FormActionType<T>> => {
    const form = unref(formRef)
    if (!form) {
      console.error('先注册form 傻狗')
    }
    await nextTick()
    return form as FormActionType<T>
  }

  const register = (instance: FormActionType<T>) => {
    props && instance.setProps(props)
    formRef.value = instance

    watch(
      () => props,
      () => {
        props && instance.setProps(getDynamicProps(props))
      },
      {
        immediate: true,
        deep: true
      }
    )
  }

  const method: FormActionType<T> = {
    getFieldsValue: () => {
      return formRef.value?.getFieldsValue() as T
    },
    setProps: async (formProps: Partial<FormProps<T>>): Promise<void> => {
      const form = await getForm()
      form.setProps(formProps)
    },
    resetFields: async () => {
      const form = await getForm();
      form.resetFields();
    },
    validate: async() => {
      const form = await getForm();
      form.validate()
    }
  }

  return [register, method]
}
