# Tinder Tools

A suite of tools for working with the Tinder API.

### Tools

* **auto-liker** – automatically swipes right on every profile in your recommendations (1 per second to avoid making too many requests)
* **get-creds** – gets your tinder access token and saves it to secrets.js for use in all the other tools
* **get-messages** – polls for new messages and saves them to a local DB

### Dependencies

* Node 7

### Secrets

Copy `secrets.example.js` to `secrets.js`. Fill in your facebook login, password, user ID and access token (or use `get-creds`). The secrets are used across all the tinder tools.
