import request from '@/utils/request'

export const reqFn = (data: FormData, params: any) => {
  return request({
    url: '/upload',
    data,
    params,
    method: 'post'
  })
}

export const reqMergeFile = (data: { md5: string, filename: string, count: number }) => {
  return request({
    url: '/mergeFile',
    data,
    method: 'post'
  })
}