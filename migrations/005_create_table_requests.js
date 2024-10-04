exports.up = (knex) => {
  return knex.schema
    .createTable('requests', (table) => {
      table.increments('id');
      table.jsonb('content').notNullable();
      table.text('details');
      table.integer('created_by').unsigned().notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.integer('validated_by').unsigned();
      table.timestamp('validated_at');
      table.boolean('approved');
      table.integer('completed_by').unsigned();
      table.timestamp('completed_at');
      table.timestamp('picked_up_at');
      table.text('reply');

      table.foreign('created_by').references('users.id')
        .onDelete('RESTRICT').onUpdate('CASCADE');
      table.foreign('validated_by').references('users.id')
        .onDelete('RESTRICT').onUpdate('CASCADE');
      table.foreign('completed_by').references('users.id')
        .onDelete('RESTRICT').onUpdate('CASCADE');
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('requests');
};
