import _ from 'lodash';
import { Container } from 'unstated';
import * as request from '../utils/request';

export class UserController extends Container {
  state = {
    currentUser: null,
    userOptions: [],
  };

  async loadCurrentUser() {
    const res = await request.get({
      path: '/api/v1/users/@me',
    });
    this.setState({
      currentUser: res,
    });
  }

  async loadUserOptions() {
    const res = await request.get({
      path: '/api/v1/users/list',
    });
    this.setState({
      userOptions: _.map(res, user => ({
        value: user.id,
        title: user.nickname,
      })),
    });
  }

  /**
   * Returns `true` if the currently logged in user
   * has at least one of the given permissions.
   * @param {string[]} whitelistedPermissions A list of whitelisted permissions
   */
  async isCurrentUserAllowed(whitelistedPermissions) {
    return _.intersection(
      _.get(this.state.currentUser, 'permissions', []),
      whitelistedPermissions,
    ).length > 0;
  }
}

const userController = new UserController();

export default userController;
