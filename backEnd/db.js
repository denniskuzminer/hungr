const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("./hungr.db", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to database.");
    db.run(
      `create table if not exists devices (
        device_id text primary key)`
    );
    db.run(
      `create table if not exists restaurants (
        id integer primary key autoincrement, 
        name text, 
        address text, 
        city text, 
        state text, 
        zipcode text)`
    );
    db.run(
      `create table if not exists swipes (
        id integer primary key autoincrement, 
        device_id integer, 
        restaurant_id integer, 
        left_or_right text, 
        foreign key (device_id) references devices (device_id), 
        foreign key (restaurant_id) references restaurants (id), 
        check(left_or_right = "left" or left_or_right = "right"))`
    );
  }
});
module.exports = db;
//
