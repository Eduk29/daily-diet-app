import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../../database";

export const extractSessionIdFromCookie = async (request: FastifyRequest, response: FastifyReply) => {

    // TODO: Extract session id from cookie
    const { sessionId } = request.cookies;

    // TODO: If session id is not present, return 401
    if (!sessionId) {
        return response.status(401).send({ error: "Unauthorized", message: "You must have a session ID" });
    }

    // TODO: If session id is present, search the user with the same session id in the database
    await knex('users').where({ session_id: sessionId }).first().then((user) => {

        // TODO: If user is not found, return 401
        if (!user) {
            return response.status(401).send({
                error: "Unauthorized",
                message: "You must be logged in to access this route"
            })
        }

        // TODO: If user is found, attach the user to the request object
        request.user = user;
    })
}