const express = require('express');
const cors = require('cors');
const app = express();
const body = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');

const db = mysql.createConnection(
    {
        host: "localhost",
        port: 3410,
        user: "root",
        password: "Ramesh208#!",
        database: "rent360"
    }
);

app.use(cors(
    {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
));
app.use(cookieParser());
app.use(body.json());
app.use(body.urlencoded({ extended: true }));
app.use(express.json());

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({Message: "we need token please provide it."})
    }
    else {
        jwt.verify(token, "our-secret-key", (err, decode) => {
            if (err) {
            return res.json({Message: "Authentication error"})
            }
            else {
                req.name = decode.name;
                req.userid = decode.userid;
                next();
            }
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({status: true, name: req.name, userid:req.userid})
})

app.post('/register', (req, res) => {
    const sqlCheck = 'SELECT * FROM users WHERE userid = ? or email = ?';
    const valuesCheck = [req.body.userid, req.body.email];

    db.query(sqlCheck, valuesCheck, (err, data) => {
        if (err) {
            console.error(err);
            return res.json({ message: "Error creating user. Try later", status: false });
        }

        if (data.length > 0) {
            return res.json({ message: "Username or email already exists!", status: false, data });
        } else {
            const sql = 'INSERT INTO users (userid, name, email, password, phone) VALUES (?,?,?,?,?)';
            const values = [
                req.body.userid,
                req.body.name,
                req.body.email,
                req.body.password,
                req.body.phone
            ];

            db.query(sql, values, (insertErr, insertData) => {
                if (insertErr) {
                    console.error(insertErr);
                    return res.json({ message: "Error creating user. Try later", status: false });
                }

                console.log(insertData);
                return res.json({ message: "User created!", status: true, data: insertData });
            });
        }
    });
});


app.post('/login', (req, res) => {
    const sqlCheck = 'SELECT * FROM users WHERE userid = ? and password = ?';
    const valuesCheck = [req.body.userid, req.body.password];

    db.query(sqlCheck, valuesCheck, (err, data) => {
        if (err) {
            console.error(err);
            return res.json({ message: "Error logging in. Try later", status: false });
        }

        if (data.length > 0) {
            const name = data[0].name;
            const userid = data[0].userid;
            const token = jwt.sign({ name,userid }, "our-secret-key", { expiresIn: "1d" });
            res.cookie('token', token);
            return res.json({ message: "logging in..", status: true, name:name, userid:userid});
        } else {
            return res.json({ message: 'Bad credentials', status: false, data });
        }
    });
});


app.get("/logout", (req, res) => {
    res.clearCookie('token');
    return res.json({ status: true });
})

app.post("/products", (req, res) => {
    const sqlCheck = "SELECT * FROM product";
    db.query(sqlCheck, (err, data) => {
     if (err) {
            console.error(err);
            return res.json({ message: "Error getting products in. Try later", status: false });
        }
     else {
         return res.json(data);
        }
    })
})

app.post("/addProduct", (req, res) => {
    const sqlCheck = "INSERT INTO product (title, description, price, seller_mobile_number, product_image_url, address, userid) VALUES (?,?,?,?,?,?,?)";
    const price = Number(req.body.price)
    const valuesCheck = [req.body.title, req.body.description, price, req.body.seller_mobile_number, req.body.product_image_url, req.body.address, req.body.userid];
    db.query(sqlCheck, valuesCheck, (insertErr, insertData) => {
                if (insertErr) {
                    console.error(insertErr);
                    return res.json({ message: "Error creating ad. Try later", status: false });
                }

                console.log(insertData);
                return res.json({ message: "Product posted!", status: true, data: insertData });
            });
})

app.post("/products/product", (req, res) => {
    const sqlCheck = "SELECT * FROM product where id=?";
    const valuesCheck = req.body.id;

    db.query(sqlCheck, valuesCheck, (err, data) => {
        if (err) {
            console.error(err);
            return res.json({ message: "Error getting products in. Try later", status: false });
        }

        if (data.length > 0) {
            console.log(data);
            return res.json({ data });
        } else {
            data = []
            return res.json({ data });
        }
    });
})

app.post("/filteredproducts", (req, res) => {
    const sqlCheck = "SELECT * FROM product WHERE title LIKE ? OR title LIKE ? OR title LIKE ? OR description LIKE ? OR description LIKE ? OR description LIKE ?";
    const valuesCheck = [
        `%${req.body.category}%`,
        `%${req.body.category}`,
        `${req.body.category}%`,
        `%${req.body.category}%`,
        `%${req.body.category}`,
        `${req.body.category}%`
    ];

    db.query(sqlCheck, valuesCheck, (err, data) => {
        if (err) {
            console.error(err);
            return res.json({ message: "Error getting products. Try later", status: false });
        }

        if (data.length > 0) {
            console.log(data);
            console.log('yes');
            return res.json( data );
        } else {
            data = [];
            return res.json({ data });
        }
    });
});


app.get('/chat', (req, res) => {
    const sql = 'SELECT * from messages where sender_id = "RameshBabuAsh" or receiver_id = "RameshBabuAsh";';
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        console.log(data);
        return res.json(data);
    })
})

app.listen(7000, 'localhost', () => {
    console.log("Server is running on http://localhost:7000/");
});