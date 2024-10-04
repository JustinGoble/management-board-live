exports.up = (knex) => {
  return knex.schema
    .createTable('ships', (table) => {
      table.increments('id');
      table.text('name').unique().notNullable();
      table.text('core_size').notNullable();
      table.integer('category_id').unsigned().notNullable();
      table.integer('empty_weight_tons');
      table.integer('max_cargo_tons');
      table.integer('max_weight_tons');
      table.decimal('max_velocity_km_per_h');
      table.decimal('atmo_thrust_g');
      table.decimal('atmo_braking_g');
      table.decimal('space_thrust_g');
      table.decimal('space_braking_g');

      table.foreign('category_id').references('ship_categories.id')
        .onDelete('RESTRICT').onUpdate('CASCADE');
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('ships');
};
