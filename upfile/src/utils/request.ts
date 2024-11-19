import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
})

instance.interceptors.request.use(config => {
  return config
}, (err) => {
  return Promise.reject(err)
})
instance.interceptors.response.use(res => {
  return res
}, err => {
  return Promise.reject(err)
})

export default instance