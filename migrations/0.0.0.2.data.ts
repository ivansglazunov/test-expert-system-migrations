import Knex from 'knex';

import * as data from '../static/sample-data.json';

export async function up(knex: Knex) {
  const symptoms = await knex('symptoms').insert(data.hardware.map(h => ({ value: h.symptom })), ['id']);
  const solutions = [];
  for (let s = 0; s < symptoms.length; s++) {
    solutions.push(...data.hardware[s].solutions.map((value) => ({
      symptom_id: symptoms[s].id, value,
    })));
  }
  await knex('solutions').insert(solutions);
}

export async function down(knex: Knex) {}
