const express = require("express");
const http = require("http");
const db = require("./db");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3001;
let API_KEY = process.env.API_KEY;

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors());

const yelp = require("yelp-fusion");

const apiKey = API_KEY;

//40.742500, -74.006000

const client = yelp.client(apiKey);

app.get("/find", (req, res) => {
  const searchRequest = {
    latitude: req.query.latitude,
    longitude: req.query.longitude,
  };
  client
    .search(searchRequest)
    .then((response) => {
      const restaurants = [];
      let businesses = response.jsonBody.businesses;
      for (let i = 0; i < businesses.length; i++) {
        const restaurant = {
          name: businesses[i].name,
          image_url: businesses[i].image_url,
          rating: businesses[i].rating,
          price: businesses[i].price,
          location: businesses[i].location,
        };
        restaurants.push(restaurant);
      }
      res.status(200).json(restaurants);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).json("No restaurants found :(");
    });
});

app.get("/restaurants", (request, response) => {
  const deviceID = request.query.device;
  const sql = `SELECT 
  * from SWIPES INNER JOIN 
  restaurants ON 
  swipes.restaurant_id=restaurants.id 
  WHERE swipes.device_id=(?);`;
  db.all(sql, [deviceID], (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      const restaurants = [];
      rows.forEach((row) => {
        restaurants.push({
          name: row.name,
          address: row.address,
          city: row.city,
          state: row.state,
          zipcode: row.zipcode,
        });
      });
      return response.status(200).json(restaurants);
    }
  });
});

// {
//   "device_id": 209858979,
//   "name": "Pizza Hut",
//   "address": "3000 Broadway",
//   "city": "New York",
//   "state": "NY",
//   "zipcode": "10001"
// }
app.post("/swiped", (req, res) => {
  const { deviceID, name, address, city, state, zipcode } = req.body;
  const selectRes = `SELECT id FROM RESTAURANTS 
    WHERE name=(?) AND address=(?) AND city=(?)
    AND state=(?) AND zipcode=(?)`;
  const insertDevice = `INSERT INTO devices(device_id) VALUES(?)`;
  const insertSwipe = `INSERT INTO 
    swipes(device_id, restaurant_id) 
    values(?,?)`;
  const insertRes = `INSERT 
        INTO restaurants(name, address, 
        city, state, zipcode) values(?,?,?,?,?)`;

  //insert device into the table
  db.run(insertDevice, [deviceID], (err) => {
    if (err) {
      console.log(`Device ${deviceID} already exists!`);
    }
  });

  //select restaurant to check duplicate
  const selectRetaurant = new Promise((resolve, reject) => {
    db.get(selectRes, [name, address, city, state, zipcode], (err, row) => {
      if (err) {
        console.log(
          `${name}, ${address},${city}, ${state}, ${zipcode} already exists!`
        );
        reject(err);
      }
      resolve(row);
    });
  });

  const insertNewSwipe = (deviceID, restaurantID) => {
    db.run(insertSwipe, [deviceID, restaurantID], (err) => {
      if (err) {
        return res.status(409).json({ message: "Swipe already exists!" });
      }
      return res.status(201).json({ message: "Successful" });
    });
  };

  selectRetaurant
    .then((restaurantID) => {
      if (restaurantID) {
        const id = restaurantID.id;
        //restaurant already exists
        insertNewSwipe(deviceID, id);
      } else {
        //insert restaurant and grab the index
        const insertRestaurant = new Promise((resolve, reject) => {
          db.run(insertRes, [name, address, city, state, zipcode], function (
            err
          ) {
            if (err) {
              reject(err);
            }
            resolve(this.lastID);
          });
        });
        insertRestaurant
          .then((newRestaurantID) => {
            insertNewSwipe(deviceID, newRestaurantID);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/device", (req, res) => {
  try {
    const { deviceID } = req.body;
    const newRelationship = db.run(
      `INSERT INTO devices (device_id) VALUES (${deviceID})`
    );
    res.json("device: " + deviceID);
  } catch (err) {
    console.error(err);
  }
});

app.get("/", (request, response) => {
  return response.status(200).json({ message: "Welcome to hungr API!" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// git add .
// git commit -m "Description"
// git push
