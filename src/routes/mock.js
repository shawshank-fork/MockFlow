const express = require('express');
const router = express.Router();
const db = require('../db');

//helper funnc to simulater artificial delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Catch-all route: intercepts amy method on any path under /mock/
router.all('/*', async (req, res) => {
    //extract dynamic path after mock
    const mockPath = req.params[0];
    const method = req.method.toUpperCase();

    try {
        //Look up for a matching mock comnfig in the database
        const stmt = db.prepare('SELECT * FROM mocks WHERE path = ? AND method = ?');
        const mock = stmt.get(mockPath, method);

        //if no mock found
        if (!mock) {
            return res.status(404).json({
                error: 'No mock found',
                path: mockPath,
                method: method,
                hint: `Register one via POST /api/mocks with path "${mockPath}" and method "${method}"`
            });
        }

        // Logging the incoming request into request_logs
        const logStmt = db.prepare(
            `INSERT INTO request_logs(mock_id, method, headers, body, query_params)
            VALUES (?, ?, ?, ?, ?)`
        );

        logStmt.run(
            mock.id,
            method,
            JSON.stringify(req.headers),
            JSON.stringify(req.body),
            JSON.stringify(req.query)
        );

        //Applying artificail delay
        if (mock.delay_ms > 0) {
            await sleep(mock.delay_ms);
        }

        //setting custom response headers if configured
        if (mock.headers) {
            const customHeaders = JSON.parse(mock.headers);
            for (const [key, value] of Object.entries(customHeaders)) {
                res.setHeader(key, value);
            }
        }

        //Sending configured responses
        const responseBody = mock.response_body ? JSON.parse(mock.response_body) : {};
        res.status(mock.status).json(responseBody);
    } catch (error) {
        console.error('Mock engine error:', error);
        res.status(500).json({ error: 'Internal mock engine error' });
    }
});

module.exports = router;