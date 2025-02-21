// src/app/api/test-neo4j/route.js
import { Neo4jDriver } from '@/lib/neo4j';
import { NextResponse } from 'next/server';

export async function GET() {
  let session = null;

  try {
    // Try to get the driver instance
    const driver = Neo4jDriver.getInstance();
    session = driver.session();

    // Query to fetch all Company nodes with their properties
    const query = `
      MATCH (n:Company)
      RETURN n
      LIMIT 25
    `;
    const dataResult = await session.run(query);

    // Process the data
    const companies = dataResult.records.map(record => {
      const node = record.get('n');
      return {
        id: node.elementId, // Unique Neo4j element ID
        properties: node.properties
      };
    });

    return NextResponse.json({
      status: 'success',
      message: 'Fetched companies successfully',
      connected: true,
      companies: companies
    });

  } catch (error) {
    console.error('Neo4j Connection or Query Error:', error);

    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch companies from Neo4j',
      error: error.message,
      connected: false,
      details: {
        uri: process.env.NEO4J_URI ? 'Configured' : 'Missing',
        username: process.env.NEO4J_USERNAME ? 'Configured' : 'Missing',
        password: process.env.NEO4J_PASSWORD ? 'Configured' : 'Missing'
      }
    }, { status: 500 });

  } finally {
    if (session) {
      await session.close();
    }
  }
}
