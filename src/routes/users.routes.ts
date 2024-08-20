import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";

export async function userRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    });

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
      });
    }

    const { name, email, password } = createUserBodySchema.parse(request.body);

    const userByEmail = await knex("users").where({ email }).first();

    if (userByEmail) {
      return reply.status(400).send({ message: "Already registered user" });
    }

    await knex("users").insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
      email,
      password,
    });

    return reply.status(201).send();
  });
}
