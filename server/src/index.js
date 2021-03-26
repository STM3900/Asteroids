import fastify from "fastify";
import mariadb from "mariadb";
import fastifycors from "fastify-cors";

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function start() {
  const app = fastify();

  app.register(fastifycors, { origin: true });

  app.get("/scores", async (request, response) => {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM `scoresList`");
    response.send(rows);
    conn.release();
  });

  app.post("/scores", async (request, response) => {
    const conn = await pool.getConnection();
    const data = JSON.parse(request.body);

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

start().catch(console.error);
