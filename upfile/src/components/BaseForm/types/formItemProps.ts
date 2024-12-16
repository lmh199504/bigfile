import type { FormProps, FormSchema } from './form'

export interface FormItemProps<T = Record<string, any>> {
  schema: FormSchema<T>;
  formModel: T;
  formProps: FormProps<T>;
  isOpen: boolean;
  index: number;
  masShowIndex: number;
}
