import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { extractSessionIdFromCookie } from "../shared/middleware/extract-session-id-from-cookie";
import { knex } from "../database";
import crypto from "node:crypto";

export const mealsController = async (app: FastifyInstance) => {

    // TODO: Implement the endpoint to create a new meal
    app.post('/', { preHandler: extractSessionIdFromCookie }, async (request: FastifyRequest, response: FastifyReply) => {
        // TODO: Validate if the user has an Session ID
        const createMealsBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string(),
            isInDiet: z.boolean()
        })

        try {
            // TODO: Validate request body and extract meal data from request body
            const { name, description, date, isInDiet } = createMealsBodySchema.parse(request.body);

            // TODO: Create an unique ID for the meal
            const mealId = crypto.randomUUID()

            // TODO: Extract user ID and append it to the meal data
            const userId = request.user?.id

            // TODO: Save meal data to the database
            await knex('meals').insert({
                id: mealId,
                name,
                description,
                date,
                is_in_diet: isInDiet,
                user_id: userId,
            }).then(async () => {
                // TODO: Load meal from the database
                const mealCreated = await knex('meals').where('id', mealId).select().first();

                // TODO: Return success response with meal information
                return response.status(201).send({ meal: mealCreated });
            }).catch((error) => {
                console.error('Error creating meal', error);
                return response.status(500).send({
                    title: 'Internal Server Error',
                    message: 'Error creating meal, please try again later!'
                })
            })

        } catch (error) {
            console.error('Invalid request body', error);
            return response.status(400).send({
                title: 'Bad Request',
                message: 'Invalid request body, please provide name and email!'
            })
        }
    })

    // TODO: Implement the endpoint to get all meals created by the user and in descending order
    app.get('/', { preHandler: extractSessionIdFromCookie }, async (request: FastifyRequest, response: FastifyReply) => {

        // TODO: Extract user ID from request
        const userId = request.user?.id;

        // TODO: Load all meals from the database by the user and in descending order
        await knex('meals').where('user_id', userId).orderBy('created_at', 'desc').then((meals) => {

            // TODO: Return success response with all meals information
            return response.status(200).send({ meals });
        }).catch((error) => {
            console.error('Error loading meals', error);
            return response.status(500).send({
                title: 'Internal Server Error',
                message: 'Error loading meals, please try again later!'
            })
        })

    })
}