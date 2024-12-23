<template>
  <BaseForm @register="register">
    <template #our="{ formModel, field }">
      <el-input v-model="formModel[field]" />
    </template>
  </BaseForm>
  <el-button @click="getValues">获取值</el-button>
</template>
<script setup lang="ts">
import BaseForm from '@/components/BaseForm/index.vue'
import { useForm } from '@/components/BaseForm/hooks/useForm'


const [register, form] = useForm({
  baseCol: {
    span: 6
  },
  actionCol: {
    span: 24,
    style: {
      textAlign: 'center'
    }
  },
  labelWidth: '80px',
  schemas: [
    {
      field: 'our',
      component: 'ElDatePicker',
      label: '时间',
      componentProps: {
        style: { width: '100%' },
        placeholder: '请选择'
      },
      // ifShow: false,
      slot: 'our'
    },
    {
      field: 'name',
      label: '姓名',
      component: 'ElInput',
      componentProps: {
        placeholder: '请输入'
      }
    },
    {
      field: 'age',
      label: '年龄',
      component: 'ElInput',
      colProps: {
        span: 6
      },
      componentProps: {
        placeholder: '请输入'
      }
    },
    {
      field: 'sex',
      label: '性别',
      component: 'ElInput',
      colProps: {
        span: 6
      },
      componentProps: ({ formModel }) => {
        return {
          placeholder: '请输入',
          onInput: (val: string) => {
            formModel.age = val
          },
          clearable: true
        }
      }
    },
    {
      field: 'type',
      label: '类型',
      component: 'ElSelectV2',
      colProps: {
        span: 6
      },
      componentProps: {
        placeholder: '请输入',
        options: [
          {
            label: '类型1',
            value: '1'
          },
          {
            label: '类型2',
            value: '2'
          }
        ]
      },
      rules: [
        {
          required: true,
          message: '类型不能为空'
        }
      ]
    },
    {
      field: 'time',
      component: 'ElDatePicker',
      label: '时间',
      componentProps: {
        style: { width: '100%' },
        placeholder: '请选择'
      },
      ifShow({ formModel }) {
        return formModel.sex
      }
    }
  ],
  showOpenBtn: false,
  open: true
})
const getValues = () => {
  const value = form.getFieldsValue()
  console.log(value)
  form.validate()
}

</script>
