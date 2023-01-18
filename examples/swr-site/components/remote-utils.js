/* eslint-disable */
const path = require("node:path");
const git = require("isomorphic-git");
const http = require("isomorphic-git/http/node");
const fs = require("node:fs");

async function listFiles({
  dirPath = ".next/cache/nextra-remote",
  url = "https://github.com/B2o5T/graphql-eslint",
} = {}) {
  const dir = path.join(process.cwd(), dirPath);

  await git.clone({ fs, http, dir, url });

  const filenames = git.listFiles({ fs, http, dir });

  return filenames;
}

module.exports = { listFiles };
