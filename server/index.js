import fastify from "fastify";
import mariadb from "mariadb";

const name = "Mino";
const score = -150;

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "scores",
  connectionLimit: 5,
});

async function start() {
  const app = fastify();
  let conn = await pool.getConnection();

  app.get("/scores", async (request, response) => {
    const rows = await conn.query("SELECT * FROM `scoresList`");
    response.send(rows);
    conn.release();
  });

  app.post("/scores", async (request, response) => {
    const res = await conn.query(
      `INSERT INTO scoresList (name, score) VALUES ('${name}', ${score})`
    );
    response.send(res);
    conn.release();
  });

  const listen = await app.listen(3000);
  console.log("listening on", listen);
}

start();

/*
async function asyncFunction() {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT 1 as val");
    // rows: [ {val: 1}, meta: ... ]

    const res = await conn.query("INSERT INTO myTable value (?, ?)", [
      1,
      "mariadb",
    ]);
    // res: { affectedRows: 1, insertId: 1, warningStatus: 0 }
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
}
*/
