import { FC, useState } from 'react'
export const PAYMENT_METHODS = [
    'COD','ZALO_TRANSFER', 'MOMO_TRANSFER', 'BANK_TRANSFER',
    'VNPAY_TRANSFER', 'VIETTEL_TRANSFER',
    'VNPAY', 'PAYPAL'
  ]
  export const SHIPPING_METHODS = [
    'UPS','BY_SHOP', 'VNPOST', 'GHN', 'GHTK', 'NINJAVAN'
  ]
  export const STATUS = [
    'COMPLETED','PROCESSING','SHIPPING', 'SHIPPING_FAIL', 'CANCELLED','PENDING'
  ]
  export const PAYMENT_STATUS = [
    'COMPLETED','WAITING', 'FAIL'
  ]
export const PAYMENT_LABELS: any = {
    WAITING: "Chờ thanh toán",
    COMPLETED: "Đã nhận",
    FAIL: "Thanh toán thất bại"
}

export const STATUS_LABELS: any = {
    PENDING: "Tạm dừng",
    COMPLETED: "Hoàn thành",
    PROCESSING: "Đang lấy hàng",
    SHIPPING_FAIL: "Không giao được",
    SHIPPING: "Đang vận chuyển",
    CANCELLED: "Đã huỷ"
}
export const t = (value: string) => {
    if(STATUS_LABELS[value]) return STATUS_LABELS[value]
    if(PAYMENT_LABELS[value]) return PAYMENT_LABELS[value]
}
 export const renderPaymentLabel = (value: string) => {
    return (
        <span className={"label label-"+value}>
        {PAYMENT_LABELS[value]}
    </span>)
}
export const renderStatusLabel = (value: string) => {
    return (
        <span className={"label label-"+value}>
        {STATUS_LABELS[value]}
    </span>)
}

