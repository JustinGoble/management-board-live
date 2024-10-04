import React from 'react';
import { withRouter } from "react-router";
import * as _ from 'lodash';
import { Menu } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import userController from '../controllers/UserController';
import { setCookie } from '../utils/cookie';
import * as request from '../utils/request';
import Logo from '../../images/havoc_logo.png';
import BgImage from '../../images/du_space_coolblue.jpg';
import '../../css/containers/SideBar.less';

const { SubMenu } = Menu;

class SideBar extends React.Component {
  async handleClick(e) {
    if (e.key === 'logout') {
      try {
        await request.get({
          path: `/api/v1/discord/logout`,
        });

        setCookie('token', '');
        window.location.reload();
      } catch (e) {
        alert("Error during logout! " + e.message);
      }
    } else {
      this.props.history.push(`/${e.key}`);
    }
  }

  render() {
    const currentUserPerms = _.get(userController, 'state.currentUser.permissions', []);
    const isManager = _.includes(currentUserPerms, 'management');
    const isAdmin = _.includes(currentUserPerms, 'admin');

    const [, path] = this.props.history.location.pathname.split('/');
    const { user } = this.props;
    const name = user.nickname || _.split(user.name, '#')[0];

    return (
      <div className="SideBar">
        <div className="SideBar-header">
          <img className="SideBar-header-img" src={BgImage} alt="Header background"/>
          <div className="SideBar-header-overlay">
            <img className="SideBar-logo" src={Logo} alt="HAVOC logo"/>
            <h1 className="SideBar-title">H A V O C Nexus</h1>
          </div>
        </div>

        <Menu
          className="SideBar-menu"
          theme="dark"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[path]}
          mode="inline"
          onClick={this.handleClick.bind(this)}
        >
          <SubMenu
            key="personal"
            title={<span><UserOutlined /><span>Personal</span></span>}
          >
            <Menu.Item key="profile">Profile</Menu.Item>
          </SubMenu>
          { isManager || isAdmin ?
            (<>
              <SubMenu
                key="management"
                title={<span><TeamOutlined /><span>Management</span></span>}
              >
                <Menu.Item key="users">Users</Menu.Item>
                <Menu.Item key="eventlogs">Event Logs</Menu.Item>
              </SubMenu>
            </>) : (<></>)
          }
          <SubMenu
            key="industry"
            title={<span><BankOutlined /><span>Industry</span></span>}
          >
            { isManager || isAdmin ?
              (<>
                <Menu.Item key="ship-categories">Ship Categories</Menu.Item>
              </>) : (<></>)
            }
            <Menu.Item key="ships">Ship Database</Menu.Item>
            <Menu.Item key="requests">Request List</Menu.Item>
          </SubMenu>
          <Menu.Item key="logout">
            <LogoutOutlined />
            <span>Log out</span>
          </Menu.Item>
        </Menu>

        <div className="SideBar-info">
          <p>Current user:<br/></p>
          { name || "Loading..." }
        </div>
      </div>
    );
  }
}

export default withRouter(SideBar);
