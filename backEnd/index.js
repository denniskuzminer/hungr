const express = require("express");
const http = require("http");
const app = express();
const db = require("./db");
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.post("/swiped", (req, res) => {
  try {
    const { device_id, restaurant_id, left_or_right } = req.body;
    const newRelationship = db.run(
      `INSERT INTO swipes (device_id, restaurant_id, left_or_right) VALUES (${device_id}, ${restaurant_id}, "${left_or_right}")`
    );
    res.json(
      "device: " +
        device_id +
        " has swiped " +
        left_or_right +
        " on restaurant: " +
        restaurant_id
    );
  } catch (err) {
    console.error(err.message);
  }
});
// {
//   "device_id": 209858979,
//   "restaurant_id": 1,
//   "left_or_right": "left"
// }

app.post("/restaurant", (req, res) => {
  try {
    const { name, address, city, state, zipcode } = req.body;
    const newRelationship = db.run(
      `INSERT INTO restaurants (name, address, city, state, zipcode) VALUES ("${name}", "${address}", "${city}", "${state}", "${zipcode}")`
    );
    res.json(
      `New restaurant created with name and address: ${name} at ${address}, ${city}, ${state}, ${zipcode}`
    );
  } catch (err) {
    console.error(err.message);
  }
});
// {
//   "name": "Pizza Hut",
//   "address": "3000 Broadway",
//   "city": "New York",
//   "state": "NY",
//   "zipcode": "10001"
// }

app.post("/device", (req, res) => {
  try {
    const { device_id } = req.body;
    const newRelationship = db.run(
      `INSERT INTO devices (device_id) VALUES (${device_id})`
    );
    res.json("device: " + device_id);
  } catch (err) {
    console.error(err.message);
  }
});

// app.post("/device", (req, res) => {
//   try {
//     const { deviceid } = req.body;
//     // const checkDevice = db.run(
//     //   `select count(*) from devices where deviceid = ${deviceid}`
//     // );
//     const sql = `select count(*) from devices where deviceid = ${deviceid}`;
//     //console.log(checkDevice);
//     var alreadyEstRel = false;
//     db.all(sql, [], (err, rows) => {
//       if (err) {
//         throw err;
//       }
//       const checkDevice = JSON.stringify(rows[0])
//         .trim("}")
//         .split(":")[1]
//         .charAt(0);
//       console.log(checkDevice);
//       if (checkDevice > 0) {
//         alreadyEstRel = true;
//       }
//     }).then(() => {
//       console.log(alreadyEstRel);
//       if (!alreadyEstRel) {
//         const newRelationship = db.run(
//           `INSERT INTO devices (deviceid) VALUES (${deviceid})`
//         );
//         res.json("device: " + deviceid);
//       } else {
//         res.json("this device: " + deviceid + " already exists.");
//       }
//     });
//   } catch (err) {
//     console.error(err.message);
//   }
// });

// app.post("/hungrs", async (req, res) => {
//     try {
//         // Saves needed fields of the request body
//         const { deviceid, restaurantid, leftOrRight } = req.body;
//         // Checks whether this information is already present
//         // To make sure that there are not duplicates
//         const checkAlreadyEstRel = `select * from relationships where deviceid = ${deviceid} and restaurantid = ${restaurantid} and leftOrRight = "${leftOrRight}"`;
//         var alreadyEstRel = true;
//         db.all(checkAlreadyEstRel, [], (err, rows) => {
//             if (err) { throw err; }
//             console.log(rows);
//             if(rows.length == 0) {
//                 alreadyEstRel = false;
//             }
//         });
//         // If there is no duplicate then create a relationship
//         if(!alreadyEstRel) {
//             const newRelationship = db.run(`INSERT INTO relationships (deviceid, restaurantid, leftOrRight) VALUES (${deviceid}, ${restaurantid}, "${leftOrRight}")`);
//             res.json("device: " + deviceid + " has swiped "+ leftOrRight + " on restaurant: " + restaurantid);
//         } else {
//             res.json("this device: " + deviceid + " has already swiped "+ leftOrRight + " on restaurant: " + restaurantid);
//         }
//     } catch (err) {
//         console.error(err.message);
//     }
// });

app.get("/", async (req, res, next) => {
  return res.json("Hello world");
});

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});
