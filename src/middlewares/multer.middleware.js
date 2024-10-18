import multer from "multer";



/*

  ".diskStorage" creates an engine that can store files on disk

  this is a middle ware
*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/temp")
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
      //null indicates there is no error 
    }
  })
  //creates an instance of the multer middleware configured to use the specified storage engine
export const upload = multer({
    storage,
 })