import { afterAll, beforeAll, describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { execSync } from "child_process";
import request from "supertest";

describe("Users routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new user", async () => {
    const response = await request(app.server)
      .post("/users")
      .send({
        name: "Usuário Teste",
        email: "teste@gmail.com",
        password: "Senha123",
      })
      .expect(201);

    const cookies = response.get("Set-Cookie");

    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining("sessionId")]),
    );
  });
});
