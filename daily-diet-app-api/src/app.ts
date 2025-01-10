import fastify from "fastify";
import cookie from "@fastify/cookie";
import { userController } from "./users/users.controller";

export const app = fastify();

app.register(cookie);

app.register(userController, {
    prefix: "/users"
})
