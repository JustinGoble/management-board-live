const { knex } = require('../backend/database').connect();
const logger = require('../backend/logger')(__filename);
const uuidv1 = require('uuid/v1');

//first two empty variables here are the "node run", and "add-user.js" arguments of the command.
let [, , nameOfUser, discordID, permissionLevels] = process.argv;

(async () => {
  if (nameOfUser === undefined) { nameOfUser = `TestUser${(await userCount())}`; }

  if (discordID === undefined) { discordID = uuidv1(); }

  if (permissionLevels === undefined) { permissionLevels = 'member'; }

  logger.info(
    `Adding test user with name ${blue(nameOfUser)},`,
    `Discord ID ${blue(discordID)},`,
    `and permission level(s) ${blue(permissionLevels)}`,
  );

  try {
    await knex('users').insert({
      name: nameOfUser,
      discord_id: discordID,
      permissions: permissionLevels,
    });
    logger.info(`User ${blue(nameOfUser)} successfully added!`);
  } catch (e) {
    logger.error(e.stack || e);
  }

  process.exit();
})();

async function userCount() {
  const [userCount] = await knex('users').count();
  let parsedUserCount = parseInt(userCount.count, 10);
  return parsedUserCount + 1;
}

function blue(text) {
  return `\x1b[36m${text}\x1b[0m`;
}
