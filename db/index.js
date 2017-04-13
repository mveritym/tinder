const path = require('path');
const Datastore = require('nedb');
const db = new Datastore({ filename: path.join(__dirname, 'messages.db'), autoload: true });

const exists = (query) => new Promise((resolve, reject) =>
  db.find(query, (err, docs) => resolve(docs.length > 0))
);

const saveMessage = (message) => new Promise(async (resolve, reject) => {
  let alreadySaved = await exists({ _id: message._id });

  if (!alreadySaved) {
    db.insert(message, (err, data) => {
      if (err) reject(err);
      resolve(`Saved message from ${message.name}`);
    });
  } else {
    resolve(`Message from ${message.name} is already saved`);
  }
});

const readMessages = () => new Promise((resolve, reject) => {
  db.find({}, (err, result) => {
    if (err) reject(err);
    resolve(result);
  });
});

module.exports = {
  saveMessage,
  readMessages
};
