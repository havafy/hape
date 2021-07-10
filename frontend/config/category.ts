
const categoryTree: {title: string, value: string}[] = [
    {
      "title": "Thời Trang Nam",
      "value": "Thoi-Trang-Nam"
    },
    {
      "title": "Thời Trang Nữ",
      "value": "Thoi-Trang-Nu"
    },
    {
      "title": "Điện Thoại & Phụ Kiện",
      "value": "Dien-Thoai-Phu-Kien"
    },
    {
      "title": "Mẹ & Bé",
      "value": "Me-Be"
    },
    {
      "title": "Thiết Bị Điện Tử",
      "value": "Thiet-Bi-Dien-Tu"
    },

    {
      "title": "Thực phẩm và đồ uống",
      "value": "Thuc-Pham-Do-Uong"
    },

    {
      "title": "Nhà Cửa & Đời Sống",
      "value": "Nha-Cua-Doi-Song"
    },
    {
      "title": "Máy Tính & Laptop",
      "value": "May-Tinh-Laptop"
    },
    {
      "title": "Làm Đẹp & Mỹ Phẩm",
      "value": "Lam-Dep-My-Pham"
    },
    {
      "title": "Máy Ảnh & Máy Quay Phim",
      "value": "May-Anh-May-Quay-Phim"
    },
    {
      "title": "Sức Khỏe",
      "value": "Suc-Khoe"
    },
    {
      "title": "Đồng Hồ",
      "value": "Dong-Ho"
    },
    {
      "title": "Giày Dép Nữ",
      "value": "Giay-Dep-Nu"
    },
    {
      "title": "Giày Dép Nam",
      "value": "Giay-Dep-Nam"
    },
    {
      "title": "Túi Ví Nữ",
      "value": "Tui-Vi-Nu"
    },
    {
      "title": "Thiết Bị Điện Gia Dụng",
      "value": "Thiet-Bi-Dien-Gia-Dung"
    },
    {
      "title": "Phụ Kiện & Trang Sức Nữ",
      "value": "Phu-Kien-Trang-Suc-Nu"
    },
    {
      "title": "Thể Thao & Du Lịch",
      "value": "The-Thao-Du-Lich"
    },
    {
      "title": "Ô Tô & Xe Máy & Xe Đạp",
      "value": "O-To-Xe-May-Xe-Dap"
    },
    {
      "title": "Nhà Sách Online",
      "value": "Nha-Sach-Online"
    },
    {
      "title": "Balo & Túi Ví Nam",
      "value": "Balo-Tui-Vi-Nam"
    },
    {
      "title": "Thời Trang Trẻ Em",
      "value": "Thoi-Trang-Tre-Em"
    },
    {
      "title": "Đồ Chơi",
      "value": "Do-Choi"
    },
    {
      "title": "Nhà cửa & Đời sống",
      "value": "Nha-cua-Doi-song"
    },
    {
      "title": "Chăm Sóc Thú Cưng",
      "value": "Cham-Soc-Thu-Cung"
    },
    {
      "title": "Voucher & Dịch Vụ",
      "value": "Voucher-Dich-Vu"
    }
  ]
export const getName = (value: string) =>{
     
    for(let category of categoryTree){
      if( category.value === value ){
        return category.title

      }
    }
    return

}
export default categoryTree






