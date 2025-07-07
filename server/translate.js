// // /server/translate.js
// const axios = require('axios');
// const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// async function translate(text, from, to) {
//   const res = await axios.post(
//     'https://api.sarvam.ai/v1/translate',
//     {
//       source_language: from,
//       target_language: to,
//       text
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${SARVAM_API_KEY}`,
//         'Content-Type': 'application/json'
//       }
//     }
//   );
//   return res.data.translated_text;
// }

// module.exports = { translate };


const axios = require('axios');
const FormData = require('form-data');
const SARVAM_API_KEY = process.env.SARVAM_API_KEY|| 'sk_98i2f4yi_7hq1VhyF4qhC0b8zCVlsJbVx';
const SARVAM_SUBSCRIPTION_KEY = process.env.SARVAM_SUBSCRIPTION_KEY || '089f4ab9-312f-4236-aff7-1013fa0ba1e1';
async function translateText(text, sourceLang, targetLang) {
  try {
    const response = await axios.post(
      'https://api.sarvam.ai/translate',
      {
        source_language: sourceLang,
        target_language: targetLang,
        text
      },
      {
        headers: {
          Authorization: `Bearer ${SARVAM_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.translated_text;
  } catch (err) {
    console.error('Translation error:', err.response?.data || err.message);
    return text;
  }
}

// async function speechToText(base64, language) {
//   try {
//     const buffer = Buffer.from(base64, 'base64');
//     const formData = new FormData();
//     formData.append('language', language);
//     formData.append('file', buffer, {
//       filename: 'audio.webm',
//       contentType: 'audio/webm'
//     });

//     const response = await axios.post(
//       'https://api.sarvam.ai/v1/speech-to-text',
//       formData,
//       {
//         headers: {
//           ...formData.getHeaders(),
//           'api-subscription-key': SARVAM_API_KEY
//         }
//       }
//     );
//     return response.data.transcript;
//   } catch (err) {
//     console.error('Speech to text error:', err.response?.data || err.message);
//     throw new Error('Failed to transcribe audio');
//   }
// }
async function speechToText(base64, language) {
    try {
      console.log('[DEBUG] Transcribing audio...');
      console.log('[DEBUG] Language:', language);
  
      const buffer = Buffer.from(base64, 'base64');
      const formData = new FormData();
  
      // Use language_code instead of just language
      formData.append('language_code', `${language}-IN`);// e.g., 'te-IN'
      formData.append('model', 'saarika:v2.5'); // Required model
      formData.append('file', buffer, {
        filename: 'audio.webm',
        contentType: 'audio/webm'
      });
  
      const response = await axios.post(
        'https://api.sarvam.ai/speech-to-text',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'api-subscription-key': SARVAM_SUBSCRIPTION_KEY
          }
        }
      );
  
      console.log('[DEBUG] Transcription response:', response.data);
      return response.data.transcript;
    } catch (err) {
      console.error('Speech to text error:', err.response?.data || err.message);
      throw new Error('Failed to transcribe audio');
    }
  }
  
  

module.exports = { translateText, speechToText };
