const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const app = express();
const port = parseInt((process.env.PORT || 1337), 10);
const Player = require('./Player');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', (req, res) => {
  const player = new Player()

  const { action, game_state } = req.body;

  switch (action) {
    case 'version':
      res.send(player.VERSION);
      break;
    case 'bet_request':
      player.betRequest(JSON.parse(game_state), function(bet) {
        res.json(bet);
      });
      break;
    case 'showdown':
      player.showdown(JSON.parse(game_state));
      res.send('Ok');
      break;
    case 'check':
      res.send('Ok');
      break;
    default:
      res.send('Unknown action');
  }
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server listening at: localhost:${port}`);
});
