// Mongoose 6 changed the default of strictQuery to true, which silently
// strips filter keys that are not in the schema (so a query on an unknown
// field matches every document). Mongoose 5 passed them through to MongoDB,
// and the existing code relies on that. This must run before any Schema is
// constructed, because each schema reads the global default at creation time.
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

module.exports = mongoose;
