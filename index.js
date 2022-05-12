const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use (cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gknk4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('bicycle').collection('items')
        const orderCollection = client.db('bicycle').collection('order')

        //Auth
        app.post('/login', async (req, res) => {
            const authHeader = req.headers.authorization
            console.log(authHeader)
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn:'1d'
            })
            res.send(accessToken)
        })
        //Item
        app.get('/item', async (req, res) => {
            const query={}
            const cursor = itemsCollection.find(query)
            const items = await cursor.toArray()
            res.send(items)
        })

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const items = await itemsCollection.findOne(query)
            res.send(items)
        })

        //post
        app.post('/item', async (req, res) => {
            const newItems = req.body
            const result = await itemsCollection.insertOne(newItems)
            res.send(result)
        }); 

        //Delete
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await itemsCollection.deleteOne(query)
            res.send(result)
        })

        //order
        app.get('/order', async (req, res) => {
            const email = req.query.email
            const query ={email:email}
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)
        })
        
        app.post('/order', async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })
    }
    finally {
        
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('i hope the server running')
})

app.listen(port, () => {
    console.log('it works')
})