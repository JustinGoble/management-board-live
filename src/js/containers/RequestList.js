import React from 'react';
import _ from 'lodash';
import { Table, Tag, Select, Button, Modal } from 'antd';
import {
  SelectOutlined,
  SyncOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Subscribe } from 'unstated';
import moment from 'moment';
import TopBar from './TopBar';
import * as request from '../utils/request';
import userController from '../controllers/UserController';
import '../../css/containers/RequestList.less';

const { confirm } = Modal;
const { Option } = Select;
const tagStyles = {
  industry: <Tag color='#faa61a' key='industry'><b>INDUSTRY</b></Tag>,
  navy: <Tag color='#ea4745' key='navy'><b>NAVY</b></Tag>,
  schematic: <Tag color='#800080' key='schematic'><b>SCHEMATIC</b></Tag>,
  ship: <Tag color='#448844' key='ship'><b>SHIP</b></Tag>,
  voxel: <Tag color='#1cb0ee' key='voxel'><b>VOXEL</b></Tag>,
};
class RequestList extends React.Component {
  state = {
    data: [],
    pagination: {
      pageSize: 10,
      current: 1,
    },
    sortedInfo: null,
    isMobile: false,
    loading: false,
    error: null,
    states: ['created', 'approved', 'completed'],
  };

  constructor(props) {
    super(props);

    // If we have a state in the history, restore it
    if (this.props.location.state) {
      this.state = this.props.location.state;
    }
  }

