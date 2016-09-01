var assert = require('assert')
  , FreshBooks = require('../');

describe('Category', function() {
  var freshbooks = new FreshBooks("https://freshbooksjs.freshbooks.com/api/2.1/xml-in","59dbd7310470641ff2332bd016ac2e4e")
    , category = new freshbooks.Category();

  describe("create()", function() {
    it("should create a new category", function(done) {
      category.name = "Test Category " + Date.now();

      category.create(function(err, category) {
        done(err);
      });
    });
  });

  describe("update()", function() {
    it("should update a category", function(done) {
      category.name = "Test Category " + Date.now();

      category.update(function(err, category) {
        done(err);
      });
    });
  });

  describe("get()", function() {
    it("should get a category", function(done) {
      category.get(category.category_id, function(err, category) {
        done(err);
      });
    });
  });

  describe("list()", function() {
    it("should list an array of categories", function(done) {
      category.list({"client_id": category.client_id}, function(err, categories) {
        done(err);
      });
    });
  });

  describe("delete()", function() {
    it("should delete a category", function(done) {
      category.delete(function(err, category) {
        done(err);
      });
    });
  });
});
