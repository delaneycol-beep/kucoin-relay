const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Root endpoint
app.get('/', (req, res) => {
  res.send('KuCoin Relay is running ✅');
});

// Balances endpoint
app.get('/balances', async (req, res) => {
  try {
    const endpoint = '/api/v1/accounts';
    const baseUrl = 'https://api.kucoin.com';
    const now = Date.now().toString();

    const strToSign = now + 'GET' + endpoint;
    const signature = crypto
      .createHmac('sha256', process.env.KUCOIN_SECRET)
      .update(strToSign)
      .digest('base64');

    const passphraseSigned = crypto
      .createHmac('sha256', process.env.KUCOIN_SECRET)
      .update(process.env.KUCOIN_PASSPHRASE)
      .digest('base64');

    const headers = {
      'KC-API-KEY': process.env.KUCOIN_KEY,
      'KC-API-SIGN': signature,
      'KC-API-TIMESTAMP': now,
      'KC-API-PASSPHRASE': passphraseSigned,
      'KC-API-KEY-VERSION': '2'
    };

    const response = await fetch(baseUrl + endpoint, { headers });
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
