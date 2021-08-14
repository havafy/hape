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
import { useAuthDispatch, logout, useAuthState } from '../../context';
import {
  Link, Router
} from "react-router-dom";
import { Hape } from '../icons'

const { SubMenu } = Menu;
const { Sider } = antLayout

const Layout = ({ history, children }) => {
	const dispatch = useAuthDispatch();
	const userDetails = useAuthState();

	const handleLogout = () => {
		logout(dispatch);
		history.push('/login');
	}
    return (<div>
      <div className="header-bar">
        <div class="flex">
            <div class="flex-none ">
            <div className="logo" ><Hape fill="#DB4140" width="70px" /></div>
            </div>
            <div class="flex-grow">

            </div>
            <div className="flex-none w-48 justify-end text-right">
                <span>Hi {userDetails.user.name.split(' ')[0]}!</span>
                <button className="mx-5" onClick={handleLogout}>Logout</button>
            </div>
         </div>
      </div>
      <div className="app-container">
        <div class="flex">
            <div class="flex-none ">
              <SideBar />
            </div>
            <div class="flex-grow">
                <div className="px-5">
                
                {children}

                  </div>
            </div>

          </div>
      </div>
      <div className="mt-20 mb-5 text-center text-xs text-gray-600">Hape Administrator ©2018 Created by Havafy</div>
      </div>
    )
  
}

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
              <Menu.Item key="5">Categories</Menu.Item>
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

export default Layout