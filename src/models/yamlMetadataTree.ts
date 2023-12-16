class YamlMetadataTreeNode {
    key: string;
    value: string;
    inlineComment: string;
    commentsAbove: string[];
    children: YamlMetadataTreeNode[];

    static readonly N_SPACES_BEFORE_INLINE_COMMENT = 8;

    constructor(key: string, value: string, inlineComment = "") {
        this.key = key;
        this.value = value;
        this.inlineComment = inlineComment;
        this.commentsAbove = [];
        this.children = [];
    }

    addChild(node: YamlMetadataTreeNode) {
        this.children.push(node);
    }

    addCommentAbove(comment: string) {
        this.commentsAbove.push(comment);
    }

    public toString(indentationLevel = 0): string {
        let result = "";
        let indentationString: string;

        if (this.key.startsWith("-")) {
            indentationString = " ".repeat(indentationLevel - 2);
        } else {
            indentationString = " ".repeat(indentationLevel);
        }

        this.commentsAbove.forEach((comment) => {
            result += indentationString + comment + "\n";
        });

        result += indentationString + `${this.key}: ${this.value}`;
        if (this.inlineComment) {
            result +=
                " ".repeat(YamlMetadataTreeNode.N_SPACES_BEFORE_INLINE_COMMENT) +
                this.inlineComment;
        }
        result += "\n";

        if (this.value === "") {
            this.children.forEach((child) => {
                result += child.toString(indentationLevel + 4);
            });
        } else {
            this.children.forEach((child) => {
                result += child.toString(indentationLevel + 2);
            });
        }

        return result;
    }
}

export class YamlMetadataTree {
    root: YamlMetadataTreeNode;
    currentNode: YamlMetadataTreeNode;
    endComments: string[];

    constructor(yamlConfigurationString: string) {
        this.root = new YamlMetadataTreeNode("", "");
        this.currentNode = this.root;
        this.endComments = [];

        const lines = yamlConfigurationString.split("\n");
        const stack: YamlMetadataTreeNode[] = [];
        let inlineComment = "";
        let commentsAbove: string[] = [];

        for (let line of lines) {
            const commentIndex = line.indexOf("#");
            if (commentIndex !== -1) {
                inlineComment = line.slice(commentIndex);
                line = line.slice(0, commentIndex);
            } else {
                inlineComment = "";
            }

            if (line.trim() === "") {
                commentsAbove.push(inlineComment);
                continue;
            }

            const indent = line.search(/\S/) / 2;
            console.log(`${indent}: ${line}`);
            line = line.trim();

            while (stack.length > indent) {
                this.currentNode = stack.pop() || this.root;
            }

            const [key, value] = line.split(":");
            const trimmedKey = key.trim();
            const trimmedValue = value ? value.trim() : "";

            const newNode = new YamlMetadataTreeNode(trimmedKey, trimmedValue, inlineComment);
            for (const commentAbove of commentsAbove) {
                newNode.addCommentAbove(commentAbove);
            }
            commentsAbove = [];
            this.currentNode.addChild(newNode);

            if (trimmedValue === "") {
                stack.push(this.currentNode);
                this.currentNode = newNode;
            }
        }

        this.endComments = commentsAbove;
    }

    public toString(): string {
        let result = "";
        this.root.children.forEach((child) => {
            result += child.toString();
        });

        return result;
    }
}

import * as fs from "fs";
const testYaml = fs.readFileSync("genezioYamlExample.yaml", "utf8");
const yamlTree = new YamlMetadataTree(testYaml);
console.log(JSON.stringify(yamlTree, null, 2));
fs.writeFileSync("genezioYamlExampleOutput.yaml", yamlTree.toString());
