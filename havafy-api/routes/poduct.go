package routes

import (
	"github.com/gofiber/fiber/v2"
	"havafy-api/controllers"
)

func ProductRoute(route fiber.Router) {
	route.Get("/", controllers.Hello)
	route.Get("/listing", controllers.ProductListing)
}

