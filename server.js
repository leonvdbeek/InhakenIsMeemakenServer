// Imports
const express = require('express');
const mysql = require('mysql');
const bodyparser = require('body-parser');

//Setting up express app
const app = express();
var PORT = process.env.PORT || 5000;
app.use(bodyparser.json());

//Starting MySQL database link
var dbConfig = {
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'b3a70cfbfeb1b7',
    password: '428bdc3e',
    database: 'heroku_f4f131df6a793e8',
    multipleStatements: true
};
var connection;
function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);  // Recreate the connection, since the old one cannot be reused.
    connection.connect( function onConnect(err) {   // The server is either down
        if (err) {                                  // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 10000);    // We introduce a delay before attempting to reconnect,
        }                                           // to avoid a hot loop, and to allow our node script to
    });                                             // process asynchronous requests in the meantime.
                                                    // If you're also serving http, display a 503 error.
    connection.on('error', function onError(err) {
        console.log('db error', err);
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {   // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
            console.log("Connection restarted!")
        } else {                                        // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}
handleDisconnect();

//----------------------------------------------------Activities queries----------------------------------------------------
app.get('/activities', (req, res) => {
    connection.query('SELECT * FROM activities', (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

app.get('/activities/:id', (req, res) => {
    connection.query('SELECT * FROM activities WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

app.delete('/activities/:id', (req, res) => {
    connection.query('DELETE FROM activities WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.send("Deleted succesfully")
        }
    });
});

app.post('/activities', (req, res) => {
    console.log(req.body)
    var query = "SET @id = ?;SET @name = ?;SET @start = ?;SET @end = ?;SET @description = ?;SET @location = ?; \
    CALL activityAddOrEdit(@id,@name,@start,@end,@description,@location);"
    connection.query(query, [req.body.id, req.body.name, req.body.start, req.body.end, req.body.description, req.body.location], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            results.forEach(element => {
                if (element.constructor == Array){
                    res.send('Inserted activity with id: '+element[0].id+". And start, end: "+ req.body.start + "   " + req.body.end);
                }
            });
        }
    });
});

app.put('/activities', (req, res) => {
    console.log(req.body)
    var query = "SET @id = ?;SET @name = ?;SET @start = ?;SET @end = ?;SET @description = ?;SET @location = ?; \
    CALL activityAddOrEdit(@id,@name,@start,@end,@description,@location);"
    connection.query(query, [req.body.id, req.body.name, req.body.start, req.body.end, req.body.description, req.body.location], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            res.send("Updated succesfully!");
        }
    });
});


//--------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------Roles queries----------------------------------------------------
app.get('/roles', (req, res) => {
    connection.query('SELECT * FROM roles', (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

app.get('/roles/:id', (req, res) => {
    connection.query('SELECT * FROM roles WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

app.delete('/roles/:id', (req, res) => {
    connection.query('DELETE FROM roles WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.send("Deleted succesfully")
        }
    });
});

app.post('/roles', (req, res) => {
    var query = "SET @id = ?;SET @description = ?;CALL roleAddOrEdit(@id, @description);"
    connection.query(query, [req.body.id, req.body.description], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            results.forEach(element => {
                if (element.constructor == Array){
                    res.send('Inserted role '+req.body.description+' with id: '+element[0].id);
                }
            });
        }
    });
});

app.put('/roles', (req, res) => {
    var query = "SET @id = ?;SET @description = ?;CALL roleAddOrEdit(@id, @description);"
    connection.query(query, [req.body.id, req.body.description], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            res.send("Updated succesfully!")
        }
    });
});
//--------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------Users queries----------------------------------------------------
app.get('/users', (req, res) => {
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

app.get('/users/:id', (req, res) => {
    connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

app.delete('/users/:id', (req, res) => {
    connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.send("Deleted succesfully")
        }
    });
});

app.post('/users', (req, res) => {
    var query = "SET @id = ?;SET @roles_id = ?;SET @firstname = ?;SET @lastname = ?;SET @email = ?;SET @password = ?;SET @year = ?;SET @birthday = ?;\
    SET @address = ?;CALL userAddOrEdit(@id, @roles_id, @firstname, @lastname, @email, v@password, @year, @birthday, @address);"
    connection.query(query, [req.body.id, req.body.description], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            results.forEach(element => {
                if (element.constructor == Array){
                    res.send('Inserted user '+req.body.description+' with id: '+element[0].id);
                }
            });
        }
    });
});

app.put('/users', (req, res) => {
    var query = "SET @id = ?;SET @roles_id = ?;SET @firstname = ?;SET @lastname = ?;SET @email = ?;SET @password = ?;SET @year = ?;SET @birthday = ?;\
    SET @address = ?;CALL userAddOrEdit(@id, @roles_id, @firstname, @lastname, @email, v@password, @year, @birthday, @address);"
    connection.query(query, [req.body.id, req.body.description], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            res.send("Updated succesfully!")
        }
    });
});
//--------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------Attendance queries----------------------------------------------------
app.get('/attendance', (req, res) => {
    connection.query('SELECT * FROM attendance', (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});
//--------------------------------------------------------------------------------------------------------------------------



app.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});