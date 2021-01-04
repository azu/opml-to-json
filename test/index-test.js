"use strict";
import fs from "fs";
import assert from "assert";
import { opmlToJSON } from "../src/opml-to-json";

describe("opml-to-json", function () {
    it("should return object", async function () {
        const xml = fs.readFileSync(__dirname + "/fixtures/test.opml");
        const json = await opmlToJSON(xml);
        const expected = {
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
        assert.deepStrictEqual(json, expected);
    });
});
