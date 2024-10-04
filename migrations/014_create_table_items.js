exports.up = (knex) => {
  return knex.schema
    .createTable('crafting_items', (table) => {
      table.increments('id');
      table.text('name').notNullable();
      table.integer('category_id').unsigned().notNullable();

      table.foreign('category_id').references('crafting_item_categories.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('crafting_items');
};
