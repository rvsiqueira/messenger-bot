'use strict';

// Wit.ai parameters
const WIT_TOKEN = process.env.WIT_TOKEN;
if (!WIT_TOKEN) {
  throw new Error('missing WIT_TOKEN');
}

// Messenger API parameters
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;

var FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
if (!FB_VERIFY_TOKEN) {
  FB_VERIFY_TOKEN = "my_voice_is_my_password_verify_me";
}

var TEST_BASE_URL = process.env.TEST_BASE_URL;
if (!TEST_BASE_URL) {
  TEST_BASE_URL = "http://localhost:5000/";
}

module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_ACCESS_TOKEN: FB_PAGE_ACCESS_TOKEN,
  FB_PAGE_ID: FB_PAGE_ID,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
  TEST_BASE_URL: TEST_BASE_URL,
};