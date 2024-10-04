import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider, Subscribe } from 'unstated';
import { Layout, Spin, Alert } from 'antd';
import '../../registerServiceWorker';
import { setCookie, getCookie } from '../utils/cookie';
import Login from './Login';
import SideBar from './SideBar';
import Application from './Application';
import ApplicationList from './ApplicationList';
import RequestList from './RequestList';
import RequestNew from './RequestNew';
import Request from './Request';
import ShipCategoryList from './ShipCategoryList';
import ShipList from './ShipList';
import Ship from './Ship';
import UserList from './UserList';
import EventLogs from './EventLogs';
import User from './User';
import NotFound from './NotFound';
import userController from '../controllers/UserController';
import '../../css/containers/App.less';

const { Footer, Content } = Layout;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
    };
  }

  async loadUserInfo() {
    if (!getCookie('token')) { return; }

    try {
      await userController.loadCurrentUser();
    } catch (e) {
      if (e.response && e.response.status === 404) {
        // User not found, clear token and force page reload
        setCookie('token', '');
        window.location.reload();
        return;
      }

      // Error in authentication
      this.setState({ error: e.message });
    }
  }

  async componentDidMount() {
    await this.loadUserInfo();
  }

  render() {
    if (window.location.pathname.startsWith('/api/')) {
      return 'Error: Trying to access a backend URL but got a response ' +
        'from the frontend. Check that your REACT_APP_BACKEND variable is pointing ' +
        'to the correct backend address, that you loaded your environment variables ' +
        'and that your reverse proxy routes requests correctly to the ' +
        'frontend and backend. If you are unsure whether it is about the reverse ' +
        'proxy or not, it is not.';
    }

    const token = getCookie('token');
    if (!token) {
      return (<Login />);
    }

    return (
      <Provider>
        <BrowserRouter>
          <Subscribe to={[userController]}>
            {userController => (
              <Layout className="App">
                <div className="App-sidebar">
                  <SideBar user={userController.state.currentUser || {}}/>
                </div>
                <Layout className="App-main">
                  <Content className="App-content">
                    {this.state.error ? (
                      <div className="full flex-centering">
                        <Alert
                          message="Error"
                          description={this.state.error}
                          type="error"
                          showIcon
                        />
                      </div>
                    ) : !userController.state.currentUser ? (
                      <div className="full flex-centering">
                        <Spin
                          className="App-user-load-spin"
                          tip="Loading user information" />
                      </div>
                    ) : userController.state.currentUser.permissions.length === 0 ? (
                      <div className="full flex-centering">
                        <Alert
                          message="No permissions"
                          description="
                            Welcome to the Nexus.
                            If you are seeing this message, you need to ask an admin for permissions.
                          "
                          type="info"
                          showIcon
                        />
                      </div>
                    ) : (
                      <Switch>
                        <Route exact path="/applications" component={ApplicationList}/>
                        <Route exact path="/applications/:id" component={Application}/>
                        <Route exact path="/application" component={Application}/>
                        <Route exact path="/requests" component={RequestList}/>
                        <Route exact path="/requests/new" component={RequestNew}/>
                        <Route exact path="/requests/:id" component={Request}/>
                        <Route exact path="/ship-categories" component={ShipCategoryList}/>
                        <Route exact path="/ships" component={ShipList}/>
                        <Route exact path="/ships/:id" component={Ship}/>
                        <Route exact path="/profile" component={User}/>
                        <Route exact path="/users" component={UserList}/>
                        <Route exact path="/users/:id" component={User}/>
                        <Route exact path="/eventlogs" component={EventLogs}/>
                        <Redirect from="/" to="/requests" />
                        <Route component={NotFound}/>
                      </Switch>
                    )}
                  </Content>
                  <Footer className="App-footer">
                    Copyright &copy; H A V O C 2022. All Rights Reserved.
                  </Footer>
                </Layout>
              </Layout>
            )}
          </Subscribe>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
