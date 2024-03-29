const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt= require('bcryptjs')
require('../models/Usuario')
// require('../models/Usuario') 
const Usuario = mongoose.model('usuarios')

module.exports = (passport) => {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).lean().then((usuario) => {
            if(!usuario){
                return done(null, false, {message: 'essa conta não exite'})
            }
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem) {
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: 'senha incorreta'})
                }
            })
        })
    }))
    passport.serializeUser((usuario, done) => {
        done(null, usuario._id)
    })
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })
}

