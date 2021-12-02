// const http = require('http')
// const hostname = '127.0.0.1'
const express = require('express')
const port = 3001
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const firebase = require('firebase-admin')

const serviceAccount = require('./serviceAccountKey.json')
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://weartheweather-1eee6-default-rtdb.firebaseio.com/'
})

const db = firebase.database()
const ref = db.ref('clothingItems')
ref.on('value', (snapshot) => {
    console.log(snapshot.val());
}, (errorObject) => {
    console.log('The read failed: ' + errorObject.name);
});

const app = express()

// const url = process.env.MONGODB_DATABASE_URI
// mongoose.connect(url)

app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    const response = await axios({
        method: 'GET',
        url: `${process.env.WEATHER_BASE_URL}/current.json`,
        params: {
            key: process.env.WEATHER_API_KEY,
            q: 'Seattle',
            aqi: 'no'
        }
    })

    const { data } = response
    console.log({ data })
    res.send({ data })
})

app.post('/', async (req, res) => {
    console.log(req.body)
    //send GET request to weather API
    const query = req.body.q
    const airQuality = req.body.aqi ? 'yes' : 'no'
    const response = await axios({
        method: 'GET',
        url: `${process.env.WEATHER_BASE_URL}/current.json`,
        params: {
            key: process.env.WEATHER_API_KEY,
            q: query,
            aqi: airQuality
        }
    })

    const { data } = response
    console.log({ data })
    res.send({ data })
})



app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})

