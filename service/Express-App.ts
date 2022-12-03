import express, { Application } from 'express'
import bodyParser from 'body-parser'

import path from 'path'

import { AdminRoute, ShoppingRoute, VandorRoute } from '../routes'


export default async(app:Application)=>{


    app.use(bodyParser.json())
    
    app.use(bodyParser.urlencoded({ extended: true }))

    app.use('/images', express.static(path.join(__dirname + '/image')))

    app.use('/admin', AdminRoute)
    
    app.use('/vandor', VandorRoute)
    
    app.use(ShoppingRoute)
    
    return app
}


