exports.up = (knex) => {
  return knex.schema
    .createTable('crafting_item_categories', (table) => {
      table.increments('id');
      table.text('name').notNullable();
      table.enu('tag', ['navy', 'industry', 'schematic', 'voxel']);
      table.integer('parent_id').unsigned();

      table.foreign('parent_id').references('crafting_item_categories.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('crafting_item_categories');
};
