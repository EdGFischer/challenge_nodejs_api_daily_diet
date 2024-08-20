import { afterAll, beforeAll, describe, it, expect, beforeEach } from "vitest";
import { execSync } from "child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Meals routes", () => {
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

  it("should be able to create a new meal", async () => {
    const userResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Usuário Teste",
        email: "teste@gmail.com",
        password: "Senha123",
      })
      .expect(201);

    const cookies = userResponse.get("Set-Cookie") ?? [];

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Breakfast",
        description: "Breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);
  });

  it("should be able to list all meals from a user", async () => {
    const userResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Usuário Teste",
        email: "teste@gmail.com",
        password: "Senha123",
      })
      .expect(201);

    const cookies = userResponse.get("Set-Cookie") ?? [];

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Breakfast",
        description: "Breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Lunch",
        description: "Lunch",
        isOnDiet: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day after
      })
      .expect(201);

    const mealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(mealsResponse.body.meals).toHaveLength(2);

    // This validate if the order is correct
    expect(mealsResponse.body.meals[0].name).toBe("Lunch");
    expect(mealsResponse.body.meals[1].name).toBe("Breakfast");
  });

  it("should be able to show a single meal", async () => {
    const userResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Usuário Teste",
        email: "teste@gmail.com",
        password: "Senha123",
      })
      .expect(201);

    const cookies = userResponse.get("Set-Cookie") ?? [];

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Breakfast",
        description: "Breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);

    const mealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = mealsResponse.body.meals[0].id;

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(mealResponse.body).toEqual({
      meal: expect.objectContaining({
        name: "Breakfast",
        description: "Breakfast",
        is_on_diet: 1,
        date: expect.any(Number),
      }),
    });
  });

  it("should be able to update a meal from a user", async () => {
    const userResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Usuário Teste",
        email: "teste@gmail.com",
        password: "Senha123",
      })
      .expect(201);

    const cookies = userResponse.get("Set-Cookie") ?? [];

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Breakfast",
        description: "Breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);

    const mealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = mealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .send({
        name: "Dinner",
        description: "Dinner",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(204);
  });

  it("should be able to delete a meal from a user", async () => {
    const userResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Usuário Teste",
        email: "teste@gmail.com",
        password: "Senha123",
      })
      .expect(201);

    const cookies = userResponse.get("Set-Cookie") ?? [];

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Breakfast",
        description: "Breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);

    const mealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = mealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(204);
  });

  it("should be able to get metrics from a user", async () => {
    const userResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Usuário Teste",
        email: "teste@gmail.com",
        password: "Senha123",
      })
      .expect(201);

    const cookies = userResponse.get("Set-Cookie") ?? [];

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Breakfast",
        description: "Breakfast",
        isOnDiet: true,
        date: new Date("2024-01-01T08:00:00"),
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Lunch",
        description: "Lunch",
        isOnDiet: false,
        date: new Date("2024-01-01T12:00:00"),
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Snack",
        description: "Snack",
        isOnDiet: true,
        date: new Date("2024-01-01T17:00:00"),
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Dinner",
        description: "Dinner",
        isOnDiet: true,
        date: new Date("2024-01-01T21:00:00"),
      });

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Breakfast",
        description: "Breakfast",
        isOnDiet: true,
        date: new Date("2024-02-02T08:00:00"),
      });

    const metricsResponse = await request(app.server)
      .get("/meals/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(metricsResponse.body).toEqual({
      totalMeals: 5,
      totalMealsOnDiet: 4,
      totalMealsOffDiet: 1,
      bestOnDietSequence: 3,
    });
  });
});
