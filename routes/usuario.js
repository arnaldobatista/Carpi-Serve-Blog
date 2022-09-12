const express = require('express') 
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs') // criptador de senhas 
const passport = require('passport')

//rotas
router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})
router.post('/registro', (req,res) => { // receber dados do front
    var erros = [] 
    //validação
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'nome invalido'})
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'email invalido'})
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'senha invalida'})
    }

    if (req.body.senha.length < 4){
        erros.push({texto: 'senha muito curta'})
    }

    if (req.body.senha != req.body.senha2){
        erros.push({texto: 'Senhas diferentes, tente novamente'})
    }

    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).lean().then((usuario) => { // procurar o email para ver se já existe
            if(usuario){
                req.flash('error_msg', 'email já existe')
                res.redirect('/usuarios/registro')
            }else{ // se não existir, pegar as informações para poder criptografar
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                })
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg', 'erro ao salvar sua senha')
                            res.redirect('/registro')
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'usuario criado')
                            res.redirect('/')
                        }).catch((e) => {
                            req.flash('error_msg', 'erro ao criar o usuario')
                            res.redirect('/usuarios/registro')
                        })
                    })
                })
            }
        }).catch((e) => {
            req.flash('error_msg', 'erro interno')
            res.redirect('/')
        })
    }
})
router.get('/login', (req, res) => {
    res.render('usuarios/login')
})
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})
router.get('/logout', (req, res) => {
    req.logout((e) => {
        if (e) {
            return next(e)
        }
        req.flash('success_msg', 'Deslogado com sucesso')
        res.redirect('/')
    })
})








module.exports = router