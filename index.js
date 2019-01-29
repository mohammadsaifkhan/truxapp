'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
// const API_KEY = require('./apiKey');
// const request = require('request');

const app = express();
const http = require('http').server(app);
server.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
res.json("hello");
    const dst = req.body.queryResult.parameters.destination;
    const src = req.body.queryResult.parameters.source;
    const vh_type = req.body.queryResult.parameters.vehicletype;
    const bd_type = req.body.queryResult.parameters.bodytype; 
    const pay_type = req.body.queryResult.parameters.payloadcapacity; 
    const date = req.body.queryResult.parameters.searchdate; 

    var options = {method: 'POST',
        url: 'http://52.221.70.49:5032/api/v1/lane_search',
        qs: 
        { 
         source: src,
         destination:dst ,
         vehicletype: vh_type,
         bodytype: bd_type,
         payloadcapacity: pay_type,
         searchdate: date 
        }
    };
    http.get(options, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            const trux = JSON.parse(completeResponse);
            dataToSend += `From ${src}  to ${dst} of vehicle type ${vh_type} the rate of turx is ${trux.values.trux_assured_rate} and the average rate is ${trux.values.average_rate}`;

            return res.json({
                speech: dataToSend,
                displayText: dataToSend,
                source: 'get-details'
            });
        });
    }, (error) => {
        return res.json({
            speech: 'Something went wrong!',
            displayText: 'Something went wrong!',
            source: 'get-details'
        });
    });
 });

http.listen(8080), () => {
    console.log("Server is up and running...");
});

