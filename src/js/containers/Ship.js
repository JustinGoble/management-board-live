import _ from 'lodash';
import React from 'react';
import { Popconfirm, Button, Spin, Alert } from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import ShipForm from '../components/ShipForm';
import userController from '../controllers/UserController';
import * as request from '../utils/request';
import TopBar from './TopBar';
import '../../css/containers/Ship.less';

class Ship extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.id,
      editing: false,
      selectedShip: null,
      editedShip: null,
      shipCategoryOptions: [],
      error: null,
    };

    if (this.state.id === 'new') {
      this.state.id = undefined;
      this.state.editing = true;
      this.state.selectedShip = {};
      this.state.editedShip = {};
    }
  }

  async componentDidMount() {
    try {
      const shipCategoryList = await request.get({
        path: `/api/v1/ship-categories/list`,
      });

      this.setState({
        shipCategoryOptions: _.map(shipCategoryList, c => ({
          value: c.id,
          title: c.name,
        })),
      });

      if (!_.isNil(this.state.id)) {
        const ship = await request.get({
          path: `/api/v1/ships/${this.state.id}`,
        });
        this.setState({ selectedShip: ship });
      }
    } catch (e) {
      this.setState({ error: e.message });
    }
  }

  getActiveShip() {
    return this.state.editing
      ? this.state.editedShip
      : this.state.selectedShip;
  }

  startEditing() {
    const editedShip = _.cloneDeep(this.state.selectedShip);
    this.setState({
      editing: true,
      editedShip,
    });
  }

  async saveChanges() {
    if (this.shipSaveRequestOngoing) return;
    this.shipSaveRequestOngoing = true;

    const newShip = _.cloneDeep(this.state.editedShip);

    this.setState({
      editing: false,
      selectedShip: newShip,
      error: null,
    });

    try {
      const res = await request.post({
        path: '/api/v1/ships',
        data: newShip,
      });
      this.setState({
        id: res.id,
        selectedShip: res,
      });
    } catch (e) {
      this.setState({ error: e.message });
    }

    this.shipSaveRequestOngoing = false;
  }

  cancelChanges() {
    if (_.isNil(this.state.id)) {
      this.props.history.goBack();
    } else {
      this.setState({
        editing: false,
        editedShip: null,
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
          path: `/api/v1/ships/${this.state.id}`,
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
        title={<b>SHIP</b>}
        backButton={true}
        subContent={!canEdit ? undefined : (
          <div className="Ship-actions">
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
              title="Are you sure you want to delete this ship?"
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
      <div className="Ship">
        {this.state.error && (
          <Alert
            style={{ 'marginBottom': '0.5em' }}
            message="Error"
            description={this.state.error}
            type="error"
            showIcon
          />
        )}
        {this.getActiveShip() === null ? (
          <Spin
            className="Ship-spin"
            size="large"
            tip="Loading ship..."
          />
        ) : (
          <ShipForm
            editing={this.state.editing}
            ship={this.getActiveShip()}
            shipCategoryOptions={this.state.shipCategoryOptions}
          />
        )}
      </div>
    </>);
  }
}

export default Ship;
