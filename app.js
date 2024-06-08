require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

//config JSON response
app.use(express.json())

//Models
const User = require('./models/User')

//open route
app.get('/', (req,res) => {
    res.status(200).json({msg: "bem vindo"})
})

//private route
app.get("/user/:id",checkToken, async(req,res) => {

    const id = req.params.id

    //check if user exists
    const user = await User.findById(id, '-password')

    if(!user){
        return res.status(404).json({msg: "usuario não encontrado"})
    }
    res.status(200).json({user})
    
        
})

function checkToken(req, res, next){


    const testHeader = req.headers['authorization']
    const token = testHeader && testHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ msg: 'acesso negado!'})
    }

    try {

        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()

    }catch(error){
        res.status(400).json({ msg: "token invalido!"})

    }
}



// register user
app.post('/test/register', async(req, res) => {

    const {name, email , password, confirmpassword} = req.body
    //validations
    if(!name){
        return res.status(422).json({msg:"o nome é obrigatório"})
    }

    if(!email){
        return res.status(422).json({msg:"o email é obrigatório"})
    }

    if(!password){
        return res.status(422).json({msg:"a senha é obrigatório"})
    }

    if(password !== confirmpassword){
        return res.status(422).json({
            msg: "as senhas não conferem"
        })
    }

    //check if user exists

    const userExists = await User.findOne({email: email})

    if(userExists) {
        return res.status(422).json({ msg: "Por favor, utilize outro email!"})
    }

    //create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //create user
    const user = new User({
        name,
        email,
        password,
    })

    try {
        await user.save()

        res.status(201).json({msg: "Usuario criado com sucesso!"})

    } catch(error) {
        console.log(error)



        res.status(500).json({msg: "Aconteceu um erro no servidor, tente novamente mais tarde"})
    }
})

//Login USer
app.post("/test/login", async (req, res) =>{

    const {email, password} = req.body

    //
    if(!email){
        return res.status(422).json({msg:"o email é obrigatório"})
    }

    if(!password){
        return res.status(422).json({msg:"a senha é obrigatório"})
    }


    //check if user exists

    const user = await User.findOne({email: email})

    if(!user) {
        return res.status(422).json({ msg: "Usuario não encontrado!"})
    }

    //check if password match
    const checkPassword = bcrypt.compare(password, user.password)

    if(!checkPassword){
        return res.status(422).json({ msg: "senha invalida!"})
    }


    try{

        const secret = process.env.SECRET
        const token = jwt.sign(
            {
                id: user._id,
            },
            secret,
        ) 
        res.status(200).json({msg: "autenticação realaizado com sucesso!", token})

    }catch (err){
        console.log(error)



        res.status(500).json({msg: "Aconteceu um erro no servidor, tente novamente mais tarde"})
    }
})




//CREDENTIALS
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS


mongoose
.connect('mongodb+srv://ereism:ereism@cluster0.qggjuzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',)
.then(() => {
    app.listen(30001)
    console.log('conectou ao bacno!')
    })
.catch((err) => console.log(err))