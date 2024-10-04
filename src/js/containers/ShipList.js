import _ from 'lodash';
import React from 'react';
import { withRouter } from "react-router";
import { Link } from 'react-router-dom';
import { Table, Button, Input, Alert } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import TopBar from './TopBar';
import * as request from '../utils/request';
import '../../css/containers/ShipList.less';

class ShipList extends React.Component {
  state = {
    data: [],
    pagination: {
      pageSize: 10,
      current: 1,
    },
    shipCategoryMap: [],
    sortedInfo: null,
    sortField: undefined,
    sortOrder: undefined,
    search: undefined,
    loading: false,
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
    });

    this.setState({
      error: null,
      loading: true,
    });

    try {
      const data = await request.get({
        path: '/api/v1/ships',
        params: _.pickBy(params, v => !_.isNil(v)), // Remove null and undefined
      });
      const shipCategoryList = await request.get({
        path: `/api/v1/ship-categories/list`,
      });
      const shipCategoryMap = {};
      _.forEach(shipCategoryList, c => {
        shipCategoryMap[c.id] = c.name;
      });

      const pagination = { ...this.state.pagination };
      pagination.total = data.totalHits;
      this.setState({
        loading: false,
        data: data.results,
        shipCategoryMap,
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
      shipCategoryMap,
    } = this.state;

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        sorter: (a, b) => (a.attr > b.attr) - (a.attr < b.attr),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortField === 'id' && sortOrder,
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, user) => (
          <Link to={`/ships/${user.id}`}>
            <SelectOutlined style={{ marginRight: 8 }} />
            Open
          </Link>
        ),
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => (a.attr > b.attr) - (a.attr < b.attr),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortField === 'name' && sortOrder,
      },
      {
        title: 'Core Size',
        dataIndex: 'coreSize',
        key: 'coreSize',
        sorter: (a, b) => (a.attr > b.attr) - (a.attr < b.attr),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortField === 'coreSize' && sortOrder,
      },
      {
        title: 'Category',
        dataIndex: 'categoryId',
        key: 'categoryId',
        sorter: (a, b) => (a.attr > b.attr) - (a.attr < b.attr),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortField === 'categoryId' && sortOrder,
        render: (categoryId) => shipCategoryMap[categoryId],
      },
    ];

    const mapUser = (user) => ({
      ...user,
      key: user.id,
    });

    return (
      <div>
        <TopBar
          title={<b>SHIPS</b>}
          subContent={
            <div className="ShipList-actions">
              <Button
                className="tool-button"
                type="primary"
                onClick={() => this.props.history.push('/ships/new')}
              >
                New
              </Button>
              <Input
                style={{ margin: '0.5em', width: '20em' }}
                placeholder="Search for ship"
                defaultValue={this.state.search}
                onPressEnter={this.onSearchQueryChanged.bind(this)}
              />
            </div>
          }
        />
        <div className="ShipList">
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
            className="ShipList-table"
            dataSource={_.map(this.state.data, mapUser)}
            loading={this.state.loading}
            columns={columns}
            pagination={{
              ...this.state.pagination,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ships`,
              showSizeChanger: false,
            }}
            onChange={this.handleTableChange.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(ShipList);
