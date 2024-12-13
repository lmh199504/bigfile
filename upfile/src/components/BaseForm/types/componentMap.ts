// import { ElInput, ElInputNumber, ElSelect, ElSelectV2, ElDatePicker } from 'element-plus'

import type { Component } from 'vue'

export interface ComponentMap {
  ElInput: Component
  ElInputNumber: Component
  ElSelect: Component
  ElSelectV2: Component
  ElDatePicker: Component
}



export const componentMap: ComponentMap = {
  ElInput,
  ElInputNumber,
  ElSelect,
  ElSelectV2,
  ElDatePicker
}

export type ComponentType = keyof ComponentMap
