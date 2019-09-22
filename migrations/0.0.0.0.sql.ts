import Knex from 'knex';

import Debug from 'debug';

const debug = Debug('sandbox:0.0.0 sql');

export async function up(knex: Knex) {
  debug('up');

  // _sandbox
  debug('_sandbox');
  await knex.schema.createTable('_sandbox', (table) => {
    table
      .increments('id')
      .notNullable()
      .unique()
      .primary()
  });

  // nodes
  debug('nodes');
  await knex.schema.createTable('nodes', (table) => {
    table
      .text('id')
      .notNullable()
      .unique()
      .primary()
  });

  // nodes_types
  debug('nodes_types');
  await knex.schema.createTable('nodes_types', (table) => {
    table
      .increments('id')
      .primary();

    table
      .text('name')
      .notNullable()
      .unique();
  });

  // links_types
  debug('links_types');
  await knex.schema.createTable('links_types', (table) => {
    table
      .increments('id')
      .primary();

    table
      .text('name')
      .notNullable()
      .unique();

    table
      .boolean('indexing')
      .notNullable()
      .defaultTo('false');
  });

  // props_types
  debug('props_types');
  await knex.schema.createTable('props_types', (table) => {
    table
      .increments('id')
      .primary();

    table
      .text('name')
      .notNullable()
      .unique();
  });

  // links
  debug('links');
  await knex.schema.createTable('links', (table) => {
    table
      .increments('id')
      .primary();

    table
      .text('source_id')
      .notNullable()
      .references('id')
      .inTable('nodes');
    table
      .text('target_id')
      .notNullable()
      .references('id')
      .inTable('nodes');
    table
      .text('node_id')
      .references('id')
      .inTable('nodes');
    table
      .integer('type_id')
      .notNullable()
      .references('id')
      .inTable('links_types');
  });

  // links_indexes
  debug('links_indexes');
  await knex.schema.createTable('links_indexes', (table) => {
    table
      .increments('id')
      .primary();

    table
      .text('list_node_id')
      .notNullable()
      .references('id')
      .inTable('nodes');
    table
      .text('index_node_id')
      .notNullable()
      .references('id')
      .inTable('nodes');
    table
      .integer('index_link_id')
      .references('id')
      .inTable('links');
    table
      .text('list_id')
      .notNullable();
    table
      .integer('depth')
      .notNullable();
  });

  // nodes_props_types
  debug('nodes_props_types');
  await knex.schema.createTable('nodes_props_types', (table) => {
    table
      .increments('id')
      .primary();

    table
      .integer('prop_type_id')
      .references('id')
      .inTable('props_types');
    table
      .text('prop_node_id')
      .notNullable()
      .references('id')
      .inTable('nodes');

    table
      .integer('node_type_id')
      .notNullable()
      .references('id')
      .inTable('nodes_types');
  });
}

export async function down(knex: Knex) {
  debug('down');

  // nodes_props_types
  debug('nodes_props_types');
  await knex.schema.dropTableIfExists('nodes_props_types');

  // links_indexes
  debug('links_indexes');
  await knex.schema.dropTableIfExists('links_indexes');

  // links
  debug('links');
  await knex.schema.dropTableIfExists('links');

  // props_types
  debug('props_types');
  await knex.schema.dropTableIfExists('props_types');

  // links_types
  debug('links_types');
  await knex.schema.dropTableIfExists('links_types');

  // nodes_types
  debug('nodes_types');
  await knex.schema.dropTableIfExists('nodes_types');

  // nodes
  debug('nodes');
  await knex.schema.dropTableIfExists('nodes');

  // _sandbox
  debug('_sandbox');
  await knex.schema.dropTableIfExists('_sandbox');
}
