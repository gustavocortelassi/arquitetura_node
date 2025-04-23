const express = require('express');
const amqp = require('amqplib');
const { error } = require('console');

const app = express();
app.use(express.json());

const QUEUE = 'product_monitoring_queue';
let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE);
        console.log('conectado ao rabbitmq')
    } catch (err) {
        console.error('erro ao conectar no rabbitmq')
    }
}

// post de novo produto
app.post('/produto', async (req, res) => {
    const { name, url, price, ecommerce } = req.body;

    const newProduct = {
        id: Date.now,
        name,
        url,
        price,
        ecommerce,
        createdAt: new Date(),
    };

    try {
        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(newProduct)));
        console.log('enviado a fila:', newProduct);
        res.status(202).json({ message: 'enviado para monitoramento' })
    } catch (err) {
        res.status(500).json({ error: 'erro ao enviar a fila' });
    }
});

const PORT = 3000;
app.listen(PORT, async () => {
    await connectRabbitMQ();
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});