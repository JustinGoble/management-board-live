import _ from 'lodash';
import React from 'react';
import { Popconfirm, Button, Spin, Alert } from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Subscribe } from 'unstated';
import * as request from '../utils/request';
import UserForm from '../components/UserForm';
import TopBar from './TopBar';
import userController from '../controllers/UserController';
import discordRoleController from '../controllers/DiscordRoleController';
import '../../css/containers/User.less';

class User extends React.Component {
  constructor(props) {
    super(props);

    const { id, isProfile } = this.getIdAndIsProfile(props);

    this.state = {
      id,
      isProfile,
      editing: false,
      selectedUser: null,
      editedUser: null,
      error: null,
    };
  }

  getIdAndIsProfile(props) {
    const { pathname } = props.history.location;
    const isProfile = pathname.endsWith('profile');

    let id = 0;
    if (isProfile) {
      id = userController.state.currentUser.id || id;
    } else {
      id = _.last(pathname.split('/'));
    }

    return { id, isProfile };
  }

  async componentDidUpdate(props) {
    const { id, isProfile } = this.getIdAndIsProfile(props);

    if (id !== this.state.id && !_.isNil(id)) {
      this.setState({
        id,
        isProfile,
        editing: false,
        editedUser: null,
      });
      await this.loadUser(id);
    }
  }

  async componentDidMount() {
    const asyncTasks = [];

    if (discordRoleController.state.discordRoleOptions.length > 0) {
      discordRoleController.loadDiscordRoleOptions();
    } else {
      asyncTasks.push(discordRoleController.loadDiscordRoleOptions());
    }

    await Promise.all(asyncTasks);

    if (!_.isNil(this.state.id)) {
      await this.loadUser(this.state.id);
    }
  }

  async loadUser(id) {
    this.setState({
      selectedUser: null,
      error: null,
    });

    try {
      const user = await request.get({
        path: `/api/v1/users/${id}`,
      });
      this.setState({ selectedUser: user });
    } catch (e) {
      this.setState({ error: e.message });
    }
  }

  getActiveUser() {
    return this.state.editing
      ? this.state.editedUser
      : this.state.selectedUser;
  }

  startEditing() {
    const editedUser = _.cloneDeep(this.state.selectedUser);
    this.setState({
      editing: true,
      editedUser,
    });
  }

  async saveChanges() {
    if (this.userSaveRequestOngoing) return;
    this.userSaveRequestOngoing = true;

    const newUser = _.cloneDeep(this.state.editedUser);

    this.setState({
      editing: false,
      selectedUser: newUser,
      error: null,
    });

    try {
      // Upsert user
      const res = await request.patch({
        path: `/api/v1/users/${newUser.id}`,
        data: newUser,
      });
      this.setState({
        id: res.id,
        selectedUser: res,
      });
    } catch (e) {
      this.setState({ error: e.message });
    }

    this.userSaveRequestOngoing = false;
  }

  cancelChanges() {
    if (_.isNil(this.state.id)) {
      this.props.history.goBack();
    } else {
      this.setState({
        editing: false,
        editedUser: null,
      });
    }
  }

  async delete() {
    this.setState({
      error: null,
    });

    if (!_.isNil(this.state.id)) {
      try {
        await request.del({
          path: `/api/v1/users/${this.state.id}`,
        });
        this.props.history.goBack();
      } catch (e) {
        this.setState({ error: e.message });
      }
    } else {
      this.props.history.goBack();
    }
  }

  render() {
    const currentUserPerms = _.get(userController, 'state.currentUser.permissions', []);
    const currentUserId = _.get(userController, 'state.currentUser.id', -1);
    const isAdmin = _.includes(currentUserPerms, 'admin');

    const canEdit = isAdmin || currentUserId.toString() === this.state.id;

    return (<>
      <TopBar
        title={this.state.isProfile ? <b>PROFILE</b> : <b>USER</b>}
        backButton={true}
        subContent={!canEdit ? undefined : (
          <div className="User-actions">
            {this.state.editing ?
              (<>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  className="tool-button"
                  onClick={() => this.saveChanges()}
                >
                  Save
                </Button>
                <Button
                  type="secondary"
                  icon={<CloseOutlined />}
                  className="tool-button"
                  onClick={() => this.cancelChanges()}
                >
                  Cancel
                </Button>
              </>) :
              (<Button
                type="primary"
                icon={<EditOutlined />}
                className="tool-button"
                onClick={() => this.startEditing()}
              >
                Edit
              </Button>)
            }
            <Popconfirm
              placement="bottomLeft"
              title="Are you sure you want to delete this user?"
              onConfirm={() => this.delete()}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                className="tool-button"
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        )}
      />
      <div className="User">
        {this.state.error && (
          <Alert
            style={{ 'marginBottom': '0.5em' }}
            message="Error"
            description={this.state.error}
            type="error"
            showIcon
          />
        )}
        {this.getActiveUser() === null ? (
          <Spin
            className="User-spin"
            size="large"
            tip="Loading user..."
          />
        ) : (
          <Subscribe to={[discordRoleController]}>
            {(discordRoleController) => (
              <UserForm
                editing={this.state.editing}
                user={this.getActiveUser()}
                discordRoleOptions={discordRoleController.state.discordRoleOptions}
                isAdmin={isAdmin}
              />
            )}
          </Subscribe>
        )}
      </div>
    </>);
  }
}

export default User;