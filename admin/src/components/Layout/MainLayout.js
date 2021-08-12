import React from 'react'
import { Layout, Menu, Breadcrumb } from 'antd';
import {
  SettingOutlined,
  WechatOutlined,
  BarChartOutlined,
  PictureOutlined,
  DatabaseOutlined,
  BarcodeOutlined,
  TeamOutlined,

} from '@ant-design/icons';
import { Hape } from '../icons'
const {  Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;


class MainLayout extends React.Component {
  state = {
    collapsed: false,
    theme: 'light'
  };

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  render() {
    const { collapsed, theme } = this.state;
    return (<div>
      <div className="header-bar"><div className="logo" ><Hape fill="#DB4140" width="70px" /></div></div>
      <div className="app-container">
      <div className="sidebar-container">
        <Sider className="mt-5" theme={theme}  width={200} collapsible collapsed={collapsed} onCollapse={this.onCollapse}>

          <Menu theme={theme} defaultSelectedKeys={['1']} mode="inline">

            <SubMenu key="products" icon={<BarcodeOutlined />} title="Products">
              <Menu.Item key="3">Product List</Menu.Item>
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
        </div>
    
          <Content className="px-5 py-3">
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              Bill is a cat.
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Hape Administrator ©2018 Created by Havafy</Footer>

      </div>
      </div>
    );
  }
}
export default MainLayout