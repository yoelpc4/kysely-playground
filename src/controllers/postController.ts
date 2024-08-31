import { RequestHandler } from 'express'
import PostService from '@/services/PostService'

export const getPosts: RequestHandler = async (req, res, next) => {
    const postService = new PostService()

    try {
        const posts = await postService.getPostsWithAuthorAndTags(req.query)

        res.status(200).json({
            posts,
        })
    } catch (error) {
        next(error)
    }
}

export const findPost: RequestHandler = async (req, res, next) => {
    const postService = new PostService()

    try {
        const post = await postService.findPostWithAuthorAndTags(+req.params.id)

        if (!post) {
            return res.status(404).send()
        }

        res.status(200).json({
            post,
        })
    } catch (error) {
        next(error)
    }
}

export const createPost: RequestHandler = async (req, res, next) => {
    const postService = new PostService()

    try {
        const post = await postService.createPost(req.body)

        res.status(201).json({
            post,
        })
    } catch (error) {
        next(error)
    }
}

export const updatePost: RequestHandler = async (req, res, next) => {
    const postService = new PostService()

    try {
        const post = await postService.findPost(+req.params.id)

        if (!post) {
            return res.status(404).send()
        }

        const updatedPost = await postService.updatePost(post.id, req.body)

        res.status(200).json({
            post: updatedPost,
        })
    } catch (error) {
        next(error)
    }
}

export const deletePost: RequestHandler = async (req, res, next) => {
    const postService = new PostService()

    try {
        const post = await postService.findPost(+req.params.id)

        if (!post) {
            return res.status(404).send()
        }

        await postService.deletePost(post.id)

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}
