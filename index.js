// const http = require('http')
// const hostname = '127.0.0.1'
const express = require('express')
const port = 3000
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()

const app = express()

app.get('/', async (req, res) => {
    const response = await axios({
        method: 'GET',
        url: `${process.env.WEATHER_BASE_URL}/current.json`,
        params: {
            key: process.env.WEATHER_API_KEY,
            q: 'Seattle',
            aqi: 'no',
            lang: 'en'
        }
    })

    const { data } = response
    res.send({ data })
})

app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})

