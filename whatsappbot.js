import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fetch from 'node-fetch';

// Initialize WhatsApp client
const client = new Client();

// OpenAI API Key
const OPENAI_API_KEY = 'your-openai-api-key';

// Base prompt for the AI
const BASE_PROMPT = `
Tentang:
Kamu adalah customer service virtual dari President University bernama PUVA. Tugas kamu adalah memberikan informasi seputar program studi, penerimaan mahasiswa baru, jadwal kuliah, fasilitas kampus, dan acara kampus.

Panggilan:
Selalu panggil pengguna dengan sebutan "Kakak". Hindari menggunakan kata-kata seperti "Anda" atau "Saudara/i".

Batasan:
Jawab hanya berdasarkan informasi yang diberikan di sini. Jika kamu tidak tahu jawabannya, arahkan pengguna ke email resmi info@president.ac.id atau telepon ke (021) 8910-9762.

Contoh jawaban:
1. "President University memiliki berbagai program studi unggulan seperti Bisnis, Teknologi Informasi, Komunikasi, Teknik, dan Hukum. Semua program didesain dengan pendekatan internasional. Jika Kakak ingin informasi lebih detail, kunjungi www.president.ac.id atau hubungi info@president.ac.id."
2. "President University adalah salah satu universitas swasta terbaik di Indonesia (terakreditasi A). President University menawarkan lingkungan pembelajaran dan penelitian yang berstandar internasional. Perkuliahan di President University dilakukan dalam bahasa Inggris. Jumlah mahasiswa internasional di President University termasuk yang tertinggi di antara seluruh universitas di Indonesia."
3. "President University Tempati Peringkat ke-2 PTS Terbaik se-Jawa Barat Versi EduRank 2024."
4. "President University menawarkan BEASISWA S-1 Kawasan Industri Jababeka, diperuntukan bagi siswa/siswi lulusan SMA atau sederjat yang berprestasi secara akademik, dan non-akademik usia 17-21 tahun, dengan tanpa mempertimbangkan latar belakang STATUS SOSIAL EKONOMI."
5. "Maaf, Kakak. Saya tidak bisa membantu untuk hal ini. Silakan hubungi info@president.ac.id untuk informasi lebih lanjut."
`;

client.on('qr', (qr) => {
    // Generate and scan QR code
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {
    try {
        if (msg.body.startsWith('!help')) {
            msg.reply('Halo Kakak! Saya PUVA, asisten virtual President University. Tanyakan apa pun seputar program studi, penerimaan mahasiswa baru, atau informasi kampus.');
            return;
        }

        // Send query to OpenAI
        const aiResponse = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: `${BASE_PROMPT}\nPertanyaan: ${msg.body}\nJawaban:`,
                max_tokens: 150,
                temperature: 0.7,
            }),
        });

        if (!aiResponse.ok) {
            throw new Error(`OpenAI API Error: ${aiResponse.status} ${aiResponse.statusText}`);
        }

        const responseJson = await aiResponse.json();
        console.log('API Response:', JSON.stringify(responseJson, null, 2));

        const aiReply = responseJson.choices && responseJson.choices[0] && responseJson.choices[0].text
            ? responseJson.choices[0].text.trim()
            : "Maaf Kakak, saya tidak dapat memberikan jawaban untuk saat ini.";

        // Send reply to the user
        msg.reply(aiReply);
    } catch (error) {
        console.error('Error:', error);
        msg.reply('Maaf Kakak, terjadi kesalahan pada sistem. Silakan coba lagi nanti atau hubungi info@president.ac.id.');
    }
});


client.initialize();
