import React from 'react';
import { Form, Input, Button, Pagination } from 'antd';
import moment from 'moment';
import '../../css/components/Comments.less';
import * as _ from "lodash";
import userController from "../controllers/UserController";
import * as req from "../utils/request";
import * as request from "../utils/request";
import { CommentItem } from "./CommentItem";

export class Comments extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: [],
      pagination: {
        pageSize: 10,
        current: 1,
      },
    };
  }

  async handleSubmit(e) {
    try {
      await req.post({
        path: `/api/v1/requests/${this.props.requestId}/comments`,
        data: {
          ...e,
        },
      });

      await this.fetch();
    } catch (e) {
      if (this.props.onCommentFailedToPost) {
        this.props.onCommentFailedToPost(e.message);
      }
    }
  }

  clearFormFields(formName, info) {
    info.forms[formName].resetFields();
  }

  async componentDidMount() {
    await this.fetch();
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
        path: `/api/v1/requests/${this.props.requestId}/comments`,
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

  render() {
    return <div className="Comments">
      <Form.Provider onFormFinish={this.clearFormFields.bind(this)}>
        <Form name="comments" validateMessages={this.validateMessages}
          onFinish={this.handleSubmit.bind(this)}>
          <Form.Item fieldContext="comment" name={['text']}
            label="Comment"
            rules={[{ required: true }]}>
            <Input.TextArea maxLength={150} />
          </Form.Item>
          <Form.Item fieldContext="submitButton">
            <Button type="secondary" htmlType="submit">Post Comment</Button>
          </Form.Item>
        </Form>
      </Form.Provider>

      {this.renderCommentItems(this.state, this.props)}
    </div>;
  }

  renderCommentItems(state) {
    if (state.data == null || state.data.length === 0) {
      return <div className="Comments-empty">No Comments yet</div>;
    }

    const items = state.data.map(item => <CommentItem key={item.id} comment={item} />);

    return <div>
      {items}
      <Pagination defaultCurrent={this.state.pagination.current}
        total={this.state.pagination.total}
        hideOnSinglePage={true}
        onChange={this.handlePaginationChanged.bind(this)}
        onShowSizeChange={this.handlePageSizeChanged.bind(this)} />
    </div>;
  }

  eventItemText(userId, time) {
    if (!userId || !time) return '';
    return `by ${this.getUserNameById(userId)} ${moment(time).fromNow()}`;
  }

  getUserNameById(id) {
    const userData = _.find(
      userController.state.userOptions,
      { value: id },
    );
    return userData ? userData.title.split('#')[0] : id;
  }

  async handlePaginationChanged(pageNumber, pageSize) {
    const pager = { ...this.state.pagination };
    pager.current = pageNumber;
    pager.pageSize = pageSize;

    this.setState({ pagination: pager });

    await this.fetch({
      limit: pageSize,
      page: pageNumber - 1,
      requestId: this.props.requestId,
    });
  }

  async handlePageSizeChanged(current, pageSize) {
    await this.handlePaginationChanged(current, pageSize);
  }
}
