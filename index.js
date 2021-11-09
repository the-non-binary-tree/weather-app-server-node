// const http = require('http')
// const hostname = '127.0.0.1'
const express = require('express')
const port = 3000
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()

// const server = http.createServer((req, res) => {
//     res.statusCode = 200
//     res.setHeader('Content-Type', 'text/plain')
//     res.end('Hello World\n')
// })
const app = express()
// app.get('/', (req, res) => {
//     res.send('Hello World')
// })

app.get('/', async (req, res) => {
    const response = await axios({
        method: 'GET',
        url: `${process.env.WEATHER_BASE_URL}/current.json?key=${process.env.WEATHER_API_KEY}&q=SeaTac&aqi=no$lang=en`
        // url: `http://api.weatherapi.com/v1/current.json?key=074ee11a96af4448b55205236210611&q=SeaTac&aqi=no&lang=en`
    })

    const { data } = response
    res.send({ data })
})
// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`)
// })
app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})

