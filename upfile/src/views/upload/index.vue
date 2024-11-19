

<template>
  <div>
    <el-upload :http-request="customUpload" :show-file-list="false">
      <el-button type="primary">选择文件</el-button>
    </el-upload>
    <el-table :data="list" border>
      <el-table-column prop="name" label="文件名" width="180" />
      <el-table-column prop="process" label="进度" width="180">
        <template #default="{ row }">
          <el-progress :percentage="row.progress * 100" :show-text="false" />
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="180" />
      <el-table-column prop="" label="操作" width="180">
        <template #default="{ row }">
          <el-button @click="handleUp(row)" :loading="row.loading" v-if="row.progress == 0"
            >开始上传</el-button
          >
          <template v-if="row.progress > 0 && row.progress < 1">
            <el-button @click="row.continueFn" v-if="row.pauseState">继续</el-button>

            <el-button @click="handlePause(row)" v-else>暂停</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import type { UploadRequestOptions } from 'element-plus'
import { ref } from 'vue'

import { useChunkUpload } from '@/utils/upload'

import type { ChunkUpload } from '@/utils/upload'

const list = ref<ChunkUpload[]>([])

const customUpload = async (options: UploadRequestOptions) => {
  const uploadObj: ChunkUpload = useChunkUpload(options.file)
  list.value.push(uploadObj as any)
}

const handleUp = (row: ChunkUpload) => {
  row.startFn()
}
const handlePause = (row: ChunkUpload) => {
  row.pauseFn()
  console.log(row.pauseState)
}
</script>