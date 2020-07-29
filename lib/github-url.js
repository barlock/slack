// FIXME: replace this with a legit npm module, preferrably one that already exists
/* eslint-disable no-useless-escape, guard-for-in, no-restricted-syntax */

const url = require('url');
const { named } = require('named-regexp');

const host = process.env.GHE_HOST || 'ithub.com';
const protocol = process.env.GHE_PROTOCOL || 'https';
const githubUrl = `${protocol}:\/\/${host}`;
const base = `(?:${githubUrl}\/)?`;
const owner = '(:<owner>[^\/]+)';
const repo = '(:<repo>[^\/]+)';
const nwo = `${base}${owner}\/${repo}`;
const line = 'L(:<line>\\d+)';

const routes = {
  account: `^${base}${owner}$`,
  blob: `^${nwo}\/blob/(:<ref>[^\/]+)\/(:<path>.+?)(?:#${line}(?:-${line})?)?$`,
  comment: `^${nwo}\/(?:issues|pull)\/(:<number>\\d+)#issuecomment-(:<id>\\d+)`,
  issue: `^${nwo}(?:\/issues\/|#)(:<number>\\d+)$`,
  pull: `^${nwo}\/pull\/(:<number>\\d+)$`,
  repo: `^${nwo}$`,
};

module.exports = (uri) => {
  for (const type in routes) {
    const match = named(new RegExp(routes[type])).exec(uri);
    if (match) {
      const result = {
        type,
      };
      Object.keys(match.captures).forEach((name) => {
        const values = match.captures[name].filter(value => value !== undefined);
        if (values.length > 1) {
          result[name] = values;
        } else if (match.captures[name][0] !== undefined) {
          // eslint-disable-next-line prefer-destructuring
          result[name] = values[0];
        }
      });
      return result;
    }
  }
};

module.exports.apiBaseUrl = `${protocol}://api.${host}`;
module.exports.host = host;
module.exports.resolve = (path) => url.resolve(githubUrl, path);
