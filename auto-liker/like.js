var { TOKEN, ID } = require('./../secrets.js');
var tinder = require('tinder');
var client = new tinder.TinderClient();

const getProfileInfo = (resolve, reject) => () => {
  const defaults = client.getDefaults();
  const recs_size = defaults.globals.recs_size;
  client.getRecommendations(recs_size, async (error, data) => {
    if (error) reject(error);
    resolve(data.results.map(({ _id, name }) => ({ id: _id, name })));
  });
};

const likeProfile = (id, name) => (resolve, reject) => () => {
  client.like(id, (error, data) => {
    if (error) reject(error);
    resolve();
  });
};

const runAsync = (cb) => new Promise((resolve, reject) => {
  client.authorize(TOKEN, ID, cb(resolve, reject));
});

const likeProfiles = async () => new Promise(async (resolve, reject) => {
  const profileInfo = await runAsync(getProfileInfo);
  const numProfiles = profileInfo.length;

  profileInfo.forEach((profile, i) => {
    setTimeout(async () => {
      const {id, name} = profileInfo.shift();
      await runAsync(likeProfile(id, name));
      console.log(`Liked ${name}`);
      if (i + 1 === numProfiles) resolve();
    }, i * 1000);
  });
});

const recursiveLike = async () => {
  await likeProfiles();
  recursiveLike();
};
//
// console.log(ID);
// console.log(TOKEN);
recursiveLike();
