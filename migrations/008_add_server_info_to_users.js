exports.up = (knex) => {
  return knex.schema
    .alterTable('users', (table) => {
      table.text('nickname');
      table.text('server');

      table.unique('discord_id');
    });
};

exports.down = (knex) => {
  return knex.schema
    .alterTable('users', (table) => {
      table.dropColumn('nickname');
      table.dropColumn('server');

      table.dropUnique('discord_id');
    });
};
