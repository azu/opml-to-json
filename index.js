"use strict";
var OpmlParser = require('opmlparser');
function shallowCopy(oldObj) {
    var newObj = {};
    for (var i in oldObj) {
        if (oldObj.hasOwnProperty(i)) {
            newObj[i] = oldObj[i];
        }
    }
    return newObj;
}

function flatJSON(root) {
    var copyNode = shallowCopy(root);
    if (root.children) {
        copyNode.children = Object.keys(root.children).map(function (key) {
            return flatJSON(root.children[key]);
        });
        copyNode.children = copyNode.children.filter(function (node) {
            return Object.keys(node).length > 0;
        });
    }
    delete copyNode["#id"];
    delete copyNode["#parentid"];
    return copyNode;
}
module.exports = function (xml, callback) {
    var opmlparser = new OpmlParser();
    var index = {};
    opmlparser.on('error', done);
    opmlparser.on('readable', function () {
        var outline;
        while (outline = this.read()) {
            index[outline['#id']] = outline;
        }
    });
    opmlparser.on('end', function () {
        var stack = Object.keys(index).reduce(function (stack, id) {
            var outline = index[id]
                , i
                , children;
            if (stack[0]['#id'] === outline['#parentid']) {
                stack[0].children || (stack[0].children = {});
                stack[0].children[id] = outline;
            }
            else if (stack[0].children && outline['#parentid'] in stack[0].children) {
                stack.unshift(stack[0].children[outline['#parentid']]);
                stack[0].children || (stack[0].children = {});
                stack[0].children[id] = outline;
            }
            else {
                // unwind the stack as much as needed
                for (i = stack.length - 1; i >= 0; i--) {
                    children = stack.shift();
                    stack[0].children[children['#id']] = children;
                    if (stack[0]['#id'] === outline['#parentid']) {
                        stack[0].children[id] = outline;
                        break;
                    }
                }
            }
            return stack;
        }, [
            { 'title': this.meta.title || 'root', '#id': 0, children: {} }
        ]);
        callback(null, flatJSON(stack[0]));
    });

    opmlparser.end(xml);

    function done(err) {
        if (err) {
            callback(err, null);
        }
    }
};