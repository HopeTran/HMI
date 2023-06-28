package web

import (
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	dbStore "home-made-inn-service/store/db"
)

type Server struct {
	version  string
	apiToken string

	router *gin.Engine
	log    *logrus.Entry

	dbStore *dbStore.DBStore
}

func NewServer(apiToken, version string, dbStore *dbStore.DBStore, log *logrus.Entry) *Server {
	r := gin.New()

	return &Server{
		version:  version,
		apiToken: apiToken,
		router:   r,
		log:      log,

		dbStore: dbStore,
	}
}

func (s *Server) Run(addr string) error {
	r := s.router
	r.Use(CORS())
	r.Use(s.applyErrorHandler())
	r.Use(s.authenticate())
	r.Use(gin.Logger())

	r.GET("/version", func(c *gin.Context) {
		c.JSON(200, map[string]interface{}{
			"commit": s.version,
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, "OK")
	})

	users := r.Group("/users")
	{
		users.GET("", s.findUsers)
		users.GET("/:id", s.findUserById)
		users.POST("", s.createUser)
		users.PUT("", s.updateUser)
		users.PATCH("/:id", s.updateUserFavoriteStore)
		users.DELETE("/:id", s.deleteUser)

		usersDeliveryAddresses := r.Group("/users/:id/delivery-addresses")
		{
			usersDeliveryAddresses.POST("", s.createUserDeliveryAddress)
			usersDeliveryAddresses.GET("", s.getAllUserDeliveryAddresses)
			usersDeliveryAddresses.PUT("", s.updateUserDeliveryAddress)
			usersDeliveryAddresses.DELETE("/:aID", s.deleteUserDeliveryAddress)
		}
	}

	stores := r.Group("/stores")
	{
		stores.GET("", s.findStores)
		stores.GET("/:id", s.findStoreById)
		stores.POST("", s.createStore)
		stores.PUT("", s.updateStore)
		stores.DELETE("/:id", s.deleteStore)
	}

	products := r.Group("/products")
	{
		products.GET("", s.findProducts)
		products.GET("/:id", s.findProductById)
		products.POST("", s.createProduct)
		products.PUT("", s.updateProduct)
		products.DELETE("/:id", s.deleteProduct)
	}

	scheduleMenus := r.Group("/schedule-menus")
	{
		scheduleMenus.GET("", s.findScheduleMenus)
		scheduleMenus.GET("/:productId", s.findScheduleMenu)
		scheduleMenus.POST("", s.createScheduleMenu)
		scheduleMenus.PUT("", s.updateScheduleMenu)
		scheduleMenus.DELETE("", s.deleteScheduleMenu)
	}

	categories := r.Group("/categories")
	{
		categories.GET("", s.findCategories)
		categories.GET("/:id", s.findCategoryById)
		categories.POST("", s.createCategory)
		categories.PUT("", s.updateCategory)
		categories.DELETE("/:id", s.deleteCategory)
	}

	platformCategories := r.Group("/platform-categories")
	{
		platformCategories.GET("", s.findPlatformCategories)
		platformCategories.GET("/:id", s.findPlatformCategoryById)
		platformCategories.POST("", s.createPlatformCategory)
		platformCategories.PUT("", s.updatePlatformCategory)
		platformCategories.DELETE("/:id", s.deletePlatformCategory)
	}

	cuisines := r.Group("/cuisines")
	{
		cuisines.GET("", s.findCuisines)
		cuisines.GET("/:id", s.findCuisineById)
		cuisines.POST("", s.createCuisine)
		cuisines.PUT("", s.updateCuisine)
		cuisines.DELETE("/:id", s.deleteCuisine)
	}

	carts := r.Group("/carts")
	{
		carts.GET("", s.findCartItems)
		carts.POST("", s.createCartItem)
		carts.PUT("", s.updateCartItem)
		carts.DELETE("/:userId/:productId", s.deleteCartItem)
	}

	orders := r.Group("/orders")
	{
		orders.GET("", s.findOrders)
		orders.GET("/:id", s.findOrderById)
		orders.GET("/profit-summary", s.getProfitSummary)
		orders.POST("", s.createOrder)
		orders.PUT("", s.updateOrder)
		orders.DELETE("/:id", s.deleteOrder)
	}

	attributes := r.Group("/attributes")
	{
		attributes.GET("", s.findAttributes)
		attributes.GET("/:id", s.findAttributeById)
		attributes.POST("", s.createAttribute)
		attributes.PUT("", s.updateAttribute)
		attributes.DELETE("/:id", s.deleteAttribute)

		attributeValues := r.Group("/attributes")
		{
			attributeValues.GET("/:id/values", s.findAttributeValues)
			attributeValues.GET("/:id/values/:vid", s.findAttributeValueById)
			attributeValues.POST("/values", s.createAttributeValue)
			attributeValues.PUT("/:id/values", s.updateAttributeValue)
			attributeValues.DELETE("/:id/values/:vid", s.deleteAttributeValue)
		}
	}

	productAttributes := r.Group("/product-attributes")
	{
		productAttributes.GET("", s.findProductAttributes)
		productAttributes.GET("/:id", s.findProductAttributeById)
		productAttributes.POST("", s.createProductAttribute)
		productAttributes.PUT("", s.updateProductAttribute)
		productAttributes.DELETE("/:id", s.deleteProductAttribute)
	}

	return s.router.Run(addr)
}
