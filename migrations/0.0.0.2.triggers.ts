import Knex from 'knex';

export const RANDOM = `
SELECT array_to_string(array(select substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',((random()*(36-1)+1)::integer),1) from generate_series(1,50)),'')
`;

export const IS_ROOT = (node_id) => `
SELECT
COUNT(li0."id")
FROM
"links_index" as li0
WHERE
li0."list_node_id" = ${node_id} AND
li0."index_node_id" = ${node_id} AND
li0."depth" = 0
LIMIT 1
`;

export const WILL_NOT_ROOT = (node_id) => `
SELECT
COUNT(l0."id")
FROM
"links" as l0
WHERE
l0."target_id" = ${node_id}
LIMIT 1
`;

export const F_NODE_INSERT_UP = `
  CREATE OR REPLACE FUNCTION nodes__on_insert__function()
  RETURNS TRIGGER AS $trigger$
  BEGIN
    INSERT INTO "links_indexes"
    ("index_node_id", "list_id", "list_node_id", "depth")
    VALUES
    (NEW."id", (${RANDOM}), NEW."id", 0);
    RETURN NEW;
  END;
  $trigger$ language 'plpgsql';
`;

export const F_NODE_INSERT_DOWN = `
  DROP FUNCTION IF EXISTS nodes__on_insert__function;
`;

export const T_NODE_INSERT_UP = `
  CREATE TRIGGER nodes__on_insert__trigger AFTER INSERT ON "nodes" FOR EACH ROW EXECUTE PROCEDURE nodes__on_insert__function();
`;

export const T_NODE_INSERT_DOWN = `
  DROP TRIGGER IF EXISTS nodes__on_insert__trigger ON "nodes";
`;

export const F_LINK_INSERT_UP = `
  CREATE OR REPLACE FUNCTION links__on_insert__function()
  RETURNS TRIGGER AS $trigger$
  DECLARE
  sourceListId RECORD;
  targetOneListId RECORD;
  targetListId RECORD;
  nextListId TEXT;
  BEGIN
  IF (SELECT "indexing" FROM "links_types" WHERE "id" = NEW."type_id")
  THEN
    IF (${IS_ROOT('NEW."target_id"')})
    THEN
      FOR sourceListId
      IN (
        SELECT
        DISTINCT sli0."list_id"
        FROM
        "links_indexes" as sli0
        WHERE
        sli0."list_node_id" = NEW."source_id"
      )
      LOOP
        FOR targetListId
        IN (
          SELECT
          DISTINCT tli0."list_id",
          tli0."list_node_id"
          FROM
          "links_indexes" as tli0
          WHERE
          tli0."index_node_id" = NEW."target_id" AND
          tli0."depth" = 0
        )
        LOOP
          ${RANDOM}
          INTO nextListId;

          INSERT INTO "links_indexes" ("index_node_id", "index_link_id", "list_node_id", "list_id", "depth")
          SELECT
          tli1."index_node_id",
          tli1."index_link_id",
          tli1."list_node_id",
          nextListId,
          (
            SELECT
            sli1."depth" + tli1."depth" + 1
            FROM
            "links_indexes" as sli1
            WHERE
            sli1."list_id" = sourceListId."list_id" AND
            sli1."index_node_id" = NEW."source_id"
          )
          FROM
          "links_indexes" as tli1
          WHERE
          tli1."list_id" = targetListId."list_id";

          INSERT INTO "links_indexes" ("index_node_id", "index_link_id", "list_node_id", "list_id", "depth")
          SELECT
          sli1."index_node_id",
          sli1."index_link_id",
          targetListId."list_node_id",
          nextListId,
          sli1."depth"
          FROM
          "links_indexes" as sli1
          WHERE
          sli1."list_id" = sourceListId."list_id";

          DELETE FROM "links_indexes"
          WHERE "list_id" = targetListId."list_id";
        END LOOP;
      END LOOP;
    ELSE
      FOR sourceListId
      IN (
        SELECT
        DISTINCT sli0."list_id",
        sli0."depth"
        FROM
        "links_indexes" as sli0
        WHERE
        sli0."list_node_id" = NEW."source_id" AND
        sli0."index_node_id" = NEW."source_id"
      )
      LOOP
        SELECT *
        INTO targetOneListId
        FROM
        "links_indexes" as toli0
        WHERE
        toli0."list_node_id" = NEW."target_id" AND
        toli0."index_node_id" = NEW."target_id"
        LIMIT 1;

        FOR targetListId
        IN (
          SELECT
          tli2."list_id",
          tli2."list_node_id"
          FROM (
            SELECT
            tli1."list_id",
            tli1."list_node_id",
            COUNT(tli1."id") as "tli1"
            FROM
            "links_indexes" as tli0,
            "links_indexes" as tli1
            WHERE
            tli0."list_id" = targetOneListId."list_id" AND
            tli1."index_node_id" = tli0."index_node_id" AND
            tli1."depth" = tli0."depth"
            GROUP BY tli1."list_id", tli1."list_node_id"
          ) as tli2,
          (
            SELECT
            COUNT(tli3."id")
            FROM
            "links_indexes" as tli3
            WHERE
            tli3."list_id" = targetOneListId."list_id"
          ) as tli3
          WHERE
          tli2."tli1" = tli3."count"
        )
        LOOP
          ${RANDOM}
          INTO nextListId;

          INSERT INTO "links_indexes" ("index_node_id", "index_link_id", "list_node_id", "list_id", "depth")
          SELECT
          tli1."index_node_id",
          tli1."index_link_id",
          tli1."list_node_id",
          nextListId,
          ((tli1."depth" - targetOneListId."depth") + sourceListId."depth" + 1)
          FROM
          "links_indexes" as tli1
          WHERE
          tli1."list_id" = targetListId."list_id" AND
          tli1."depth" >= targetOneListId."depth";

          INSERT INTO "links_indexes" ("index_node_id", "index_link_id", "list_node_id", "list_id", "depth")
          SELECT
          sli1."index_node_id",
          sli1."index_link_id",
          targetListId."list_node_id",
          nextListId,
          sli1."depth"
          FROM
          "links_indexes" as sli1
          WHERE
          sli1."list_id" = sourceListId."list_id";
        END LOOP;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
  END;
  $trigger$ language 'plpgsql';
`;

