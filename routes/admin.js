const express = require('express') // chamando o express
const router = express.Router() // é isso que usamos para criar rotas em arquivos separados.
// usando um model externo
const mongoose = require('mongoose') // chamar o mongoose
require('../models/Categoria') // chamar o arquivo do model
const Categoria = mongoose.model('categorias') // chamar uma função que vai receber o nome do seu model e passar para uma variavel.
require('../models/Postagem')
const Postagem = mongoose.model('postagens')

//definindo rotas
router.get('/', (req, res) => res.render('admin/index')) // pagina principal adm
router.get('/categorias', (req, res) => Categoria.find().lean().sort({date:'desc'}).then((categorias) => res.render('admin/categorias', {categorias: categorias})).catch((e) => {
        req.flash('error_msg', 'erro ao cadastrar categoria')
        res.redirect('/admin')
    })) // A função .find() vai listar todas as categorias de dentro do banco de dados.
router.get('/categorias/add', (req, res) => res.render('admin/addcategorias')) // renderiza o admin/addcategorias -- cadastro de novas categorias
router.post('/categorias/nova', (req, res) => {
    // validando dados passados da nova categoria  
    var erros = []

    const nome = req.body.nome
    const slug = req.body.slug

    if(!nome || typeof nome == undefined || nome == null || nome.length < 2){
        erros.push({texto: 'Nome inválido'})
    }
    if(!slug || typeof slug == undefined || slug == null){
        erros.push({texto: 'Slug inválido'})
    }
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    } else {
        //model
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        //salvar modelo com os dados corretos
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'categoria criada com sucesso') // mandar uma mensagem de sucesso antes de redirecionar.
            res.redirect('/admin/categorias') // redirecionar para outra pagina
        }).catch((e) => {
            req.flash('error_msg', 'erro ao cadastrar categoria')
            res.redirect('/admin/categorias')
        })
    }
})
router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => res.render('admin/editcategorias', {categoria: categoria}) ).catch((e) => {
        req.flash('error_msg', 'Esta categoria não existe')
        res.redirect('/admin/categorias')
    })
}) // renderiza a pagina admin/editcategorias -- edição de categorias com as informações da determinada categoria

router.post('/categorias/edit', (req, res) => { // esse post recebe as informações alteradas do /categorias/edit.
    Categoria.findOne({_id: req.body.id}).then((categoria) => { // aqui ele procura o id da categoria no banco de dados
        categoria.nome = req.body.nome // atribuindo as novas informações
        categoria.slug = req.body.slug

        categoria.save().then(() => { // salvando no banco de dados
            req.flash('success_msg', 'Categoria editada com sucesso')
            res.redirect('/admin/categorias')
        }).catch(() => {
            req.flash('error_msg', 'Erro ao editar a categoria')
            res.redirect('/admin/categorias')
        })
    }).catch((e) => {
        req.flash('error_msg', 'Erro ao editar categoria')
        res.redirect('/admin/categorias')
    })
}) 
router.post('/categorias/deletar', (req, res) => { // recebendo o id para deletar no caminho /categorias/deletar
    Categoria.deleteOne({_id: req.body.id}).then(() => { // deletando a categoria com o id informado.
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((e) => {
        req.flash('error_msg', 'erro ao excluir categoria')
        res.redirect('/admin/categorias')
    })
})
router.get('/postagens', (req, res) => { //vou renderizar a pagina de postagens
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => { //vou procurar as categorias para colocar junto com as postagens usando o .populate('categoria')
        res.render('admin/postagens', {postagens: postagens})
    }).catch((e) => {
        req.flash('error_msg', 'erro ao listar as postagens')
        res.redirect('/admin')
    })
}) // pagina de posts renderizando o adm/postagens
router.get('/postagens/add', ((req, res) => {
    Categoria.find().lean().then((categorias) => { // procura as categoridas de dentro do banco de dados
        res.render('admin/addpostagem', {categorias: categorias}) // renderizando o admin/addpostagem junto com as categorias
    }).catch(() => {
        reg.flash('error_mgs', 'erro ao carregar o formulario')
        res.redirect('/admin')
    })
}))
router.post('/postagens/nova', (req, res) => { // receber os dados de uma nova postagem
//validando a categoria
var erros = []

if(req.body.categoria == '0') { // vou jogar para o var erros, o texto de erro
        erros.push({texto: 'categoria invalida registre uma categoria'})
    }
    if(erros.length > 0){ // verifica se existem erros dentro da variavel de arrays
        res.render('admin/addpostagem', {erros: erros})
    } else{ // se não tiver, ela vai criar uma nova postagem
        const novaPostagem = { // recebendo os dados do formulario
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(() => { // salvando a postagem recebida. 
            req.flash('success_msg', 'Postagem salva com sucesso.')
            res.redirect('/admin/postagens')
        }).catch((e) => {
            req.flash('error_msg', 'Erro ao salvar postagem')
            res.redirect('/admin/postagens')
        })
    }
})
router.get('/postagens/edit/:id', (req, res) => { //
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => { // pesquisando o id que veio do botão editar postagem
        Categoria.find().lean().then((categorias) => { // pesquisando todas as categorias disponiveis
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem}) // passando as categorias e a postagem do id
        }).catch((e) => {
            req.flash('error_mgs', 'erro ao pesquisar a categoria. Formulario nao carregado.')
            res.redirect('/admin/postagens')
        })
    }).catch((e) => {
        req.flash('error_mgs', 'erro ao pesquisar a postagem. Formulario nao carregado.')
        res.redirect('/admin/postagens')
    })
})
router.post('/postagem/edit', (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => { // pesquisando o id que esta vindo do furmulario de edção
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => { 
            req.flash('success_msg', 'Postagem salva com sucesso')
            res.redirect('/admin/postagens')
        }).catch(() => {
            req.flash('error_msg', 'Erro ao salvar postagem')
            res.redirect('/admin/postagens')
        })
    }).catch((e) => {
        req.flash('error_msg', 'Erro ao salvar edição')
        res.redirect('/admin/postagens')
        console.log(e)
    })
})
router.post('/postagem/deletar', (req, res) => { // recebendo o id para deletar no caminho /postagem/deletar
    Postagem.deleteOne({_id: req.body.id}).then(() => { // deletando a postagem com o id informado.
        req.flash('success_msg', 'Postagem deletada com sucesso')
        res.redirect('/admin/postagens')
    }).catch((e) => {
        req.flash('error_msg', 'erro ao excluir postagem')
        res.redirect('/admin/postagens')
    })
})


module.exports = router