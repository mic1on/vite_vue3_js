import service from '@/utils/service.js';
const { axiosService, HTTP_TYPE } = service;


export const fetchData = params => axiosService(HTTP_TYPE.GET, './table.json', params)
