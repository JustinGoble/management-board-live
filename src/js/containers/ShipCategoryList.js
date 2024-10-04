import _ from 'lodash';
import React from 'react';
import { Pagination, Alert, Spin } from 'antd';
import TopBar from './TopBar';
import ShipCategoryForm from '../components/ShipCategoryForm';
import * as request from '../utils/request';
import userController from '../controllers/UserController';
import '../../css/containers/ShipCategoryList.less';

class ShipCategoryList extends React.Component {
  state = {
    data: [],
    pagination: {
      pageSize: 8,
      current: 1,
    },
    loading: false,
    error: null,
  };

  async componentDidMount() {
    await this.fetch();
  }

  async handlePaginationChange(page) {
    const pager = { ...this.state.pagination };
    pager.current = page;
    this.setState({
      pagination: pager,
    });
    await this.fetch({
      limit: pager.pageSize,
      page: page - 1,
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
        path: '/api/v1/ship-categories',
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

  async onCategoryDeleted(categoryId) {
    this.setState({
      loading: true,
      error: null,
    });

    try {
      await request.del({
        path: `/api/v1/ship-categories/${categoryId}`,
      });

      await this.fetch();
    } catch (err) {
      this.setState({
        loading: false,
        error: err.message,
      });
    }
  }

  async onCategoryUpserted(category) {
    this.setState({
      loading: true,
      error: null,
    });

    try {
      await request.post({
        path: '/api/v1/ship-categories',
        data: category,
      });

      await this.fetch();
    } catch (err) {
      this.setState({
        loading: false,
        error: err.message,
      });
    }
  }

  render() {
    return (
      <div>
        <TopBar
          title={<b>SHIP CATEGORIES</b>}
        />
        {this.renderPageContent()}
      </div>
    );
  }

  renderPageContent() {
    const canEdit = userController.isCurrentUserAllowed(
      ['industry', 'admin'],
    );

    if (this.state.loading) {
      return (
        <div className="ShipCategoryList">
          <Spin
            className="ShipCategoryList-load-spin"
            tip="Loading ship category information"
          />
        </div>
      );
    }

    return (
      <div className="ShipCategoryList">
        {this.state.error && (
          <Alert
            style={{ 'marginBottom': '0.5em' }}
            message="Error"
            description={this.state.error}
            type="error"
            showIcon
          />
        )}
        <div className="ShipCategoryList-content">
          {_.map(this.state.data, shipCategory =>
            <ShipCategoryForm
              shipCategory={shipCategory}
              onSaved={this.onCategoryUpserted.bind(this)}
              onDelete={this.onCategoryDeleted.bind(this)}
            />,
          )}
          {canEdit &&
            <ShipCategoryForm
              shipCategory={{}}
              onSaved={this.onCategoryUpserted.bind(this)}
              onDelete={this.onCategoryDeleted.bind(this)}
            />
          }
        </div>
        <Pagination
          onChange={this.handlePaginationChange.bind(this)}
          current={this.state.pagination.current}
          pageSize={this.state.pagination.pageSize}
          total={this.state.pagination.total}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} ship categories`}
          showSizeChanger={false}
        />
      </div>
    );
  }
}

export default ShipCategoryList;
