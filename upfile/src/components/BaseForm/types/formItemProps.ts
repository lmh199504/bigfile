import type { FormSchema } from './form'

export interface FormItemProps<T = Record<string, any>> {
  schema: FormSchema<T>;
  formModel: T
}
