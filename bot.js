#!/usr/bin/env node

const path = require('path');
const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
const { Client } = require('pg');
const removeAccents = require('remove-accents');

const pkg = require(path.resolve(__dirname, 'package.json'));

const SEARCH_STRING = 'ahi lo tenes al pelotudo';
const VIDEO_URL = 'https://www.youtube.com/watch?v=sRJxOfSO_Lc';
const REPLY_TEXT = `[Ahí lo tenés al pelotudo](${VIDEO_URL})`;

const reddit = new Snoowrap({
  userAgent: `${pkg.name}/${pkg.version}`,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
  debug: true
});

const client = new Snoostorm(reddit);

const comments = client.CommentStream({
  subreddit: process.env.REDDIT_SUBREDDIT
});

const replyToComment = comment => {
  console.info('Replying to comment `%s`', comment.id);

  comment.reply(REPLY_TEXT);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  client.connect();

  const query = {
    text: 'INSERT INTO replies (comment_id, link_id) VALUES ($1, $2)',
    values: [comment.id, comment.link_id]
  }

  client.query(query, (err, result) => {
    client.end();
  });
}

comments.on('comment', comment => {
  const body = removeAccents(comment.body.toLowerCase());

  if (body.includes(SEARCH_STRING) && comment.author.name !== 'AhiLoTenesAlPelotudo') {
    replyToComment(comment);
  }
});
