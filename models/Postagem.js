const mongoose = require('mongoose') // puchando o mingoose (integrador do banco de dados mongoDB)
const Schema = mongoose.Schema 

const Postagem = new Schema ({
    titulo: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    descricao: {
        type: String,
        require: true
    },
    conteudo: {
        type: String,
        require: true
    },
    titulo: {
        type: String,
        require: true
    },
    titulo: {
        type: String,
        require: true
    },
    categoria: {
        type: Schema.Types.ObjectId, // esse campo ira armazenar o id de uma categoria.
        ref: 'categorias',
        require: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('postagens', Postagem)