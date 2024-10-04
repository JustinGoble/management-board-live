exports.up = (knex) => {
  return knex.schema
    .createTable('user_discord_role', (table) => {
      table.text('user_discord_id').notNullable();
      table.text('discord_role_id').notNullable();

      table.unique(['user_discord_id', 'discord_role_id']);

      table.foreign('user_discord_id').references('users.discord_id')
        .onDelete('CASCADE').onUpdate('CASCADE');
      table.foreign('discord_role_id').references('discord_roles.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('user_discord_role');
};
