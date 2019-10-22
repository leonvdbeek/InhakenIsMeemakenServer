// Imports
const express = require('express');
const mysql = require('mysql');

//Setting up express app
const app = express();
var PORT = process.env.PORT || 5000;

//Starting MySQL database link
var dbConfig = {
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'b3a70cfbfeb1b7',
    password: '428bdc3e',
    database: 'heroku_f4f131df6a793e8'
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

// Routes
const ActivitiesRoutes = require("./Routes/Activities")
app.use("/activities", ActivitiesRoutes);
const AttendanceRoutes = require("./Routes/Attendance")
app.use("/attendance", AttendanceRoutes);
const UsersRoutes = require("./Routes/Users")
app.use("/users", UsersRoutes);

app.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});