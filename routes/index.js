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

router.get('/customerById/:customerId', (req, res) => {
    let id = parseInt(req.params.customerId)
    Cliente.findOne({
        where: {
            id: id
        }
    }).then(response => {
        res.send(response)
    })
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

router.get('/productsById/:productId', (req, res) => {
    let productId = parseInt(req.params.productId);

    sequelize.query(
        "SELECT `producto`.`id`, `producto`.`nombre`, `producto`.`categoriaId`, `producto`.`stock`, "+
        "`categoria`.`nombre` AS categoryName from `producto` INNER JOIN `categoria` "+
        "ON `producto`.`categoriaId` = `categoria`.`id` "+
        "WHERE `producto`.`id` = :prodId",
        {
            replacements: {prodId: productId},
            type: Sequelize.QueryTypes.SELECT
        }
    ).then(response => {
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

router.get('/productsOfCustomer', (req, res) => {
    let customerId = parseInt(req.query.customerId);

    sequelize.query(
        "SELECT `producto`.`id`, `producto`.`nombre`, `producto`.`stock`, `producto_cliente`.`id` AS `purchaseId`"+
        " FROM `producto`"+
        " INNER JOIN (`producto_cliente` INNER JOIN `cliente`"+
        " ON `producto_cliente`.`clienteId` = `cliente`.`id`) ON `producto`.`id` = `producto_cliente`.`productoId`"+
        " WHERE `producto_cliente`.`clienteId` = :idCustomer",
        {
            replacements: {idCustomer: customerId},
            type: Sequelize.QueryTypes.SELECT
        }
    ).then(response => {
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

router.post('/purchase', (req, res) => {
    let amountRetrieved = parseInt(req.body.amount);
    let idProductBody = parseInt(req.body.productId);
    let idCustomerBody = parseInt(req.body.customerId);

    sequelize.query(
        "SELECT CASE WHEN stock < :amount THEN TRUE ELSE FALSE END AS datos FROM `producto` WHERE id = :idProd",
        {
            replacements: {amount: amountRetrieved, idProd: idProductBody},
            type: Sequelize.QueryTypes.SELECT
        }
    ).then(response => {
        if (response.length === 0) {
            res.send('No')
        } else {
            if (response[0].datos) {
                res.send('No')
            } else {
                sequelize.query(
                    "UPDATE `producto` SET stock = stock - :amount WHERE id = :idProd",
                    {
                        replacements: {amount: amountRetrieved, idProd: idProductBody},
                        type: Sequelize.QueryTypes.UPDATE
                    }
                ).then(response2 => {
                    if (response2.length === 0) {
                        res.send('error')
                    } else {
                        Producto_Cliente.build({
                            clienteId: idCustomerBody, productoId: idProductBody, cantidadComprados: amountRetrieved
                        }).save().then(response3 => {
                            res.send(response3)
                        });
                    }
                });
            }
        }
    })
});

/* DELETE */

router.delete('/purchase', (req, res, next) => {
    let purchaseId = parseInt(req.query.purchaseId);
    let customerId = parseInt(req.query.customerId);

    sequelize.query(
        "DELETE FROM `producto_cliente` WHERE `id` = :idPC",
        {
            replacements: {idPC: purchaseId},
            type: Sequelize.QueryTypes.DELETE
        }
    ).then(() => {
        sequelize.query(
            "SELECT `producto`.`id`, `producto`.`nombre`, `producto`.`stock`, `producto_cliente`.`id` AS `purchaseId`"+
            " FROM `producto`"+
            " INNER JOIN (`producto_cliente` INNER JOIN `cliente`"+
            " ON `producto_cliente`.`clienteId` = `cliente`.`id`) ON `producto`.`id` = `producto_cliente`.`productoId`"+
            " WHERE `producto_cliente`.`clienteId` = :idCustomer",
            {
                replacements: {idCustomer: customerId},
                type: Sequelize.QueryTypes.SELECT
            }
        ).then(response => {
            res.send(response)
        }).catch(err2 => {
            res.send(err2)
        })
    }).catch(err => {
        res.send(err)
    })
});

/* PUT */

router.put('/products/:productId', (req, res) => {
    let productId = parseInt(req.params.productId);
    let name = req.body.name;
    let categoryId = parseInt(req.body.categoryId);
    let stock = parseInt(req.body.stock);
    Producto.update({ nombre: name, categoriaId: categoryId, stock: stock }, {
        where: {
            id: productId
        }
    }).then((response) => {
        res.send({response});
    }).catch(err => {
        res.send(err)
    })
});

router.put('/customers/:customerId', (req, res) => {
    let customerId = parseInt(req.params.customerId)
    let name = req.body.name;
    Cliente.update({ nombre: name }, {where: { id: customerId }})
        .then(response => {
            res.send({response})
        })
        .catch(err => {
            res.send(err)
        })
});

module.exports = router;
