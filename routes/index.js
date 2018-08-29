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

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
