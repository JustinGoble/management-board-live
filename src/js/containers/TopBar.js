import _ from 'lodash';
import React from 'react';
import { withRouter } from "react-router";
import {
  LeftOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import '../../css/containers/TopBar.less';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: true,
    };
  }

  handleClick = () => {
    this.setState({
      isExpanded: !this.state.isExpanded,
    });
  }

  render() {
    const hasContent = !_.isNil(this.props.subContent);
    const { isExpanded } = this.state;

    return (
      <div>
        <div className="TopBar">
          {this.props.backButton && (
            <div
              className="TopBar-back-button"
              onClick={() => this.props.history.goBack()}
            >
              <LeftOutlined />
            </div>
          )}
          <span className="TopBar-title">
            {this.props.title}
          </span>
          {hasContent && (
            <div
              className="TopBar-expander"
              onClick={this.handleClick}
            >
              {isExpanded
                ? <UpOutlined />
                : <DownOutlined />
              }
            </div>
          )}
        </div>
        {isExpanded && hasContent && (
          <div className="TopBar-expand">
            {this.props.subContent}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(TopBar);

