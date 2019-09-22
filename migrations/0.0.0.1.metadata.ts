import Knex from 'knex';

import { export_metadata } from '../imports/export_metadata';
import { defineTable, deleteTable, defineForeignRelation } from '../imports/metadata';
import { replace_metadata } from '../imports/replace_metadata';

import Debug from 'debug';

const debug = Debug('sandbox:0.0.0 metadata');

const delay = (time) => new Promise(res => setTimeout(res, time));

export async function up(knex: Knex) {
  debug('up');

  const md = await export_metadata();

  // _sandbox
  debug('_sandbox');
  defineTable(md, '_sandbox');

  // nodes
  debug('nodes');
  defineTable(md, 'nodes');

  // nodes_types
  debug('nodes_types');
  defineTable(md, 'nodes_types');

  // links_types
  debug('links_types');
  defineTable(md, 'links_types');

  // props_types
  debug('props_types');
  defineTable(md, 'props_types');

  // links
  debug('links');
  defineTable(md, 'links');

  defineForeignRelation(md, 'links', 'source_id', 'source', 'nodes', 'id', 'links_by_source');
  defineForeignRelation(md, 'links', 'target_id', 'target', 'nodes', 'id', 'links_by_target');
  defineForeignRelation(md, 'links', 'node_id', 'node', 'nodes', 'id', 'links_by_node');
  defineForeignRelation(md, 'links', 'type_id', 'link_type', 'links_types', 'id', 'links');

  // links_indexes
  debug('links_indexes');
  defineTable(md, 'links_indexes');

  defineForeignRelation(md, 'links_indexes', 'list_node_id', 'list_node', 'nodes', 'id', 'links_indexes_by_list_node');
  defineForeignRelation(md, 'links_indexes', 'index_node_id', 'index_node', 'nodes', 'id', 'links_indexes_by_index_node');
  defineForeignRelation(md, 'links_indexes', 'index_link_id', 'index_link', 'links', 'id', 'links_indexes_by_index_link');

  // nodes_props_types
  debug('nodes_props_types');
  defineTable(md, 'nodes_props_types');

  defineForeignRelation(md, 'nodes_props_types', 'prop_type_id', 'prop_type', 'props_types', 'id', 'nodes_props_types');
  defineForeignRelation(md, 'nodes_props_types', 'prop_node_id', 'prop_node', 'nodes', 'id', 'nodes_props_types');

  defineForeignRelation(md, 'nodes_props_types', 'node_type_id', 'node_type', 'nodes_types', 'id', 'nodes_props_types');

  debug('replace_metadata');
  await replace_metadata(md);
}

export async function down(knex: Knex) {
  debug('down');

  const md = await export_metadata();

  // nodes_props_types
  debug('nodes_props_types');
  deleteTable(md, 'nodes_props_types');

  // links_indexes
  debug('links_indexes');
  deleteTable(md, 'links_indexes');

  // links
  debug('links');
  deleteTable(md, 'links');

  // props_types
  debug('props_types');
  deleteTable(md, 'props_types');

  // links_types
  debug('links_types');
  deleteTable(md, 'links_types');

  // nodes_types
  debug('nodes_types');
  deleteTable(md, 'nodes_types');

  // nodes
  debug('nodes');
  deleteTable(md, 'nodes');

  // _sandbox
  debug('_sandbox');
  deleteTable(md, '_sandbox');

  debug('replace_metadata');
  await replace_metadata(md);
}
