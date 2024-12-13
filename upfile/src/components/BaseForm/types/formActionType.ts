import type { FormProps } from './form'

export interface FormActionType<T = Record<string, any>> {
  setProps: (formProps: Partial<FormProps<T>>) => Promise<void>
  getFieldsValue: () => T;
  resetFields: () => Promise<void>;
  validate: () => Promise<void>;
}
