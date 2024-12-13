<template>
  <BaseForm @register="register" />
  <el-button @click="getValues">获取值</el-button>
</template>
<script setup lang="ts">
import BaseForm from '@/components/BaseForm/index.vue'
import { useForm } from '@/components/BaseForm/hooks/useForm'

const [register, form] = useForm({
  schemas: [
    {
      field: 'name',
      label: '姓名',
      component: 'ElInput',
      colProps: {
        span: 6
      },
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
      componentProps: {
        placeholder: '请输入'
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
    }
  ]
})
console.log(form)
const getValues = () => {
  const value = form.getFieldsValue()
  console.log(value)
  form.validate();
}
</script>
