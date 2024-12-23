let db: IDBDatabase | null
const databaseName = 'file'
const version = 3
const storeName = 'blobList'
export interface IData {
  // indexedDB数据库key
  myKey: string
  // 原文件MD5
  md5: string
  // 分割的blob文件
  blob: Blob
  // 序号
  index: number
  // 上传状态
  status: 'success' | 'error' | 'init'
  // 文件名
  name: string
  // 文件大小
  size: number
  // 文件类型
  type: string
  // 一共有多少个
  allSize: number
  saveType: SVAE_TYPE
}

export interface FormatData {
  myKey: string
  list: IData[]
}

type SVAE_TYPE = 'blob' | 'file'
export interface LocalFile {
  myKey: string
  file: File
  saveType: SVAE_TYPE
}

const useLocalUpload = () => {
  const connect = (): Promise<IDBDatabase> => {
    if (db) return Promise.resolve(db)
    return new Promise((resolve, reject) => {
      const req = window.indexedDB.open(databaseName, version) // 数据库名称，版本号
      req.onsuccess = function (event: any) {
        // 监听数据库创建成功事件
        db = event.target.result // 数据库对象
        console.log('数据库打开成功', db)
        resolve(db as IDBDatabase)
      }
      req.onerror = function (error) {
        console.log('数据库打开报错')
        db = null
        reject(error)
      }
      req.onupgradeneeded = function (event: any) {
        console.log(event)
        db = event.target.result
        if (db && !db.objectStoreNames.contains(storeName)) {
          // keyPath是主键键值，也可以不传然后设定autoIncrement：true自动创建键值
          db.createObjectStore(storeName, { keyPath: 'myKey' })
        }
      }
    })
  }
  const addData = async (data: IData | LocalFile): Promise<void> => {
    await connect()

    const transaction = db!.transaction([storeName], 'readwrite') // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
    const objectStore = transaction.objectStore(storeName) // 仓库对象
    const request = objectStore.add(data)
    return new Promise((resolve, reject) => {
      request.onsuccess = function () {
        console.log('数据写入成功')
        resolve()
      }

      request.onerror = function () {
        reject()
      }
    })
  }

  const updateDB = async (data: IData | LocalFile): Promise<void> => {
    await connect()
    const transaction = db!.transaction([storeName], 'readwrite') // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
    const objectStore = transaction.objectStore(storeName) // 仓库对象
    const request = objectStore.put(data)

    return new Promise((resolve, reject) => {
      request.onsuccess = function () {
        console.log('数据写入成功')
        resolve()
      }

      request.onerror = function () {
        console.log('-----')
        reject()
      }
    })
  }

  const getAllData = async (type: SVAE_TYPE = 'blob'): Promise<FormatData[] | LocalFile[]> => {
    await connect()
    const transaction = db!.transaction([storeName], 'readonly')
    const objectStore = transaction.objectStore(storeName)
    // 打开游标
    const cursorRequest = objectStore.openCursor()
    const data: IData[] | LocalFile[] = []

    return new Promise((resolve, reject) => {
      cursorRequest.onsuccess = function (event: any) {
        const cursor = event.target.result
        if (cursor) {
          // 将每一个数据对象推入数组中
          if (cursor.value.saveType == type) {
            data.push(cursor.value)
          }
          cursor.continue()
        } else {
          if (type == 'blob') {
            // 所有数据已经处理完毕，将数据数组返回
            const res = formatByKey(data as IData[])
            resolve(res)
          } else {
            resolve(data as LocalFile[])
          }
        }
      }
      cursorRequest.onerror = () => {
        reject()
      }
    })
  }

  const getDB = async () => {
    if (!db) {
      await connect()
    }
    return db
  }

  const deleteDB = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = db!.transaction([storeName], 'readwrite').objectStore(storeName).delete(id)
      request.onsuccess = function () {
        console.log('数据删除成功')
        resolve()
      }

      request.onerror = function () {
        console.log('数据删除失败')
        reject()
      }
    })
  }

  const formatByKey = (data: IData[]): FormatData[] => {
    const res: FormatData[] = []
    data.forEach((item) => {
      const index = res.findIndex((i) => i.myKey == item.md5)
      if (index == -1) {
        res.push({
          myKey: item.md5,
          list: [item]
        })
      } else {
        res[index].list.push(item)
      }
    })

    // 过滤不完整的数据
    const filterRes: FormatData[] = []

    res.forEach((item) => {
      if (item.list.length != item.list[0].allSize) {
        // 数据不完整 直接删除
        for (let i = 0; i < item.list.length; i++) {
          deleteDB(item.list[i].myKey)
        }
      } else {
        filterRes.push(item)
      }
    })

    return filterRes
  }

  return {
    connect,
    getDB,
    addData,
    updateDB,
    getAllData,
    deleteDB,
    storeName
  }
}

export default useLocalUpload
