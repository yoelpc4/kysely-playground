import 'dotenv/config'
import express from 'express'
import router from '@/router';
import errorRequestHandler from '@/middlewares/errorRequestHandler';

const port = process.env.APP_PORT ?? 3000

const app = express()

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

app.use('/', router)

app.use(errorRequestHandler)

app.listen(port, () => console.log(`Server is listening on port ${port}`))
