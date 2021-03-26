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
    const rows = await conn.query(
      "SELECT * FROM `scoresList` ORDER BY `score` DESC"
    );
    response.send(rows);
    conn.release();
  });

  app.post(
    "/scores",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            score: { type: "number" },
          },
        },
      },
    },
    async (request, response) => {
      const conn = await pool.getConnection();
      const { name, score } = request.body;

      const rows = await conn.query(
        "SELECT `name`, `score` FROM `scoresList` ORDER BY `score` DESC"
      );
      // on cherche l'index du score plus petit que celui actuel
      const index = rows.findIndex((row) => score > row.score);
      if (index > -1) {
        // on glisse le nouveau score a cette position, tout en decallant le reste
        rows.splice(index, 0, { name, score });
        // puis on ne prend que les 5 premiers
        const scores = rows.slice(0, 5);

        await conn.query(
          `INSERT INTO scoresList (id, name, score)
        VALUES (1, ?, ?),
        (2, ?, ?),
        (3, ?, ?),
        (4, ?, ?),
        (5, ?, ?)
        ON DUPLICATE KEY UPDATE id=VALUES(id),
        name=VALUES(name),
        score=VALUES(score);`,
          scores.flatMap(({ name, score }) => [name, score])
        );
        conn.release();
        return scores;
      }
      return rows;
    }
  );

  const listen = await app.listen(process.env.PPE_PORT || 8080);
  console.log("listening on", listen);
}

start().catch(console.error);
