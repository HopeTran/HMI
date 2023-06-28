import axios from 'axios';
import qs from 'qs';

import { WEEKDAYS } from 'constants/common';
import store from 'store';

const APIS = {
  FAV_STORES: '/fav-stores',
  CUISINES: '/cuisines',
  STORES: '/stores',
  USER_DELIVERY_ADDRESSES: '/user-delivery-addresses',
  ATTRIBUTES: '/attributes',
  VALUES: 'values',
};

const config = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

async function getStores(params?: any): Promise<any> {
  const { data } = await axios.get(APIS.STORES, {
    params: {
      ...params
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
  return data;
}

async function getStoreById(id?: any, filter?: any): Promise<any> {
  const { data } = await axios.get(`${APIS.STORES}/${id}`, {
      params: { ...filter },
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
  });
  return data;
}

async function updateStores(params?: any): Promise<any> {
  const storeId = params.id;
  const platformCategories = JSON.stringify(params.platformCategories || []);
  const cuisines = JSON.stringify(params.cuisines || []);
  const operationTimes = params.operationTimes;

  if (operationTimes && operationTimes.length > 0) {
    operationTimes.map((operationTime: any) => {
      const availableFrom = operationTime?.availableFromDate;
      const availableTo = operationTime?.availableToDate;
      operationTime.storeId = storeId;
      operationTime.availableFrom = availableFrom ? `${availableFrom.getHours()}:${availableFrom.getMinutes()}:00` : '00:00:00';
      operationTime.availableTo = availableTo ? `${availableTo.getHours()}:${availableTo.getMinutes()}:00` : '00:00:00';
    });
  }

  const formData = new FormData();

  formData.append('id', params.id);
  formData.append('userId', params.userId);
  formData.append('name', params.name);
  formData.append('logoUpload', params.logoUpload);
  formData.append('description', params.description);
  formData.append('photoUpload', params.photoUpload);
  formData.append('platformCategories', platformCategories);
  formData.append('cuisines', cuisines);
  formData.append('operationTimes', JSON.stringify(operationTimes || []));
  formData.append('countryCode', params.countryCode);
  formData.append('address', params.address);
  formData.append('longitude', params.longitude);
  formData.append('latitude', params.latitude);
  formData.append('active', JSON.stringify(params.active));
  formData.append('currency', params.currency);

  const { data } = await axios.put(`${APIS.STORES}`, formData, config);
  return data;
};

async function createStore(params: any): Promise<any> {
  const { data } = await axios.post(`${APIS.STORES}`, params);
  return data
}

async function deleteStores(id?: any): Promise<any> {
  const { data } = await axios.delete(`/stores/${id}`);
  return data
}

async function getPlatformCategories(params?: any): Promise<any> {
  const reduxStore = store.getState()
  
  const { data } = await axios.get('/platform-categories', {
    params: {
      ...params,
      searchLocationRadius: reduxStore.user?.user.searchLocationRadius || 10,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });

  return data;
}

async function addPlatformCategory(params?: any): Promise<any> {
  const formData = new FormData();
  formData.append('name', params.name);
  formData.append('description', params.description);
  formData.append('photoUploadData', params.photoUploadData);
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  const { data } = await axios.post('/platform-categories', formData, config);
  return data;
}

async function updatePlatformCategory(params?: any): Promise<any> {
  const formData = new FormData();
  formData.append('id', params.id);
  formData.append('name', params.name);
  formData.append('description', params.description);
  formData.append('iconFileData', params.iconFileData);
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  const { data } = await axios.put('/platform-categories', formData, config);
  return data;
}

async function deletePlatformCategory(id: number): Promise<any> {
  const { data } = await axios.delete(`/platform-categories?id=${id}`);
  return data;
}

async function getCuisines(params?: any): Promise<any> {
  const { data } = await axios.get(`${APIS.CUISINES}`, params);
  return data;
}

async function getCuisineById(id: number) {
  const { data } = await axios.get(`${APIS.CUISINES}/${id}`);
  return data;
}

async function updateCuisines(params?: any) {
  const { data } = await axios.put(`${APIS.CUISINES}`, params);
  return data
}

async function addCuisine(params?: any) {
  const { data } = await axios.post(`${APIS.CUISINES}`, params);
  return data
}

async function deleteCuisine(id: number) {
  const { data } = await axios.delete(`${APIS.CUISINES}/${id}`);
  return data
}

async function getCategories(params?: any): Promise<any> {
  const { data } = await axios.get('/categories', {
    params: {
      ...params,
      preloads: ['Products'],
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
  return data;
}

async function addCategory(params?: any): Promise<any> {
  const { data } = await axios.post('/categories', params);
  return data;
}

async function updateCategory(params?: any): Promise<any> {
  const { data } = await axios.put('/categories', params);
  return data;
}

async function deleteCategory(id: number): Promise<any> {
  const { data } = await axios.delete(`/categories?id=${id}`);
  return data;
}

async function getProducts(params?: any): Promise<any> {
  const { data } = await axios.get('/products', {
    params: {
      ...params,
      preloads: params.preloads || ['Categories'],
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
  return data;
}

async function getProductById(id?: any): Promise<any> {
  const { data } = await axios.get(`/products/${id}`);
  return data;
}

async function saveProduct(params?: any): Promise<any> {
  const formData = new FormData();
  formData.append('storeId', params.storeId);
  formData.append('name', params.name);
  formData.append('description', params.description);
  formData.append('price', params.price);
  formData.append('inventory', params.inventory);
  formData.append('isGeneralMeal', params.isGeneralMeal);
  formData.append('photoUploadData', params.photoUploadData);
  formData.append('categories', JSON.stringify(params.categories));
  formData.append('photo', params.photo);
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  if (params.id && params.id > 0) {
    formData.append('id', params.id);
    const { data } = await axios.put('/products', formData, config);
    return data;
  } else {
    const scheduleMenus: any = [];
    WEEKDAYS.forEach((weekDay) => {
      scheduleMenus.push({
        storeId: params.storeId,
        weekDay: weekDay.value,
        price: params.price,
        inventory: Number(params.inventory) || 0,
        active: params.isGeneralMeal,
      });
    });

    formData.append('scheduleMenus', JSON.stringify(scheduleMenus));
    const { data } = await axios.post('/products', formData, config);
    return data;
  }
}

async function deleteProduct(id: number): Promise<any> {
  const { data } = await axios.delete(`/products?id=${id}`);
  return data;
}

async function getScheduleMenus(params?: any): Promise<any> {
  const { data } = await axios.get('/schedule-menus', {
    params: {
      ...params,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
  return data;
}

async function updateScheduleMenu(params?: any): Promise<any> {
  const { data } = await axios.put('/schedule-menus', params);
  return data;
}



async function getCarts(params?: any): Promise<any> {
  const { data } = await axios.get('/carts', {
    params: {
      ...params,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
  return data;
}

async function addCartItem(params?: any): Promise<any> {
  const { data } = await axios.post('/carts', params);
  return data;
}

async function updateCartItem(params?: any): Promise<any> {
  const { data } = await axios.put('/carts', params);
  return data;
}

async function deleteCartItem(id: any): Promise<any> {
  const { data } = await axios.delete(`/carts/${id}`);
  return data;
}

async function getOrders(params?: any): Promise<any> {
  const { data } = await axios.get('/orders', {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
  return data;
}

async function addOrder(params?: any): Promise<any> {
  const { data } = await axios.post('/orders', params);
  return data;
}

async function updateOrder(params?: any): Promise<any> {
  const { data } = await axios.put('/orders', params);
  return data;
}

async function deleteOrder(id: any): Promise<any> {
  const { data } = await axios.delete(`/orders/${id}`);
  return data;
}

async function getOrderById(id: any): Promise<any> {
  const { data } = await axios.get(`/orders/${id}`);
  return data;
}

async function getProfitSummary(params?: any): Promise<any> {
  const { data } = await axios.get(`/orders/profit-summary`, {
    params: {
      ...params,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
  return data;
}

async function getFavoriteStores(params?: any): Promise<any> {
  const { data } = await axios.get(APIS.FAV_STORES, {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
  return data;
}

async function addFavoriteStore(storeId: number): Promise<any> {
  const { data } = await axios.post(APIS.FAV_STORES, { params: { storeId } });
  return data;
}

async function removeFavoriteStore(storeId: number): Promise<any> {
  const { data } = await axios.delete(APIS.FAV_STORES, { params: { storeId } });
  return data;
}

async function fetchUserDeliveryAddress(): Promise<any> {
  const { data } = await axios.get(APIS.USER_DELIVERY_ADDRESSES);
  return data;
}

async function addUserDeliveryAddress(addressInfo: any): Promise<any> {
  return await axios.post(APIS.USER_DELIVERY_ADDRESSES, { ...addressInfo });
}

async function updateUserDeliveryAddress(addressInfo: any): Promise<any> {
  return await axios.put(`${APIS.USER_DELIVERY_ADDRESSES}`, addressInfo);
}

async function deleteUserDeliveryAddress(id: any): Promise<any> {
  return await axios.delete(`${APIS.USER_DELIVERY_ADDRESSES}/${id}`);
}

async function getAttributes(params?: any): Promise<any> {
  const { data } = await axios.get(APIS.ATTRIBUTES);
  return data;
}

async function addAttribute(params?: any): Promise<any> {
  const { data } = await axios.post(APIS.ATTRIBUTES, params);
  return data;
}

async function updateAttribute(params?: any): Promise<any> {
  const { data } = await axios.put(APIS.ATTRIBUTES, params);
  return data;
}

async function deleteAttribute(id: number): Promise<any> {
  const { data } = await axios.delete(`${APIS.ATTRIBUTES}?id=${id}`);
  return data;
}

async function getAttributeValues(attrId?: any): Promise<any> {
  const { data } = await axios.get(`${APIS.ATTRIBUTES}/${attrId}/${APIS.VALUES}`);
  return data;
}

async function addAttributeValues(params?: any): Promise<any> {
  const { data } = await axios.post(`${APIS.ATTRIBUTES}/${APIS.VALUES}`, params);
  return data;
}

async function updateAttributeValues(params?: any, attrId?: any): Promise<any> {
  
  const { data } = await axios.put(`${APIS.ATTRIBUTES}/${attrId}/${APIS.VALUES}`, params);
  return data;
}

async function deleteAttributeValues(attrId?: any, vId?: any): Promise<any> {
  const { data } = await axios.delete(`${APIS.ATTRIBUTES}/${attrId}/${APIS.VALUES}/${vId}`);
  return data;
}

export default {
  getStores,
  getStoreById,
  createStore,
  updateStores,
  deleteStores,
  getPlatformCategories,
  addPlatformCategory,
  updatePlatformCategory,
  deletePlatformCategory,  
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  getScheduleMenus,
  updateScheduleMenu,
  getCarts,
  updateCartItem,
  deleteCartItem,
  addCartItem,
  getOrders,
  getOrderById,
  addOrder,
  updateOrder,
  deleteOrder,
  getProfitSummary,
  getFavoriteStores,
  addFavoriteStore,
  removeFavoriteStore,
  getCuisines,
  getCuisineById,
  updateCuisines,
  addCuisine,
  deleteCuisine,
  fetchUserDeliveryAddress,
  addUserDeliveryAddress,
  updateUserDeliveryAddress,
  deleteUserDeliveryAddress,
  getAttributes,
  addAttribute, 
  updateAttribute,
  deleteAttribute,
  getAttributeValues,
  addAttributeValues, 
  updateAttributeValues,
  deleteAttributeValues
}