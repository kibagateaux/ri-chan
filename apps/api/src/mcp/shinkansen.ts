const { chromium } = require('playwright');
const sqlite3 = require('sqlite3').verbose();
const { Server } = require('@modelcontextprotocol/server'); // Hypothetical MCP server lib
import z from 'zod';

const db = new sqlite3.Database('./app.db');
const mcpServer = new Server({
  name: 'shinkansen-booker',
  tools: {
    bookTrain: {
      description: 'Books a Shinkansen train ticket',
      parameters: {
        email: z.string().describe("User email booking the train tickets"),
        from: z.string().describe("City you are departing from"),
        to: z.string().describe("City you are arriving in"),
        date: z.string().describe("ISO 8601 from 2025-04-01"),
        time: z.string().describe("14:00"),
      },
      execute: async ({ email, from, to, date, time }) => {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
          // Navigate to Shinkansen booking site
          await page.goto('https://smart-ex.jp/en/reservation');

          // Login
          // Single email/password for all users for ease
          await page.fill('#email', process.env.SHINKANSEN_EMAIL);
          await page.fill('#password', process.env.SHINKANSEN_PASSWORD);
          await page.click('button[type="submit"]');

          // Search for train
          await page.fill('#departure', from);
          await page.fill('#arrival', to);
          await page.fill('#date', date);
          await page.fill('#time', time);
          await page.click('#search-button');

          // Select first available train
          await page.waitForSelector('.train-option');
          await page.click('.train-option:first-child .book-now');

          // TODO find train with best
          // choose reserved option

          // Confirm booking
          await page.click('#confirm-booking');
          const confirmation = await page.textContent('#confirmation-message');

          // Store in SQLite
          db.run(
            'INSERT INTO bookings (user_id, trip_details, created_at) VALUES (?, ?, ?)',
            [await getUserId(email), `${from} to ${to} on ${date} at ${time}`, new Date().toISOString()]
          );

          return { success: true, message: confirmation };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          await browser.close();
        }
      },
    },
  },
});

async function getUserId(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      resolve(row.id);
    });
  });
}

mcpServer.start({ port: 3001 });
console.log('MCP server running on port 3001');