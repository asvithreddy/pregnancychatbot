
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const axios = require('axios');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// app.post('/sendMessage', async (req, res) => {
//   const { message } = req.body;
//   if (!message) return res.status(400).json({ error: 'Message is required' });

//   try {
//     const response = await axios.post(
//       'https://api.groq.com/openai/v1/chat/completions',
//       {
//         model: 'llama3-8b-8192',
//         messages: [
//           {
//             role: 'system',
//             content:
//               'You are a maternal health assistant named lunaCare. You provide safe, evidence-based pregnancy and maternal health advice. Give short, simple answers. Avoid long paragraphs. If the message sounds like a medical emergency, advise the user to call their doctor immediately.'


//           },
//           { role: 'user', content: message }
//         ],
//         max_tokens: 150
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );


//     const replyText = response.data.choices[0].message.content;
// const isUrgent = /contact.*(doctor|hospital)|seek.*(medical|emergency)|call.*(provider|911)/i.test(replyText);
// res.json({ reply: replyText, urgent: isUrgent });

//   } catch (error) {
//     console.error('Grok API error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Grok API failed', details: error.message });
//   }
// });

// app.listen(3001, () => console.log('🚀 Server running on http://localhost:3001'));

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { translateText, speechToText } = require('./translate');
require('dotenv').config();
console.log('[ENV CHECK] SARVAM_API_KEY:', process.env.SARVAM_API_KEY ? '✅ Loaded' : '❌ Missing');


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/sendMessage', async (req, res) => {
  const { message, language = 'en', audioBase64 } = req.body;

  if (!message && !audioBase64) {
    return res.status(400).json({ error: 'Message or audio is required' });
  }
  try {
    let finalMessage = message;
  
    if (audioBase64 && language !== 'en') {
      console.log('🗣️ Voice detected. Calling speechToText...');
      finalMessage = await speechToText(audioBase64, language);
      console.log('🎙️ Transcribed Message:', finalMessage);
    }
  
    const messageInEnglish =
      language !== 'en' ? await translateText(finalMessage, language, 'en') : finalMessage;
  
    console.log('📤 Final message to Groq in English:', messageInEnglish);
  

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content:
              'You are a maternal health assistant named MomWise. You provide safe, evidence-based pregnancy and maternal health advice. Give short, simple answers. Avoid long paragraphs. If the message sounds like a medical emergency, advise the user to call their doctor immediately.'
          },
          { role: 'user', content: messageInEnglish }
        ],
        max_tokens: 150
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const replyTextEn = response.data.choices[0].message.content;
    const replyTranslated =
      language !== 'en' ? await translateText(replyTextEn, 'en', language) : replyTextEn;

    const isUrgent = /contact.*(doctor|hospital)|seek.*(medical|emergency)|call.*(provider|911)/i.test(
      replyTextEn
    );

    res.json({ reply: replyTranslated, urgent: isUrgent });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.listen(3001, () => console.log('🚀 Server running on http://localhost:3001'));
