"use strict";
var assert = require("power-assert");
var fs = require("fs");
var opmlToJSON = require("../");
describe("opml-to-json", function () {
    it("should return object", function (done) {
        var xml = fs.readFileSync(__dirname + "/fixtures/test.opml");
        opmlToJSON(xml, function (error, json) {
            var expected = {
                "title": "title",
                "children": [
                    {"text": "H1", "children": [
                        {"text": "H2 Text"},
                        {"text": "H2", "children": [
                            {"text": "text"}
                        ]}
                    ]},
                    {"text": "H1 text"}
                ]};
            assert.deepEqual(json, expected);
            done();
        });
    });
});