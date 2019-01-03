'use strict';

const http = require('http');
const functions = require('firebase-functions');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((req, res) => {
  // Get the city and date from the request
  let src = req.body.queryResult.parameters['source']; // city is a required param
  let dest = req.body.queryResult.parameters['destination'];
  let vh_type = req.body.queryResult.parameters['vehicletype'];
  let bd_type = req.body.queryResult.parameters['bodytype'];
  let pay_type = req.body.queryResult.parameters['payloadcapacity'];

  // Get the date for the weather forecast (if present)
  let date = '';
  if (req.body.queryResult.parameters['searchdate']) {
    date = req.body.queryResult.parameters['searchdate'];
    console.log('Date: ' + date);
  }

  // Call the weather API
  callApi(src, dest, vh_type, date).then((output) => {
    res.json({ 'fulfillmentText': output }); // Return the results of the weather API to Dialogflow
  }).catch(() => {
    res.json({ 'fulfillmentText': `some error has occured!` });
  });
});

function callApi (src, dest, vh_type, date,bd_type,pay_type) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the api
    var options = {method: 'POST',
        url: 'http://52.221.70.49:5032/api/v1/lane_search',
        qs: 
        { 
         source: src,
         destination:dest ,
         vehicletype: vh_type,
         bodytype: 'Open%20Body',
         payloadcapacity: '40%20Ton',
         searchdate: '2018-27-12' 
        }
     };
    // Make the HTTP request to get the weather
    http.post(options, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        let trux_rate = response['values']['trux_assured_rate'][0];
        let avg_rate = response['values']['average_rate'][0];
        
        // Create response
        let output = `Current rates from ${src} to  
        ${dest} of trux is ${trux_rate}  and average rate is ${avg_rate}`;

        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        console.log(`Error calling the weather API: ${error}`)
        reject();
      });
    });
  });
}
