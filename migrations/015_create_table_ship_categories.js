exports.up = (knex) => {
  return knex.schema
    .createTable('ship_categories', (table) => {
      table.increments('id');
      table.text('name').unique().notNullable();
      table.text('description');
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('ship_categories');
};
