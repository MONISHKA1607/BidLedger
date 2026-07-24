import express from 'express';
import { isAuth, isAuthorised } from '../middlewares/auth.js';
import placebid, { manageAutoBid } from '../controllers/bidcontroller.js';
import checkAuctionEndtime from "../middlewares/checkAuctionEndtime.js";
import { lockAuctionMutation } from '../middlewares/auctionRequestLock.js';
import { placeBidValidation, autoBidValidation } from '../middlewares/validators.js';
const router = express.Router();

router.post("/place/:id",isAuth,isAuthorised("Bidder"),placeBidValidation,checkAuctionEndtime,lockAuctionMutation,placebid);
router.put("/auto/:id",isAuth,isAuthorised("Bidder"),autoBidValidation,checkAuctionEndtime,lockAuctionMutation,manageAutoBid);

export default router;
