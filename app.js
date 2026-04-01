// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});


app.post('/webhook',(req,res)=>{
  const body=req.body;

  if(body.object === 'whatsapp_business_account'){
    const entry= body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0]

    if(message?.type === 'text'){
    const userText = message.text.body.trim();

      if(userText.startsWith('/invoice')){
        const parts = userText.split(' ');
        const price = parts[1];
        const item = parts.slice(2).join(' ');

        console.log('--- COMMAND DETECTED ---')
        console.log('Command: INVOICE')'
        console.log(`amount: ${price}`)
        console.log(`Product: ${item}`)
      }

    }
    res.sendStatus(200);
  }else{
    res.sendStatus(404)
  }
})
// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
