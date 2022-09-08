// carregando rotas
const express = require('express') // express é responsavel pelo gerenciamento de requisições, portas, rotas, (res, ...)
const handlebars = require('express-handlebars') // express-handlebars é responsavel pela renderização das paginas web pegando informações do banco de dados.
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin') // puchar as rotas admin
const path = require('path') // o path server para vocÊ poder trabalhar manipulando diretorios de dentro do servidor
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')

//configurações
    // configurar sessão
    app.use(session({
        secret: '=p{fHqkEhFyXF{!',
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    //configurando middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg') // o res.locals eu consigo fazer uma variavel e ter acesso a ela em qualquer local do meu codigo. ela é uma variavel global.
        res.locals.error_msg = req.flash('error_msg')
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
app.use('/admin', admin)
app.get('/post', (req, res) => res.send('pagina de posts'))
app.get('/', (req, res) => res.send('pagina inicial'))

//outros
const PORT = 80
app.listen(PORT, () => console.log('Servidor WEB OK'))

// infs 
// todo o app.use é a configuração de um middleware