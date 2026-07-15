const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const express = require('express');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;
let qrCodeImageUrl = ''; // Guarda a imagem do QR Code em Base64

// Rota web para exibir o QR Code em uma página limpa
app.get('/', (req, res) => {
    if (qrCodeImageUrl) {
        res.send(`
            <html>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background-color: #f0f2f5;">
                    <h2>Escaneie o QR Code abaixo com seu WhatsApp:</h2>
                    <img src="${qrCodeImageUrl}" style="border: 10px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px;" />
                    <p style="margin-top: 15px; color: #666;">A página atualiza sozinha quando o QR Code mudar.</p>
                    <script>
                        // Atualiza a página a cada 10 segundos para pegar novos QRs se necessário
                        setTimeout(() => { location.reload(); }, 10000);
                    </script>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <body style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background-color: #f0f2f5;">
                    <h2>Aguardando o WhatsApp gerar o QR Code... Por favor, recarregue a página em alguns instantes.</h2>
                </body>
            </html>
        `);
    }
});

// Inicia o servidor web da Render
app.listen(PORT, () => {
    console.log(`Servidor web rodando na porta ${PORT}`);
});

// Inicializa o cliente do WhatsApp
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
        cacheDirectory: path.join(__dirname, '.cache', 'puppeteer')
    }
});

// Quando gerar o QR Code, converte para imagem (Base64) para exibir na página web
client.on('qr', async (qr) => {
    try {
        qrCodeImageUrl = await QRCode.toDataURL(qr);
        console.log('--- NOVO QR CODE GERADO! Acesse o link da sua aplicação para escanear ---');
    } catch (err) {
        console.error('Erro ao gerar imagem do QR Code:', err);
    }
});

client.on('ready', () => {
    console.log('TUDO PRONTO! O seu WhatsApp está conectado à VPS.');
    qrCodeImageUrl = ''; // Limpa o QR Code após conectar
});

client.on('message', async msg => {
    if (msg.body.toLowerCase() === 'oi') {
        await msg.reply('Olá! Esse é um teste enviado automaticamente pela minha VPS gratuita na Render. 🚀');
    }
});

client.initialize();
