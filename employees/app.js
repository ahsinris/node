const express = require('express')
const app = express()

app.use(express.json())

const mysql = require('mysql2')

const bcrypt = require('bcrypt')

const promisepool = mysql.createPool({

    host: 'localhost',
    user: 'root',
    password: 'masood$1',
    database: 'hihsc'

}).promise();

app.get('/get_all_employees', async function (req, res) {

    try {

        const [row, field] = await promisepool.query("SELECT * FROM employees")

        return res.status(200).json({

            message: "sucess",

            data: row
        })
    }

    catch (e) {

        console.log("error", e)

        return res.status(500).json({

            message: "server error",

        })

    }



})

app.post('/insert_employees', async function (req, res) {

    try {

        const name = req.body.name
        const password = req.body.password
        const phone = req.body.phone

        if (!name || !password || !phone) {

            return res.status(422).json({

                message: "pls fill all the fields"

            })
        }

        const [row, field] = await promisepool.query("INSERT INTO employees (name,password,phone) VALUES(?,?,?)", [name, password, phone])

        return res.status(200).json({

            message: "sucessfully inserted",

            data: row


        })

    }

    catch (e) {
        return res.status(500).json({
            message: "server issue"
        })
    }





})

app.post('/register', async function (req, res) {
    try {
        const name = req.body.name
        const password = req.body.password
        const phone = req.body.phone

        if (!name || !password || !phone) {

            return res.status(422).json({

                message: "pls fill alll the fields"
            })
        }

        var [row, field] = await promisepool.query("SELECT * FROM employees WHERE name = ?", [name])

        if (row.length !== 0) {

            return res.status(422).json({

                message: "name already exists"
            })
        }

        const encryptPaswrd = await bcrypt.hash(password, 10)

        var [row, field] = await promisepool.query("INSERT INTO employees (name,password,phone) VALUES (?,?,?)", [name, encryptPaswrd, phone])

        return res.status(200).json({

            message: "sucessfully registerd",

            data: row


        })





    }
    catch (e) {
        console.log("error", e)

        return res.status(500).json({
            message: "server issue"

        })
    }


})

app.post('/login', async function (req, res) {
    try {
        const name = req.body.name
        const password = req.body.password

        if (!name || !password) {

            return res.status(422).json({

                message: "pls fill all the fields"
            })
        }

        var [row, field] = await promisepool.query("SELECT * FROM employees WHERE name =?", [name])

        if (row.length === 0) {

            return res.status(422).json({

                message: "pls register first"
            })
        }

        const encryptPaswrd = row[0].password

        const isPasswordSuccess = await bcrypt.compare(password, encryptPaswrd)

        if (!isPasswordSuccess) {

            return res.status(422).json({

                message: "invalid credentials"
            })
        }

    }
    catch (e) {
        console.log("ERROR", e)

        return res.status(500).json({
            message: "sever issue"
        })
    }
})
app.listen(3000)