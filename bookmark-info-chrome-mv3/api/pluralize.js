import { pluralRules, singularRules, uncountables, irregularPlurals, irregularSingles  } from './pluralize-rules.js';

const isHasOwnProperty = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)

function restoreCase (word, token) {
  // Tokens are an exact match.
  if (word === token) return token;

  // Lower cased words. E.g. "hello".
  if (word === word.toLowerCase()) return token.toLowerCase();

  // Upper cased words. E.g. "WHISKY".
  if (word === word.toUpperCase()) return token.toUpperCase();

  // Title cased words. E.g. "Title".
  if (word[0] === word[0].toUpperCase()) {
    return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
  }

  // Lower cased words. E.g. "test".
  return token.toLowerCase();
}

function interpolate (str, args) {
  return str.replace(/\$(\d{1,2})/g, function (match, index) {
    return args[index] || '';
  });
}

function replace (word, rule) {
  return word.replace(rule[0], function (match, index) {
    var result = interpolate(rule[1], arguments);

    if (match === '') {
      return restoreCase(word[index - 1], result);
    }

    return restoreCase(match, result);
  });
}

function sanitizeWord (token, word, rules) {
  // Empty string or doesn't need fixing.
  if (!token.length || isHasOwnProperty(uncountables, token)) {
    return word;
  }

  var len = rules.length;

  // Iterate over the sanitization rules and use the first one to match.
  while (len--) {
    var rule = rules[len];

    if (rule[0].test(word)) return replace(word, rule);
  }

  return word;
}

function replaceWord (replaceMap, keepMap, rules) {
  return function (word) {
    // Get the correct token and case restoration functions.
    var token = word.toLowerCase();

    // Check against the keep object map.
    if (isHasOwnProperty(keepMap, token)) {
      return restoreCase(word, token);
    }

    // Check against the replacement map for a direct word replacement.
    if (isHasOwnProperty(replaceMap, token)) {
      return restoreCase(word, replaceMap[token]);
    }

    // Run all the rules against the word.
    return sanitizeWord(token, word, rules);
  };
}

function checkWord (replaceMap, keepMap, rules) {
  return function (word) {
    var token = word.toLowerCase();

    if (isHasOwnProperty(keepMap, token)) return true;
    if (isHasOwnProperty(replaceMap, token)) return false;

    return sanitizeWord(token, token, rules) === token;
  };
}

// eslint-disable-next-line no-unused-vars
const plural = replaceWord(
  irregularSingles, irregularPlurals, pluralRules
);

// eslint-disable-next-line no-unused-vars
const isPlural = checkWord(
  irregularSingles, irregularPlurals, pluralRules
);

export const singular = replaceWord(
  irregularPlurals, irregularSingles, singularRules
);

// eslint-disable-next-line no-unused-vars
const isSingular = checkWord(
  irregularPlurals, irregularSingles, singularRules
);
