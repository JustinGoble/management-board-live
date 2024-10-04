exports.up = (knex) => {
  return knex.schema
    .createTable('event_logs', (table) => {
      table.increments('id');
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.integer('user').unsigned();
      table.text('type').notNullable();
      table.enu('rest_type', ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']);
      table.text('request_path');
      table.text('request_body');

      table.foreign('user').references('users.id')
        .onDelete('RESTRICT').onUpdate('CASCADE');
    });
};


exports.down = (knex) => {
  return knex.schema.dropTable('event_logs');
};
