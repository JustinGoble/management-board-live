import _ from 'lodash';
import React from 'react';
import { Popconfirm, Button, Spin, Alert } from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Subscribe } from 'unstated';
import * as request from '../utils/request';
import ApplicationForm from '../components/ApplicationForm';
import userController from '../controllers/UserController';
import TopBar from './TopBar';
import '../../css/containers/Application.less';

class Application extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.id,
      editing: false,
      selectedApplication: null,
      editedApplication: null,
      error: null,
    };

    if (!this.state.id) {
      this.state.id = undefined;
      this.state.editing = true;
      this.state.selectedApplication = {};
      this.state.editedApplication = {};
    }
  }

  async componentDidMount() {
    const asyncTasks = [];

    if (userController.state.userOptions.length > 0) {
      userController.loadUserOptions();
    } else {
      asyncTasks.push(userController.loadUserOptions());
    }

    await Promise.all(asyncTasks);

    if (!_.isNil(this.state.id)) {
      try {
        const op = await request.get({
          path: `/api/v1/applications/${this.state.id}`,
        });
        this.setState({ selectedApplication: op });
      } catch (e) {
        this.setState({ error: e.message });
      }
    }
  }

  getActiveApplication() {
    return this.state.editing
      ? this.state.editedApplication
      : this.state.selectedApplication;
  }

  startEditing() {
    const editedApplication = _.cloneDeep(this.state.selectedApplication);
    this.setState({
      editing: true,
      editedApplication,
    });
  }

  async saveChanges() {
    if (this.applicationSaveRequestOngoing) return;
    this.applicationSaveRequestOngoing = true;

    const newApplication = _.cloneDeep(this.state.editedApplication);

    this.setState({
      editing: false,
      selectedApplication: newApplication,
      error: null,
    });

    try {
      const res = await request.post({
        path: '/api/v1/applications',
        data: newApplication,
      });
      this.setState({
        id: res.id,
        selectedApplication: res,
      });
    } catch (e) {
      this.setState({ error: e.message });
    }

    this.applicationSaveRequestOngoing = false;
  }

  cancelChanges() {
    if (_.isNil(this.state.id)) {
      this.props.history.goBack();
    } else {
      this.setState({
        editing: false,
        editedApplication: null,
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
          path: `/api/v1/applications/${this.state.id}`,
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
    const canEdit = _.intersection(
      _.get(userController, 'state.currentUser.permissions', []),
      ['management', 'admin'],
    ).length > 0;

    return (<>
      <TopBar
        title={<b>APPLICATION</b>}
        backButton={true}
        subContent={!canEdit ? undefined : (
          <div className="Application-actions">
            {this.state.editing ?
              (<>
                <Button
                  type="primary"
                  icon={<SaveOutlined/>}
                  className="tool-button"
                  onClick={() => this.saveChanges()}
                >
                  Save
                </Button>
                <Button
                  type="secondary"
                  icon={<CloseOutlined/>}
                  className="tool-button"
                  onClick={() => this.cancelChanges()}
                >
                  Cancel
                </Button>
              </>) :
              (<Button
                type="primary"
                icon={<EditOutlined/>}
                className="tool-button"
                onClick={() => this.startEditing()}
              >
                Edit
              </Button>)
            }
            <Popconfirm
              placement="bottomLeft"
              title="Are you sure you want to delete this application?"
              onConfirm={() => this.delete()}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="danger"
                icon={<DeleteOutlined/>}
                className="tool-button"
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        )}
      />
      <div className="Application">
        {this.state.error && (
          <Alert
            style={{ 'marginBottom': '0.5em' }}
            message="Error"
            description={this.state.error}
            type="error"
            showIcon
          />
        )}
        {this.getActiveApplication() === null ? (
          <Spin
            className="Application-spin"
            size="large"
            tip="Loading application..."
          />
        ) : (
          <Subscribe to={[userController]}>
            {(userController) => (
              <ApplicationForm
                editing={this.state.editing}
                application={this.getActiveApplication()}
                userOptions={userController.state.userOptions}
              />
            )}
          </Subscribe>
        )}
      </div>
    </>);
  }
}

export default Application;
