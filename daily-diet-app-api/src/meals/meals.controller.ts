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
            _invalidBodyInRequestHandler(response, error);
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
            _invalidBodyInRequestHandler(response, error);
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
            _invalidBodyInRequestHandler(response, error);
        }
    })

    // TODO: Implement the endpoint to delete a meal by ID
    app.delete('/:id/delete', { preHandler: extractSessionIdFromCookie }, async (request: FastifyRequest, response: FastifyReply) => {
        // TODO: Validate meal ID from request parameters
        const getMealIdParamSchema = z.object({
            id: z.string().uuid()
        })

        try {
            // TODO: Extract meal ID from request parameters
            const { id } = getMealIdParamSchema.parse(request.params);

            // TODO: Extract user ID from request
            const userId = request.user?.id;

            // TODO: Load meal from the database by ID and user ID
            const meal = await knex('meals').where({ id }).select().first();

            // TODO: Validate if the meal exists and belongs to the user
            if (meal && meal.user_id === userId) {
                // TODO: If the meal exists and belongs to the user, delete the meal
                await knex('meals').where({ id }).andWhere({ user_id: userId }).delete().catch((error) => {
                    console.error('Error deleting meal', error);
                    return response.status(500).send({
                        title: 'Internal Server Error',
                        message: 'Error deleting meal, please try again later!'
                    })
                });

                // TODO: Return success response with no content
                return response.status(204).send({});

            } else {
                // TODO: If the meal does not exist or does not belong to the user, return error response
                return response.status(403).send({ message: "You don't have permission to delete this meal" });
            }

        } catch (error) {
            _invalidBodyInRequestHandler(response, error);
        }
    })

    // TODO: Implement the endpoint to summarize the meals created by the user
    app.get('/summary', { preHandler: extractSessionIdFromCookie }, async (request: FastifyRequest, response: FastifyReply) => {
        // TODO: Extract user ID from request
        const userId = request.user?.id;

        // TODO: Load all meals from the database by the user
        await knex('meals').where('user_id', userId).select().then((meals) => {
            // TODO: Calculate the total number of meals created by the user
            const totalMeals = meals.length;

            // TODO: Calculate the total number of meals that are in the diet
            const mealsOnDiet = _calculateMealsInDiet(meals);

            // TODO: Calculate the total number of meals that are not in the diet
            const mealsNotOnDiet = _calculateMealsNotInDiet(meals);

            // TODO: Calculate the best sequence of meals in diet created by the user
            const bestSequenceOfMealsInDiet = _calculateBestSequenceOfMealsInDiet(meals);

            // TODO: Return success response with the summary information
            return response.status(200).send({ totalMeals: meals.length, mealsOnDiet: mealsOnDiet.length, mealsNotOnDiet: mealsNotOnDiet.length, bestSequenceOfMealsInDiet });
        }).catch((error) => {
            _invalidBodyInRequestHandler(response, error);
        });
    })
}

const _calculateMealsInDiet = (meals: any[]) => {
    return meals.filter((meal) => meal.is_in_diet);
}

const _calculateMealsNotInDiet = (meals: any[]) => {
    return meals.filter((meal) => !meal.is_in_diet);
}

const _calculateBestSequenceOfMealsInDiet = (meals: any[]) => {
    const { onDietSequence } = meals.reduce(
        (acc, meal) => {
            acc.currentSequence = meal.is_in_diet ? acc.currentSequence + 1 : 0;

            if (acc.currentSequence > acc.onDietSequence) {
                acc.onDietSequence = acc.currentSequence
            }
            return acc
        },
        { onDietSequence: 0, currentSequence: 0 },
    )

    return onDietSequence;
}

const _invalidBodyInRequestHandler = (response: FastifyReply, error: unknown) => {
    console.error('Invalid request body', error);
    return response.status(400).send({
        title: 'Bad Request',
        message: 'Invalid request body, please provide meals informations!'
    })
}