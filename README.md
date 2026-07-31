# Unique Haircut Queue System

## Overview
A simple React-based queue manager for Unique Haircut salon. Customers can be added to the queue, the next customer can be called, and the current service status is shown.

## Files
- `index.html` — main page that loads the app
- `styles.css` — app styling and layout
- `app.js` — React logic and queue management

## How to run
1. Open `index.html` in a web browser.
2. The app will load automatically and display the salon queue interface.

## How to use
- **Add a customer**: Type a name in the `Customer name` field and click `Add to Queue`.
- **Call the next customer**: Click `Call Next` to move the first waiting customer into service.
- **Finish service**: Click `Finish Service` when the current customer is done.
- **Clear queue**: Click `Clear Queue` to reset the app and remove all customers.
- **Admin login**: Use the `Admin` button in the top-right header to open the login menu.
- **Check your status**: Enter a customer name in the `Your name` field to see if it is your turn or how many customers are ahead of you.

## Features
- displays the number of customers waiting
- shows who is being served now
- generates a ticket number for each customer
- keeps the queue after a page refresh using local storage

## Notes
- The app runs entirely in the browser.
- No backend server is required.
- If local storage is cleared in the browser, the queue will reset.