export const F_LINK_INSERT_DOWN = `
  DROP FUNCTION IF EXISTS links__on_insert__function;
`;

export const T_LINK_INSERT_UP = `
  CREATE TRIGGER links__on_insert__trigger AFTER INSERT ON "links" FOR EACH ROW EXECUTE PROCEDURE links__on_insert__function();
`;

export const T_LINK_INSERT_DOWN = `
  DROP TRIGGER IF EXISTS links__on_insert__trigger ON "links";
`;

export const F_LINK_DELETE_UP = `
  CREATE OR REPLACE FUNCTION links__on_delete__function()
  RETURNS TRIGGER AS $trigger$
  DECLARE
  sourceListId RECORD;
  sourceIgnoreListId RECORD;
  targetListId RECORD;
  nextListId TEXT;
  BEGIN
  IF (SELECT "indexing" FROM "links_types" WHERE "id" = OLD."type_id")
  THEN
    IF (${WILL_NOT_ROOT('OLD."target_id"')})
    THEN
      FOR sourceListId
      IN (
        SELECT
        DISTINCT sl0."list_id",
        sl0."depth"
        FROM
        "links_indexes" as sl0
        WHERE
        sl0."list_node_id" = OLD."source_id" AND
        sl0."index_node_id" = OLD."source_id"
      )
      LOOP
        DELETE FROM "links_indexes"
        WHERE "list_id" IN (
          SELECT r."list_id" FROM
          (
              SELECT
              tsli0."list_id",
              tsli0."list_node_id",
              (
                  SELECT COUNT(tli1."id")
                  FROM "links_indexes" as tli1
                  WHERE tli1."list_id" = tl1."list_id"
              ) as "targetCount",
              COUNT(tsli0."id") as "count"
              FROM
              (
                  SELECT *
                  FROM
                  (
                      SELECT
                      tl0."list_id",
                      tl0."list_node_id",
                      COUNT(tl0."id") as "tl0"
                      FROM
                      "links_indexes" as sli0,
                      "links_indexes" as tl0
                      WHERE
                      sli0."list_id" = sourceListId."list_id" AND
                      tl0."list_node_id" = OLD."target_id" AND
                      tl0."index_node_id" = sli0."index_node_id" AND
                      tl0."depth" = sli0."depth"
                      GROUP BY tl0."list_id", tl0."list_node_id"
                  ) as tl0,
                  (
                      SELECT
                      COUNT(sli0."id")
                      FROM
                      "links_indexes" as sli0
                      WHERE
                      sli0."list_id" = sourceListId."list_id"
                  ) as sli0
                  WHERE
                  tl0."tl0" = sli0."count"
              ) as tl1,
              "links_indexes" as tli0,
              "links_indexes" as tsli0
              WHERE
              tli0."list_id" = tl1."list_id" AND
              tsli0."index_node_id" = tli0."index_node_id" AND
              tsli0."depth" = tli0."depth"
              GROUP BY tsli0."list_id", tsli0."list_node_id", tl1."list_id"
          ) as r
          WHERE
          r."targetCount" = r."count"
        );
      END LOOP;
    ELSE
      SELECT *
      INTO sourceIgnoreListId
      FROM
      "links_indexes" as sili0
      WHERE
      sili0."list_node_id" = OLD."source_id" AND
      sili0."index_node_id" = OLD."source_id"
      LIMIT 1;

      FOR sourceListId
      IN (
        SELECT
        DISTINCT sl0."list_id",
        sl0."depth"
        FROM
        "links_indexes" as sl0
        WHERE
        sl0."list_node_id" = OLD."source_id" AND
        sl0."index_node_id" = OLD."source_id" AND
        sl0."id" != sourceIgnoreListId."id"
      )
      LOOP
        DELETE FROM "links_indexes"
        WHERE "list_id" IN (
          SELECT r."list_id" FROM
          (
              SELECT
              tsli0."list_id",
              tsli0."list_node_id",
              (
                  SELECT COUNT(tli1."id")
                  FROM "links_indexes" as tli1
                  WHERE tli1."list_id" = tl1."list_id"
              ) as "targetCount",
              COUNT(tsli0."id") as "count"
              FROM
              (
                  SELECT *
                  FROM
                  (
                      SELECT
                      tl0."list_id",
                      tl0."list_node_id",
                      COUNT(tl0."id") as "tl0"
                      FROM
                      "links_indexes" as sli0,
                      "links_indexes" as tl0
                      WHERE
                      sli0."list_id" = sourceListId."list_id" AND
                      tl0."list_node_id" = OLD."target_id" AND
                      tl0."index_node_id" = sli0."index_node_id" AND
                      tl0."depth" = sli0."depth"
                      GROUP BY tl0."list_id", tl0."list_node_id"
                  ) as tl0,
                  (
                      SELECT
                      COUNT(sli0."id")
                      FROM
                      "links_indexes" as sli0
                      WHERE
                      sli0."list_id" = sourceListId."list_id"
                  ) as sli0
                  WHERE
                  tl0."tl0" = sli0."count"
              ) as tl1,
              "links_indexes" as tli0,
              "links_indexes" as tsli0
              WHERE
              tli0."list_id" = tl1."list_id" AND
              tsli0."index_node_id" = tli0."index_node_id" AND
              tsli0."depth" = tli0."depth"
              GROUP BY tsli0."list_id", tsli0."list_node_id", tl1."list_id"
          ) as r
          WHERE
          r."targetCount" = r."count"
        );
      END LOOP;

      FOR targetListId
      IN (
        SELECT r."list_id" FROM
        (
          SELECT
          tsli0."list_id",
          tsli0."list_node_id",
          (
              SELECT COUNT(tli1."id")
              FROM "links_indexes" as tli1
              WHERE tli1."list_id" = tl1."list_id"
          ) as "targetCount",
          COUNT(tsli0."id") as "count"
          FROM
          (
              SELECT *
              FROM
              (
                  SELECT
                  tl0."list_id",
                  tl0."list_node_id",
                  COUNT(tl0."id") as "tl0"
                  FROM
                  "links_indexes" as sli0,
                  "links_indexes" as tl0
                  WHERE
                  sli0."list_id" = sourceIgnoreListId."list_id" AND
                  tl0."list_node_id" = OLD."target_id" AND
                  tl0."index_node_id" = sli0."index_node_id" AND
                  tl0."depth" = sli0."depth"
                  GROUP BY tl0."list_id", tl0."list_node_id"
              ) as tl0,
              (
                  SELECT
                  COUNT(sli0."id")
                  FROM
                  "links_indexes" as sli0
                  WHERE
                  sli0."list_id" = sourceIgnoreListId."list_id"
              ) as sli0
              WHERE
              tl0."tl0" = sli0."count"
          ) as tl1,
          "links_indexes" as tli0,
          "links_indexes" as tsli0
          WHERE
          tli0."list_id" = tl1."list_id" AND
          tsli0."index_node_id" = tli0."index_node_id" AND
          tsli0."depth" = tli0."depth"
          GROUP BY tsli0."list_id", tsli0."list_node_id", tl1."list_id"
        ) as r
        WHERE
        r."targetCount" = r."count"
      )
      LOOP
        DELETE FROM "links_index"
        WHERE
        "list_id" = targetListId."list_id" AND
        "depth" <= sourceIgnoreListId."depth";
        
        UPDATE "links_index"
        SET
        "depth" = "depth" - sourceIgnoreListId."depth" - 1
        WHERE
        "list_id" = targetListId."list_id";
      END LOOP;
    END IF;
  END IF;
  RETURN OLD;
  END;
  $trigger$ language 'plpgsql';
`;

