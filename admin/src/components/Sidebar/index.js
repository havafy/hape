import React, { useState } from 'react'
import { Menu, Layout as antLayout } from 'antd';
import {
  SettingOutlined,
  WechatOutlined,
  BarChartOutlined,
  PictureOutlined,
  DatabaseOutlined,
  BarcodeOutlined,
  TeamOutlined,

} from '@ant-design/icons';

import {
  Link, 
} from "react-router-dom";
const { SubMenu } = Menu;
const { Sider } = antLayout


const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false)

  const onCollapse = (collapsed) => {
    setCollapsed( collapsed )
  };

  const [theme] = useState('light')
  console.log('sidebar render...')
  return (
 
        <Sider className="mt-2 bg-white" theme={theme}  width={200} collapsible collapsed={collapsed} onCollapse={onCollapse}>
   
          <Menu theme={theme} defaultSelectedKeys={['1']} mode="inline">
       
            <SubMenu key="products" icon={<BarcodeOutlined />} title="Products">
              <Menu.Item key="3"><Link to="/products">Product List </Link></Menu.Item>
              <Menu.Item key="4">Add Product</Menu.Item>
              <Menu.Item key="5"><Link to="/categories">Categories</Link></Menu.Item>
            </SubMenu>
            <SubMenu key="sub2" icon={<TeamOutlined />} title="Users">
              <Menu.Item key="6">List</Menu.Item>
              <Menu.Item key="8">Admin accounts</Menu.Item>
            </SubMenu>
            <SubMenu key="sub20" icon={<DatabaseOutlined/>} title="Orders">
              <Menu.Item key="20">List</Menu.Item>
            </SubMenu>
            <SubMenu key="sub3" icon={<BarChartOutlined />} title="Marketing">
              <Menu.Item key="9">Coupons</Menu.Item>
              <Menu.Item key="10">Price Rules</Menu.Item>
            </SubMenu>
            <SubMenu key="sub4" icon={<PictureOutlined/>} title="Pages">
              <Menu.Item key="11">Landing Pages</Menu.Item>
              <Menu.Item key="12">Static Page</Menu.Item>
            </SubMenu>
            <SubMenu key="sub5" icon={<WechatOutlined />} title="Socials">
              <Menu.Item key="13">Posts</Menu.Item>
              <Menu.Item key="14">Create Group</Menu.Item>
            </SubMenu>
            <SubMenu key="sub6" icon={<SettingOutlined />} title="Settings">
              <Menu.Item key="15">Settings</Menu.Item>
  
            </SubMenu>
          </Menu>
        </Sider>
   
  )
}

export default SideBar