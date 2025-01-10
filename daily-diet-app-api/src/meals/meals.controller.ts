import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { extractSessionIdFromCookie } from "../shared/middleware/extract-session-id-from-cookie";
import { knex } from "../database";
import crypto from "node:crypto";

export const mealsController = async (app: FastifyInstance) => {

    // TODO: Implement the endpoint to create a new meal
    app.post('/', { preHandler: extractSessionIdFromCookie }, async (request: FastifyRequest, response: FastifyReply) => {
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
                message: 'Invalid request body, please provide meals informations!'
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

    // TODO: Implement the endpoint to get a meal by ID
    app.get('/:id', { preHandler: extractSessionIdFromCookie }, async (request: FastifyRequest, response: FastifyReply) => {
        // TODO: Validate meal ID from request
        const getMealIdParamSchema = z.object({
            id: z.string().uuid()
        })

        try {
            // TODO: Extract meal ID from request
            const { id } = getMealIdParamSchema.parse(request.params);

            // TODO: Extract user ID from request
            const userId = request.user?.id

            // TODO: Load meal from the database by ID and user ID
            await knex('meals').where({ id }).andWhere({ user_id: userId }).select().first().then((meal) => {
                // TODO: Return success response with meal information
                return response.status(200).send({ meal });
            }).catch((error) => {
                console.error('Error loading meal', error);
                return response.status(500).send({
                    title: 'Internal Server Error',
                    message: 'Error loading meal, please try again later!'
                })
            });

        } catch (error) {
            console.error('Invalid request parameter', error);
            return response.status(400).send({
                title: 'Bad Request',
                message: 'Invalid request parameter, please provide meal ID!'
            })
        }
    })

    // TODO: Implement the endpoint to update a meal by ID
    app.put('/:id', { preHandler: extractSessionIdFromCookie }, async (request: FastifyRequest, response: FastifyReply) => {
        // TODO: Validate meal ID from request parameters
        const getMealIdParamSchema = z.object({
            id: z.string().uuid()
        })

        // TODO: Validate meal data from request body
        const createMealsBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string(),
            isInDiet: z.boolean()
        })

        try {
            // TODO: Extract meal ID from request parameters
            const { id } = getMealIdParamSchema.parse(request.params);

            // TODO: Extract meal data from request body
            const { name, description, date, isInDiet } = createMealsBodySchema.parse(request.body);

            // TODO: Extract user ID from request
            const userId = request.user?.id;

            // TODO: Load meal from the database by ID and user ID
            const mealToUpdate = await knex('meals').where({ id }).select().first();

            // TODO: Validate if the meal exists and belongs to the user
            if (mealToUpdate && mealToUpdate.user_id === userId) {
                // TODO: If the meal exists and belongs to the user, update the meal data
                await knex('meals').where({ id }).andWhere({ user_id: userId }).update({
                    name,
                    description,
                    date,
                    is_in_diet: isInDiet,
                }).then(async () => {
                    // TODO: Load meal from the database
                    const mealUpdated = await knex('meals').where('id', id).select().first();

                    // TODO: Return success response with meal information
                    return response.status(200).send({ meal: mealUpdated });

                }).catch((error) => {
                    console.error('Error updating meal', error);
                    return response.status(500).send({
                        title: 'Internal Server Error',
                        message: 'Error updating meal, please try again later!'
                    })
                })
            } else {
                // TODO: If the meal does not exist or does not belong to the user, return error response
                return response.status(403).send({ message: "You don't have permission to update this meal" });
            }
        } catch (error) {
            console.error('Invalid request parameter', error);
            return response.status(400).send({
                title: 'Bad Request',
                message: 'Invalid request parameter OR meal information, please provide meal ID AND meal information!'
            })
        }
    })
}