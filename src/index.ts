import express from 'express'
import App from './service/Express-App'
import Database from './service/Database'

const StartServer = async () => {
    
    const app = express()

    await Database()

    await App(app)

    app.listen(8000, () => {
       
        console.log("server is listening port 8000")
    })

}

StartServer()
