const { logging } = require("googleapis/build/src/apis/logging");
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

// const sequelize = new Sequelize({
//   database: 'wood',
//   username: 'postgres',
//   password: 'postgres',
//   host: '64.226.90.160',
//   port: 5432,
//   dialect: 'postgres',
//   logging: false
// });


const file = path.join(__dirname, "ca-certificate.crt")

const serverCa = [fs.readFileSync(file, "utf8")];

const sequelize = new Sequelize("woodlinecrm", "doadmin", "AVNS_Hq7s9CF7p0HNn1ikIoZ", {
    host: "db-postgresql-fra1-95213-do-user-12466147-0.b.db.ondigitalocean.com",
    port: 25060,
    dialect: "postgres", // or 'mysql', 'sqlite', 'mssql', etc.
    logging: false,
    dialectOptions: {
        ssl: {
            rejectUnauthorized: true,
            ca: serverCa,
        },
    },
});

// const sequelize = new Sequelize({
//   password: "ffffffff",
//   username: "postgres",
//   host: "localhost",
//   port: 5432,
//   database: "test",
//   dialect: "postgres",
//   logging: false,
// });

// const sequelize = new Sequelize({
//   password: "piTSDDcLcbA1smRF5fuz8Op5Qmd-urqR",
//   username: "mkjivyle",
//   host: "arjuna.db.elephantsql.com",
//   port: 5432,
//   database: "mkjivyle",
//   dialect: "postgres",
// });

module.exports = sequelize;
