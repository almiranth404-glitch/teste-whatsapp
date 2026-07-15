const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necessário para rodar em servidores Linux como a Render
    }
});

// Gera o QR Code no terminal da VPS
client.on('qr', (qr) => {
    console.log('--- ESCANEIE O QR CODE ABAIXO COM SEU CELULAR ---');
    qrcode.generate(qr, { small: true });
});

// Mensagem quando o login for bem-sucedido
client.on('ready', () => {
    console.log('TUDO PRONTO! O seu WhatsApp está conectado à VPS.');
});

// Resposta automática simples para testes
client.on('message', async msg => {
    if (msg.body.toLowerCase() === 'oi') {
        await msg.reply('Olá! Esse é um teste enviado automaticamente pela minha VPS gratuita na Render. 🚀');
    }
});

client.initialize();
