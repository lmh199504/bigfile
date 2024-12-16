import type { ComputedRef, CSSProperties, Ref } from 'vue';
import type { ComponentType } from './componentMap'
import type { FormActionType } from './formActionType'
import type { ColProps, FormItemRule } from 'element-plus'

export interface FormProps<T = Record<string, any>> {
  disabled?: boolean;
  schemas?: FormSchema<T>[];
  baseCol?: Partial<ColProps>;
  actionCol?: Partial<ColProps & {style: CSSProperties }>;
  showOpenBtn?: boolean;
  open?: boolean;
  labelWidth?: string | number;
  labelPosition?: 'top' | 'left' | 'right';
}

export interface FormSchema<T = Record<string, any>> {
  field: keyof T | string;
  label: string;
  component: ComponentType;
  componentProps?: Record<string, any> | ((obj: { formModel: T, field: string }) => Record<string, any>);
  colProps?: Partial<ColProps>;
  defaultValue?: any;
  rules?: FormItemRule[];
  ifShow?: boolean | ((obj: { formModel: T, field: string }) => boolean);
  slot?: string;
  colSlot?: string;
}

export type UseFormReturn<T> = [(instance: FormActionType<T>) => void, FormActionType<T>]


export interface UseFormActionContext {
  formRef: Ref<FormActionType>;
  formModel: Record<string, any>;
  getSchema: ComputedRef<FormSchema[]>;
}