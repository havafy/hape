package models

import "gorm.io/gorm"

//Product model
type Product struct {
	gorm.Model

	Name  string `json:"name"`
	Description string `json:"description"`
	Price float64 `json:"description"`
	Quantity int `json:"quantity"`
	SalePrice float64 `json:"sale_price"`
	Visibility string `json:"visibility"`
	Thumbnail string `json:"thumbnail"`
	Images string `json:"images"`

}

// Products struct
type Products struct {
	Products []Product `json: "products"`
}