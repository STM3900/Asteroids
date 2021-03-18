import fastify from "fastify";
import mariadb from "mariadb";
import fastifycors from "fastify-cors";

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "scores",
  connectionLimit: 5,
});

async function start() {
  const app = fastify();
  app.register(fastifycors, {
    origin: true,
  });

  let conn = await pool.getConnection();

  app.get("/scores", async (request, response) => {
    const rows = await conn.query("SELECT * FROM `scoresList`");
    response.send(rows);
    conn.release();
  });

  app.post("/scores", async (request, response) => {
    const data = JSON.parse(request.body);
    console.log(data);

    const res = await conn.query(
      `INSERT INTO scoreslist (id, name, score)
      VALUES (1, '${data[0].name}', '${data[0].score}'),
      (2, '${data[1].name}', '${data[1].score}'),
      (3, '${data[2].name}', '${data[2].score}'),
      (4, '${data[3].name}', '${data[3].score}'),
      (5, '${data[4].name}', '${data[4].score}')
      ON DUPLICATE KEY UPDATE id=VALUES(id),
      name=VALUES(name),
      score=VALUES(score);`
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
