const express = require('express')

const app = express()

app.use(express.json())

const mysql = require('mysql2')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const secret = "mySecrectKey"

const promisepool = mysql.createPool({

    host: 'localhost',
    user: 'root',
    password: 'masood$1',
    database: 'hihsc'
}).promise()

app.post('/register', async function (req, res) {

    try {

        const name = req.body.name

        const email = req.body.email

        const password = req.body.password

        const phone = req.body.phone


        if (!name || !email || !password || !phone) {

            return res.status(422).json({

                status: false,

                message: "pls fill all the fields"
            })
        }

        var [result, field] = await promisepool.query("SELECT * FROM labours WHERE email = ?", [email])

        if (result.length !== 0) {

            return res.status(422).json({

                status: false,

                message: "the email already exsists"
            })
        }

        const encryptpassword = await bcrypt.hash(password, 10)

        var [row, field] = await promisepool.query("INSERT INTO labours (name,email,password,phone) VALUES (?,?,?,?)", [name, email, encryptpassword, phone])

        return res.status(200).json({

            status: true,

            message: "sucessfully inserted"
        })


    }


    catch (e) {

        console.log("ERROR", e)

        return res.status(500).json({

            status: false,

            message: "server issue"
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

        var [result, field] = await promisepool.query("SELECT * FROM labours WHERE email =?", [email])

        if (result.length === 0) {

            return res.status(422).json({

                status: false,

                message: "invalid email or password"


            })

        }

        const encryptpassword = result[0].password

        // true-false
        const isPasswordCorrect = await bcrypt.compare(password, encryptpassword)

        // Codition for password validation
        if (!isPasswordCorrect) {

            return res.status(422).json({

                status: false,

                message: "invalid email or password"
            })
        }


        const jwtPayload = {
            user_id: result[0].id,
            email: result[0].email,
            phone: result[0].phone,
            name: result[0].name
        }

        jwtPayload.access_token = jwt.sign(jwtPayload, secret, { expiresIn: '1h' })

        // jwtPayload.access_token = accessToken

        return res.status(200).json({

            status: true,

            message: "welcome",

            data: jwtPayload
        })
    }

    catch (e) {

        return res.status(500).json({

            status: false,

            message: "sever issue"
        })
    }
})


async function authenticationMiddleware(req, res, next) {
    const accessToken = req.headers.authorization

    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        })
    }

    try {
        req.decode = await jwt.verify(accessToken, secret)

        // req.decode = decode
        // console.log("decode", req.decode)

        next()
    }
    catch (e) {

        console.log("JWT ERROR", e)
        return res.status(401).json({
            status: false,
            message: 'Invalid or expired token'
        })
    }
}

app.post('/create-posts', authenticationMiddleware, async function (req, res) {

    try {
        const content = req.body.content;

        if (!content) {
            return res.status(422).json({
                success: false,
                message: 'Please provide content'
            })
        }

        await promisepool.query("INSERT INTO posts (user_id, content) VALUES(?,?)", [req.decode.user_id, content])

        return res.status(200).json({
            status: true,
            message: 'Successfuly posted'
        })
    }
    catch (e) {
        console.log("Error", e)

        return res.status(500).json({

            status: false,

            message: "sever issue"
        })
    }

})

app.get('/get-my-posts', authenticationMiddleware, async function (req, res) {
    try {
        const [row, field] = await promisepool.query("SELECT * FROM posts WHERE user_id = ? ORDER BY id DESC", [req.decode.user_id])

        return res.status(200).json({
            success: true,
            data: row
        })
    }
    catch (e) {
        console.log("Error", e)

        return res.status(500).json({

            status: false,

            message: "sever issue"
        })
    }
})

app.listen(3000)