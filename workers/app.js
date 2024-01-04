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

        var [result, field] = await promisepool.query("SELECT * FROM workers WHERE email = ?", [email])

        if (result.length !== 0) {

            return res.status(422).json({

                status: false,

                message: "the email is already exists"
            })
        }
        const encryptpassword = await bcrypt.hash(password, 10)

        var [row, field] = await promisepool.query("INSERT INTO workers (name,email, password, phone) VALUES (?,?,?,?)", [name, email, encryptpassword, phone])

        return res.status(200).json({

            status: true,
            message: "sucessfully registered",
            data: row
        })

    }
    catch (e) {

        console.log("error", e)

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

                message: "pls fill all the fileds"

            })
        }

        var [row, field] = await promisepool.query("SELECT * FROM workers WHERE email = ? ", [email])

        if (row.length === 0) {

            return res.status(422).json({

                status: false,

                message: "pls register first "
            })

        }

        const encryptpassword = row[0].password

        const ispasswordiscorrect = await bcrypt.compare(password, encryptpassword)

        if (!ispasswordiscorrect) {

            return res.status(422).json({

                status: false,
                message: "invalid crendtials"
            })
        }

        return res.status(200).json({

            status: true,

            message: "welcome",
            data: row[0]


        })


    }
    catch (e) {

        console.log("error", e)

        return res.status(500).json({

            status: false,

            message: "sever issue"
        })
    }


})


app.delete('/remove_students/:email', async function (req, res) {
    try {
        const email = req.params.email

        if (!email) {
            return res.status(422).json({
                message: 'Fill all field'
            })
        }

        var [row, field] = await promisepool.query("DELETE FROM students WHERE email = ?", [email]);

        console.log("Data===", row)


        return res.status(200).json({
            status: true,
            data: row
        })
    }
    catch (e) {
        console.log("Error", e)

        res.status(500).json({
            status: false,
            message: "Server issue"
        })
    }
})

app.put('/update_workers', async function (req, res) {
    try {

        const name = req.body.name

        const phone = req.body.phone

        const id = req.body.id

        if (!name || !phone || !id) {

            return res.status().json({
                status: false,

                message: "invalid crendtials"
            })
        }

        const [row, field] = await promisepool.query("UPDATE workers  SET name = ?,phone =? WHERE id =?", [name, phone, id])

        return res.status(200).json({

            status: true,

            message: "updated sucessfully"
        })
    }

    catch (e) {

        console.log("ERROR", e)

        return res.status(500).json({

            status: false,
            message: "sever issue"
        })
    }


})

app.listen(3000)