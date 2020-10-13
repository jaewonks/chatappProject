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
  //랜딩페이지에 보여질 skip과 limit
  let limit = req.body.limit ? parseInt(req.body.limit) : 20
  let skip = req.body.skip ? parseInt(req.body.skip) : 0
  let searchTerm = req.body.searchTerm

  let findArgs = {}
 /*  const [Filters, setFilters] = useState({
    continents: [],
    price: []
  }) */
  for( let key in req.body.filters) {
    if(req.body.filters[key].length > 0){ //배열이 있을 경우
      
      console.log('key: ', key)
      if(key === 'price') {
            findArgs[key] = {
            //Greater than equal
            $gte: req.body.filters[key][0],
            //Less than equal
            $lte: req.body.filters[key][1]
          }
      } else {
        findArgs[key] = req.body.filters[key]
      }
    }
  }
  console.log(findArgs)
  
  if(searchTerm){
      //DB product collection에 있는 모든 상품 정보를 불러오기
      Product.find(findArgs)
      .find({ $text: { $search: searchTerm } }) //mongoDB에서 제공하는 기능
      .populate('writer') //ObjectId를 통해 ()안의 모든 정보를 가져올 수 있다.
      .limit(limit)
      .skip(skip)
      .exec((err, productInfo) => {
        if(err) return res.status(400).json({ success: false, err })
        return res.status(200)
                  .json({ success: true, 
                          productInfo,  
                          postRange: productInfo.length
        })
      })

  } else {
      //DB product collection에 있는 모든 상품 정보를 불러오기
      Product.find(findArgs)
      .populate('writer') //ObjectId를 통해 ()안의 모든 정보를 가져올 수 있다.
      .limit(limit)
      .skip(skip)
      .exec((err, productInfo) => {
        if(err) return res.status(400).json({ success: false, err })
        return res.status(200)
                  .json({ success: true, 
                          productInfo,  
                          postRange: productInfo.length
        })
      })
  }
})

//axios.get(`/api/product/products_by_id?id=${productId}&type=single`)
 //DetailProductPage에 화면을 보여준다
 router.get('/products_by_id', (req, res) => {
  //productId를 이용해서 DB에서 productId와 같은 상품의 정보를 가져온다(query이용)
    let type = req.query.type
    let productIds = req.query.id 

    if(type === 'array'){
      //id = 123455667677, 6765434243565, 987967756643 를
      //productIds = ['123455667677', '6765434243565', '987967756643']
      //이런식으로 바꿔주기
        let ids = req.query.id.split(',')
        productIds = ids.map(item => {
          return item
        })
    }

    Product.find({ _id: { $in : productIds } })
      .populate('writer') //ObjectId를 통해 ()안의 모든 정보를 가져올 수 있다.
      .exec((err, product) => {
        if (err) return res.status(400).json({ success: false, err })
        return res.status(200).send(product)
    })
})

module.exports = router;
