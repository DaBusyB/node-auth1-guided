const router = require('express').Router()
const users = require('../users/users-model.js')

const bcrypt = require('bcryptjs')//

router.post('/register', async (req, res) => {
    let user = req.body

    const hash = bcrypt.hashSync(user.password, 10)//
    user.password = hash//

    try {
        const saved = await users.add(user)
        res.status(201).json(saved)
    } catch(err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.post('/login', (req, res) => {//
    let {username, password} = req.body //password here is the password guess that user is trying to log in with

    users.findBy({username})
        .first()
        .then(user => {
            if(user && bcrypt.compareSync(password, user.password)) {
                req.session.user = user 
                //adds new property to session obj called user and adds user obj to it. 
                //this forces the session obj to persist in our memory store and force the session id cookie to go back to the browser. 
                //this means that the next time the browser makes an req, 
                    //we go through the gobal middleware, 
                    //the req will have a cookie with the session id and the session middleware will lookup the session id in the session store
                    //and find it along with the user obj we're adding here and add it to the req obj
                    //we can then bypass this login and go straight to the users after we config the user rout GET req to check and see if there is a session obj and if there is, does it hav ea user obj on it
                        //if there is, we know the session obj came out of memory from the login method after a successful login

                res.status(200).json({message: `welcome ${user.username}`})
            } else {
                res.status(401).json({message: 'invalid credentials'})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json(err)
        })
})

router.get('/logout', (req, res) => {
    if(req.session) {
        req.session.destroy(err => { //takes invalidates cookie
            if(err) {
                console.log(err)
                res.send('cannot log out')
            } else {
                res.send('goodbye')
            }
        })
    } else {
        res.end()
    }
})

module.exports = router;