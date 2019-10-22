const express = require("express");
const Router = express.Router();
const connection = require('../connection');

Router.get('/', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

module.exports = Router;