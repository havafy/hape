export default interface IProduct {
    readonly id: number;
    readonly name: string;
    readonly sku: string;
    readonly description: string;
    readonly price: number;
    readonly priceDiscount: number;
    readonly discountBegin: Date;
    readonly discountEnd: Date;
    readonly category: string;
    readonly quantity: number;
    readonly images: string[];
    readonly width?: number;
    readonly weight?: number;
    readonly length?: number;
    readonly height?: number;
    readonly countryOrigin?: string;
    readonly tags?: string[];
    readonly expiryDate?: Date;
  }
  