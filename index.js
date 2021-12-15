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
    const query = req.body.q ? req.body.q : 98144
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
    const weatherData = response.data.current
    const locationData = response.data.location
    const location = new Location(
        locationData.name, 
        locationData.region, 
        locationData.country,
    )

    const condition = new Condition(
        weatherData.condition.text,
        weatherData.condition.icon,
    )

    clothingStore.getByTempF(weatherData.feelslike_f, condition.name, function(clothingItems) {
        const data = new WeatherViewObject(
            location,
            weatherData.temp_c,
            weatherData.feelslike_c,
            weatherData.temp_f,
            weatherData.feelslike_f,
            weatherData.is_day,
            condition,
            clothingItems,
        )
        res.send(data)
    })    
})

const firebase = require('firebase-admin')

const serviceAccount = require('./serviceAccountKey.json')
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URI
})

app.get('/test', async (req, res) => {
    const db = firebase.database()
    const ref = db.ref('clothingItems')

    ref.on('value', (snapshot) => {
        const data = snapshot.val()
        console.log(data);
        res.send(data)
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    });
    
})

//TODO: clothingItems: []
class Location {
    constructor(city, region, country) {
        this.city = city
        this.region = region
        this.country = country
    }
}

class Condition {
    constructor(name, imageUrl) {
        this.name = name
        this.imageUrl = imageUrl
    }
}

class WeatherViewObject {
    constructor(
        location, 
        tempCelsius, 
        tempCelsiusFeelLike, 
        tempFahrenheit, 
        tempFahrenheitFeelLike, 
        isDay, 
        condition,
        clothingItems,
    ) {
        this.location = location
        this.tempCelsius = tempCelsius
        this.tempCelsiusFeelLike = tempCelsiusFeelLike
        this.tempFahrenheit = tempFahrenheit
        this.tempFahrenheitFeelLike = tempFahrenheitFeelLike
        this.isDay = isDay
        this.condition = condition
        this.clothingItems = clothingItems
    }
}

class ClothingItem {
    constructor(name, fMax, fMin, imageUrl, specialCondition) {
        this.name = name
        this.fahrenheitMax = fMax
        this.fahrenheitMin = fMin
        this.imageUrl = imageUrl
        this.specialCondition = specialCondition
    }
}

class MockClothingStore {
    getByTempF(f, specialCondition, callback) {
        const data = [
            new ClothingItem("Cardigan", 65, 50, "https://storage.googleapis.com/clothing-icons/004-cardigan.svg", "None"),
            new ClothingItem("Cardigan", 65, 50, "https://storage.googleapis.com/clothing-icons/004-cardigan.svg", "None"),
            new ClothingItem("Cardigan", 65, 50, "https://storage.googleapis.com/clothing-icons/004-cardigan.svg", "None"),
        ]
        callback(data)
    }      
}

class FireBaseSnapshotClothingStore {
    getByTempF(f, specialCondition, callback) {
        const db = firebase.database()
        const ref = db.ref('clothingItems')

        ref.on('value', (snapshot) => {
            const data = snapshot.val()
            console.log(data);
            let clothingItems = []
            
            for (const [key, value] of Object.entries(data)) {
                const clothingItem = new ClothingItem(key, value.temp_f_max, value.temp_f_min, value.url)
                if (clothingItem.fahrenheitMax < f || clothingItem.fahrenheitMin > f) {
                    continue
                }
                clothingItems.push(clothingItem)
            }
            console.log(clothingItems);
            callback(clothingItems)
        }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
        });
    }
}

const clothingStore = new FireBaseSnapshotClothingStore()

app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})

