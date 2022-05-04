import { table } from "console";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.createTable("users", (table) => {
        table.increments("id");
        table.string("email").notNullable().unique();
        table.string("name").notNullable().unique();
        table.string("salt").notNullable();
        table.string("hash").notNullable();
        table.string("token");
        table.string("totp_secret");
        table.string("totp_qr");
        table.string("totp_uri");
        table.string("password_reset_token");
        table.datetime("password_reset_token_expiration");
    });

    await knex.schema.createTable("messages", (table) => {
        table.increments("id");
        table.bigint("sender").notNullable();
        table.bigint("addressee").notNullable();
        table.string("text").notNullable();
        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.dropTable("users");
    await knex.schema.dropTable("messages");
};
