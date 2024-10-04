const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('request_comments', (table) => {
      table.increments('id');
      table.integer('request_id').unsigned();
      table.integer('user_id').unsigned().notNullable();
      table.text('text').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));

      table.foreign('user_id').references('users.id')
        .onDelete('CASCADE').onUpdate('CASCADE');

      table.foreign('request_id').references('requests.id')
        .onDelete('RESTRICT').onUpdate('CASCADE');
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON request_comments
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
};

exports.down = (knex) => {
  return knex.schema
    .dropTable('request_comments');
};
