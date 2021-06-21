import axios from 'axios'

const updateEndTime = (response) => {
  response.customData = response.customData || {}
  response.customData.time = new Date().getTime() - response.config.customData.startTime

  return response
}

axios.interceptors.request.use(request => {
  request.customData = request.customData || {}
  request.customData.startTime = new Date().getTime()

  return request
})

axios.interceptors.response.use(updateEndTime, error => {
  return Promise.reject(updateEndTime(error.response))
})