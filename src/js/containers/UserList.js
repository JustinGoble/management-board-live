import _ from 'lodash';
import React from 'react';
import moment from 'moment';
import { withRouter } from "react-router";
import { Link } from 'react-router-dom';
import { Table, Tag, Select, Input, Alert } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import TopBar from './TopBar';
import * as request from '../utils/request';
import '../../css/containers/UserList.less';

const { Option } = Select;

class UserList extends React.Component {
  state = {
    data: [],
    pagination: {
      pageSize: 10,
      current: 1,
    },
    sortedInfo: null,
    sortField: undefined,
    sortOrder: undefined,
    search: undefined,
    active: "active",
    hasPermissions: "hasPermissions",
    loading: false,
    isMobile: false,
    error: null,
  };

  constructor(props) {
    super(props);

    // If we have a state in the history, restore it
    if (this.props.location.state) {
      this.state = this.props.location.state;
    }
  }

  async componentDidMount() {
    const isMobileQuery = window.matchMedia("(max-width: 700px)");
    isMobileQuery.addEventListener('change', this.handleMobileStateChange.bind(this));
    this.handleMobileStateChange(isMobileQuery);

    await this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    /**
     * Allows restoring the state of the component when returning from another page.
     */
    if (!_.isEqual(prevState, this.state)) {
      this.props.history.replace(this.props.location.pathname, this.state);
    }
  }

  async handleMobileStateChange(e) {
    this.setState({ isMobile: e.matches });
  }

  async handleTableChange(pagination, filters, sorter) {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortField: sorter.order ? sorter.field : null,
      sortOrder: sorter.order ? sorter.order : null,
    });
    await this.fetch({
      limit: pagination.pageSize,
      page: pagination.current - 1,
      sortField: sorter.order ? sorter.field : null,
      sortOrder: sorter.order ? sorter.order : null,
      ...filters,
    });
  }

  async fetch(params = {}) {
    _.defaults(params, {
      limit: this.state.pagination.pageSize,
      page: this.state.pagination.current - 1,
      sortField: this.state.sortField,
      sortOrder: this.state.sortOrder,
      search: this.state.search,
      active: this.state.active,
      hasPermissions: this.state.hasPermissions,
    });

    params.active = {
      all: null,
      active: true,
      inactive: false,
    }[params.active];


    params.hasPermissions = {
      all: null,
      hasPermissions: true,
      noPermissions: false,
    }[params.hasPermissions];

    this.setState({
      error: null,
      loading: true,
    });

    try {
      const data = await request.get({
        path: '/api/v1/users',
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

  async onSearchQueryChanged(event) {
    const search = event.target.value;

    const pagination = { ...this.state.pagination };
    pagination.current = 1;

    this.setState({ search, pagination });
    await this.fetch({ search, page: 0 });
  }

  async onActiveStateChanged(active) {
    const pagination = { ...this.state.pagination };
    pagination.current = 1;

    this.setState({ active, pagination });
    await this.fetch({ active, page: 0 });
  }

  async onPermissionStateChanged(hasPermissions) {
    const pagination = { ...this.state.pagination };
    pagination.current = 1;

    this.setState({ hasPermissions, pagination });
    await this.fetch({ hasPermissions, page: 0 });
  }

  async onUserLimitChanged(limit) {
    const pagination = { ...this.state.pagination };
    pagination.current = 1;
    pagination.pageSize = limit;

    this.setState({ limit, pagination });
    await this.fetch({ limit, page: 0 });
  }

  render() {
    const {
      sortField,
      sortOrder,
      isMobile,
    } = this.state;

    const columns = [
      {
        title: 'Action',
        key: 'action',
        render: (text, user) => (
          <Link to={`/users/${user.id}`}>
            <SelectOutlined style={{ marginRight: 8 }} />
            Open
          </Link>
        ),
      },
      {
        title: 'Account Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: (a, b) => (a.attr > b.attr) - (a.attr < b.attr),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortField === 'createdAt' && sortOrder,
        render: time => moment(time).format('YYYY-MM-DD'),
      },
      {
        title: 'Nickname',
        dataIndex: 'nickname',
        key: 'nickname',
        sorter: (a, b) => (a.attr > b.attr) - (a.attr < b.attr),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortField === 'nickname' && sortOrder,
        render: (text, user) => (
          isMobile ? <a href={`/users/${user.id}`}>
            <SelectOutlined style={{ marginRight: 8 }} />
            {text}
          </a> : text
        ),
      },
      {
        title: 'Permissions',
        dataIndex: 'permissions',
        key: 'permissions',
        render: permissions => (
          <span>
            {_.map(permissions, tag => <Tag color="blue" key={tag}>{tag}</Tag>)}
          </span>
        ),
      },
      {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
      },
    ];

    if (isMobile) {
      _.remove(
        columns,
        c => c.key === 'createdAt' || c.key === 'action',
      );
    }

    const mapUser = (user) => ({
      ...user,
      key: user.id,
    });

    return (
      <div>
        <TopBar
          title={<b>USERS</b>}
          subContent={
            <div className="UserList-actions">
              <Input
                style={{ margin: '0.5em', width: '20em' }}
                placeholder="Search for username"
                defaultValue={this.state.search}
                onPressEnter={this.onSearchQueryChanged.bind(this)}
              />
              <Select
                defaultValue={this.state.active}
                style={{ margin: '0.5em', width: '10em' }}
                onChange={this.onActiveStateChanged.bind(this)}
              >
                <Option value="all">All active states</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
              <Select
                defaultValue={this.state.hasPermissions}
                style={{ margin: '0.5em', width: '13em' }}
                onChange={this.onPermissionStateChanged.bind(this)}
              >
                <Option value="all">All permission states</Option>
                <Option value="hasPermissions">Has permissions</Option>
                <Option value="noPermissions">No permissions</Option>
              </Select>
              <Select
                defaultValue={this.state.pagination.pageSize}
                style={{ margin: '0.5em', width: '7em' }}
                onChange={this.onUserLimitChanged.bind(this)}
              >
                <Option value="10">10</Option>
                <Option value="20">20</Option>
                <Option value="50">50</Option>
                <Option value="100">100</Option>
              </Select>
            </div>
          }
        />
        <div className="UserList">
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
            className="UserList-table"
            dataSource={_.map(this.state.data, mapUser)}
            loading={this.state.loading}
            columns={columns}
            pagination={{
              ...this.state.pagination,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
              showSizeChanger: false,
            }}
            onChange={this.handleTableChange.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(UserList);
