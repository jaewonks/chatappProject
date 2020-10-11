const express = require('express');
const router = express.Router();
const multer = require('multer')

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

//Upload 프론트엔드에서 보내는 정보를 처리(axios)
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

module.exports = router;
