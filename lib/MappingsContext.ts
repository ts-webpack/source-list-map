/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */
class MappingsContext {
    sources: string[]
    sourcesContent: string[]
    hasSourceContent: boolean
    currentOriginalLine: number
    currentSource: number

    constructor() {
        this.sources = [];
        this.sourcesContent = [];
        this.hasSourceContent = false;
        this.currentOriginalLine = 1;
        this.currentSource = 0;
    }

    ensureSource(source: string, originalSource: string) {
        let idx = this.sources.indexOf(source);
        if (idx >= 0) {
            return idx;
        }
        idx = this.sources.length;
        this.sources.push(source);
        this.sourcesContent.push(originalSource);
        if (typeof originalSource === 'string') {
            this.hasSourceContent = true;
        }
        return idx;
    }
}

export = MappingsContext;