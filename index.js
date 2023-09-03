const express = require('express');

const app = express();
app.use(express.urlencoded())
app.use(express.json())
app.use(express.text())
app.use(require('cors')())
const axios = require("axios").default;


app.post('/query', async (req, res) => {
    const { query, location } = req.body
    console.log(req.body);

    axios.request({
        method: 'GET',
        url: `http://api.weatherapi.com/v1/forecast.json?key=bd8919bc14d4471ba33115059230309&q=${location}&days=10&aqi=no&alerts=no`
    }).then(r => r.data).then(r => {
        return r.forecast.forecastday.map(fore => fore.day)
    }).then(weather => {

        const options = {
            method: "POST",
            url: "https://api.edenai.run/v2/text/chat",
            headers: {
                authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDk3ZThiMjgtYWFmMC00ZTgyLThjMDktZWExZDZhMTdiZDFiIiwidHlwZSI6ImFwaV90b2tlbiJ9.0y5raNnPU3y2pVI85wpw5R8uIryRc1X_5tvvzCsaRsE",
            },
            data: {
                providers: "openai",
                text: `Location:${location}\nWeather:${JSON.stringify(weather)}\n\nQuery: ${query}`,
                chatbot_global_action: `You are a chatbot assistant for chat-bots you will be given location and weather data in json format along with a user query in separate lines. Your job is to provide a helpful response for the user query using both location and weather data if necessary.`,
                openai: "gpt-4",
                previous_history: [],
                temperature: 0.0,
                max_tokens: 500,
            },
        };

        axios
            .request(options)
            .then((response) => {
                res.json(response.data)
            })
            .catch((error) => {
                console.error(error);
                res.errored("failed: " + error)
            });
    }).catch((err) => {
        res.errored("failed: " + error)
    })

})
const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
    console.log("Server running at... ", PORT);
})
