var request = require("request");
var testIndex = require("../index.js")
const Config = require('../const.js');
//var base_url = "http://localhost:5000/"
var base_url = Config.TEST_BASE_URL

describe("API Test", function(){
  describe("GET /", function() {
    it("returns status code 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();

      });
    });
    it("returns Hello World", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(body).toBe("Hello world, I am a chat bot");
        done();
      });
    });
  });
  describe("GET /webhook/", function() {
    it("returns status code 200", function(done) {
      request.get(base_url+"webhook/", function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it("verify error for wrong token ", function(done) {
      request.get(base_url+"webhook/", function(error, response, body) {
        console.log(base_url+"webhook/");
        expect(body).toBe("Error, wrong token");
        testIndex.closeServer();
        done();
      });
    });
  });
  
});