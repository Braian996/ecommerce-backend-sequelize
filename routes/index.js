let express = require('express');
let router = express.Router();
let Sequelize = require('sequelize');
const Op = Sequelize.Op;

let env       = process.env.NODE_ENV || 'development';
let config    = require("../config/config.json")[env];

let sequelize = new Sequelize(config.database, config.username, config.password, config);

// Models
let db = require('../models');

// Tables
let Categoria = db.Categoria;
let Producto = db.Producto;
let Cliente = db.Cliente;
let Producto_Cliente = db.Producto_Cliente;

let app = express();
let bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/* GET */
router.get('/categories', (req, res) => {
    Categoria.findAll().then(response => {
        res.send(response)
    });
});

router.get('/customers', (req, res) => {
    let nameCustomer = '';
    if (String(req.query.name) !== 'undefined') {
        nameCustomer = req.query.name;
    }
    Cliente.findAll({
        where: {
            nombre: {
                [Op.like]: `${nameCustomer}%`
            }
        }
    }).then(response => {
        res.send(response)
    });
});

router.get('/products', (req, res) => {
    let nameProduct = '';
    if (String(req.query.name) !== 'undefined') {
        nameProduct = req.query.name;
    }

    Producto.findAll({
        where: {
            nombre: {
                [Op.like]: `${nameProduct}%`
            }
        }
    }).then(response => {
        res.send(response)
    })
});

router.get('/productByCategorieId', (req, res) => {
    Producto.findAll({
        where: {
            categoriaId: req.query.categoryId
        }
    }).then(response => {
        res.send(response)
    })
});

/* POST */

router.post('/categories', (req, res) => {
    Categoria.build({nombre: req.body.name}).save().then(response => {
        res.send(response)
    });
});

router.post('/customers', (req, res) => {
    Cliente.build({nombre: req.body.name}).save().then(response => {
        res.send(response)
    });
});

router.post('/products', (req, res) => {
    let idCategory = parseInt(req.body.categoryId);
    let stockRetrieved = parseInt(req.body.stock);

    Producto.build({
        nombre: req.body.name, categoriaId: idCategory, stock: stockRetrieved
    }).save().then(response => {
        res.send(response)
    });
});

module.exports = router;
