// src/lib/testNeo4jConnection.js
import { Neo4jDriver } from './neo4j';

async function testNeo4jConnection() {
  const driver = Neo4jDriver.getInstance();
  const session = driver.session();
  
  try {
    // Test 1: Basic connection
    const connectionTest = await session.run('RETURN 1 AS result');
    console.log('✓ Basic connection test passed');
    
    // Test 2: Write operation
    const writeTest = await session.run(`
      CREATE (t:TestNode {
        id: 'test-' + randomUUID(),
        timestamp: datetime()
      })
      RETURN t
    `);
    console.log('✓ Write operation test passed');
    
    // Test 3: Read operation
    const readTest = await session.run(`
      MATCH (t:TestNode)
      RETURN t
      LIMIT 1
    `);
    console.log('✓ Read operation test passed');
    
    // Test 4: Clean up
    await session.run(`
      MATCH (t:TestNode)
      WHERE t.id STARTS WITH 'test-'
      DELETE t
    `);
    console.log('✓ Cleanup test passed');
    
    return {
      success: true,
      message: 'All Neo4j connection tests passed successfully'
    };
  } catch (error) {
    console.error('Neo4j Connection Test Failed:', error);
    return {
      success: false,
      message: 'Connection test failed',
      error: error.message
    };
  } finally {
    await session.close();
  }
}

export { testNeo4jConnection };