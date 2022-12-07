import express, { Application } from 'express'
import bodyParser from 'body-parser'
import path from 'path'

import { AdminRoute, ShoppingRoute, VandorRoute ,CustomerRoute } from '../routes'


export default async(app:Application)=>{


    app.use(bodyParser.json())
    
    app.use(bodyParser.urlencoded({ extended: true }))

    const imagePath = path.join(__dirname + 'image')
    
    app.use('/image', express.static(imagePath))

    app.use('/admin', AdminRoute)
    
    app.use('/vandor', VandorRoute)

    app.use('/customer',CustomerRoute)
    
    app.use(ShoppingRoute)
    
    return app
}


