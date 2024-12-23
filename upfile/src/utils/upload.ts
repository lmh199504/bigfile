import sparkMD5 from 'spark-md5'
import pLimit from 'p-limit'
import { computed, reactive, ref, type ComputedRef, type Ref } from 'vue'
import { reqFn, reqMergeFile } from '@/api/file'
import useFileIndexDB, { type FormatData } from './useLocalUpload'
import { guid } from '.'

export interface FileObj {
  data: Blob
  status: 'success' | 'error' | 'init'
  index: number
}

export interface ChunkUpload {
  loading: Ref<boolean>
  uploadFn: (list: FileObj[]) => Promise<void>
  retryFn: () => void
  pauseFn: () => void
  stopFn: () => void
  continueFn: () => void
  mergeFile: () => void
  progress: ComputedRef<number>
  startFn: () => void
  size: Ref<number>
  name: Ref<string>
  type: Ref<string>
  pauseState: ComputedRef<boolean>
  initByFile: (file: File, saveUid?: string) => Promise<void>
  initByList: (formatData: FormatData) => Promise<void>
  actionType: Ref<ActionType>
  netSpeed: Ref<number>
}
type ActionType = 'init' | 'uploading' | 'pause' | 'success' | 'wait' | 'merge'
export const useChunkUpload = (): ChunkUpload => {
  const { addData, updateDB, deleteDB } = useFileIndexDB()

  const loading = ref(false)
  const actionType = ref<ActionType>('init')
  const md5Str = ref('')

  // 网速
  const netSpeed = ref(0)

  // limit是线程池组件
  const limit = pLimit(5)
  const allList = ref<FileObj[]>([])

  const useTime = reactive({
    start: 0,
    end: 0
  })

  const size = ref()
  const name = ref()
  const type = ref()

  const isPause = ref(false)

  // 文件分片
  const chunkFile = (file: File, chunksize: number) => {
    const chunks = Math.ceil(file.size / chunksize)
    const chunksList: Blob[] = []
    let currentChunk = 0
    while (currentChunk < chunks) {
      const start = currentChunk * chunksize
      const end = Math.min(file.size, start + chunksize)
      const chunk = file.slice(start, end)
      chunksList.push(chunk)
      currentChunk++
    }
    return chunksList
  }
  // 请求
  const chunkPromise = (data: FormData) => {
    const i = Number(data.get('index'))

    //每个分片的请求
    return new Promise((resolve, reject) => {
      const start = Date.now()
      /* 这里写上传的 【接口2】，传data过去*/
      reqFn(data, {
        md5Str: md5Str.value,
        index: i
      })
        .then(() => {
          allList.value[i].status = 'success'
          // 单位秒
          const diff = (Date.now() - start) / 1000;
          // 
          netSpeed.value = allList.value[i].data.size / diff

          updateDB({
            myKey: md5Str.value + '-' + i,
            // file: file,
            blob: allList.value[i].data,
            md5: md5Str.value,
            index: i,
            status: 'success',
            name: name.value,
            size: size.value,
            type: type.value,
            allSize: allList.value.length,
            saveType: 'blob'
          })
          resolve('')
        })
        .catch(() => {
          allList.value[i].status = 'error'
          updateDB({
            myKey: md5Str.value + '-' + i,
            // file: file,
            blob: allList.value[i].data,
            md5: md5Str.value,
            index: i,
            status: 'error',
            name: name.value,
            size: size.value,
            type: type.value,
            allSize: allList.value.length,
            saveType: 'blob'
          })
          reject()
        })
    })
  }
  // 获取
  const hash = (chunks: Blob[]): Promise<string> => {
    // 返回一个Promise，这样调用者可以使用.then()或async/await来处理结果
    return new Promise((resolve) => {
      // 创建一个新的sparkMD5实例，用于计算MD5哈希值
      const spark = new sparkMD5.ArrayBuffer()

      // 定义一个递归函数_read，用于逐个处理chunks数组中的blob
      function _read(i: number) {
        // 如果索引i大于等于chunks数组的长度，说明所有blob都已经处理完毕
        if (i >= chunks.length) {
          // 调用sparkMD5实例的end方法，并传入resolve回调，以返回最终的哈希值
          const md5 = spark.end()
          resolve(md5)
          return // 读取完成，退出函数
        }

        // 获取当前索引i对应的blob
        const blob = chunks[i]

        // 创建一个新的FileReader实例，用于读取blob的内容
        const reader = new FileReader()

        // 设置FileReader的onload事件处理函数，当blob内容读取完成后调用
        reader.onload = (e: ProgressEvent<FileReader>) => {
          // 从事件对象e中获取读取到的字节数组
          const bytes = e.target!.result
          // 将字节数组添加到sparkMD5实例中，用于计算哈希值
          spark.append(bytes as ArrayBuffer)

          // 递归调用_read函数，处理下一个blob
          _read(i + 1)
        }

        // 以ArrayBuffer格式异步读取当前blob的内容
        reader.readAsArrayBuffer(blob) // 这里是读取操作开始的地方
      }

      // 从索引0开始，调用_read函数，处理chunks数组中的第一个blob
      _read(0)
    })
  }
  // 上传
  const uploadFn = async (list: FileObj[]) => {
    try {
      loading.value = true
      isPause.value = false
      const promiseList: Promise<unknown>[] = []
      list.map((item) => {
        const formData = new FormData()
        formData.append('file', item.data)
        formData.append('md5Str', md5Str.value)
        formData.append('index', item.index + '')
        promiseList.push(limit(() => chunkPromise(formData)))
      })
      await Promise.all(promiseList)
      await mergeFile()
      loading.value = false
    } catch (error) {
      loading.value = false
    }
  }
  // 重试
  const retryFn = () => {
    const needRetryList = allList.value.filter((item) => item.status != 'success')
    if (needRetryList.length) {
      uploadFn(needRetryList)
      actionType.value = 'uploading'
    } else {
      mergeFile()
    }
  }
  // 暂停上传
  const pauseFn = () => {
    limit.clearQueue()
    loading.value = false
    isPause.value = true
    actionType.value = 'pause'
  }
  // 停止上传
  const stopFn = () => {
    limit.clearQueue()
    loading.value = false
    isPause.value = true
    netSpeed.value = 0;
  }
  // 继续上传
  const continueFn = () => {
    retryFn()
  }
  // 开始上传
  const startFn = () => {
    useTime.start = Date.now()
    retryFn()
  }
  // 上传完成 合并图片
  const mergeFile = async () => {
    if (isComplete.value) {
      actionType.value = 'merge'
      await reqMergeFile({
        md5: md5Str.value,
        filename: name.value,
        count: allList.value.length
      })
      allList.value.forEach((item) => {
        deleteDB(md5Str.value + '-' + item.index)
      })
      actionType.value = 'success'

      useTime.end = Date.now()
      netSpeed.value = 0;

      console.log(useTime.end - useTime.start)
    }
  }
  // 是否全部上传完成
  const isComplete = computed(() => {
    const successNum = allList.value.filter((item) => item.status == 'success').length
    if (successNum == allList.value.length) {
      return true
    } else {
      return false
    }
  })
  // 初始化数据
  const initByList = async (formatData: FormatData) => {
    actionType.value = 'init'
    md5Str.value = formatData.myKey

    allList.value = formatData.list.map((item) => {
      name.value = item.name
      size.value = item.size
      type.value = item.type

      return {
        data: item.blob,
        index: item.index,
        status: item.status
      }
    })
    actionType.value = 'wait'
    startFn()
  }
  const initByFile = async (file: File, saveUid?: string) => {
    try {
      loading.value = true
      actionType.value = 'init'
      size.value = file.size
      name.value = file.name
      type.value = file.type
      const uid = saveUid || guid()

      // 有id说明存过 不需要再存一次
      if (!saveUid) {
        // 本地存储文件
        await addData({
          myKey: uid,
          file: file,
          saveType: 'file'
        })
      }
      const chunkList = chunkFile(file, 10 * 1024 * 1024)
      md5Str.value = await hash(chunkList)

      const pList = []
      for (let i = 0; i < chunkList.length; i++) {
        pList.push(
          addData({
            myKey: md5Str.value + '-' + i,
            // file: file,
            md5: md5Str.value,
            blob: chunkList[i],
            index: i,
            status: 'init',
            name: name.value,
            size: size.value,
            type: type.value,
            allSize: allList.value.length,
            saveType: 'blob'
          })
        )
      }

      await Promise.all(pList)

      // 分割文件存储完成 删除 本地源文件
      await deleteDB(uid)

      allList.value = chunkList.map((item, index) => {
        return {
          data: item,
          status: 'init',
          index
        }
      })
      loading.value = false
      actionType.value = 'wait'
      startFn()
    } catch (error) {
      console.log(error)
    }
  }

  const progress = computed(() => {
    if (!allList.value.length) return 0
    const successNum = allList.value.filter((item) => item.status == 'success').length
    return successNum / allList.value.length
  })

  const pauseState = computed(() => {
    return isPause.value
  })

  return {
    loading,
    uploadFn,
    retryFn,
    pauseFn,
    stopFn,
    continueFn,
    mergeFile,
    progress,
    startFn,
    size,
    name,
    type,
    pauseState,
    initByFile,
    initByList,
    actionType,
    netSpeed
  }
}
