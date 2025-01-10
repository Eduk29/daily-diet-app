import fastify from "fastify";
import cookie from "@fastify/cookie";
import { userController } from "./users/users.controller";
import { mealsController } from "./meals/meals.controller";

export const app = fastify();

app.register(cookie);

app.register(userController, {
    prefix: "/users"
})

app.register(mealsController, {
    prefix: "/meals"
})
