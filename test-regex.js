const md = `## Constraints
## Problem Statement
tree of server nodes.`;

const titleMatch = md.match(/^#+\s*(.+)(?:\r?\n|$)/m);
console.log("Title match:", titleMatch ? titleMatch[1] : "null");
