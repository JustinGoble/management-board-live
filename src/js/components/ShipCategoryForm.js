import _ from 'lodash';
import React from 'react';
import { oneLine } from 'common-tags';
import { Modal } from 'antd';
import {
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import InputField from './InputField';
import userController from '../controllers/UserController';
import '../../css/components/ShipCategoryForm.less';

const { confirm } = Modal;

class ShipCategoryForm extends React.Component {
  state = {
    editing: false,
    shipCategory: {},
  }

  constructor(props) {
    super(props);

    if (_.isNil(props.shipCategory.id)) {
      this.state.editing = true;
    }

    this.state.shipCategory = _.cloneDeep(props.shipCategory);
  }

  onEditClicked() {
    this.setState({
      editing: true,
    });
  }

  onDeleteClicked() {
    confirm({
      title: 'Are you sure you want to delete?',
      content: oneLine`
        The ship category will be permanently deleted
        if there are no ships belonging to it.
      `,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk : async () =>
        await this.props.onDelete(this.state.shipCategory.id),
    });
  }

  async onSaveClicked() {
    this.setState({
      editing: false,
    });

    // Only save if something has changed
    if (!_.isEqual(this.state.shipCategory, this.props.shipCategory)) {
      await this.props.onSaved(this.state.shipCategory);
    }
  }

  render() {
    const canEdit = userController.isCurrentUserAllowed(
      ['industry', 'admin'],
    );

    const {
      editing,
    } = this.state;

    const {
      id,
      name,
      description,
    } = this.state.shipCategory;

    return (
      <div className="ShipCategoryForm">
        <div className="ShipCategoryForm-header">
          {!_.isNil(id) &&
            <span className="ShipCategoryForm-header-id">ID #{id}</span>
          }
          <h2 className="ShipCategoryForm-header-text">
            <InputField
              hint="Category name"
              editing={editing}
              object={this.state.shipCategory}
              path={'name'}>
              {name}
            </InputField>
          </h2>
          {editing ? (
            <Tooltip Tooltip color="#23395d" placement="bottom" title="Save Changes" arrowPointAtCenter>
              <SaveOutlined style={{ fontSize: '200%' }}
                className="ShipCategoryForm-action"
                onClick={this.onSaveClicked.bind(this)}
              />
            </Tooltip>
          ) : (canEdit &&
            <span>
              <Tooltip color="#23395d" placement="bottom" title="Edit Ship Category" arrowPointAtCenter>
                <EditOutlined style={{ fontSize: '150%' }}
                  className="ShipCategoryForm-action"
                  onClick={this.onEditClicked.bind(this)}
                />
              </Tooltip>
              <Tooltip color="#23395d" placement="bottom" title="Delete Ship Category" arrowPointAtCenter>
                <DeleteOutlined  style={{ fontSize: '150%' }}
                  className="ShipCategoryForm-action"
                  onClick={this.onDeleteClicked.bind(this)}
                />
              </Tooltip>
            </span>
          )}
        </div>
        <div className="line-horizontal"/>
        <div className="ShipCategoryForm-info">
          <div className="dim-caption">Description:</div>
          <InputField
            editing={editing}
            object={this.state.shipCategory}
            path={'description'}
          >
            {description}
          </InputField>
        </div>
      </div>
    );
  }
}

export default ShipCategoryForm;
