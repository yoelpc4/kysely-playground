import { RequestHandler } from 'express'
import { NoResultError } from 'kysely';
import TagService from '@/services/TagService'

export const getTags: RequestHandler = async (req, res, next) => {
    const tagService = new TagService()

    try {
        const tags = await tagService.getTags(req.query)

        res.status(200).json({
            tags,
        })
    } catch (error) {
        next(error)
    }
}

export const findTag: RequestHandler = async (req, res, next) => {
    const tagService = new TagService()

    try {
        const tag = await tagService.findTag(+req.params.id)

        if (!tag) {
            return res.status(404).send()
        }

        res.status(200).json({
            tag,
        })
    } catch (error) {
        next(error)
    }
}

export const createTag: RequestHandler = async (req, res, next) => {
    const tagService = new TagService()

    try {
        const tag = await tagService.createTag(req.body)

        res.status(201).json({
            tag,
        })
    } catch (error) {
        next(error)
    }
}

export const updateTag: RequestHandler = async (req, res, next) => {
    const tagService = new TagService()

    try {
        const tag = await tagService.findTag(+req.params.id)

        if (!tag) {
            return res.status(404).send()
        }

        const updatedTag = await tagService.updateTag(tag.id, req.body)

        res.status(200).json({
            tag: updatedTag,
        })
    } catch (error) {
        next(error)
    }
}

export const deleteTag: RequestHandler = async (req, res, next) => {
    const tagService = new TagService()

    try {
        const tag = await tagService.findTag(+req.params.id)

        if (!tag) {
            return res.status(404).send()
        }

        await tagService.deleteTag(tag.id)

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}
