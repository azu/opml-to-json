# opml-to-json [![Build Status](https://travis-ci.org/azu/opml-to-json.svg)](https://travis-ci.org/azu/opml-to-json)

Convert OPML to JSON(JavaScript Object).

## Installation

``` sh
npm install opml-to-json
```

## Usage

Example OPML file.

``` xml
<?xml version="1.0" encoding="utf-8"?>
<opml version="1.0">
  <head>
    <title>title</title>
    <expansionState>0,2</expansionState>
  </head>
  <body>
    <outline text="H1">
      <outline text="H2 Text"/>
      <outline text="H2">
        <outline text="text"/>
      </outline>
    </outline>
    <outline text="H1 text"/>
  </body>
</opml>
```

```js
opmlToJSON(xmlString, function (error, json) {
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
});
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT