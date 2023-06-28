"use strict";

const axios = require("axios");
const qs = require("qs");
const { cloneDeep, remove, parseInt, find } = require("lodash");

const uploadService = require("./upload");
const config = require("../../config");
const accountService = require("../services/account")

const homeMadeInn = axios.create({
  baseURL: config.home_made_inn_service.uri,
  headers: {
    "Content-Type": "application/json",
    "API-TOKEN": config.home_made_inn_service.api_token,
  },
});

const API = {
  HEALTH: "/health",
  ORDERS: "/orders",
  USERS: "/users",
  STORES: "/stores",
  PLATFORM_CATEGORIES: "/platform-categories",
  CUISINES: "/cuisines",
  CATEGORIES: "/categories",
  PRODUCTS: "/products",
  SCHEDULE_MENUS: "/schedule-menus",
  CARTS: "/carts",
  ATTRIBUTES: "/attributes",
  ATTRIBUTE_VALUES: "values",
  PRODUCT_ATTRIBUTES: "/product-attributes",
};

async function healthCheck() {
  const response = await homeMadeInn.get(`${API.HEALTH}`);
  return response.data;
}

async function createUser(params) {
  const { data } = await homeMadeInn.post(`${API.USERS}`, params);
  return data;
}

async function createStore(params) {
  const { data } = await homeMadeInn.post(`${API.STORES}`, params);
  await accountService.updateAccountInfo(data.userId, {storeId: data.id});
  return data;
}

