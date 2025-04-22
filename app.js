const express = require('express');
const app = express();

// express interpreta o json do corpo de req
app.use(express.json());

// armazena localmente os produtos em um array
const products = [];

// post de novo produto
app.post('/produto', (req, res) => {
    const { name, url, price, ecommerce } = req.body;

    const newProduct = {
        id: products.length + 1,
        name,
        url,
        price,
        ecommerce,
        createdAt: new Date(),
    };

    products.push(newProduct);

    res.status(201).json(newProduct);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});