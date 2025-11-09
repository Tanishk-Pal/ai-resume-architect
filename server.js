const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve your html, css, js files

// The endpoint that will receive and save user data
app.post('/api/save-user', (req, res) => {
    const { name, email, phone, address } = req.body;

    if (!name || !email) {
        return res.status(400).send('Name and Email are required.');
    }

    // Format the data as a CSV line
    const csvLine = `"${new Date().toISOString()}","${name}","${email}","${phone}","${address}"\n`;

    // Append the data to a file named users.csv
    fs.appendFile('users.csv', csvLine, (err) => {
        if (err) {
            console.error('Failed to save user data:', err);
            return res.status(500).send('Error saving data.');
        }
        console.log('Successfully saved user data for:', name);
        res.status(200).send('Data saved successfully.');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});