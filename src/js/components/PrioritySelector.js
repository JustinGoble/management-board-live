import React from 'react';
import { Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import * as req from '../utils/request';
import '../../css/components/PrioritySelector.less';

export class PrioritySelector extends React.Component {
  handleMenuClick = async e => {
    try {
      await req.post({
        path: `/api/v1/requests/${this.props.requestId}/change-priority`,
        data: {
          priority: e.key,
        },
      });

      if (this.props.onPriorityChanged) {
        this.props.onPriorityChanged(e.key);
      }
    } catch (e) {
      if (this.props.onPriorityFailedToChange) {
        this.props.onPriorityFailedToChange(e.message);
      }
    }
  };

  render() {
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key={1}>1</Menu.Item>
        <Menu.Item key={2}>2</Menu.Item>
        <Menu.Item key={3}>3</Menu.Item>
        <Menu.Item key={4}>4</Menu.Item>
        <Menu.Item key={5}>5</Menu.Item>
      </Menu>
    );

    return (<div className="Priority-Selector">
      <Dropdown overlay={menu} placement="bottomLeft" arrow>
        <button onClick={e => e.preventDefault()}>
          {this.props.value} <DownOutlined />
        </button>
      </Dropdown>
    </div>);
  }
}
