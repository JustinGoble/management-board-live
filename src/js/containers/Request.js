import * as _ from 'lodash';
import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  Table, Spin, Alert, Input,
  Button, Tooltip,
} from 'antd';
import {
  CheckOutlined,
  StopOutlined,
  ImportOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { Subscribe } from 'unstated';
import TopBar from './TopBar';
import * as req from '../utils/request';
import userController from '../controllers/UserController';
import '../../css/containers/Request.less';
import { PrioritySelector } from "../components/PrioritySelector";
import { Comments } from "../components/Comments";

const { TextArea } = Input;

class Request extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.id,
      request: null,
      reply: '',
      committing: false,
      error: null,
      canChangePriority: false,
      approveBtnTooltip: '',
      rejectBtnTooltip: '',
      completeBtnTooltip: '',
      pickUpBtnTooltip: '',
    };
  }

  async componentDidMount() {
    if (userController.state.userOptions.length > 0) {
      userController.loadUserOptions();
    } else {
      await userController.loadUserOptions();
    }

    const isManagement = _.intersection(
      _.get(userController, 'state.currentUser.permissions', []),
      ['admin'],
    ).length > 0;

    const showComments = _.intersection(
      _.get(userController, 'state.currentUser.permissions', []),
      ['admin', 'management', 'industry'],
    ).length > 0;

    this.setState({ canChangePriority: isManagement, showComments });

    try {
      const request = await req.get({
        path: `/api/v1/requests/${this.state.id}`,
      });
      this.setState({ request });
    } catch (e) {
      this.setState({ error: e.message });
    }
  }

  componentDidUpdate() {
    const isManagement = _.intersection(
      _.get(userController, 'state.currentUser.permissions', []),
      ['management', 'admin'],
    ).length > 0;

    const request = this.state.request || {};

    let approveBtnTooltip = '';
    if (!isManagement) {
      approveBtnTooltip = 'Not enough permissions';
    }
    if (approveBtnTooltip !== this.state.approveBtnTooltip) {
      this.setState({ approveBtnTooltip });
    }

    let rejectBtnTooltip = '';
    if (!isManagement) {
      rejectBtnTooltip = 'Not enough permissions';
    } else if (!this.state.reply) {
      rejectBtnTooltip = 'No rejection message entered';
    }
    if (rejectBtnTooltip !== this.state.rejectBtnTooltip) {
      this.setState({ rejectBtnTooltip });
    }

    let completeBtnTooltip = '';
    if (!request.validatedAt) {
      completeBtnTooltip = 'Request not yet validated';
    } else if (!this.state.reply) {
      completeBtnTooltip = 'No completion message entered';
    }
    if (completeBtnTooltip !== this.state.completeBtnTooltip) {
      this.setState({ completeBtnTooltip });
    }

    let pickUpBtnTooltip = '';
    if (
      request.createdBy !== userController.state.currentUser.id
      && !isManagement
    ) {
      pickUpBtnTooltip = "Requested by another person";
    } else if (!request.completedAt) {
      pickUpBtnTooltip = 'Request not yet completed';
    }
    if (pickUpBtnTooltip !== this.state.pickUpBtnTooltip) {
      this.setState({ pickUpBtnTooltip });
    }
  }

  getUserNameById(id) {
    const userData = _.find(
      userController.state.userOptions,
      { value: id },
    );
    return userData ? userData.title.split('#')[0] : id;
  }

  eventItemText(userId, time) {
    if (!userId || !time) return '';
    return `by ${this.getUserNameById(userId)} ${moment(time).fromNow()}`;
  }

  async callAction(action, data = {}) {
    this.setState({
      error: null,
      committing: true,
    });

    try {
      const request = await req.post({
        path: `/api/v1/requests/${this.state.id}/${action}`,
        data,
      });
      this.setState({
        request,
        committing: false,
      });
    } catch (e) {
      this.setState({
        error: e.message,
        committing: false,
      });
    }
  }

  async reject() {
    await this.callAction(
      'validate',
      {
        approved: false,
        reply: this.state.reply,
      },
    );
  }

  async approve() {
    await this.callAction('validate', { approved: true });
  }

  async complete() {
    await this.callAction(
      'complete',
      { reply: this.state.reply },
    );
  }

  async pickUp() {
    await this.callAction('pick-up');
  }

  changeReply(event) {
    const { value } = event.target;
    this.setState({
      reply: value,
    });
  }

  renderPrioritySelector(request) {
    const { priority, completedAt } = request;

    const requestIsCompleted = !!completedAt;

    return (
      <div className="Request-priority-container">
        <h4>Priority:</h4>{this.state.canChangePriority && !requestIsCompleted ?
          (<PrioritySelector value={priority}
            requestId={this.state.id}
            onPriorityChanged={this.handlePriorityChange}
            onPriorityFailedToChange={this.handlePriorityChangeFailure} />) :
          (<span className="priority-value">{priority}</span>)}
      </div>
    );
  }

  handlePriorityChange = priority => {
    this.setState({
      request: {
        ...this.state.request,
        priority,
      },
    });
  };

  handlePriorityChangeFailure = e => {
    this.setState({ error: `Failed to Change Priority. ${e}` });
  };

  handleCommentPostFailure = e => {
    this.setState({ error: `Failed to Post Comment. ${e}` });
  };

  handleFailureToFetchComments = e => {
    this.setState({ error: `Failed to Fetch Comments. ${e}` });
  };

  render() {
    const columns = [
      {
        title: 'Element',
        dataIndex: 'name',
        key: 'name',
        render: (name, item) => {
          if (item.tag === 'ship') {
            return (
              <Link to={`/ships/${item.id}`}>
                {name}
              </Link>
            );
          }

          return name;
        },
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
      },
    ];

    const request = this.state.request || {};

    const content = _.forEach(
      request.content,
      (item, i) => { item.key = i; },
    );

    const untaggedContent = _.filter(content, a => !a.tag);
    const navyContent = _.filter(content, a => a.tag === "navy");
    const industryContent = _.filter(content, a => a.tag === "industry");
    const voxelContent = _.filter(content, a => a.tag === "voxel");
    const schematicContent = _.filter(content, a => a.tag === "schematic");
    const shipContent = _.filter(content, a => a.tag === "ship");

    const {
      id,
      type,
      details,
      createdBy,
      createdAt,
      validatedBy,
      validatedAt,
      approved,
      completedBy,
      completedAt,
      pickedUpAt,
      reply,
    } = request;

    const wasRejected = validatedAt && !approved;
    const showReplyField = !wasRejected && !completedAt;

    const renderContentTable = (content, headerClassName, headerText) =>
      content.length > 0 && (
        <div className="request-list-container">
          <h3 className={headerClassName}>{headerText}</h3>
          <Table
            className='Request-content'
            columns={columns}
            dataSource={content}
            pagination={false}
          />
        </div>
      );

    return (<>
      <TopBar
        backButton={true}
        title={<b>INDUSTRY REQUESTS - ID#{id}</b>}
      />
      <div className='Request'>
        {renderContentTable(untaggedContent, "untagged", "UNTAGGED")}
        {renderContentTable(industryContent, "industry", "INDUSTRY")}
        {renderContentTable(navyContent, "navy", "NAVY")}
        {renderContentTable(schematicContent, "schematic", "SCHEMATIC")}
        {renderContentTable(shipContent, "ship", "SHIP")}
        {renderContentTable(voxelContent, "voxel", "VOXEL")}
        <div className='Request-info'>
          {this.state.error && (
            <Alert
              style={{ 'marginBottom': '0.5em' }}
              message="Error"
              description={this.state.error}
              type="error"
              showIcon
            />
          )}
          {this.state.committing && (
            <Alert
              style={{ 'marginBottom': '0.5em' }}
              message="Committing..."
              type="info"
            />
          )}
          {this.state.request === null ? (
            <Spin
              className="Request-spin"
              size="large"
              tip="Loading request..."
            />
          ) : (
            <Subscribe to={[userController]}>
              {() => (
                <div className="Request-info-content">
                  {type &&
                  <div className="Request-type-container">
                    <h3>REQUEST TYPE: <span>{_.toUpper(type)}</span></h3>
                    <div className="line-horizontal"/>
                  </div>
                  }
                  {this.renderPrioritySelector(request)}
                  <div className="line-horizontal"/>
                  <p>Description:</p>
                  <p>{details || "No description"}</p>
                  <div className="line-horizontal"/>
                  <p>Created {this.eventItemText(createdBy, createdAt)}</p>
                  <div className="line-horizontal"/>
                  {validatedAt ? <p>
                    {approved ? 'Approved' : 'Rejected'} {
                      this.eventItemText(validatedBy, validatedAt)
                    }
                  </p> : <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Tooltip title={this.state.approveBtnTooltip} placement='top'>
                      <Button
                        type='primary'
                        disabled={this.state.approveBtnTooltip || this.state.committing}
                        style={{ width: '100%' }}
                        onClick={this.approve.bind(this)}
                      >
                        Approve
                        <CheckOutlined />
                      </Button>
                    </Tooltip>
                    <Tooltip title={this.state.rejectBtnTooltip} placement='top'>
                      <Button
                        type='danger'
                        disabled={this.state.rejectBtnTooltip || this.state.committing}
                        style={{ width: '100%', marginTop: '0.5em' }}
                        onClick={this.reject.bind(this)}
                      >
                        Reject
                        <StopOutlined />
                      </Button>
                    </Tooltip>
                  </div>}
                  {!wasRejected && <>
                    <div className="line-horizontal"/>
                    {completedAt ? <p>
                      Completed {this.eventItemText(completedBy, completedAt)}
                    </p> : <>
                      <Tooltip title={this.state.completeBtnTooltip} placement='top'>
                        <Button
                          type='normal'
                          style={{ width: '100%' }}
                          disabled={this.state.completeBtnTooltip || this.state.committing}
                          onClick={this.complete.bind(this)}
                        >
                          Complete
                          <ImportOutlined />
                        </Button>
                      </Tooltip>
                    </>}
                    <div className="line-horizontal"/>
                    {pickedUpAt ? <p>
                      Picked up {moment(pickedUpAt).fromNow()}
                    </p> : <>
                      <Tooltip title={this.state.pickUpBtnTooltip} placement='top'>
                        <Button
                          type='normal'
                          style={{ width: '100%' }}
                          disabled={this.state.pickUpBtnTooltip || this.state.committing}
                          onClick={this.pickUp.bind(this)}
                        >
                          Pick up
                          <ExportOutlined />
                        </Button>
                      </Tooltip>
                    </>}
                  </>}
                  <div className="line-horizontal"/>
                  {showReplyField ? <>
                    <TextArea
                      type="textarea"
                      className="InputDetails"
                      placeholder="Rejection or completion message"
                      maxLength={5000}
                      autoSize={{ minRows: 2, maxRows: 20 }}
                      onChange={this.changeReply.bind(this)}
                    />
                  </> : <>
                    <p>Reply:</p>
                    <p style={{ 'white-space': 'pre-wrap' }}>{reply}</p>
                  </>}
                  <div className="line-horizontal"/>
                  {this.state.showComments ? <Comments requestId={this.state.id}
                    onCommentFailedToPost={this.handleCommentPostFailure}
                    onFailedToFetchComments={this.handleFailureToFetchComments} /> : '' }
                </div>
              )}
            </Subscribe>
          )}
        </div>
      </div>
    </>);
  }
}

export default Request;
