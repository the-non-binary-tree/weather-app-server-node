const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const clothingIconSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: 5
    },
    tags: [{
        type: String
    }],
    source: {
        type: String,
        required: true,
        unique: true
    }
})

clothingIconSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

clothingIconSchema.plugin(uniqueValidator)

module.exports = mongoose.model('ClothingIcon', clothingIconSchema)