async function getStores(params) {
  const { data } = await homeMadeInn.get(`${API.STORES}`, {
    params: {
      ...params,
      preloads: ['PlatformCategories', 'Cuisines', 'ScheduleMenus', 'Categories.Products', 'OperationTimes']
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
  return data;
}

async function getStoresById(id, params) {
  const { data } = await homeMadeInn.get(`${API.STORES}/${id}`, {
    params: {
      ...params,
      preloads: ['PlatformCategories', 'Cuisines', 'ScheduleMenus', 'Categories.Products', 'OperationTimes']
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });

  data.categories?.forEach((category) => {
    const products = [];
    category.products.forEach((product) => {
      const scheduleProduct = find(data.scheduleMenus, {
        productId: product.id,
      });
      if (scheduleProduct) {
        product.price = scheduleProduct.price;
        product.inventory = scheduleProduct.inventory;
        products.push(product);
      }
    });
    category.products = products;
  });
  return data;
}

async function updateStores(params) {
  
  const storeId = parseInt(params.id);
  const platformCategories = params.platformCategories ? JSON.parse(params.platformCategories) : null;
  const cuisines = params.cuisines ? JSON.parse(params.cuisines) : null;
  const operationTimes = params.operationTimes ? JSON.parse(params?.operationTimes) : null;

  params.id = storeId;
  params.platformCategories = platformCategories;
  params.cuisines = cuisines;
  params.operationTimes = operationTimes;
  params.longitude = parseFloat(params.longitude);
  params.latitude = parseFloat(params.latitude);
  params.active = JSON.parse(params.active);

  if (params.photoUpload && params.photoUpload !== "undefined") {
    const fileName = await uploadService.detectAndUploadFile(
      params.photoUpload,
      `store_${storeId}_background`
    );
    params.photo = fileName;
    delete params.photoUpload;
  }
  if (params.logoUpload && params.logoUpload !== "undefined") {
    const fileName = await uploadService.detectAndUploadFile(
      params.logoUpload,
      `store_${storeId}_logo`
    );
    params.logo = fileName;
    delete params.logoUpload;
  }

  const { data } = await homeMadeInn.put(`${API.STORES}`, params);
  return data;
}

async function deleteStore(id) {
  const { data } = await homeMadeInn.delete(`${API.STORES}/${id}`);
  return data
}

async function getPlatformCategories(params) {
  const { data } = await homeMadeInn.get(`${API.PLATFORM_CATEGORIES}`, {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
  return data;
}

async function createPlatformCategory(params) {
  const formData = cloneDeep(params);

  delete formData.iconFileData;

  const response = await homeMadeInn.post(
    `${API.PLATFORM_CATEGORIES}`,
    formData
  );

  if (params.iconFileData && params.iconFileData !== "undefined") {
    await updatePlatformCategory({
      id: response.data.id,
      iconFileData: params.iconFileData,
    });
  }

  return response.data;
}

async function updatePlatformCategory(params) {
  const id = parseInt(params.id);

  params.id = id;

  if (params.iconFileData && params.iconFileData !== "undefined") {
    const fileName = await uploadService.detectAndUploadFile(
      params.iconFileData,
      `platform_category_${id}_icon`
    );
    params.icon = fileName;
  }

  const { data } = await homeMadeInn.put(`${API.PLATFORM_CATEGORIES}`, params);
  return data;
}

async function deletePlatformCategory(id) {
  const { data } = await homeMadeInn.delete(`${API.PLATFORM_CATEGORIES}/${id}`);
  return data;
}

async function getCuisines(queries) {
  const { data } = await homeMadeInn.get(`${API.CUISINES}`, queries);
  return data;
}

async function getCuisineById(id) {
  const { data } = await homeMadeInn.get(`${API.CUISINES}/${id}`);
  return data;
}

async function updateCuisines(params) {
  const { data } = await homeMadeInn.put(`${API.CUISINES}`, params);
  return data
}

async function createCuisine(params) {
  const { data } = await homeMadeInn.post(`${API.CUISINES}`, params);
  return data
}

async function deleteCuisine(id) {
  const { data } = await homeMadeInn.delete(`${API.CUISINES}/${id}`);
  return data
}

async function getCategories(params) {
  const { data } = await homeMadeInn.get(`${API.CATEGORIES}`, {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
  return data;
}

async function createCategory(params) {
  const { data } = await homeMadeInn.post(`${API.CATEGORIES}`, params);
  return data;
}

async function updateCategory(params) {
  const { data } = await homeMadeInn.put(`${API.CATEGORIES}`, params);
  return data;
}

async function deleteCategory(id) {
  const { data } = await homeMadeInn.delete(`${API.CATEGORIES}/${id}`);
  return data;
}

async function getProducts(params) {
  const { data } = await homeMadeInn.get(`${API.PRODUCTS}`, {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
  return data;
}

async function getProductById(id) {
  const { data } = await homeMadeInn.get(`${API.PRODUCTS}/${id}`);
  return data;
}

async function buildProductParams(params) {
  params.id = parseInt(params.id);
  params.storeId = parseInt(params.storeId);
  params.categories = JSON.parse(params.categories || []);
  params.price = parseFloat(params.price);
  params.inventory = parseInt(params.inventory);
  params.isGeneralMeal = params.isGeneralMeal === "true";

  if (params.scheduleMenus && params.scheduleMenus !== "undefined") {
    params.scheduleMenus = JSON.parse(params.scheduleMenus);
  }

  if (params.photoUploadData && params.photoUploadData !== "undefined") {
    const fileName =
      params.photo && params.photo.length > 0
        ? params.photo.substring(0, params.photo.lastIndexOf("."))
        : `store_${params.storeId}_product_${new Date().getTime()}`;
    params.photo = await uploadService.detectAndUploadFile(
      params.photoUploadData,
      fileName
    );
    delete params.photoUploadData;
  }
  return params;
}

async function createProduct(params) {
  const product = await buildProductParams(params);
  const response = await homeMadeInn.post(`${API.PRODUCTS}`, product);
  return response.data;
}

async function updateProduct(params) {
  const product = await buildProductParams(params);
  const { data } = await homeMadeInn.put(`${API.PRODUCTS}`, product);
  return data;
}

async function deleteProduct(id) {
  const { data } = await homeMadeInn.delete(`${API.PRODUCTS}/${id}`);
  return data;
}

async function getScheduleMenus(params) {
  const { data } = await homeMadeInn.get(`${API.SCHEDULE_MENUS}`, {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
  return data;
}

async function updateScheduleMenu(params) {
  const { data } = await homeMadeInn.put(`${API.SCHEDULE_MENUS}`, params);
  return data;
}

async function getCarts(params) {
  const { data } = await homeMadeInn.get(`${API.CARTS}`, {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
  return data;
}

async function createCart(params) {
  const { data } = await homeMadeInn.post(`${API.CARTS}`, params);
  return data;
}

async function updateCarts(params) {
  const { data } = await homeMadeInn.put(`${API.CARTS}`, params);
  return data;
}

async function deleteCart(userId, productId) {
  const { data } = await homeMadeInn.delete(
    `${API.CARTS}/${userId}/${productId}`
  );
  return data;
}

async function getOrders(params) {
  const { data } = await homeMadeInn.get(`${API.ORDERS}`, {
    params: params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
  return data;
}

async function getOrderById(id) {
  const { data } = await homeMadeInn.get(`${API.ORDERS}/${id}`);
  return data;
}

async function createOrder(params) {
  const { data } = await homeMadeInn.post(`${API.ORDERS}`, params);
  return data;
}

async function updateOrder(params) {
  const { data } = await homeMadeInn.put(`${API.ORDERS}`, params);
  return data;
}

async function deleteOrder(id) {
  const { data } = await homeMadeInn.delete(`${API.ORDERS}/${id}`);
  return data;
}

async function getProfitSummary(queries) {
  const { data } = await homeMadeInn.get(`${API.ORDERS}/profit-summary`, {
    params: queries,
  });
  return data;
}

async function updateFavoriteStores(userId, queries) {
  const { data } = await homeMadeInn.patch(`${API.USERS}/${userId}`, queries);
  return data;
}

async function getUserFavStores(userId, queries) {
  const { data } = await homeMadeInn.get(`${API.USERS}/${userId}`, {
    params: queries,
    paramsSerializer: (queries) => {
      return qs.stringify(queries, { arrayFormat: "repeat" });
    },
  });
  return data.favoriteStores;
}

async function getAllUserDeliveryAddresses(userId) {
  const { data } = await homeMadeInn.get(`/users/${userId}/delivery-addresses`)
  return data
}

async function createUserDeliveryAddress(userId, addressInfo) {
  const { data } = await homeMadeInn.post(`/users/${userId}/delivery-addresses`, addressInfo)
  return data
}

async function updateUserDeliveryAddress(userId, addressInfo) {
  const { data } = await homeMadeInn.put(`/users/${userId}/delivery-addresses`, addressInfo)
  return data
}

async function deleteUserDeliveryAddress(userId, addressId) {
  const { data } = await homeMadeInn.delete(`/users/${userId}/delivery-addresses/${addressId}`)
  return data
}

async function getAttributes(params) {
  const { data } = await homeMadeInn.get(`${API.ATTRIBUTES}`, {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
  return data;
}

async function getAttributeById(id) {
  const { data } = await homeMadeInn.get(`${API.ATTRIBUTES}/${id}`);
  return data;
}

async function createAttribute(params) {
  const response = await homeMadeInn.post(`${API.ATTRIBUTES}`, params);
  return response.data;
}

async function updateAttribute(params) {
  const { data } = await homeMadeInn.put(`${API.ATTRIBUTES}`, params);
  return data;
}

async function deleteAttribute(id) {
  const { data } = await homeMadeInn.delete(`${API.ATTRIBUTES}/${id}`);
  return data;
}

async function getAttributeValues(attrId) {
  const { data } = await homeMadeInn.get(`${API.ATTRIBUTES}/${attrId}/${API.ATTRIBUTE_VALUES}`);
  console.log("attrId", attrId)
  return data;
}

async function getAttributeValuesById(params, id) {
  const attrId = params.attribute_id
  const { data } = await homeMadeInn.get(`${API.ATTRIBUTES}/${attrId}/${API.ATTRIBUTE_VALUES}/${id}`);
  return data;
}

async function createAttributeValue(params) {
  const response = await homeMadeInn.post(`${API.ATTRIBUTES}/${API.ATTRIBUTE_VALUES}`, params);
  return response.data;
}

async function updateAttributeValue(params, attrId) {  
  const { data } = await homeMadeInn.put(`${API.ATTRIBUTES}/${attrId}/${API.ATTRIBUTE_VALUES}`, params);
  return data;
}

async function deleteAttributeValue(attrId, vid) {
  const { data } = await homeMadeInn.delete(`${API.ATTRIBUTES}/${attrId}/${API.ATTRIBUTE_VALUES}/${vid}`);
  return data;
}

async function getProductAttributes() {
  const attrId = params.attribute_id
  const { data } = await homeMadeInn.get(API.PRODUCT_ATTRIBUTES);
  return data;
}

async function getProductAttributeById(id) {
  const attrId = params.attribute_id
  const { data } = await homeMadeInn.get(`${API.PRODUCT_ATTRIBUTES}/${id}`);
  return data;
}

async function createProductAttribute(params) {
  const response = await homeMadeInn.post(`${API.PRODUCT_ATTRIBUTES}`, params);
  return response.data;
}

async function updateProductAttribute(params) {  
  const { data } = await homeMadeInn.put(`${API.PRODUCT_ATTRIBUTES}`, params);
  return data;
}

async function deleteProductAttribute(id) {
  const { data } = await homeMadeInn.delete(`${API.PRODUCT_ATTRIBUTES}/${id}`);
  return data;
}


module.exports = {
  healthCheck,
  createUser,
  createStore,
  getStores,
  updateStores,
  deleteStore,
  getPlatformCategories,
  createPlatformCategory,
  updatePlatformCategory,
  deletePlatformCategory,
  getCuisines,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getScheduleMenus,
  updateScheduleMenu,
  getStoresById,
  getCarts,
  createCart,
  updateCarts,
  deleteCart,
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getProfitSummary,
  updateFavoriteStores,
  getUserFavStores,
  getCuisineById,
  updateCuisines,
  createCuisine,
  deleteCuisine,
  getAllUserDeliveryAddresses,
  createUserDeliveryAddress,
  updateUserDeliveryAddress,
  deleteUserDeliveryAddress,
  getAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  getAttributeValues,
  getAttributeValuesById,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
  getProductAttributes,
  getProductAttributeById,
  createProductAttribute,
  updateProductAttribute,
  deleteProductAttribute
};
