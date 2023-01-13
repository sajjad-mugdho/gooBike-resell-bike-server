const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const { query } = require('express')


require('dotenv').config()


const app = express()
const port = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log(decoded)
        req.decoded = decoded
        next()
    })
}


const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    const usersCollection = client.db('gooBike').collection('users');
    const bikesCollection = client.db('gooBike').collection('bikes');
    const bookingsCollection = client.db('gooBike').collection('bookings');

    try {
        // Save user email & generate JWT
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body

            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d',
            })
            console.log(result)
            res.send({ result, token })
        });

        // get user 

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = {email: email};
            const result = await usersCollection.findOne(query);
            res.send(result)
        });

        app.get('/users', async (req, res ) =>{
            const query = {};
            const result = await usersCollection.find(query).toArray();
            res.send(result);

        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({user })
        });

        app.put('/users/admin/:id',  async (req, res) => {

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })


        //==================
        //Bike Apis
        //=============================================

        //Get Bikes

        app.get('/bikes', async (req, res) => {
            const quary = {};
            const bikes = await bikesCollection.find(quary).toArray();
            res.send(bikes)
        });

        app.get('/bike/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const bike = await bikesCollection.findOne(query);
            res.send(bike)
        });

        app.put('/bike/:id',  async (req, res) => {

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'Booked'
                }
            }
            const result = await bikesCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })


        app.get('/bikes/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const bikes = await bikesCollection.find(query).toArray()
            res.send(bikes)
        });

        //Get Bike By Category

        app.get('/bike/:category', async (req, res) => {
            const category = req.params.category;
            console.log("cate", category);
            const query = { category: category };

            const bikeCategory = await bikesCollection.find(query).toArray();

            res.send(bikeCategory)

        })

        // Add Bikes

        app.post('/bikes', async (req, res) => {
            const bike = req.body;
            const result = await bikesCollection.insertOne(bike);
            res.send(result)
        });

        app.delete("/bike/:id", async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};

            const result = await bikesCollection.deleteOne(query);
            res.send(result)
        })


        //===========================================
        // ========= Bookings API====================
        //===========================================

        app.get('/bookings/:email', async (req, res ) =>{
            const email = req.params.email;
            console.log(email);
            const filter = {buyerEmail: email};
            const booking = await bookingsCollection.find(filter).toArray();
            res.send(booking)
        });

        app.post('/bookings', async (req, res) =>{
            const booking = req.body;
            console.log(booking);

            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

        
    }


    finally {

    }
}

run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('Server is running... in session')
})

app.listen(port, () => {
    console.log(`Server is running...on ${port}`)
})