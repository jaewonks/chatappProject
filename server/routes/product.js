const express = require('express');
const router = express.Router();
const multer = require('multer')
const { Product } = require('../models/Product')

//=================================
//            Product
//=================================

const storage = multer.diskStorage({
    //파일 경로
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    //파일을 저장할때 어떠한 이름으로 저장할지에 관한 것
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`)
    }
  })
const upload = multer({ storage: storage }).single('file')

 //UploadProductPage 프론트엔드에서 보내는 정보를 처리(axios)
router.post('/', (req, res) => {
  //받아온 정보들을 DB에 넣어 준다.
  const product = new Product(req.body)
  product.save((err) => {
      if (err) return res.status(400).json({ success: false, err })
      return res.status(200).json({ success: true })
  })
}) 

//UploadProductPage 프론트엔드에서 보내는 정보를 처리(axios)
router.post('/image', (req, res) => {
    //가져온 이미지를 저장(multer이용)
    upload(req, res, err => {
        if(err){
            return req.json({ success: false, err })
        }
        return res.json({ success: true, 
                filePath: res.req.file.path, 
                fileName: res.req.file.filename 
        })
    })
})

//Landing page에 상품 나열하기
router.post('/products', (req, res) => {
  //DB product collection에 있는 모든 상품 정보를 불러오기
  Product.find()
    .populate('writer') //ObjectId를 통해 ()안의 모든 정보를 가져올 수 있다.
    .exec((err, productInfo) => {
      if(err) return res.status(400).json({ success: false, err })
      return res.status(200).json({ success: true, productInfo })
    })
})

module.exports = router;
