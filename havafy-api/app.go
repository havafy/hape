package main

import (
	"log"
	"github.com/joho/godotenv"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"havafy-api/database"
	"havafy-api/routes"
)

func setUpRoutes(app *fiber.App) {
	app.Get("/", routes.Hello)
	app.Get("/allbooks", routes.AllBooks)
	app.Post("/addbook", routes.AddBook)
	app.Post("/book", routes.Book)
	app.Put("/update", routes.Update)
	app.Delete("/delete", routes.Delete)
}

func main() {
	err := godotenv.Load()
	if err != nil {
	  log.Fatal("Error loading .env file")
	}
	database.ConnectDb()
	app := fiber.New()

	setUpRoutes(app)

	app.Use(cors.New())

	app.Use(func(c *fiber.Ctx) error {
		return c.SendStatus(404) // => 404 "Not Found"
	})

	log.Fatal(app.Listen(":3000"))
}
