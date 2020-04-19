// NOTE: Experimental OOP approach to modelling user-generated data entities
import Utils from './Utils.js'
/**
 * Represents the persistence of a piece of user-generated data
 */
class Item {
    constructor(type = '', id = '', name = '') {
        this.type = type
        this.id = id || Utils.general.randomString(16)
        this.name = name
        this.saved = { local: false, cloud: false }
    }
}

/**
 * Represents a user-generated motif
 */
class Motif extends Item {
    constructor(
        id = '',
        name = '',
        parentId = '',
        transformations = [],
        motif
    ) {
        super('motif', id, name)
        this.parentId = parentId
        this.transformations = transformations
        this.notes = motif.notes
        this.meta = motif.meta
    }
}

/**
 * Represnts a set of parameters for an API operation (like Randomizer, Transformer)
 */
class Setting extends Item {
    constructor(id = '', name = '') {
        super('setting', id, name)
    }
}
