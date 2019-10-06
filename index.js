const express = require('express');
const cors = require('cors');
const mysql = require('mysql')

const app = express();
var PORT = process.env.PORT || 5000;

const getAllActivities = 'SELECT * FROM attendance';

const c = mysql.createConnection({
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'b3a70cfbfeb1b7',
    password: '428bdc3e',
    database: 'heroku_f4f131df6a793e8'
})
c.connect(err => {
    if(err) {
        return err;
    }
});
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hi');
})

app.get('/activities', (req, res) => {
    c.query(getAllActivities, (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

app.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});