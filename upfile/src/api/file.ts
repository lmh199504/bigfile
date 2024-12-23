import request from '@/utils/request'
import { type CancelToken } from 'axios'


export const reqFn = (data: FormData, params: any, cancelToken: CancelToken) => {
  return request({
    url: '/upload',
    data,
    params,
    method: 'post',
    cancelToken: cancelToken
  })
}

export const reqMergeFile = (data: { md5: string, filename: string, count: number }) => {
  return request({
    url: '/mergeFile',
    data,
    method: 'post'
  })
}