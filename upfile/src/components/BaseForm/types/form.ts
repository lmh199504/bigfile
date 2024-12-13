import type { ComputedRef, Ref } from 'vue';
import type { ComponentType } from './componentMap'
import type { FormActionType } from './formActionType'
import type { ColProps, FormItemRule } from 'element-plus'

export interface FormProps<T = Record<string, any>> {
  disabled?: boolean;
  schemas?: FormSchema<T>[];
}

export interface FormSchema<T = Record<string, any>> {
  field: keyof T | string;
  label: string;
  component: ComponentType;
  componentProps?: Record<string, any>;
  colProps?: Partial<ColProps>;
  defaultValue?: any;
  rules?: FormItemRule[];
}

export type UseFormReturn<T> = [(instance: FormActionType<T>) => void, FormActionType<T>]


export interface UseFormActionContext {
  formRef: Ref<FormActionType>;
  formModel: Record<string, any>;
  getSchema: ComputedRef<FormSchema[]>;
}