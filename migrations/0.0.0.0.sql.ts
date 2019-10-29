import Knex from 'knex';

import Debug from 'debug';

const debug = Debug('sandbox:0.0.0 sql');

export async function up(knex: Knex) {
  debug('up');

  // symptoms
  debug('symptoms');
  await knex.schema.createTable('symptoms', (table) => {
    table
      .increments('id')
      .primary()

    table
      .text('value')
      .notNullable()
      .unique();
  });

  // solutions
  debug('solutions');
  await knex.schema.createTable('solutions', (table) => {
    table
      .increments('id')
      .primary()

    table
      .integer('symptom_id');

    table
      .text('value')
      .notNullable()
      .unique();
  });
}

export async function down(knex: Knex) {
  debug('down');

  // symptoms
  debug('symptoms');
  await knex.schema.dropTableIfExists('symptoms');

  // solutions
  debug('solutions');
  await knex.schema.dropTableIfExists('solutions');
}
