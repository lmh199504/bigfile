import { unref } from 'vue'
import type { UseFormActionContext } from '../types/form'

export const useFormEvent = ({ formRef, formModel, getSchema }: UseFormActionContext) => {
  const getFieldsValue = () => {
    const values = unref(formModel)
    return values
  }
  const resetFields = async (): Promise<void> => {
    getSchema.value.forEach((item) => {
      formModel[item.field] = item.defaultValue || ''
    })
  }
  const validate = async(): Promise<void> => {
    formRef.value.validate()
  }
  return {
    getFieldsValue,
    resetFields,
    validate
  }
}
