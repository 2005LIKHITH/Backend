import { Router } from "express";
import { logOutUser, loginUser, refreshAccessToken, registerUser ,
    getUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannel,getWatchHistory,changePassword
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(upload.fields(
    [
        {
            name:"avatar",
            maxCount: 1,

        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]
),registerUser);


router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/current-user").get(verifyJWT,getUser)
router.route("/update-account-details").post(verifyJWT,updateAccountDetails)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

//params wala

router.route("/channel/:username").get(verifyJWT,getUserChannel);

//watch History

router.route("/watch-history").get(verifyJWT,getWatchHistory);




export default router;
