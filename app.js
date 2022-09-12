// carregando rotas
const express = require('express') // express é responsavel pelo gerenciamento de requisições, portas, rotas, (res, ...)
const handlebars = require('express-handlebars') // express-handlebars é responsavel pela renderização das paginas web pegando informações do banco de dados.
const bodyParser = require('body-parser')
const app = express()
const admin = require('/routes/admin') // puchar as rotas admin
const path = require('path') // o path server para vocÊ poder trabalhar manipulando diretorios de dentro do servidor
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('/models/Postagem')
const Postagem = mongoose.model('postagens')
require('/models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('/routes/Usuario')
const passport = require('passport')
require('/config/auth')(passport)
// FEITO
//configurações
    // configurar sessão
    app.use(session({
        secret: '=p{fHqkEhFyXF{!',
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    //configurando middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg') // o res.locals eu consigo fazer uma variavel e ter acesso a ela em qualquer local do meu codigo. ela é uma variavel global.
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        next()
    })
    // body parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    //handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    // mongose
    mongoose.Promise = global.Promise
    mongoose.connect('mongodb://localhost/blogapp').then(() => console.log('Conectado ao banco de dados')).catch((e) => console.log(`Erro ao se conectar ao banco de dados: ${e}`))
    // publics (arquivos estaticos como css, img e JS)
    app.use(express.static(path.join(__dirname,'public'))) // configurando a pasta public

//rotas
app.get('/', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => { // vai passar para a paginaprincipal, as postagens e as categorias
        res.render('index', {postagens: postagens})
    }).catch((e) => {
        req.flash('error_msg', 'erro interno')
        res.redirect('/404')
    })
})
app.get('/postagem/:slug', (req, res) => { // pesquisar uma postagem especifica pelo slug recebido
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => { // se der certo e ele achar essa postagem, ele vai executar um IF
        if(postagem){ // se ele achar uma postagem, ele vai renderizar a view base (dentro dessa view base, vai ser passada as informações do id da postagem especifica)
            res.render('postagem/index', {postagem: postagem}) // passando o parametro de postagem para poder ser localizada os parametros da postagem dentro da pagina base
        }else{
            req.flash('error_msg', 'esta postagem não existe')
            res.redirect('/')
        }
    }).catch((e) => {
        req.flash('error_msg', 'Erro interno')
        res.redirect('/')
    })
})
app.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('categorias/index', {categorias: categorias})
    }).catch((e) => {
        req.flash('error_msg', 'erro ao listar categorias')
        res.redirect('/')
    })
})
app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
        if(categoria) {
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
            }).catch((e) => {
                req.flash('error_msg', 'erro ao listar os posts')
                res.redirect('/categorias')
            })
        }else{
        req.flash('error_msg', 'essa categoria não existe')
        res.redirect('/categorias')
        }

    }).catch((e) => {
        console.log(e)
        req.flash('error_msg', 'erro ao localizar categoria')
        res.redirect('/categorias')
    })
})
app.get('/404', (req, res) => res.send('erro 404!'))
app.get('/post', (req, res) => res.send('pagina de posts'))
app.get('/admin', (req, res) => res.send('erro 404!'))
app.use('/admin', admin)
app.use('/usuarios', usuarios)

//outros
const PORT = 80 || 443
app.listen(PORT, () => console.log('Servidor WEB OK'))

// infs
// todo o app.use é a configuração de um middleware
// /nome é referencia de link e nome/sem/barra é referencia de pasta
