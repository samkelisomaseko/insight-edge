// server.js

const express = require('express');
const https = require('https'); // Use the native HTTPS module
const dotenv = require('dotenv');
const cors = require('cors'); // Required for CORS

dotenv.config(); // Load environment variables from .env file
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to enable CORS
app.use(cors());

// Utility function to fetch data using the native https module
const fetchData = (options) => {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                const body = Buffer.concat(chunks);
                try {
                    const data = JSON.parse(body.toString());
                    resolve(data);
                } catch (error) {
                    reject(new Error('Error parsing response as JSON: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            console.error('Error with the request:', error.message);
            reject(error);
        });

        req.end();
    });
};

// Endpoint to fetch live data
app.get('/api/live-data', async (req, res) => {
    const options = {
        method: 'GET',
        hostname: 'aviator-exclusiva-bet-api.p.rapidapi.com',
        port: null,
        path: '/res_aviator',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,  // Use environment variable
            'x-rapidapi-host': 'aviator-exclusiva-bet-api.p.rapidapi.com'
        }
    };

    try {
        const data = await fetchData(options);
        // Validate response structure
        if (!data || typeof data.value === 'undefined') {
            return res.status(500).send('Invalid data structure received for live data.');
        }
        res.json(data);
    } catch (error) {
        console.error('Error fetching live data:', error);
        res.status(500).send('Error fetching live data: ' + error.message);
    }
});

// Endpoint to fetch current round and next predictions
app.get('/api/predictions', async (req, res) => {
    const options = {
        method: 'GET',
        hostname: 'aviator-exclusiva-bet-api.p.rapidapi.com',
        port: null,
        path: '/res_aviator/predictions',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'aviator-exclusiva-bet-api.p.rapidapi.com'
        }
    };

    try {
        const data = await fetchData(options);
        // Validate response structure
        const { currentRound, nextPrediction } = data;
        if (typeof currentRound === 'undefined' || typeof nextPrediction === 'undefined') {
            return res.status(500).send('Invalid data structure received for predictions.');
        }
        res.json({ currentRound, nextPrediction });
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).send('Error fetching predictions: ' + error.message);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});
