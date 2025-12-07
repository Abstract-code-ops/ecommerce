import mongose from "mongoose"; // Mongoose client used to connect to MongoDB

// Use a global cache to store the connection/promise between module reloads.
// This is important in serverless environments (e.g., Next.js API routes, AWS Lambda)
// where the module may be re-evaluated across requests; caching prevents creating
// multiple connections to the database.
const cached = (global as any).mongoose || { conn: null, promise: null };

/**
 * Connect to MongoDB using mongoose and return the connection.
 *
 * Behavior:
 * - If a connection is already established (cached.conn), return it immediately.
 * - If a connection attempt is already in progress (cached.promise), await it.
 * - Otherwise, start a new connection and cache both the promise and final conn.
 *
 * @param MONGODB_URI - MongoDB connection string (defaults to process.env.MONGODB_URI)
 * @returns The established mongoose connection
 * @throws If MONGODB_URI is not provided
 */
export const connectToDB = async (
    MONGODB_URI: string = process.env.MONGODB_URI!
) => {
    // If we've already connected, reuse the existing connection.
    if (cached.conn) {
        return cached.conn;
    }

    // Ensure there is a connection string available.
    if (!MONGODB_URI) {
        throw new Error("Please define the MONGODB_URI environment variable");
    }

    // If there's already a pending connection attempt, reuse its promise.
    // Otherwise, create a new mongoose.connect promise and store it.
    cached.promise = cached.promise || mongose.connect(MONGODB_URI)

    // Await the connection promise and cache the resolved connection object.
    cached.conn = await cached.promise;

    return cached.conn;
}