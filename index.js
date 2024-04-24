const express = require('express');
const cors = require('cors');
const { connectToDB, getConnection } = require('./sql');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const app = express();

// A RESTFul API accepts JSON (is the norm for JavaScript)
app.use(express.json());

// Make our RESTFul API public
app.use(cors());

function verifyJWT(req,res, next){
    const authorization = req.headers["authorization"];
    // the format will "BEARER <jwt>"
    console.log(authorization); 
    const token = authorization.split(" ")[1]; 
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, payload){
        if(err){
            res.sendStatus(401);
            return;
        } 
        req.user = payload; 
        next()
    })
}

async function hashPassword(password) {
    try {
        const hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
        return hash;
    } catch (e) {
        console.log("Error generating hashed password");
        return "";
    }
}

async function main() {

    await connectToDB(
        process.env.DB_HOST,
        process.env.DB_USER,
        process.env.DB_DATABASE,
        process.env.DB_PASSWORD
    );

    const connection = getConnection();

    // naming convention
    // 1. the font part of the url is '/api' 
    // 2. the url itself refers to nouns (i.e objects or things)
    // 3. 
    app.get('/api/products', async function (req, res) {
        const [products] = await connection.execute('select * from products');
        res.json({
            products
        });
    })

    app.post('/api/products', async function (req, res) {
        const { product_name, description, price, stock_quantity } = req.body;
        const query = `
            insert into products (product_name, description, price, stock_quantity) 
            values (?,?,?,?)`;
        const bindings = [product_name, description, parseFloat(price), parseInt(stock_quantity)];
        const results = await connection.execute(query, bindings);
        res.json({ results });
    });

    app.put('/api/products/:product_id', async function (req, res) {
        const { product_name, description, price, stock_quantity } = req.body;
        const sql = 'update products set product_name =?, description = ?, price=?, stock_quantity=? where product_id=?'
        await connection.execute(sql, [product_name, description, price, stock_quantity, req.params.product_id]);
        res.json({
            message: "update completed"
        })
    });

    app.delete("/api/products/:product_id", async function (req, res) {
        const sql = "delete from products where product_id = ?";
        await connection.execute(sql, [req.params.product_id]);
        res.json({
            message: "Delete completed"
        })
    });

    app.post('/api/users', async function (req, res) {
        const { email, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const query = `
            insert into users (email, password) 
            values (?,?)`;
        const bindings = [email, hashedPassword];
        const results = await connection.execute(query, bindings);
        res.json({ results });
    });

    app.post('/api/login', async function (req, res) {
        const [users] = await connection.execute("select * from users where email = ?", [req.body.Email]);
        const user = users[0]
        console.log(user);
        if (user) {
            if (await bcrypt.compare(req.body.Password, user.Password)) {
                const token = jwt.sign({
                    id: user.Id,
                    email: user.Email
                }, process.env.TOKEN_SECRET, {
                    expiresIn: "1h" 
                });
                res.json({
                    "message": "Login successful",
                    "token": token
                });
            }
        } else {
            res.status(400);
            res.json({
                "error": "Invalid Login"
            })
        }
    })

    app.get("/api/profile", verifyJWT, function(req,res){
        res.json({
            "user":req.user
        })
    })
}

main();

app.listen(3000, function () {
    console.log("server has started");
})