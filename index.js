const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')


require('dotenv').config()


const app = express()
const port = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())


const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    const usersCollection = client.db('gooBike').collection('users');
    const bikesCollection = client.db('gooBike').collection('bikes');

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


        //=====
        //Bike Apis
        //=====

        //Get Bikes

        app.get('/bikes', async (req, res) => {
            const quary ={};
            const bikes = await bikesCollection.find(quary).toArray();
            res.send(bikes)
        });
        app.get('/bikes/:email', async (req, res) => {
            const quary ={email: email};
            const bikes = await bikesCollection.findOne(quary);
            res.send(bikes)
        });

        // Add Bikes

        app.post('/bikes', async (req, res) => {
            const bike = req.body;
            const result = await bikesCollection.insertOne(bike);
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