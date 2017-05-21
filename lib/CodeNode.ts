/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
import { getNumberOfLines, getUnfinishedLine } from './helpers';
import MappingsContext = require('./MappingsContext');

class CodeNode {
    constructor(public generatedCode: string) {
        this.generatedCode = generatedCode;
    }

    clone() {
        return new CodeNode(this.generatedCode);
    }

    getGeneratedCode() {
        return this.generatedCode;
    }

    getMappings(mappingsContext: MappingsContext) {
        const lines = getNumberOfLines(this.generatedCode);
        const mapping = Array(lines + 1).join(';');
        if (lines > 0) {
            mappingsContext.unfinishedGeneratedLine = getUnfinishedLine(this.generatedCode);
            if (mappingsContext.unfinishedGeneratedLine > 0) {
                return `${mapping}A`;
            } else {
                return mapping;
            }
        } else {
            const prevUnfinished = mappingsContext.unfinishedGeneratedLine;
            mappingsContext.unfinishedGeneratedLine += getUnfinishedLine(this.generatedCode);
            if (prevUnfinished === 0 && mappingsContext.unfinishedGeneratedLine > 0) {
                return 'A';
            } else {
                return '';
            }
        }
    }

    addGeneratedCode(generatedCode: string) {
        this.generatedCode += generatedCode;
    }

    mapGeneratedCode(fn: (code: string) => string) {
        const generatedCode = fn(this.generatedCode);
        return new CodeNode(generatedCode);
    }

    getNormalizedNodes() {
        return [this];
    }

    merge(otherNode: CodeNode) {
        if (otherNode instanceof CodeNode) {
            this.generatedCode += otherNode.generatedCode;
            return this;
        }
        return false;
    }
}

export = CodeNode;
