const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Inicializa o cliente do WhatsApp configurando o caminho correto do Chrome na Render
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        // Aponta para a pasta onde o Chrome foi baixado na Render usando a variável de ambiente
        cacheDirectory: path.join(__dirname, '.cache', 'puppeteer')
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
