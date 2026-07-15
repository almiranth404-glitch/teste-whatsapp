const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const express = require('express');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;
let qrCodeImageUrl = ''; 

app.get('/', (req, res) => {
    if (qrCodeImageUrl) {
        res.send(`
            <html>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background-color: #f0f2f5;">
                    <h2>Escaneie o QR Code abaixo com seu WhatsApp:</h2>
                    <img src="${qrCodeImageUrl}" style="border: 10px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px;" />
                    <p style="margin-top: 15px; color: #666;">A página atualiza sozinha quando o QR Code mudar.</p>
                    <script>
                        setTimeout(() => { location.reload(); }, 10000);
                    </script>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <body style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background-color: #f0f2f5;">
                    <h2>Aguardando o WhatsApp carregar ou já conectado! Olhe os logs na Render.</h2>
                </body>
            </html>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor web rodando na porta ${PORT}`);
});

// Inicialização super otimizada para servidores de baixa memória (512MB)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Evita usar a memória compartilhada /dev/shm
            '--disable-gpu',           // Desativa aceleração de hardware por GPU
            '--no-zygote',             // Desativa o processo Zygote para economizar RAM
            '--single-process',        // Força a rodar tudo em apenas uma thread/processo (ajuda muito a poupar RAM)
            '--no-first-run',
            '--disable-extensions'
        ],
        cacheDirectory: path.join(__dirname, '.cache', 'puppeteer')
    }
});

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
    qrCodeImageUrl = ''; 
});

client.on('message', async msg => {
    if (msg.body.toLowerCase() === 'oi') {
        try {
            await msg.reply('Olá! Esse é um teste enviado automaticamente pela minha VPS gratuita na Render. 🚀');
            console.log('Mensagem de teste respondida com sucesso!');
        } catch (error) {
            console.error('Erro ao responder mensagem:', error);
        }
    }
});

client.initialize();
