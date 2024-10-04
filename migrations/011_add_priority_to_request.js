exports.up = (knex) => {
  return knex.schema
    .alterTable('requests', (table) => {
      table.integer('priority')
        .unsigned()
        .notNullable()
        .defaultTo(3);
    });
};

exports.down = (knex) => {
  return knex.schema
    .alterTable('requests', (table) => {
      table.dropColumn('priority');
    });
};
