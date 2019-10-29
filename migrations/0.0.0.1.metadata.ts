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

  // symptoms
  debug('symptoms');
  defineTable(md, 'symptoms');

  // solutions
  debug('solutions');
  defineTable(md, 'solutions');

  defineForeignRelation(md, 'solutions', 'symptom_id', 'symptom', 'symptoms', 'id', 'solutions');

  debug('replace_metadata');
  await replace_metadata(md);
}

export async function down(knex: Knex) {
  debug('down');

  const md = await export_metadata();

  // symptoms
  debug('symptoms');
  deleteTable(md, 'symptoms');

  // solutions
  debug('solutions');
  deleteTable(md, 'solutions');

  debug('replace_metadata');
  await replace_metadata(md);
}
