const http = require("http")
const fs = require("fs")
const mysql = require("mysql")
const { connect } = require("tls")

const hostname = "127.0.0.1"
const port = 3000

// create mysql connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root1234',
    database: 'my_db'
})

connection.connect()

// create server
const server = http.createServer((req, res) => {
    // serve api requests
    // enroll new user
    if (req.url == "/enroll") {
        data = ""
        req.on("data", (chunk) => {
            data += chunk
        })
        req.on("end", () => {
            // retrieve data
            data = data.split('&')
            id = data[0].split("=")[1]
            name = data[1].split("=")[1]
            descriptors0 = data[2].split("=")[1]
            descriptors1 = data[3].split("=")[1]
            descriptors2 = data[4].split("=")[1]
            descriptors = descriptors0 + "+" + descriptors1 + "+" + descriptors2

            // insert into table
            return connection.query("INSERT INTO FACEDATA VALUES (?, ?, ?)", [id, name, descriptors], function (error, results, fields) {
                if (error == null) {
                    res.statusCode = 200
                    res.write("success")
                    return res.end()
                }

                else {
                    res.statusCode = 500
                    res.write("error")
                    return res.end()
                }
            })
        })
    }

    // get all face data
    else if (req.url == "/getFaceData") {
        return connection.query("SELECT * FROM FACEDATA", (error, results, fields) => {
            // check if error occurred
            if (error == null) {
                res.statusCode = 200
                res.write(JSON.stringify(results))
                return res.end()
            }
        })
    }

    // serve whatever file asked
    else {
        fs.readFile(__dirname + req.url, (err, data) => {
            res.statusCode = 200
            res.write(data)
            return res.end()
        })
    }
})

// start server
server.listen(port, hostname, () => {
    console.log("server running at localhost:3000")
})