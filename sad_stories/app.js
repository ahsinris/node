const express = require('express')

const app = express()

app.use(express.json())

const mysql = require('mysql2')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const jwtSecret = "Love Is Beautiful, But Logic is Hurtful"

const promisePool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'masood$1',
    database: 'sad_stories'
}).promise()

app.post('/register', async function (req, res) {

    try {

        const name = req.body.name

        const email = req.body.email

        const password = req.body.password

        if (!name || !email || !password) {

            return res.status(422).json({
                status: false,
                message: "pls fill all the fields"
            })
        }

        let [isEmailExist, field] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (isEmailExist.length != 0) {

            return res.status(422).json({
                status: false,
                message: "Already registered with this email"
            })
        }

        const encryptPassword = await bcrypt.hash(password, 10)

        let [result, fields] = await promisePool.query('INSERT INTO users (name, email, password) VALUES(?,?,?)', [name, email, encryptPassword]);

        const payload = {
            user_id: result.insertId,
            name: name,
            email: email
        }

        payload.accessToken = await jwt.sign(payload, jwtSecret, { expiresIn: '10h' })



        return res.status(200).json({
            status: true,
            message: 'Success',
            data: payload
        })

    }
    catch (e) {

        console.log("Error", e)

        return res.status(500).json({
            status: false,
            message: 'server issue'
        })
    }
})

async function authMiddleware(req, res, next) {
    try {
        const jwtToken = req.headers.authorization

        if (!jwtToken) {

            return res.status(401).json({
                status: false,
                message: 'Token is empty'
            })
        }

        const userData = await jwt.verify(jwtToken, jwtSecret)

        req.userData = userData

        next()

    }
    catch (e) {
        console.log("Error", e)

        return res.status(401).json({
            status: false,
            message: 'Invalid or expired token'
        })
    }
}

app.post('/create/post', authMiddleware, async function (req, res) {

    try {
        if (!req.body.content) {
            res.status(422).json({
                status: false,
                message: 'Please share your feelings..'
            })
        }

        await promisePool.query(`INSERT INTO posts (user_id, content) VALUES(?, ?)`,
            [req.userData.user_id, req.body.content])

        return res.status(200).json({
            status: true,
            message: 'success'
        })

    }
    catch (e) {
        console.log("Error", e)

        return res.status(500).json({
            status: false,
            message: 'server issue'
        })
    }
})

app.get('/get/posts', authMiddleware, async function (req, res) {
    try {
        const [result, field] = await promisePool.query('SELECT posts.*, users.name as user_name, users.email as user_email  FROM posts LEFT JOIN users ON posts.user_id = users.id ORDER BY id DESC')

        res.status(200).json({
            status: true,
            message: 'Sucess',
            data: result
        })
    }
    catch (e) {
        console.log("Error", e)

        return res.status(500).json({
            status: false,
            message: 'server issue'
        })
    }
})

app.post('/login', async function (req, res) {

    try {

        const email = req.body.email

        const password = req.body.password

        if (!email || !password) {

            return res.status(422).json({
                status: false,
                message: "pls fill all the fields"
            })
        }

        let [result, field] = await promisePool.query("SELECT * FROM users WHERE email=?", [email])

        if (result.length === 0) {

            return res.status(422).json({

                status: false,
                message: "kindly register first"
            })
        }

        const encryptPassword = result[0].password

        const ispasswordiscorrect = await bcrypt.compare(password, encryptPassword)

        if (!ispasswordiscorrect) {

            return res.status(422).json({

                status: false,
                message: "invalid credentials"
            })
        }

        const payload = {

            id: result[0].id,
            name: result[0].name,
            email: email

        }

        payload.accessToken = await jwt.sign(payload, jwtSecret, { expiresIn: '10h' })

        return res.status(200).json({

            status: true,

            message: "welcome",

            data: payload
        })

    }

    catch (e) {

        console.log("error", e)

        return res.status(500).json({
            status: false,
            message: " server issue"
        })
    }


})


app.listen(3000)


