// lib/neo4j.js
import neo4j from 'neo4j-driver';

export class Neo4jDriver {
  static #instance;

  static getInstance() {
    if (!this.#instance) {
      const uri = process.env.NEO4J_URI;
      const user = process.env.NEO4J_USERNAME;
      const password = process.env.NEO4J_PASSWORD;

      if (!uri || !user || !password) {
        throw new Error('Neo4j credentials not found in environment variables');
      }

      this.#instance = neo4j.driver(
        uri,
        neo4j.auth.basic(user, password),
        {
          maxConnectionPoolSize: 50,
          connectionTimeout: 5000
        }
      );
    }
    return this.#instance;
  }

  static async close() {
    if (this.#instance) {
      await this.#instance.close();
      this.#instance = null;
    }
  }
}