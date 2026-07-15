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
                    <h2>WhatsApp Conectado ou Autenticando! Acompanhe o progresso nos logs da Render.</h2>
                </body>
            </html>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`[SERVIDOR WEB] Ativo na porta ${PORT}`);
});

console.log('[BOT] Iniciando o motor do Puppeteer...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process',
            '--disable-extensions'
        ],
        cacheDirectory: path.join(__dirname, '.cache', 'puppeteer')
    }
});

// Evento 1: Gerando o QR Code
client.on('qr', async (qr) => {
    try {
        qrCodeImageUrl = await QRCode.toDataURL(qr);
        console.log('[STATUS] Novo QR Code disponível para leitura no navegador.');
    } catch (err) {
        console.error('[ERRO] Falha ao gerar imagem do QR Code:', err);
    }
});

// Evento 2: O celular escaneou com sucesso e está autenticando a sessão
client.on('authenticated', () => {
    console.log('[LOG] QR CODE DETECTADO! Conexão autenticada pelo celular. Sincronizando dados...');
    qrCodeImageUrl = ''; // Limpa a imagem para atualizar a interface web
});

// Evento 3: Se a autenticação falhar
client.on('auth_failure', (msg) => {
    console.error('[ERRO] Falha na autenticação do WhatsApp:', msg);
});

// Evento 4: Tudo pronto para enviar e receber mensagens
client.on('ready', () => {
    console.log('[STATUS] TUDO PRONTO! Conexão estabelecida com sucesso. Bot ativo e ouvindo mensagens.');
});

// Evento 5: Monitorando o recebimento de mensagens
client.on('message', async msg => {
    console.log(`[MENSAGEM RECEBIDA] De: ${msg.from} | Conteúdo: "${msg.body}"`);
    
    if (msg.body.toLowerCase() === 'oi') {
        try {
            console.log(`[BOT] Tentando responder para ${msg.from}...`);
            await msg.reply('Olá! Esse é um teste enviado automaticamente pela minha VPS gratuita na Render. 🚀');
            console.log(`[BOT] Resposta enviada com sucesso para ${msg.from}!`);
        } catch (error) {
            console.error('[ERRO] Falha ao enviar resposta:', error);
        }
    }
});

client.initialize();
