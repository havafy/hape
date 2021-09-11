package controllers

import (
	"github.com/gofiber/fiber/v2"
	"havafy-api/database"
	"havafy-api/models"
)


//Hello
func Hello(c *fiber.Ctx) error {
	return c.SendString("Havafy API")
}


//AllBooks
func ProductListing(c *fiber.Ctx) error {
	products := []models.Product{}
	database.DB.Db.Find(&products)

	return c.Status(200).JSON(products)
}
