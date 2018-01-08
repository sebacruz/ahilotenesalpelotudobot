const path = require('path');
const Snoowrap = require('snoowrap');
const { Client } = require('pg')

const pkg = require(path.resolve(__dirname, 'package.json'));

const reddit = new Snoowrap({
  userAgent: `${pkg.name}/${pkg.version}`,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

reddit.config({ debug: true });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

const VIDEO_URL = 'https://www.youtube.com/watch?v=sRJxOfSO_Lc';
const REPLY_TEXT = `[Ahí lo tenés al pelotudo](${VIDEO_URL})`;

const processComments = comments => {
  for (let comment of comments) {
    const body = comment.body.toLowerCase();

    if (body.includes('ahi lo tenes al pelotudo')) {
      console.info('Replying to comment `%s`', comment.id);

      comment.reply(REPLY_TEXT);

      const query = {
        text: 'INSERT INTO replies (comment_id, link_id) VALUES ($1, $2)',
        values: [comment.id, comment.link_id]
      }

      client.query(query)
        .then(() => {});
    }
  }

  process.exit();
};

const getComments = (after = null) => {
  let args = {};

  if (after) {
    args.after = after;
  }

  reddit.getSubreddit(process.env.REDDIT_SUBREDDIT)
    .getNewComments(args)
    .then(processComments)
    .catch(err => {
      console.log(err);
    });
}

client.query('SELECT * FROM replies ORDER BY replied_at DESC LIMIT 1')
  .then(result => {
    let afterOf = null;

    if (result.rowCount) {
      afterOf = result.rows[0].comment_id;
    }

    getComments(afterOf);
  });
