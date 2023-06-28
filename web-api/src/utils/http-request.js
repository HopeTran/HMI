'use strict';
const axios = require('axios');

class HttpRequest {
  constructor(baseURL, headers) {
    axios.defaults.baseURL = baseURL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    for (const key in headers) {
      axios.defaults.headers.common[key] = headers[key];
    }
  }

  get(uri, configs) {
    return axios.get(uri, configs);
  }

  post(uri, data, configs) {
    return axios.post(uri, data, configs);
  }

  put(uri, data, configs) {
    return axios.put(uri, data, configs);
  }
}

module.exports = HttpRequest;
