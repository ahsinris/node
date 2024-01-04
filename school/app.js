const express = require('express')

const app = express()

app.use(express.json())

// get the client
const mysql = require('mysql2');

// create the connection to database
const promisePool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'masood$1',
    database: 'hihsc'
}).promise();



app.get('/get_students', async function (req, res) {

    try {
        const [row, field] = await promisePool.query("SELECT * FROM students")

        return res.status(200).json({
            message: "success",
            data: row
        })
    }
    catch (e) {
        console.log("Error", e)

        return res.status(500).json({
            message: "Server issue"
        })
    }

})

app.get('/get_students_by_email', async function (req, res) {

    try {

        const email = req.query.email;

        if (!email) {
            return res.status(422).json({
                status: false,
                message: "Please give email id"
            })
        }

        const [result, field] = await promisePool.query("SELECT * FROM  students WHERE  email = ?", [email])

        if (result.length === 0) {
            return res.status(404).json({
                status: false,
                message: "EMail id not found"
            })
        }

        return res.status(200).json({

            status: true,

            message: "sucess",

            data: result

        })

    }

    catch (e) {

        console.log("error", e)

        return res.status(500).json({

            status: false,

            message: "sever error"
        })



    }




})
app.listen(3000)