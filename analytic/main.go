package main

import (
	"github.com/havafy/analytic/entities"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"time"
)

func main() {

	// router := mux.NewRouter()

	// router.HandleFunc("/api/v1/user/find", userapi.FindUser).Methods("GET")
	// router.HandleFunc("/api/v1/user/getall", userapi.GetAll).Methods("GET")
	// router.HandleFunc("/api/v1/user/create", userapi.CreateUser).Methods("POST")
	// router.HandleFunc("/api/v1/user/update", userapi.UpdateUser).Methods("PUT")
	// router.HandleFunc("/api/v1/user/delete", userapi.Delete).Methods("DELETE")

	// fmt.Printf("Golang Rest API Is Running On Port: 5000")

	// err := http.ListenAndServe(":5000", router)

	// if err != nil {
	// 	panic(err)
	// }

	app := fiber.New()
	// Or extend your config for customization
	app.Use(limiter.New(limiter.Config{
		Max:          5,
		Expiration:     10 * time.Second,
		KeyGenerator:          func(c *fiber.Ctx) string {
			return c.Get("x-forwarded-for")
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.SendFile("./toofast.html")
		},
	}))
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString(entities.Ken())
	})
	// // Default middleware config
	// app.Use(limiter.New())


	app.Listen(":3000")

}
