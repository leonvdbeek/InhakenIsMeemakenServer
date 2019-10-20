const express = require('express');
const cors = require('cors');
const mysql = require('mysql')
const app = express();
var PORT = process.env.PORT || 5000;

const getAllActivities = 'SELECT * FROM attendance';

var db_config = {
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'b3a70cfbfeb1b7',
    password: '428bdc3e',
    database: 'heroku_f4f131df6a793e8'
  };
  
var c = mysql.createConnection(db_config);
c.connect(er => {
    if(er) {
        handleDisconnect();
    }
});

function handleDisconnect() {
    c = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.

    c.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    c.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

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