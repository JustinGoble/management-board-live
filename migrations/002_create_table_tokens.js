const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('discord_tokens', (table) => {
      table.integer('user_id').unsigned().unique().notNullable();
      table.text('access_token').primary().notNullable();
      table.text('refresh_token').unique().notNullable();
      table.bigInteger('expires_in').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));

      table.foreign('user_id').references('users.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
    })
    .createTable('access_tokens', (table) => {
      table.integer('user_id').unsigned().notNullable();
      table.text('token').primary().notNullable();
      table.text('user_agent').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));

      table.foreign('user_id').references('users.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON discord_tokens
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `)
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON access_tokens
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
};

exports.down = (knex) => {
  return knex.schema
    .dropTable('access_tokens')
    .dropTable('discord_tokens');
};
