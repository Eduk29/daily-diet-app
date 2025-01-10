import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";

export const userController = async (app: FastifyInstance) => {

    // TODO: Implement the route to create a new user
    app.post("/", async (request, response) => {

        // TODO: Validate the request body
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
        })

        try {
            // TODO: Extract user information from the request body
            const { name, email } = createUserBodySchema.parse(request.body);

            //TODO: Check if user has a session id and if exist use provided session id, if not create a new one
            const sessionId = request.cookies.sessionId ? request.cookies.sessionId : crypto.randomUUID();

            // TODO: Set the session id in the cookie with 7 days to expire
            response.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            })

            // TODO: Insert user into the database
            await knex('users').insert({
                id: crypto.randomUUID(),
                name,
                email,
                session_id: sessionId
            }).then(async () => {
                // TODO: Load user from the database
                const userCreated = await knex('users').where('session_id', sessionId).select().first();

                // TODO: Return success response with user information
                return response.status(201).send({ user: userCreated });
            }).catch((error) => {
                console.error('Error creating user', error);
                return response.status(500).send({
                    title: 'Internal Server Error',
                    message: 'Error creating user, please try again later!'
                })
            })
        } catch (error) {
            console.error('Invalid request body', error);
            return response.status(400).send({
                title: 'Bad Request',
                message: 'Invalid request body, please provide name and email!'
            })
        }
    });

    // TODO: Implement the route to get all user registered
    app.get('/', async (request, response) => {
        // TODO: Load all users from the database
        const users = await knex('users').select();

        // TODO: Return success response with all users information
        return response.status(200).send({ users });
    })
}