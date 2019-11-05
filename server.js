// Imports
const express = require('express');
const mysql = require('mysql');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('./middleware/check-auth');

//Setting up express app
const app = express();
var PORT = process.env.PORT || 5000;
var JWT_SECRET = process.env.JWT || "4243";
app.use(bodyparser.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "GET, POST, POST, DELETE");
        return res.status(200).json({});
    }
    next();
});

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
app.get('/activities', checkAuth, (req, res) => {
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

app.get('/activities/:id', checkAuth, (req, res) => {
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

app.delete('/activities/:id', checkAuth, (req, res) => {
    connection.query('DELETE FROM activities WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.send("Deleted succesfully")
        }
    });
});

app.post('/activities', checkAuth, (req, res) => {
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

app.put('/activities', checkAuth, (req, res) => {
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
app.get('/roles', checkAuth, (req, res) => {
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

app.get('/roles/:id', checkAuth, (req, res) => {
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

app.delete('/roles/:id', checkAuth, (req, res) => {
    connection.query('DELETE FROM roles WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.send("Deleted succesfully")
        }
    });
});

app.post('/roles', checkAuth, (req, res) => {
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

app.put('/roles', checkAuth, (req, res) => {
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
app.get('/users', checkAuth, (req, res) => {
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

app.get('/users/:id', checkAuth, (req, res) => {
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

app.delete('/users/:id', checkAuth, (req, res) => {
    connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.send("Deleted succesfully")
        }
    });
});

app.post('/users', checkAuth, (req, res) => {
    bcrypt.hash(req.body.password, 10 , (err, hash) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        } else {
            var query = "SET @id = ?;SET @roles_id = ?;SET @firstname = ?;SET @lastname = ?;SET @email = ?;SET @password = ?;SET @year = ?;SET @birthday = ?;SET @address = ?;CALL userAddOrEdit(@id, @roles_id, @firstname, @lastname, @email, @password, @year, @birthday, @address);"
            connection.query(query, [req.body.id, req.body.roles_id, req.body.firstname, req.body.lastname, req.body.email, hash, req.body.year, req.body.birthday, req.body.address], (err, results) => {
            if(err) {
                return res.send(err);
            } else {
                results.forEach(element => {
                    if (element.constructor == Array){
                        res.send('Inserted user '+req.body.firstname+' with id: '+element[0].id);
                    }
                });
            }
            });
        }
    });
});

app.put('/users', checkAuth, (req, res) => {
    bcrypt.hash(req.body.password, 10 , (err, hash) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        } else {
            var query = "SET @id = ?;SET @roles_id = ?;SET @firstname = ?;SET @lastname = ?;SET @email = ?;SET @password = ?;SET @year = ?;SET @birthday = ?;SET @address = ?;CALL userAddOrEdit(@id, @roles_id, @firstname, @lastname, @email, @password, @year, @birthday, @address);"
            connection.query(query, [req.body.id, req.body.roles_id, req.body.firstname, req.body.lastname, req.body.email, hash, req.body.year, req.body.birthday, req.body.address], (err, results) => {
                if(err) {
                    return res.send(err);
                } else {
                    res.send("Updated succesfully!")
                }
            });
        }
    });
});
//--------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------Attendance queries----------------------------------------------------
app.get('/attendance', checkAuth, (req, res) => {
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

app.get('/attendance/activity/:id', checkAuth, (req, res) => {
    connection.query('SELECT * FROM attendance WHERE activities_id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

app.get('/attendance/user/:id', checkAuth, (req, res) => {
    connection.query('SELECT * FROM attendance WHERE users_id = ?', [req.params.id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

app.get('/attendance/:act_id/:user_id', checkAuth, (req, res) => {
    connection.query('SELECT * FROM attendance WHERE (activities_id = ? AND users_id = ?)', [req.params.act_id, req.params.user_id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.json({
                data: results
            });
        }
    });
});

app.delete('/attendance/:act_id/:user_id', checkAuth, (req, res) => {
    connection.query('DELETE FROM attendance WHERE (activities_id = ? AND users_id = ?)', [req.params.act_id, req.params.user_id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            return res.send("Deleted succesfully")
        }
    });
});

app.post('/attendance', checkAuth, (req, res) => {
    connection.query("INSERT INTO attendance(activities_id, users_id, attending, status)VALUES(?,?,?,?);", [req.body.activities_id, req.body.users_id, req.body.attending, req.body.status], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            res.send('Inserted attendance for user ID: '+req.body.users_id+ 'for activity ID: '+ req.body.activities_id);
        }
    });
});

app.put('/attendance/:act_id/:user_id', checkAuth, (req, res) => {
    connection.query("UPDATE attendance SET attending = ?, status = ? WHERE (activities_id = ? AND users_id = ?);", [req.body.attending, req.body.status, req.params.act_id, req.params.user_id], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            res.send('Updated attendance for user ID: '+req.params.user_id+ 'for activity ID: '+ req.params.act_id);
        }
    });
});
//--------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------AUTH------------------------------------------------------------

app.post('/login', (req, res) => {
    connection.query("SELECT * FROM users WHERE email = ?;", [req.body.email], (err, results) => {
        if(err) {
            return res.send(err);
        } else {
            if (results.length > 0) {
                // Email exists
                bcrypt.compare(req.body.password, results[0].password, (err, result) => {
                    if (err) {
                        res.send('error')
                    } else if (result == true) {
                        //Password is right
                        const token = jwt.sign({
                                id: results[0].id,
                                email: results[0].email
                            }, 
                            JWT_SECRET,
                            {
                                expiresIn: "1h"
                            }
                        );

                        res.status(200).json({
                            message: "Auth succesful",
                            token: token,
                            user_id: results[0].id
                        });

                    } else {
                        // password is wrong
                        res.send('Bad login');
                    }
                });
            } else {
                // Email does not exist
                return res.send('Bad login');
            }
        }
    });
});

//--------------------------------------------------------------------------------------------------------------------------
app.use((req, res, next) => {
    const error = new Error('Route does not exist');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

app.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});