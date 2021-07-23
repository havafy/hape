import { FC, useState } from 'react'

export const PAYMENT_LABELS: any = {
    WAITING: "Chờ thanh toán",
    COMPLETED: "Đã thanh toán",
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

