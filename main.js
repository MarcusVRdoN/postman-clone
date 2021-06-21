import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './axios.config'

import axios from 'axios'
import prettyBytes from 'pretty-bytes'
import setupEditors from './setup-editor'

const form = document.querySelector('[data-form]')
const queryParamsContainer = document.querySelector('[data-query-params]')
const queryParamsAddButton = document.querySelector('[data-add-query-param]')
const headersContainer = document.querySelector('[data-headers]')
const headersAddButton = document.querySelector('[data-add-header]')
const keyValueTemplate = document.querySelector('[data-key-value-template]')

const { requestEditor, responseEditor } = setupEditors()

const createKeyValue = () => {
  const element = keyValueTemplate.content.cloneNode(true)
  const removeButton = element.querySelector('[data-remove]')

  removeButton.addEventListener('click', (event) => {
    event.target.closest('[data-key-value]').remove()
  })

  return element
}
const appendKeyValueInContainer = (...containers) => {
  containers.forEach(container => container.append(createKeyValue()))
}
const keyValueToObject = (container) => {
  const keyValuePairs = container.querySelectorAll('[data-key-value]');

  return [...keyValuePairs].reduce((data, pair) => {
    const key = pair.querySelector('[data-key]').value
    const value = pair.querySelector('[data-value]').value

    if (key === '') return data

    return { ...data, [key]: value }
  }, {})
}
const updateResponseDetails = (response) => {
  const { data, headers, status, customData: { time }} = response
  const statusElement = document.querySelector('[data-status]')
  const timeElement = document.querySelector('[data-time]')
  const sizeElement = document.querySelector('[data-size]')

  statusElement.textContent = status
  timeElement.textContent = time
  sizeElement.textContent = prettyBytes(JSON.stringify(data).length + JSON.stringify(headers).length)
}
const updateResponseHeaders = (headers) => {
  const container = document.querySelector('[data-response-headers]')

  container.innerHTML = ''

  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement('div')
    const valueElement = document.createElement('div')

    keyElement.textContent = key
    valueElement.textContent = value

    container.append(keyElement, valueElement)
  })
}
const updateResponseEditor = (value) => {
  responseEditor.dispatch({
    changes: {
      from: 0,
      to: responseEditor.state.doc.length,
      insert: JSON.stringify(value, null, 2)
    }
  })
}

appendKeyValueInContainer(queryParamsContainer, headersContainer)

form.addEventListener('submit', (event) => {
  event.preventDefault()

  const url = document.querySelector('[data-url]').value
  const method = document.querySelector('[data-method]').value
  const params = keyValueToObject(queryParamsContainer)
  const headers = keyValueToObject(headersContainer)
  const request = { url, method, params, headers, data: {} }

  try {
    request.data = JSON.parse(requestEditor.state.doc.toString() || null)
  } catch (error) {
    console.error(error)
    alert('JSON data is malformed')

    return
  }

  axios(request).catch(error => error).then(response => {
    const responseContainer = document.querySelector('[data-response-section]')

    responseContainer.classList.remove('d-none')

    updateResponseDetails(response)
    updateResponseHeaders(response.headers)
    updateResponseEditor(response.data)
  })
})

queryParamsAddButton.addEventListener('click', () => appendKeyValueInContainer(queryParamsContainer))
headersAddButton.addEventListener('click', () => appendKeyValueInContainer(headersContainer))
