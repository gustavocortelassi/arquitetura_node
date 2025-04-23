const amqp = require('amqplib');

// filas
const INPUT_QUEUE = 'product_monitoring_queue';
const ALERT_QUEUE = 'price_alert_queue';

const precosAnteriores = {};

async function start() {
  try {
    // conexao no rabbitmq
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(INPUT_QUEUE);
    await channel.assertQueue(ALERT_QUEUE);

    console.log(`🔎 Escutando fila ${INPUT_QUEUE}...`);

    // "escuta" a mensagem
    channel.consume(INPUT_QUEUE, (msg) => {
      if (!msg) return;

      // joga pra jsin
      const produto = JSON.parse(msg.content.toString());
      const { url, price } = produto;

      const precoAnterior = precosAnteriores[url];
      precosAnteriores[url] = price; // atualiza sempre

      // comparacao de preco
      if (precoAnterior) {
        const diferenca = Math.abs((price - precoAnterior) / precoAnterior);

        if (diferenca >= 0.10) {
          const alerta = {
            ...produto,
            oldPrice: precoAnterior,
            difference: diferenca,
            timestamp: new Date()
          };

          // manda p fila de notify
          channel.sendToQueue(ALERT_QUEUE, Buffer.from(JSON.stringify(alerta)));
          console.log(`preço mudou de R$${precoAnterior} para R$${price}`);
        } else {
            // se for muito pequena, so printa console
          console.log(`preco alterado, diferença foi de ${(diferenca * 100).toFixed(2)}%`);
        }
      } else {
        console.log(`novo produto iniciado: ${produto.name} - R$${price}`);
      }
      
      channel.ack(msg); 
    });
  } catch (err) {
    console.error('err ao conectar/escutar RabbitMQ:', err);
  }
}

start();
