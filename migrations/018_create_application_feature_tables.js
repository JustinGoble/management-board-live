const applicationStatuses = require('../backend/services/aplication-statuses-service');
const applicationVoteTypes = require('../backend/services/application-vote-types-service');
exports.up = async (knex) => {
  await knex.schema
    .createTable('applications', (table) => {
      table.increments('id').primary();

      table.integer('applicant_id').unsigned().notNullable();
      table.foreign('applicant_id').references('users.id');

      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));

      table.text('iana_timezone').notNullable();
      table.text('sponsor');
      table.text('game');
      table.integer('status_id');
      table.foreign('status_id').references('application_statuses');
    })
    .createTable('application_statuses', (table) => {
      table.integer('id').unique().notNullable().primary();
      table.text('name');
    })
    .createTable('application_vote_types', (table) => {
      table.integer('id').unsigned().notNullable().primary();
      table.text('name');
    })
    .createTable('application_votes', (table) => {
      // table.increments('application_vote_id').unique().notNullable().primary();
      table.integer('application_id').unsigned().notNullable();
      table.integer('voter_id').unsigned().notNullable();
      table.foreign('voter_id').references('users.id');

      table.integer('vote_type_id').unsigned().notNullable();
      table.foreign('vote_type_id').references('application_vote_types.id');

      table.timestamp('created_at').defaultTo(knex.raw('now()'));

      table.primary(['application_id', 'voter_id']);
    })
    .createTable('questions', (table) => {
      table.uuid('id').primary();
      table.integer('order').notNullable().defaultTo(1);
      table.text('content').notNullable();
      table.boolean('active').defaultTo(true);
      table.enum('type', ['text', 'multi-choice', 'single-choice']).notNullable();
    })
    .createTable('application_question_answers', (table) => {
      table.uuid('id').primary();
      table.timestamp('created_at').defaultTo(knex.raw('now()'));
      table.integer('application_id').unsigned().notNullable();
      table.foreign('application_id').references('applications.id');
      table.text('answer_json');
    });

  await applicationStatuses.importApplicationStatus({ id: 1, name: 'New App' }, knex);
  await applicationStatuses.importApplicationStatus({ id: 2, name: 'Voting' }, knex);
  await applicationStatuses.importApplicationStatus({ id: 3, name: 'Accepted' }, knex);
  await applicationStatuses.importApplicationStatus({ id: 4, name: 'Rejected' }, knex);

  await applicationVoteTypes.importApplicationVote({ id: 1, name: 'Approve' }, knex);
  await applicationVoteTypes.importApplicationVote({ id: 2, name: 'Reject' }, knex);
  await applicationVoteTypes.importApplicationVote({ id: 3, name: 'Abstain' }, knex);
};

exports.down = (knex) => {
  return knex.schema
    .dropTable('questions')
    .dropTable('application_question_answers')
    .dropTable('applications')
    .dropTable('application_statuses')
    .dropTable('application_votes')
    .dropTable('application_vote_types');
};
