const express = require('express');
const router = express.Router();
const db = require('../db');

//Creating/registering a new mocj config

router.post('/mocks', (req, res) => {
    const { path, method, status, responseBody, headers, delayMs } = req.body;

    if (!path || !method) {
        return res.status(400).json({ error: 'path and method are required' });
    }

    const normalizedPath = path.replace(/^\/+|\/+$/g, '');
    const normalizedMethod = method.toUpperCase();

    try {
        const stmt = db.prepare(`
            INSERT INTO mocks (path, method, status, response_body, headers, delay_ms)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            normalizedPath,
            normalizedMethod,
            status || 200,
            responseBody ? JSON.stringify(responseBody) : null,
            headers ? JSON.stringify(headers) : null,
            delayMs || 0
        );

        res.status(201).json({
            message: 'Mock created successfully',
            mockId: result.lastInsertRowid
        });

    } catch (error) {
        //SQL Contraint warning for UNIQUE index
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({
                error: `Mock already exists for ${normalizedMethod} /mock/${normalizedPath}`
            });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to create mock' });
    }
});

// fetch all configured mocks
router.get('/mocks', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM mocks ORDER BY created_at DESC');
        const mocks = stmt.all();

        //mapping and parsing stringified JSON clolumns back to js objects
        const parsedMocks = mocks.map(mock => ({
            ...mock,
            response_body: mock.response_body ? JSON.parse(mock.response_body) : null,
            headers: mock.headers ? JSON.parse(mock.headers) : null
        }));

        res.json(parsedMocks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch mocks' });
    }
});

//Deleting a mock config

router.delete('/mocks/:id', (req, res) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM mocks WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Mock not found' });
        }
        res.json({ message: 'Mock deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete mock' });
    }
});

//For getting the request logs camptured for a specific mock

router.get('/mocks/:id/logs', (req, res) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare('SELECT * FROM request_logs WHERE mock_id = ? ORDER BY received_at DESC');
        const logs = stmt.all(id);
        const parsedLogs = logs.map(log => ({
            ...log,
            headers: log.headers ? JSON.parse(log.headers) : null,
            body: log.body ? JSON.parse(log.body) : null,
            query_params: log.query_params ? JSON.parse(log.query_params) : null
        }));

        res.json(parsedLogs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

module.exports = router;