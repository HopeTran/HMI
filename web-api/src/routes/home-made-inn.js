"use strict";

const PERMISSIONS = require("../utils/permissions");
const homeMadeInnService = require("../services/home-made-inn");
const config = require("../../config");

const APIs = {
  ADMIN: {
    ORDER: "/admin/orders/{orderId}",
  },

  STORES: "/stores",
  PLATFORM_CATEGORIES: "/platform-categories",
  CUISINES: "/cuisines",
  CATEGORIES: "/categories",
  PRODUCTS: "/products",
  SCHEDULE_MENUS: "/schedule-menus",
  CARTS: "/carts",
  ORDERS: "/orders",
  FAV_STORES: "/fav-stores",
  USER_DELIVERY_ADDRESSES: "/user-delivery-addresses",
  ATTRIBUTES: "/attributes",
  ATTRIBUTE_VALUES: "values",
  PRODUCT_ATTRIBUTES: "/product-attributes",
};

const DEFAULT_ADMIN_AUTH = {
  strategy: "jwt",
  scope: ["admin"],
};

module.exports = {
  name: "routes-home-made-inn",
  version: "1.0.0",
  register: (server) => {

    server.route({
      method: "GET",
      path: APIs.STORES,
      options: {
        auth: "jwt",
      },
      handler: async (request) => {
        return homeMadeInnService.getStores(request.query);
      },
    });

    server.route({
      method: "GET",
      path: `${APIs.STORES}/{id}`,
      handler: async (request) => {
        const { id } = request.params;
        return homeMadeInnService.getStoresById(id, request.query);
      },
    });

    server.route({
      method: "POST",
      path: APIs.STORES,
      options: {
        auth: "jwt",
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      handler: async (request) => {
        return homeMadeInnService.createStore(request.payload);
      },
    });

    server.route({
      method: "PUT",
      options: {
        auth: "jwt",
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      path: APIs.STORES,
      handler: async (request) => {
        return homeMadeInnService.updateStores(request.payload);
      },
    });

    server.route({
      method: "DELETE",
      path: `${APIs.STORES}/{id}`,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        },
      },
      handler: async (request) => {
        const { id } = request.params;
        return homeMadeInnService.deleteStore(id);
      },
    });

    server.route({
      method: "GET",
      path: APIs.PLATFORM_CATEGORIES,
      handler: async (request) => {
        return homeMadeInnService.getPlatformCategories({ ...request.query });
      },
    });

    server.route({
      method: "POST",
      path: APIs.PLATFORM_CATEGORIES,
      options: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        },
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      handler: async (request) => {
        return homeMadeInnService.createPlatformCategory(request.payload);
      },
    });

    server.route({
      method: "PUT",
      path: APIs.PLATFORM_CATEGORIES,
      options: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        },
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      handler: async (request) => {
        return homeMadeInnService.updatePlatformCategory(request.payload);
      },
    });

    server.route({
      method: "DELETE",
      path: APIs.PLATFORM_CATEGORIES,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        },
      },
      handler: async (request) => {
        const { id } = request.query;
        return homeMadeInnService.deletePlatformCategory(id);
      },
    });

    server.route({
      method: "GET",
      path: APIs.CUISINES,
      handler: async (request) => {
        return homeMadeInnService.getCuisines();
      },
    });

    server.route({
      method: "GET",
      path: `${APIs.CUISINES}/{id}`,
      handler: async (request) => {
        const { id } = request.params
        return homeMadeInnService.getCuisineById(id);
      },
    });

    server.route({
      method: "POST",
      path: APIs.CUISINES,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        }
      },
      handler: async (request) => {
        return homeMadeInnService.createCuisine(request.payload);
      },
    });

    server.route({
      method: "PUT",
      path: APIs.CUISINES,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        }
      },
      handler: async (request) => {
        return homeMadeInnService.updateCuisines(request.payload);
      },
    });    

    server.route({
      method: "DELETE",
      path: `${APIs.CUISINES}/{id}`,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        }
      },
      handler: async (request) => {
        const { id } = request.params;
        return homeMadeInnService.deleteCuisine(id);
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: APIs.CATEGORIES,
      handler: async (request) => {
        return homeMadeInnService.getCategories({ ...request.query });
      },
    });

    server.route({
      method: "POST",
      path: APIs.CATEGORIES,
      config: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
      },
      handler: async (request) => {
        return homeMadeInnService.createCategory(request.payload);
      },
    });

    server.route({
      method: "PUT",
      path: APIs.CATEGORIES,
      config: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
      },
      handler: async (request) => {
        return homeMadeInnService.updateCategory(request.payload);
      },
    });

    server.route({
      method: "DELETE",
      path: APIs.CATEGORIES,
      config: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
      },
      handler: async (request) => {
        const { id } = request.query;
        return homeMadeInnService.deleteCategory(id);
      },
    });

    server.route({
      method: "GET",
      path: APIs.PRODUCTS,
      handler: async (request) => {
        return homeMadeInnService.getProducts({ ...request.query });
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: `${APIs.PRODUCTS}/{id}`,
      handler: async (request) => {
        const { id } = request.params;
        return homeMadeInnService.getProductById(id);
      },
    });

    server.route({
      method: "POST",
      path: APIs.PRODUCTS,
      options: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      handler: async (request) => {
        return homeMadeInnService.createProduct(request.payload);
      },
    });

    server.route({
      method: "PUT",
      path: APIs.PRODUCTS,
      options: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      handler: async (request) => {
        return homeMadeInnService.updateProduct(request.payload);
      },
    });

    server.route({
      method: "DELETE",
      path: APIs.PRODUCTS,
      config: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
      },
      handler: async (request) => {
        const { id } = request.query;
        return homeMadeInnService.deleteProduct(id);
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: APIs.SCHEDULE_MENUS,
      handler: async (request) => {
        return homeMadeInnService.getScheduleMenus({ ...request.query });
      },
    });

    server.route({
      method: "PUT",
      config: {
        auth: "jwt",
      },
      path: APIs.SCHEDULE_MENUS,
      handler: async (request) => {
        return homeMadeInnService.updateScheduleMenu(request.payload);
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: APIs.CARTS,
      handler: async (request) => {
        return homeMadeInnService.getCarts({
          ...request.query,
          userId: request.user.id,
        });
      },
    });

    server.route({
      method: "POST",
      config: {
        auth: "jwt",
      },
      path: APIs.CARTS,
      handler: async (request) => {
        return homeMadeInnService.createCart(request.payload);
      },
    });

    server.route({
      method: "PUT",
      config: {
        auth: "jwt",
      },
      path: APIs.CARTS,
      handler: async (request) => {
        return homeMadeInnService.updateCarts(request.payload);
      },
    });

    server.route({
      method: "DELETE",
      path: `${APIs.CARTS}/{id}`,
      config: {
        auth: "jwt",
      },
      handler: async (request) => {
        return homeMadeInnService.deleteCart(
          request.user.id,
          request.params.id
        );
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: APIs.ORDERS,
      handler: async (request) => {
        return homeMadeInnService.getOrders({
          ...request.query,
          userId: request.user.id,
        });
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: `${APIs.ORDERS}/{id}`,
      handler: async (request) => {
        const { id } = request.params;
        return homeMadeInnService.getOrderById(id);
      },
    });

    server.route({
      method: "POST",
      options: {
        auth: "jwt",
      },
      path: APIs.ORDERS,
      handler: async (request) => {
        return homeMadeInnService.createOrder(request.payload);
      },
    });

    server.route({
      method: "PUT",
      options: {
        auth: "jwt",
      },
      path: APIs.ORDERS,
      handler: async (request) => {
        return homeMadeInnService.updateOrder(request.payload);
      },
    });

    server.route({
      method: "DELETE",
      path: `${APIs.ORDERS}/{id}`,
      options: {
        auth: "jwt",
      },
      handler: async (request) => {
        return homeMadeInnService.deleteOrder(request.params.id);
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: `${APIs.ORDERS}/profit-summary`,
      handler: async (request) => {
        return homeMadeInnService.getProfitSummary({ ...request.query });
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: `${APIs.FAV_STORES}`,
      handler: async (request) => {
        return homeMadeInnService.getUserFavStores(request.user.id, request.query);
      },
    });

    server.route({
      method: "POST",
      config: {
        auth: "jwt",
      },
      path: `${APIs.FAV_STORES}`,
      handler: async (request) => {
        return homeMadeInnService.updateFavoriteStores(request.user.id, {
          isAdd: true,
          storeId: Number(request.payload.params.storeId),
        });
      },
    });

    server.route({
      method: "DELETE",
      config: {
        auth: "jwt",
      },
      path: `${APIs.FAV_STORES}`,
      handler: async (request) => {
        return homeMadeInnService.updateFavoriteStores(request.user.id, {
          storeId: Number(request.query.storeId),
        });
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt"
      },
      path: `${APIs.USER_DELIVERY_ADDRESSES}`,
      handler: (request) => {
        return homeMadeInnService.getAllUserDeliveryAddresses(request.user.id)
      }
    })

    server.route({
      method: "POST",
      config: {
        auth: "jwt"
      },
      path: `${APIs.USER_DELIVERY_ADDRESSES}`,
      handler: (request) => {
        return homeMadeInnService.createUserDeliveryAddress(request.user.id, request.payload)
      }
    })

    server.route({
      method: "PUT",
      config: {
        auth: "jwt"
      },
      path: `${APIs.USER_DELIVERY_ADDRESSES}`,
      handler: (request) => {
        return homeMadeInnService.updateUserDeliveryAddress(request.user.id, request.payload)
      }
    })

    server.route({
      method: "DELETE",
      config: {
        auth: "jwt"
      },
      path: `${APIs.USER_DELIVERY_ADDRESSES}/{id}`,
      handler: (request) => {
        return homeMadeInnService.deleteUserDeliveryAddress(request.user.id, request.params.id)
      }
    })

    server.route({
      method: "GET",
      path: APIs.ATTRIBUTES,
      handler: async (request) => {
        return homeMadeInnService.getAttributes({ ...request.query });
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: `${APIs.ATTRIBUTES}/{id}`,
      handler: async (request) => {
        const { id } = request.params;
        return homeMadeInnService.getAttributeById(id);
      },
    });

    server.route({
      method: "POST",
      path: APIs.ATTRIBUTES,
      options: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      handler: async (request) => {
        return homeMadeInnService.createAttribute(request.payload);
      },
    });

    server.route({
      method: "PUT",
      path: APIs.ATTRIBUTES,
      options: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      handler: async (request) => {
        return homeMadeInnService.updateAttribute(request.payload);
      },
    });

    server.route({
      method: "DELETE",
      path: APIs.ATTRIBUTES,
      config: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
      },
      handler: async (request) => {
        const { id } = request.query;
        return homeMadeInnService.deleteAttribute(id);
      },
    });

    server.route({
      method: "GET",
      path: `${APIs.ATTRIBUTES}/{attrId}/${APIs.ATTRIBUTE_VALUES}`,
      handler: async (request) => {
        const { attrId } = request.params;
        return homeMadeInnService.getAttributeValues(attrId);
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: `${APIs.ATTRIBUTES}/{attrId}/${APIs.ATTRIBUTE_VALUES}/{id}`,
      handler: async (request) => {
        const { id } = request.params;
        return homeMadeInnService.getAttributeValuesById(...request.query, id);
      },
    });

    server.route({
      method: "POST",
      path: `${APIs.ATTRIBUTES}/${APIs.ATTRIBUTE_VALUES}`,
      options: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
      },
      handler: async (request) => {
        const { attrId } = request.params;
        return homeMadeInnService.createAttributeValue(request.payload, attrId);
      },
    });

    server.route({
      method: "PUT",
      path: `${APIs.ATTRIBUTES}/{attrId}/${APIs.ATTRIBUTE_VALUES}`,
      options: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      handler: async (request) => {
        const { attrId } = request.params;
        return homeMadeInnService.updateAttributeValue(request.payload, attrId);
      },
    });

    server.route({
      method: "DELETE",
      path: `${APIs.ATTRIBUTES}/{attrId}/${APIs.ATTRIBUTE_VALUES}/{vId}`,
      config: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
      },
      handler: async (request) => {
        const { attrId, vId } = request.params;
        return homeMadeInnService.deleteAttributeValue(attrId, vId);
      },
    });
    server.route({
      method: "GET",
      path: APIs.PRODUCT_ATTRIBUTES,
      handler: async (request) => {
        const { attrId } = request.params;
        return homeMadeInnService.getProductAttributes(attrId);
      },
    });

    server.route({
      method: "GET",
      config: {
        auth: "jwt",
      },
      path: `${APIs.PRODUCT_ATTRIBUTES}/{id}`,
      handler: async (request) => {
        const { id } = request.params;
        return homeMadeInnService.getProductAttributeById(...request.query, id);
      },
    });

    server.route({
      method: "POST",
      path: APIs.PRODUCT_ATTRIBUTES,
      options: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
      },
      handler: async (request) => {
        return homeMadeInnService.createProductAttribute(request.payload);
      },
    });

    server.route({
      method: "PUT",
      path: APIs.PRODUCT_ATTRIBUTES,
      options: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
        payload: {
          output: "stream",
          multipart: true,
          maxBytes: config.max_file_size,
        },
      },
      handler: async (request) => {
        return homeMadeInnService.updateProductAttribute(request.payload);
      },
    });

    server.route({
      method: "DELETE",
      path: `${APIs.PRODUCT_ATTRIBUTES}/{id}`,
      config: {
        auth: {
          strategy: "jwt",
          scope: [PERMISSIONS.API_PERMISSIONS.CHEF.value],
        },
      },
      handler: async (request) => {
        const { Id } = request.params;
        return homeMadeInnService.deleteProductAttribute(Id);
      },
    });
  },
};
