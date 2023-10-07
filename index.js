const express = require('express');
const http = require('http');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const server = http.createServer(app);

const list = [
  {
    key: null,
    context: null,
    question: null,
  }
]

// Step 1: Initialize Chatbot
const client = new Client({
  authStrategy: new LocalAuth(),
})

client.on('ready', () => {
  console.log('Chatbot is ready');
});

client.on('qr', (qr) => {
  console.log('QRCode is ready');
  qrcode.generate(qr, { small: true });
});

client.initialize();

// Step 2: Buat aturan
client.on('message', async (message) => {
  const command = message.body;
  const contact = await message.getContact();
  const phoneNumber = contact.id.user;

  if (command.startsWith('!context')) {
    const body = command.replace('!context ', '');
    const index = list.findIndex(e => e.key === phoneNumber);
    console.log('Context indeks ke-', index);

    if (index !== -1) {
      list[index].context = body;
    } else {
      list.push({
        key: phoneNumber,
        context: null,
        question: null,
      });
    }
    message.reply('Context accepted');
  }

  if (command.startsWith('!question')) {
    const body = command.replace('!question ', '');
    const index = list.findIndex(e => e.key === phoneNumber);
    console.log('Question indeks ke-', index);

    if (index !== -1) {
      list[index].question = body;
    } else {
      list.push({
        key: phoneNumber,
        context: null,
        question: null,
      });
    }
    message.reply('Question accepted');
  }

  if (command.startsWith('!getanswer')) {
    const index = list.findIndex(e => e.key === phoneNumber);

    // bikin var response
    // cek jika question/answer kosong

    const res = await prediksi({
      context: list[index].context,
      question: list[index].question
    })
    message.reply(res)
  }

  if (command.startsWith('!reset')) {
    const obj = list.find(e => e.key === phoneNumber);
    obj.context = null;
    obj.question = null;
    message.reply(JSON.stringify(obj))
  }
});

// Step 3: Trigger api prediksi

const { default: axios } = require('axios');

async function prediksi({ context, question }) {
  API_URL = "https://api-inference.huggingface.co/models/Rifky/Indobert-QA"
  headers = { "Authorization": "Bearer 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" }
  const body = { context, question }
  const response = await axios.post(API_URL, body, {
    ...headers,
    'Content-Type': 'application/json',
  });
  console.log(response.data)
  return JSON.stringify(response.data);
}


// Step 4: Tampilkan pesan di chatbot


server.listen(3003, () => {
  console.log('App running on port 3003');
});