  async componentDidMount() {
    const isMobileQuery = window.matchMedia("(max-width: 800px)");
    isMobileQuery.addEventListener('change', this.handleMobileStateChange.bind(this));
    this.handleMobileStateChange(isMobileQuery);

    if (userController.state.userOptions.length > 0) {
      userController.loadUserOptions();
    } else {
      await userController.loadUserOptions();
    }
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

  getUserNameById(id) {
    const userData = _.find(
      userController.state.userOptions,
      { value: id },
    );
    return userData ? userData.title.split('#')[0] : id;
  }

  formatRequestList(req) {
    const request = {
      ...req,
      delivery: req.completedAt && !req.pickedUpAt ? req.reply : '',
      creatorName: this.getUserNameById(req.createdBy),
    };

    if (request.pickedUpAt) {
      request.status = 'Closed';
      return request;
    }

    if (request.completedAt) {
      request.status = 'Ready For Pick-Up';
      return request;
    }

    if (!request.validatedAt) {
      request.status = 'Pending Validation';
      return request;
    }

    if (request.approved) {
      request.status = 'Queued in Industry';
      return request;
    }

    request.status = 'Rejected';
    return request;
  }

  async refreshTable() {
    const pagination = { ...this.state.pagination };
    pagination.current = 1;

    this.setState({ pagination });
    await this.fetch({ page: 0 });
  }

  async fetch(params = {}) {
    _.defaults(params, {
      limit: this.state.pagination.pageSize,
      page: this.state.pagination.current - 1,
      states: this.state.states,
    });

    this.setState({
      error: null,
      loading: true,
    });

    try {
      const data = await request.get({
        path: '/api/v1/requests',
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

  /**
   * Allows restoring the state of the component when returning from another page.
   */
  updateStateToHistory() {
    this.props.history.replace(this.props.location.pathname, this.state);
  }

  async onRequestsLimitChanged(limitString) {
    const limit = parseInt(limitString);
    const pagination = { ...this.state.pagination };
    pagination.current = 1;
    pagination.pageSize = limit;

    this.setState({ limit, pagination });
    await this.fetch({ limit, page: 0 });
  }

  async onRequestsStatesChanged(states) {
    const pagination = { ...this.state.pagination };
    pagination.current = 1;

    this.setState({ pagination, states });
    await this.fetch({ states, page: 0 });
  }

  async onRequestsTableChanged(pagination) {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;

    this.setState({ pagination: pager });

    await this.fetch({
      limit: pagination.pageSize,
      page: pagination.current - 1,
    });
  }

  onClickAddRequest() {
    this.props.history.push(`/requests/new`);
  }

  async deleteItem(requestId) {
    this.setState({
      error: null,
      loading: true,
    });

    try {
      await request.del({
        path: `/api/v1/requests/${requestId}`,
      });

      await this.fetch();
    } catch (err) {
      this.setState({
        loading: false,
        error: err.message,
      });
    }
  }

  actionStepComponent(className, actionText, userId, actionTime) {
    return <p key={actionText}>
      <span className={className}>{actionText}</span>
      {' '}by {this.getUserNameById(userId)}
      {' '}{moment(actionTime).fromNow()}
    </p>;
  }

  expandedRowRender(request) {
    const actions = [];

    actions.push(<p key="Created">
      <b>Created </b>
      {moment(request.createdAt).fromNow()}
    </p>);

    if (request.approved) {
      actions.push(this.actionStepComponent(
        'good', 'Approved', request.validatedBy, request.validatedAt,
      ));

      if (request.completedAt) {
        actions.push(this.actionStepComponent(
          'good', 'Completed', request.completedBy, request.completedAt,
        ));
      }
    } else {
      if (request.validatedAt) {
        actions.push(this.actionStepComponent(
          'bad', 'Rejected', request.validatedBy, request.validatedAt,
        ));
      }
    }

    if (request.pickedUpAt) {
      actions.push(<p key="Picked-up">
        <span className='good'>
          Picked-up
        </span> {moment(request.pickedUpAt).fromNow()}
      </p>);
    }

    return (
      <div className='RequestList-details-list'>
        {actions}
      </div>
    );
  }

  confirmDelete(requestId) {
    confirm({
      title: 'Are you sure you want to delete the request?',
      content: 'This operation can not be canceled',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => this.deleteItem(requestId),
    });
  }

  render() {
    const { isMobile } = this.state;

    const currentUser = _.get(userController, 'state.currentUser', {});
    const currentUserId = currentUser.id;
    const isManager = _.intersection(
      currentUser.permissions,
      ['management', 'industry', 'admin'],
    ).length;

    const columns = [
      {
        title: 'ID#',
        dataIndex: 'id',
        key: 'id',
        width: '5em',
      },
      {
        title: 'Open',
        key: 'open',
        render: (_text, request) => (
          isManager || request.createdBy === currentUserId ? (
            <Link to={`/requests/${request.id}`}>
              <SelectOutlined style={{ marginRight: 8 }} />
              {!isMobile && 'Open'}
            </Link>
          ) : (
            <span>--</span>
          )
        ),
      },
      {
        title: 'Creation date',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt, request) => isManager || request.createdBy === currentUserId ?
          moment(createdAt).format('YYYY-MM-DD')
          :  (
            <span>--</span>
          ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (status, request) => {
          let color = 'red';
          if (status === 'Pending Validation') {
            color = 'gold';
          }
          if (status === 'Ready For Pick-Up') {
            color = 'green';
          }
          if (status === 'Queued in Industry') {
            color = 'blue';
          }
          return (
            isManager || request.createdBy === currentUserId ?
              <Tag color={color} key={status}>
                {status.toUpperCase()}
              </Tag>
              : (
                <span>--</span>
              )
          );
        },
      },
      {
        title: 'Creator',
        dataIndex: 'creatorName',
        key: 'creatorName',
        render: (creatorName, request ) =>
          isManager || request.createdBy === currentUserId
            ? creatorName
            :  (<span>--</span>),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type, request) => {
          return (
            isManager || request.createdBy === currentUserId ?
              <Tag color="#535353">
                <b>{_.toUpper(type)}</b>
              </Tag>
              : (<span>--</span>)
          );
        },
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        key: 'tags',
        render: (tags, request) =>
          isManager || request.createdBy === currentUserId
            ? _.compact(
              _.keys(tagStyles).map(
                key => _.includes(tags, key) ? tagStyles[key] : null,
              ))
            : (<span>--</span>),
      },
    ];

    const isAdmin = _.includes(
      currentUser.permissions,
      'admin',
    );

    if (isAdmin && !isMobile) {
      columns.push(
        {
          title: 'Delete',
          key: 'delete',
          align: 'right',
          width: 100,
          render: (request) => (<Button
            className='RequestList-delete-action'
            type='danger'
            shape='circle'
            icon={<DeleteOutlined />}
            key='delete'
            onClick={() => this.confirmDelete(request.id)}
          />),
        },
      );
    }

    if (isMobile) {
      _.remove(
        columns,
        c => _.includes(['id', 'createdAt', 'tags'], c.key),
      );
    }

    return (
      <div>
        <TopBar
          title={<b>INDUSTRY REQUESTS</b>}
          subContent={
            <div className="RequestList-actions">
              <Select
                className="RequestList-filter-select"
                mode="multiple"
                placeholder="Filter Requests"
                optionLabelProp="title"
                onChange={this.onRequestsStatesChanged.bind(this)}
                defaultValue={this.state.states}
              >
                <Option
                  value="completed"
                  title={<span className='titleGreen'>Ready for Pick-up</span>}
                >
                  <Tag color='green' className='optTag'>READY FOR PICK-UP</Tag>
                </Option>
                <Option
                  value="approved"
                  title={<span className='titleBlue'>Queued in Industry</span>}
                >
                  <Tag color='blue' className='optTag'>QUEUED IN INDUSTRY</Tag></Option>
                <Option
                  value="created"
                  title={<span className='titleGold'>Pending Validation</span>}
                >
                  <Tag color='gold' className='optTag'>PENDING VALIDATION</Tag></Option>
                <Option
                  value="rejected"
                  title={<span className='titleRed'>Rejected</span>}
                >
                  <Tag color='red' className='optTag'>REJECTED</Tag></Option>
                <Option
                  value="picked_up"
                  title={<span className='titleRed'>Closed</span>}
                >
                  <Tag color='red' className='optTag'>CLOSED</Tag></Option>
                {isManager &&
                  <Option value="own" title='All my requests'>All My Requests</Option>
                }
              </Select>

              <Select
                className="RequestList-quantity-select"
                defaultValue={this.state.pagination.pageSize}
                onChange={this.onRequestsLimitChanged.bind(this)}
              >
                <Option value="10">10</Option>
                <Option value="20">20</Option>
                <Option value="50">50</Option>
                <Option value="100">100</Option>
              </Select>

              <Button
                type="default"
                className="RequestList-refresh-button"
                onClick={this.refreshTable.bind(this)}
              >
                Refresh
                <SyncOutlined spin={this.state.loading} />
              </Button>

              <Button
                type="primary"
                className="RequestList-add-button"
                onClick={this.onClickAddRequest.bind(this)}
              >
                <PlusOutlined />
                New
              </Button>
            </div>
          }
        />
        <div className="RequestList">
          <Subscribe to={[userController]}>
            {() => (
              <Table
                className="RequestList-table"
                loading={this.state.loading}
                columns={columns}
                rowKey={request => request.id}
                expandedRowRender={this.expandedRowRender.bind(this)}
                onChange={this.onRequestsTableChanged.bind(this)}
                dataSource={_.map(this.state.data, this.formatRequestList.bind(this))}
                pagination={{
                  ...this.state.pagination,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`,
                  showSizeChanger: false,
                }}
              />
            )}
          </Subscribe>
        </div>
      </div>
    );
  }
}

export default RequestList;
