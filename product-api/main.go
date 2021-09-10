package main

import (
	"github.com/joho/godotenv"
    "log"
    "os"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"time"
)

func main() {
	err := godotenv.Load()
	if err != nil {
	  log.Fatal("Error loading .env file")
	}
	s3Bucket := os.Getenv("AWS_IAM_ACCESS_KEY")
	secretKey := os.Getenv("AWS_IAM_SECRET_KEY")
	log.Fatal("s3Bucket  : ", s3Bucket, secretKey)

	app := fiber.New()
	// Or extend your config for customization
	app.Use(limiter.New(limiter.Config{
		Max:          	5,
		Expiration:  	30 * time.Second,
		KeyGenerator:          func(c *fiber.Ctx) string {
			return c.Get("x-forwarded-for")
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.SendFile("./toofast.html")
		},
	}))
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("product-api")
	})
	// // Default middleware config
	// app.Use(limiter.New())

	app.Listen(":5100")

}
