import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Table, Alert } from 'antd';
import '../../css/containers/EventLogs.less';
import TopBar from './TopBar';
import userController from '../controllers/UserController';
import * as request from '../utils/request';


class EventLogs extends React.Component {
  state = {
    data: [],
    pagination: {
      pageSize: 50,
      current: 1,
    },
    loading: false,
    error: null,
  };

  async componentDidMount() {
    await userController.loadUserOptions();
    await this.fetch();
  }

  async handleTableChange(pagination) {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    await this.fetch({
      limit: pagination.pageSize,
      page: pagination.current - 1,
    });
  }

  async fetch(params = {}) {
    _.defaults(params, {
      limit: this.state.pagination.pageSize,
      page: this.state.pagination.current - 1,
    });

    this.setState({
      error: null,
      loading: true,
    });

    try {
      const data = await request.get({
        path: '/api/v1/event-logs',
        params: _.pickBy(params, v => !_.isNil(v)), // Remove null and undefined
      });

      const pagination = { ...this.state.pagination };
      pagination.total = data.totalHits;
      this.setState({
        loading: false,
        data: data.results,
        pagination,
      });
    } catch (err) {
      this.setState({
        loading: false,
        data: [],
        error: err.message,
      });
    }
  }

  onUserSelected(user) {
    this.props.history.push(`/users/${user.id}`);
  }

  renderExpandedRow(body) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch (e) {
      // Not JSON, draw it as it is
      return body;
    }
  }

  render() {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Created By',
        dataIndex: 'user',
        key: 'user',
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: time => moment(time).format('YYYY-MM-DD'),
      },
      {
        title: 'Log Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Rest Path',
        dataIndex: 'restType',
        key: 'restType',
      },
      {
        title: 'Request Path',
        dataIndex: 'requestPath',
        key: 'requestPath',
      },
    ];
    const mapEvent = (event) => ({
      ...event,
      user: _.get(
        _.find(userController.state.userOptions, { value: event.user }),
        'title',
      ),
      key: event.id,
    });

    return (
      <div className='EventLog-container'>
        <TopBar title={<b>EVENT LOGS</b>}/>
        <div className="EventLogs">
          {this.state.error && (
            <Alert
              style={{ 'marginBottom': '0.5em' }}
              message="Error"
              description={this.state.error}
              type="error"
              showIcon
            />
          )}
          <Table
            className="EventLog-table"
            expandedRowRender={event => <pre className="EventLog-table-expanded-row">
              {this.renderExpandedRow(event.requestBody)}
            </pre>}
            dataSource={_.map(this.state.data, mapEvent)}
            loading={this.state.loading}
            columns={columns}
            pagination={{
              ...this.state.pagination,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} events`,
              showSizeChanger: false,
            }}
            onChange={this.handleTableChange.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default EventLogs;
