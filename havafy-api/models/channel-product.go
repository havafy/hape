package models

import "gorm.io/gorm"

//ChannelProduct model
type ChannelProduct struct {
	gorm.Model
	ProductID int `json:"product_id"`
	Product Product
	ChannelURL string `json:"channel_url"`
	ChannelDomain string `json:"channel_domain"`
	Name  string `json:"name"`
	Description string `json:"description"`
	Price float64 `json:"description"`
	SalePrice float64 `json:"sale_price"`
	Visibility string `json:"visibility"`
	Thumbnail string `json:"thumbnail"`
	Images string `json:"images"`
}
