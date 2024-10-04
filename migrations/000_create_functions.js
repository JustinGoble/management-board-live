const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .raw(stripIndent`
      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
};

exports.down = (knex) => {
  return knex.schema.raw('DROP FUNCTION IF EXISTS trigger_set_timestamp');
};
