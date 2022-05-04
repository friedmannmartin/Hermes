import knex from "knex";
import knexfile from "../knexfile.js";

const db = knex(knexfile[process.env.NODE_ENV || "development"]);

export default db;
