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
      .notNullable();
    table
      .text('target_id')
      .notNullable();
    table
      .text('node_id');
    table
      .integer('type_id')
      .notNullable();
  });

  // links_indexes
  debug('links_indexes');
  await knex.schema.createTable('links_indexes', (table) => {
    table
      .increments('id')
      .primary();

    table
      .text('list_node_id')
      .notNullable();
    table
      .text('index_node_id')
      .notNullable();
    table
      .integer('index_link_id');
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
      .integer('prop_type_id');
    table
      .text('prop_node_id')
      .notNullable();

    table
      .integer('node_type_id')
      .notNullable();
  });

  // nodes_props_strings
  debug('nodes_props_strings');
  await knex.schema.createTable('nodes_props_strings', (table) => {
    table
      .increments('id')
      .primary();

    table
      .integer('prop_type_id');
    table
      .text('prop_node_id')
      .notNullable();

    table
      .text('value')
      .notNullable();
    table
      .text('format')
      .notNullable();
    table
      .text('type')
      .notNullable();
  });

  // nodes_props_numbers
  debug('nodes_props_numbers');
  await knex.schema.createTable('nodes_props_numbers', (table) => {
    table
      .increments('id')
      .primary();

    table
      .integer('prop_type_id');
    table
      .text('prop_node_id')
      .notNullable();

    table
      .text('value')
      .notNullable();
    table
      .text('format')
      .notNullable();
    table
      .text('type')
      .notNullable();
  });
}

export async function down(knex: Knex) {
  debug('down');

  // nodes_props_numbers
  debug('nodes_props_numbers');
  await knex.schema.dropTableIfExists('nodes_props_numbers');

  // nodes_props_strings
  debug('nodes_props_strings');
  await knex.schema.dropTableIfExists('nodes_props_strings');

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
