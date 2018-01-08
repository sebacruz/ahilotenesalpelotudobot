const path = require('path');
const Snoowrap = require('snoowrap');

const pkg = require(path.resolve(__dirname, 'package.json'));

const reddit = new Snoowrap({
  userAgent: `${pkg.name}/${pkg.version}`,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

reddit.config({ debug: true });

const VIDEO_URL = 'https://www.youtube.com/watch?v=sRJxOfSO_Lc';
const REPLY_TEXT = `[Ahí lo tenés al pelotudo](${VIDEO_URL})`;

const processComments = comments => {
  for (let comment of comments) {
    const body = comment.body.toLowerCase();

    if (body.includes('ahi lo tenes al pelotudo')) {
      comment.reply(REPLY_TEXT);
    }
  }
};

reddit.getSubreddit(process.env.REDDIT_SUBREDDIT)
  .getNewComments()
  .then(processComments)
  .catch(err => {
    console.log(err);
  });
