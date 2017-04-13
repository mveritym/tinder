var { TOKEN, ID } = require('./../secrets.js');
var tinder = require('tinder');
var client = new tinder.TinderClient();
var db = require('../db');

const messageGetFactory = (func) => (resolve, reject) => () => {
  func((err, data) => {
    if (err) { reject(err); }
    else {
      console.log(data);
      resolve(
        data.matches.map(match => ({
          id: match.person._id,
          name: match.person.name,
          messages: match.messages
        }))
      );
    }
  });
}

const getHistory = messageGetFactory(client.getHistory);
const getUpdates = messageGetFactory(client.getUpdates);

const runAsync = (cb) => new Promise((resolve, reject) => {
  client.authorize(TOKEN, ID, cb(resolve, reject));
});

const processMatches = (matches) => {
  const messagedMe = matches.filter(match => match.messages.length > 0);
  console.log(matches.length);
  if (messagedMe.length === 0) console.log('No new matches');
  messagedMe.forEach(async match => {
    const result = await db.saveMessage({
      _id: match.id,
      name: match.name,
      messages: match.messages.map(msg => msg.message).join('\n')
    });
    console.log(result);
  });
};

const getMessageHistory = async () => {
  const matches = await runAsync(getHistory);
  processMatches(matches);
};

const watchForMessageUpdates = () => {
  setTimeout(async () => {
    const matches = await runAsync(getUpdates);
    processMatches(matches);
    watchForMessageUpdates();
  }, 5000);
}

getMessageHistory();
watchForMessageUpdates();
