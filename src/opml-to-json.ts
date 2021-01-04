// @ts-expect-error: no types
import OpmlParser from "opmlparser";

function shallowCopy<T extends (Parent | Item)>(oldObj: T): T {
    return {
        ...oldObj
    }
}

type Item = {
    [index in string]: object
}
type Parent = {
    children: (Parent | Item)[]
}

const isParent = (node: unknown): node is Parent => {
    return typeof node === "object" && node !== null && "children" in node;
}

function flatJSON<T extends (Parent | Item)>(root: T): T {
    const copyNode = shallowCopy(root);
    if (isParent(root) && isParent(copyNode)) {
        const children = root.children;
        copyNode.children = Object.keys(children).map(function (key) {
            // @ts-expect-error: FIXME
            const item = children[key];
            if (!item) {
                return
            }
            return flatJSON(item);
        });
        copyNode.children = copyNode.children.filter(function (node) {
            return Object.keys(node).length > 0;
        });
    }
    // @ts-ignore
    delete copyNode["#id"];
    // @ts-ignore
    delete copyNode["#parentid"];
    return copyNode;
}

type OpmlObject = {
    [P in "#id" | "#parentid" | string | number]: any
}
export type opmlToJsonResult = {
    "title": "title",
    "children": (Parent | Item)[]
}
export const opmlToJSON = function (xml: string): Promise<opmlToJsonResult> {
    const opmlparser = new OpmlParser();
    const index: OpmlObject = {};
    return new Promise((resolve, reject) => {

        opmlparser.on('error', done);
        opmlparser.on('readable', function (this: OpmlParser) {
            var outline;
            while (outline = this.read()) {
                // @ts-ignore
                index[outline['#id']] = outline;
            }
        });
        opmlparser.on('end', function (this: OpmlParser) {
            const stack: any[] = Object.keys(index).reduce(function (stack, id) {
                let outline = index[id];
                let i;
                let children;
                if (stack[0]['#id'] === outline['#parentid']) {
                    stack[0].children || (stack[0].children = {});
                    // @ts-expect-error: FIXME
                    stack[0].children[id] = outline;
                } else if (stack[0].children && outline['#parentid'] in stack[0].children) {
                    // @ts-expect-error: FIXME
                    stack.unshift(stack[0].children[outline['#parentid']]);
                    stack[0].children || (stack[0].children = {});
                    // @ts-expect-error: FIXME
                    stack[0].children[id] = outline;
                } else {
                    // unwind the stack as much as needed
                    for (i = stack.length - 1; i >= 0; i--) {
                        children = stack.shift();
                        // @ts-expect-error: FIXME
                        stack[0].children[children['#id']] = children;
                        if (stack[0]['#id'] === outline['#parentid']) {
                            // @ts-expect-error: FIXME
                            stack[0].children[id] = outline;
                            break;
                        }
                    }
                }
                return stack;
            }, [
                { 'title': this.meta.title || 'root', '#id': 0, children: {} }
            ]);
            let flat = flatJSON(stack.pop());
            resolve(flat);
        });

        opmlparser.end(xml);

        function done(err?: Error) {
            if (err) {
                reject(err);
            }
        }

    })
};
