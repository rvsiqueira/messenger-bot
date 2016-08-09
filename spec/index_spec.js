var request = require("request");
var testIndex = require("../index.js")
var base_url = "http://localhost:5000/"

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
        testIndex.closeServer();
        done();
      });
    });
  });
});