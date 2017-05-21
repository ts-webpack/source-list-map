import MappingsContext = require('./MappingsContext');

export interface BaseNode {
    generatedCode: string

    getGeneratedCode(): string
    getMappings(mappingsContext: MappingsContext): string
    getNormalizedNodes(): BaseNode[]
    mapGeneratedCode(fn: (code: string) => string): BaseNode
    merge(otherNode: BaseNode): false | BaseNode
}
