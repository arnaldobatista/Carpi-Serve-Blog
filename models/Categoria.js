const mongoose = require('mongoose') // puchando o mingoose (integrador do banco de dados mongoDB)
const Schema = mongoose.Schema 

const Categoria = new Schema({
    nome: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('categorias', Categoria) // montando para o banco de dados. primeiro o nome do conjunto e dps a referencia do model