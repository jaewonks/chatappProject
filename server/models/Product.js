const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        maxlength: 50
    },
    detail: {
        type: String,
    },
    price: {
        type: Number,
        default: 0
    },
    images: {
        type: Array,
        default: []
    },
    sold: {
        type: Number,
        maxlength: 100,
        default: 0
    },
    continents: {
        type: Number,
        default: 1
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true })
//timestamps 등록시간이나 업데이트 등이 기록된다.

//검색 기능을 이용할때 키워드를 어디에 둘 것이며
//어떤 부분에 중점을 두어햐 하는 지(weight)등을 처리
productSchema.index({
    title: 'text',
    detail: 'text'
}, {
    weights: {
        title: 5,
        detail: 1
    }
})

const Product = mongoose.model('Product', productSchema);

module.exports = { Product }