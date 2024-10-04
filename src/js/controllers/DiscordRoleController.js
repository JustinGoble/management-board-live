import _ from 'lodash';
import { Container } from 'unstated';
import * as request from '../utils/request';

export class DiscordRoleController extends Container {
  state = {
    discordRoleOptions: [],
  };

  async loadDiscordRoleOptions() {
    const res = await request.get({
      path: '/api/v1/discord-roles/list',
    });
    this.setState({
      discordRoleOptions: _.map(res, user => ({
        value: user.id,
        title: user.name,
        color: user.color,
      })),
    });
  }
}

const discordRoleController = new DiscordRoleController();

export default discordRoleController;
