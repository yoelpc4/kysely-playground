import { ErrorRequestHandler } from 'express';
import { NoResultError } from 'kysely';

const errorRequestHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err)

    if (err instanceof NoResultError) {
        return res.status(404).send()
    }

    res.status(500).send()
}

export default errorRequestHandler
