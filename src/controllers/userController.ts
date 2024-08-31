import { RequestHandler } from 'express'
import { NoResultError } from 'kysely';
import UserService from '@/services/UserService'

export const getUsers: RequestHandler = async (req, res, next) => {
    const userService = new UserService()

    try {
        const users = await userService.getUsers(req.query)

        res.status(200).json({
            users,
        })
    } catch (error) {
        next(error)
    }
}

export const findUser: RequestHandler = async (req, res, next) => {
    const userService = new UserService()

    try {
        const user = await userService.findUser(+req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        res.status(200).json({
            user,
        })
    } catch (error) {
        next(error)
    }
}

export const createUser: RequestHandler = async (req, res, next) => {
    const userService = new UserService()

    try {
        const user = await userService.createUser(req.body)

        res.status(201).json({
            user,
        })
    } catch (error) {
        next(error)
    }
}

export const updateUser: RequestHandler = async (req, res, next) => {
    const userService = new UserService()

    try {
        const user = await userService.findUser(+req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        const updatedUser = await userService.updateUser(user.id, req.body)

        res.status(200).json({
            user: updatedUser,
        })
    } catch (error) {
        next(error)
    }
}

export const deleteUser: RequestHandler = async (req, res, next) => {
    const userService = new UserService()

    try {
        const user = await userService.findUser(+req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        await userService.deleteUser(user.id)

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}
