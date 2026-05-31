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
router.get('mocks', (req, res) => {
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