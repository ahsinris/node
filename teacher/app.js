const express = require('express')

const app = express()
const bcrypt = require('bcrypt');

app.use(express.json())

const mysql = require('mysql2');

const promisePool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'masood$1',
    database: 'hihsc'
}).promise();

app.get('/get_all_teacher', async function (req, res) {

    try {

        const [row, field] = await promisePool.query("SELECT * FROM  teacher")

        return res.status(200).json({

            message: "sucess",

            data: row
        })
    }

    catch (e) {

        console.log("error", e)

        return res.status(500).json({

            message: "sever error"
        })
    }


})

app.post('/insert_students', async function (req, res) {
    try {
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone

        if (!name || !email || !phone) {
            return res.status(422).json({
                status: false,
                message: "Please fill valid data"
            })
        }

        const [row, field] = await promisePool.query("INSERT INTO students (name, email, phone) VALUES (?, ?, ?)", [name, email, phone]);

        return res.status(200).json({
            status: true,
            message: "Insert succesfully",
            date: row
        });
    }
    catch (e) {
        console.log("Error", e);

        return res.status(500).json({
            status: false,
            message: "Server issue"
        })
    }
})


// Register
app.post('/register', async function (req, res) {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const password = req.body.password;

        if (!name || !email || !phone || !password) {
            return res.status(422).json({
                status: false,
                message: "Please fill all fields"
            })
        }

        var [sRow, sField] = await promisePool.query("SELECT * FROM teacher WHERE email_id = ?", [email]);

        if (sRow.length !== 0) {
            return res.status(422).json({
                status: false,
                message: "Email already exists"
            });
        }

        const encryptPaswrd = await bcrypt.hash(password, 10);
        console.log("encryptPaswrd", encryptPaswrd)

        var [row, field] = await promisePool.query(`INSERT INTO teacher (name, email_id, password, phone_number) 
                                                        VALUES (?, ?, ?, ?)`, [name, email, encryptPaswrd, phone]);

        return res.status(200).json({
            status: true,
            message: "Register succesfully",
            data: row
        })
    }
    catch (e) {
        console.log("Error", e)

        return res.status(500).json({
            message: "Server issue"
        })
    }
});

// Login
app.post('/login', async function (req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password

        if (!email || !password) {
            return res.status(422).json({
                message: "Fill all fields"
            })
        }

        const [row, fields] = await promisePool.query("SELECT * FROM teacher WHERE email_id = ?", [email]);

        if (row.length === 0) {
            return res.status(422).json({
                status: false,
                message: "Please register first"
            })
        }

        const encryptPaswrd = row[0].password;

        const isPasswordSuccess = await bcrypt.compare(password, encryptPaswrd)

        console.log("checking value", isPasswordSuccess)

        if (!isPasswordSuccess) {
            return res.status(401).json({
                status: false,
                messgae: "Inavid Credentials"
            })
        }

        return res.status(200).json({
            status: true,
            message: "Welcome",
            data: row[0]
        })
    }
    catch (e) {
        console.log("Error", e)
        return res.status(500).json({
            status: false,
            message: "Server Issue"
        })
    }
})


app.listen(3000)