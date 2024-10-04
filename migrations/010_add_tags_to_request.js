exports.up = (knex) => {
  return knex.schema
    .alterTable('requests', (table) => {
      table.text('tags');
      table.text('type');
    });
};

exports.down = (knex) => {
  return knex.schema
    .alterTable('requests', (table) => {
      table.dropColumn('tags');
      table.dropColumn('type');
    });
};
