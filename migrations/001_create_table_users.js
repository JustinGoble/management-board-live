const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id');
      table.text('name').notNullable();
      table.text('description');
      table.text('discord_id').notNullable();
      table.text('permissions');
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
      table.enu('state', ['active', 'inactive'])
        .notNullable().defaultTo('active');
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
};

exports.down = (knex) => {
  return knex.schema
    .dropTable('users');
};
