/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */
import CodeNode = require('./CodeNode');
import MappingsContext = require('./MappingsContext');
import SourceNode = require('./SourceNode');
import { BaseNode } from './BaseNode';

class SourceListMap {
    children: BaseNode[];

    constructor(generatedCode: string | BaseNode | SourceListMap, source: string, originalSource: string)
    constructor(generatedCode: BaseNode[])

    constructor(generatedCode?, source?, originalSource?) {
        if (Array.isArray(generatedCode)) {
            this.children = generatedCode;
        }
        else {
            this.children = [];
            if (generatedCode || source) {
                this.add(generatedCode, source, originalSource);
            }
        }
    }

    add(generatedCode: string | BaseNode | SourceListMap, source?: string, originalSource?: string) {
        if (typeof generatedCode === 'string') {
            if (source) {
                this.children.push(new SourceNode(generatedCode, source, originalSource as string));
            }
            else if (this.children.length > 0 && (<CodeNode>this.children[this.children.length - 1]) instanceof CodeNode) {
                (<CodeNode>this.children[this.children.length - 1]).addGeneratedCode(generatedCode);
            }
            else {
                this.children.push(new CodeNode(generatedCode));
            }
        }
        else if ((<BaseNode>generatedCode).getMappings && (<BaseNode>generatedCode).getGeneratedCode) {
            this.children.push(<BaseNode>generatedCode);
        }
        else if ((<SourceListMap>generatedCode).children) {
            (<SourceListMap>generatedCode).children.forEach(function (sln) {
                this.children.push(sln);
            }, this);
        }
        else {
            throw new Error('Invalid arguments to SourceListMap.prototype.add: Expected string, Node or SourceListMap');
        }
    }

    prepend(generatedCode: SourceListMap | BaseNode, source?: string, originalSource?: string) {
        if (typeof generatedCode === 'string') {
            if (source) {
                this.children.unshift(new SourceNode(generatedCode, source, originalSource as string));
            } else {
                this.children.unshift(new CodeNode(generatedCode));
            }
        }
        else if ((<BaseNode>generatedCode).getMappings && (<BaseNode>generatedCode).getGeneratedCode) {
            this.children.unshift(<BaseNode>generatedCode);
        }
        else if ((<SourceListMap>generatedCode).children) {
            (<SourceListMap>generatedCode).children.slice().reverse().forEach(function (sln) {
                this.children.unshift(sln);
            }, this);
        }
        else {
            throw new Error('Invalid arguments to SourceListMap.prototype.prerend: Expected string, Node or SourceListMap');
        }
    }

    mapGeneratedCode(fn: (code: string) => string) {
        const normalizedNodes: BaseNode[] = [];
        this.children.forEach((sln: BaseNode) => {
            sln.getNormalizedNodes().forEach(function (newNode) {
                normalizedNodes.push(newNode);
            });
        });
        const optimizedNodes: BaseNode[] = [];
        normalizedNodes.forEach(function (sln) {
            sln = sln.mapGeneratedCode(fn);
            if (optimizedNodes.length === 0) {
                optimizedNodes.push(sln);
            } else {
                const last = optimizedNodes[optimizedNodes.length - 1];
                const mergedNode = last.merge(sln);
                if (mergedNode) {
                    optimizedNodes[optimizedNodes.length - 1] = mergedNode;
                } else {
                    optimizedNodes.push(sln);
                }
            }
        });
        return new SourceListMap(optimizedNodes);
    }

    toString() {
        return this.children.map((sln: BaseNode) =>
            sln.getGeneratedCode(),
        ).join('');
    }

    toStringWithSourceMap(
        options: {
            file: any
        },
    ) {
        const mappingsContext = new MappingsContext();
        const source = this.children.map((sln: BaseNode) => sln.getGeneratedCode()).join('');
        const mappings = this.children.map((sln: BaseNode) =>
                sln.getMappings(mappingsContext),
            )
            .join('');
        return {
            source,
            map: {
                version: 3,
                file: options && options.file,
                sources: mappingsContext.sources,
                sourcesContent: mappingsContext.hasSourceContent ? mappingsContext.sourcesContent : undefined,
                mappings,
            },
        };
    }
}

export = SourceListMap;
