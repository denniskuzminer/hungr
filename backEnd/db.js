const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("./hungr.db", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to database.");
    db.run("create table if not exists devices (device_id text primary key)");
    db.run(
      "create table if not exists restaurants (id integer primary key autoincrement, name text, address text, city text, state text, zipcode text)"
    );
    db.run(
      'create table if not exists relationships (id integer primary key autoincrement, deviceid integer, restaurantid integer, leftOrRight text, foreign key (deviceid) references devices (id), foreign key (restaurantid) references restaurants (id), check(leftOrRight = "left" or leftOrRight = "right"))'
    );
  }
});
module.exports = db;
