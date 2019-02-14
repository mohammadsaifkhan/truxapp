const express = require('express');
const bodyParser = require('body-parser');
const {
  dialogflow,
  BasicCard,
  Permission,
  Suggestions,
} = require('actions-on-google');

const server = express();
const app = dialogflow();
		
server.set('port', 5000);
server.use(bodyParser.json({type: 'application/json'}));

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
  conv.user.storage = {}; // to reset user data everytime 
  // console.log("my data: ",conv.user.storage);
  const name = conv.user.storage.userName;
  const typs = conv.user.storage.favType;
  const id   = conv.user.storage.favID;
  console.log("name:",name , " typs :",typs)
  if (!name) {
    // Asks the user's permission to know their name, for personalization.
    conv.ask(new Permission({
      context: 'Hi there, to get to know you better',
      permissions: 'NAME',
    }));
  } else if (!typs){
    conv.ask(`Hi again, ${name}. Are you a Shipper or Transporter?`);
    conv.ask(new Suggestions('Transporter', 'Shipper'));
  } else if(!id){
    conv.ask(`Hi again ${name}. As I remember you are ${typs}`);
    conv.ask(`Please type your ClientID(e.g. CR0001)?`);
  }else{
    const parameters = {
    'types':typs
    };
    if (typs === "Transporter"){
      conv.contexts.delete('typeshipper');
      conv.contexts.set('typetransporter', 1, parameters);
    }
    else if (typs === "Shipper"){
      conv.contexts.delete('typetransporter');
      conv.contexts.set('typeshipper', 1, parameters);
    }
    else{
      console.log("nothing selected")
    }
    conv.ask(`Hi again, ${name}. You are  ${typs} with ClientID ${id}.`);
    conv.ask(`What would you like to know?`);
  }
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.

 app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    // If the user denied our request, go ahead with the conversation.
    conv.ask(`Need your name in order to remember your preferences`);
    // conv.ask(new Suggestions('Blue', 'Red', 'Green'));
  } else {
    // If the user accepted our request, store their name in
    // the 'conv.user.storage' object for future conversations.
    conv.user.storage.userName = conv.user.name.display;
    conv.ask(`Thanks, ${conv.user.storage.userName}. ` +
      `Are you a Shipper or Transporter?`);
    conv.ask(new Suggestions('Transporter', 'Shipper'));
  }
});


app.intent('TYPES', (conv, {types}) => {
  conv.user.storage.favType = types;

  if (types === "Transporter"){
    conv.ask("Hey transporter. Please type your ClientID (e.g. CR0001)?")
  }
  else if (types === "Shipper"){
    conv.ask("Hey Shipper. Please type your ClientID (e.g. CR0001)?")
  }
  else{
    console.log("nothing selected")
  }
  // console.log(conv.contexts.get("typeout").parameters["types"]);
  // console.log(conv.user.storage);
  
});

app.intent('ClientID', (conv, { ID }) => {
  // console.log("In ClientID")
  if(ID){
    // console.log(ID)
    ID = ID.trim();
    if ((ID.length == 6) && (ID.substr(0,2) == "CR") && (/^\d+$/.test(ID.substr(2,6)))){
      const name = conv.user.storage.userName;
      const typs = conv.user.storage.favType;
      conv.user.storage.favID = ID;
      const parameters = {
        'types':typs
      };
      if (typs === "Transporter"){
        conv.contexts.delete('typeshipper');
        conv.contexts.set('typetransporter', 1, parameters);
        console.log("t  Here");
        // conv.ask("Hey transporter. Can you please tell me your ClientID?")
      }
      else if (typs === "Shipper"){
        conv.contexts.delete('typetransporter');
        conv.contexts.set('typeshipper', 1, parameters);
        console.log("S  here");
        // conv.ask("Hey Shipper. Can you please tell me your ClientID?")
      }
      else{
        // conv.ask("Please Select vaalid option")
        console.log("nothing selected")
      }
      conv.ask(`Thank you, ${name}. for letting me know that you are ${typs} with ID ${ID} \n What would you like to know?`);
      console.log(conv.user.storage)
    }
  }else{
    conv.ask("Please TYPE Valid ClientID (e.g. CR0001)")
  }
});


app.intent('Rate_Enquiry', (conv, { source,destination,vehicletype,bodytype,payloadcapacity,searchdate }) => {
	conv.ask(`Source: ${source} 
			  destination : ${destination}
			  vehicletype : ${vehicletype}
			  bodytype : ${bodytype}
			  payloadcapacity : ${payloadcapacity}
			  searchdate : ${searchdate}`)

});
server.post('/webhook', app);

server.listen(server.get('port'), function () {
	console.log('Express server started on port', server.get('port'));
});


