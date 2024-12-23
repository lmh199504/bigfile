<template>
  <div>
    <el-upload :http-request="customUpload" :show-file-list="false">
      <el-button type="primary">选择文件</el-button>
    </el-upload>
    <el-table :data="list" border>
      <el-table-column prop="name" label="文件名" />
      <el-table-column prop="process" label="进度">
        <template #default="{ row }">
          <el-progress :percentage="Number((row.progress * 100).toFixed(2))" />
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小">
        <template #default="{ row }">
          <span>{{ formatFileSize(row.size) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="" label="操作">
        <template #default="{ row }">
          <el-button v-if="row.actionType == 'init'" :loading="true">初始化中</el-button>
          <el-button v-if="row.actionType == 'wait'" @click="handleUp(row)">开始上传</el-button>
          <el-button v-if="row.actionType == 'pause'" @click="handleContinue(row)"
            >继续上传</el-button
          >
          <el-button v-if="row.actionType == 'uploading'" @click="handlePause(row)">暂停</el-button>
          <el-button v-if="row.actionType == 'merge'" loading>合并中</el-button>
          <el-button v-if="row.actionType == 'success'">已完成</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import type { UploadRequestOptions } from 'element-plus'
import { ref } from 'vue'

import { useChunkUpload } from '@/utils/upload'
// import useOriginFile from '@/utils/useOriginFile'

import type { ChunkUpload } from '@/utils/upload'
import useFileIndexDB, { type FormatData, type LocalFile } from '@/utils/useLocalUpload'

// const originFile = useOriginFile()

const list = ref<ChunkUpload[]>([])

const customUpload = async (options: UploadRequestOptions) => {
  const uploadObj: ChunkUpload = useChunkUpload()
  uploadObj.initByFile(options.file)
  list.value.push(uploadObj as any)
}

const handleUp = (row: ChunkUpload) => {
  row.startFn()
}
const handlePause = (row: ChunkUpload) => {
  row.pauseFn()
}
const handleContinue = (row: ChunkUpload) => {
  row.continueFn()
}
const { getAllData } = useFileIndexDB()

const getLocalData = async () => {
  const fileList = await getAllData('file')

  fileList.forEach((item) => {
    const uploadObj: ChunkUpload = useChunkUpload()
    uploadObj.initByFile((item as LocalFile).file, (item as LocalFile).myKey)
    list.value.push(uploadObj as any)
  })

  const data = await getAllData()

  data.forEach((item) => {
    const uploadObj: ChunkUpload = useChunkUpload()
    uploadObj.initByList(item as FormatData)
    list.value.push(uploadObj as any)
  })
}

function formatFileSize(size: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let threshold = 1024

  if (size === 0) {
    return '0 B'
  }

  let i = Math.floor(Math.log(size) / Math.log(threshold))

  return Number((size / Math.pow(threshold, i)).toFixed(2)) * 1 + ' ' + units[i]
}

getLocalData()
</script>
