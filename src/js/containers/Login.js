import React from 'react';
import { Button } from 'antd';
import uuidv4 from 'uuid/v4';
import Logo from '../../images/havoc_logo.png';
import { REACT_APP_BACKEND } from '../config';
import '../../css/containers/Login.less';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      state: uuidv4(),
    };
  }

  render() {
    return (
      <div className="Login">
        <span className="Login-content">
          <img className="Login-logo" src={Logo} alt="HAVOC logo"/>
          <p>Welcome to the</p>
          <h2>H A V O C Nexus</h2>
          <Button
            className="Login-button"
            href={
              `${REACT_APP_BACKEND}/api/v1/discord/login` +
              `?state=${this.state.state}` +
              `&returnUrl=${encodeURIComponent(window.location.href)}`
            }
          >
            Login using Discord
          </Button>
        </span>
      </div>
    );
  }
}

export default Dashboard;