export const F_LINK_DELETE_DOWN = `
  DROP FUNCTION IF EXISTS links__on_delete__function;
`;

export const T_LINK_DELETE_UP = `
  CREATE TRIGGER links__on_delete__trigger AFTER DELETE ON "links" FOR EACH ROW EXECUTE PROCEDURE links__on_delete__function();
`;

export const T_LINK_DELETE_DOWN = `
  DROP TRIGGER IF EXISTS links__on_delete__trigger ON "links";
`;

export async function up(knex: Knex) {
  await knex.raw(F_NODE_INSERT_UP);
  await knex.raw(T_NODE_INSERT_UP);
  await knex.raw(F_LINK_INSERT_UP);
  await knex.raw(T_LINK_INSERT_UP);
  await knex.raw(F_LINK_DELETE_UP);
  await knex.raw(T_LINK_DELETE_UP);
};

export async function down(knex: Knex) {
  await knex.raw(T_NODE_INSERT_DOWN);
  await knex.raw(F_NODE_INSERT_DOWN);
  await knex.raw(T_LINK_INSERT_DOWN);
  await knex.raw(F_LINK_INSERT_DOWN);
  await knex.raw(T_LINK_DELETE_DOWN);
  await knex.raw(F_LINK_DELETE_DOWN);
};
