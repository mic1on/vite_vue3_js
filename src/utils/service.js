import axios from 'axios';
import qs from 'qs';
import { ElMessage } from 'element-plus';
import router from "@/router";

const HTTP_TYPE = {
  GET: 0,
  POST: 1,
  PUT: 2,
  DELETE: 3,
  UPLOAD_POST: 4,
  UPLOAD_PUT: 5,
  DOWNLOAD: 6,
  JSON_POST: 7,
  JSON_PUT: 8,
  JSON_PATCH: 9,
};
var _axios = axios.create({
    baseURL: '',//接口统一域名
    timeout: 30000                                                       //设置超时
})

// 网络请求的总方法
const axiosService = (type, url, params) => {
  _axios.defaults.withCredentials = true
  _axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
  _axios.defaults.headers.post['Content-Type'] = 'application/json';
  const token = localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization');
  if (token) _axios.defaults.headers['Authorization'] = 'Bearer ' + token; // 添加token
  return new Promise((resolve, reject) => {
    switch (type) {
      case HTTP_TYPE.GET:
        _axios.get(spliceApiUrl(url, params))
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error.response);
          });
        break;
      case HTTP_TYPE.POST:
        _axios.post(url, qs.stringify(params, { arrayFormat: 'brackets' }))
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error.response);
          });
        break;
      case HTTP_TYPE.JSON_POST:
        const config = { headers: { 'Content-Type': 'application/json' } };
        _axios.post(url, params, config)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error.response);
          });
        break;
      case HTTP_TYPE.JSON_PUT:
        _axios.put(url, params, { headers: { 'Content-Type': 'application/json' } })
            .then(result => {
              resolve(result);
            })
            .catch(error => {
              reject(error.response);
            });
        break;
      case HTTP_TYPE.JSON_PATCH:
        _axios.patch(url, params, { headers: { 'Content-Type': 'application/json' } })
            .then(result => {
              resolve(result);
            })
            .catch(error => {
              reject(error.response);
            });
        break;
      case HTTP_TYPE.PUT:
        _axios.put(url, qs.stringify(params, { arrayFormat: 'brackets' }))
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error.response);
          });
        break;
      case HTTP_TYPE.DELETE:
        _axios.delete(url, {
          params,
          paramsSerializer: params => {
            return qs.stringify(params, { arrayFormat: 'brackets' });
          }
        })
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error.response);
          });
        break;
      case HTTP_TYPE.UPLOAD_POST:
        {
          const config = { headers: { 'Content-Type': 'multipart/form-data' } };
          _axios.post(url, params, config)
            .then(result => {
              resolve(result);
            })
            .catch(error => {
              reject(error.response);
            });
        }
        break;
      case HTTP_TYPE.UPLOAD_PUT:
        {
          const config = { headers: { 'Content-Type': 'multipart/form-data' } };
          _axios.put(url, params, config)
            .then(result => {
              resolve(result);
            })
            .catch(error => {
              reject(error.response);
            });
        }
        break;
    }
  });
};

// 针对RESTFUL接口单独处理url
const generateRestfulApi = (type, url, data) => {
  const params = JSON.parse(JSON.stringify(data));
  const reg = /{\w+}/g;
  if (reg.test(url)) {
    (url.match(reg) || []).forEach(matched => {
      const key = String(matched.match(/\w+/));
      url = url.replace(matched, params[key]);
      delete params[key];
    });
  }
  return axiosService(type, url, params);
};

// GET方法拼接url参数
const spliceApiUrl = (apiUrl, params) => {
  let url = '?';
  console.log(params)
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      if (params[key] != null) {
        url += key + '=' + params[key] + '&';
      }
    }
  }
  url = url.substring(0, url.length - 1);
  return apiUrl + url;
};

// 请求拦截器
_axios.interceptors.request.use((request) => {
  return request;
});

// 响应拦截器
_axios.interceptors.response.use(
  async (response, promise) => {
    // 服务器异常
    if (response.data.status === 'INTERNAL_ERROR') {
      ElMessage.error(response.data.msgDetail || response.data.msg || '服务异常'); // 提示信息
      // window.location.pathname = '/error';
      return Promise.resolve(false);
    }
    if (response.data.status === 'BAD_CREDENTIALS_ERROR') {
      ElMessage.error(response.data.msgDetail || response.data.msg || '服务异常'); // 提示信息
        // window.location.pathname = '/error';
        return Promise.resolve(false);
      }
    // 处理http-code 200时，业务逻辑返回错误的场景
    if (response.data.status !== 'SUCCESS' && response.data.status !== undefined) {
      ElMessage.error(response.data.msgDetail || response.data.msg || '服务异常'); // 提示信息
      return Promise.resolve(false);
    }
    return response.data;
  },
  (err, promise) => {
    console.log('出错提示', err, promise)

    if (err.request && err.request.readyState === 4 && err.request.status === 0) {
      // 超时
      ElMessage.error('网络请求超时');
    } else if (err.response) {
      if (err.response.status === 401) {
        ElMessage.error('登录已过期，请重新登录');
        router.push({path: '/login'})
        // store.dispatch('Logout');
      } else if (err.response.status === 403) {
        ElMessage.error('您的账号无此操作权限！');
      }  else if (err.response.status === 404) {
        ElMessage.error('请求数据不存在(404)');
      } else if (err.response.status >= 500) {
        ElMessage.error('服务器出错了，请稍后再试');
      } else {
        ElMessage.error(JSON.stringify(err.response.data));
      }
      return Promise.reject(err);
    }
  }
);

export default {
  HTTP_TYPE,
  axiosService,
  generateRestfulApi,
  _axios,
};
