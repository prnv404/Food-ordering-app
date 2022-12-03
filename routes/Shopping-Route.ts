import express from 'express'
import { GetFoodAvailablity, GetFoodsIn30Min, GetTopRestaurant, RestaurantById, SearchFood } from '../controller'

const router = express.Router()

/** ---------------------- Food Availabilty ----------------------**/

router.get('/:pincode',GetFoodAvailablity)

/** ---------------------- Top Restaurants ----------------------**/

router.get('/restaurants/:pincode',GetTopRestaurant)

/** ---------------------- Foods Available in 30 minutes ----------------------**/

router.get('/foods-in-30-min/:pincode',GetFoodsIn30Min)

/** ---------------------- Search Foods ----------------------**/

router.get('/search/:pincode',SearchFood)

/** ---------------------- Find Restuarant by Id ----------------------**/

router.get('/restaurant/:id',RestaurantById)



export { router as ShoppingRoute}