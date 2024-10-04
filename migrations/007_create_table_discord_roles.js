exports.up = (knex) => {
  return knex.schema
    .createTable('discord_roles', (table) => {
      table.text('id').notNullable().unique().primary();
      table.text('name').notNullable();
      table.integer('color').unsigned().notNullable();
      table.text('permissions');
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('discord_roles');
};
