import React from 'react';
import '../../css/components/CommentItem.less';
import moment from "moment";
import * as _ from "lodash";
import userController from "../controllers/UserController";

export class CommentItem extends React.Component {
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

  render() {
    const item = this.props.comment;

    return <div className="CommentItem">
      <p>{item.text}</p>
      <small>Posted {this.eventItemText(item.userId, item.createdAt)}</small>
    </div>;
  }
}
