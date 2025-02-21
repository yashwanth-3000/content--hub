// src/app/api/companies/route.js
import { Neo4jDriver } from '@/lib/neo4j';
import { NextResponse } from 'next/server';

export async function GET() {
  const driver = Neo4jDriver.getInstance();
  const session = driver.session();
  
  try {
    // First, let's count all companies
    const countResult = await session.run(`
      MATCH (c:Company)
      RETURN count(c) as count
    `);
    
    const totalCompanies = countResult.records[0].get('count').low;
    console.log(`Total companies in database: ${totalCompanies}`);

    // Then get all companies with their full data
    const result = await session.run(`
      MATCH (c:Company)
      RETURN c
      ORDER BY c.name
    `);

    const companies = result.records.map(record => {
      const company = record.get('c').properties;
      return {
        elementId: company.elementId,
        name: company.name,
        description: company.description,
        logo_urls: company.logo_urls,
        created_at: company.created_at
      };
    });

    return NextResponse.json({
      total: totalCompanies,
      companies: companies
    });
  } catch (error) {
    console.error('GET /api/companies - Error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}

export async function POST(request) {
  const driver = Neo4jDriver.getInstance();
  const session = driver.session();

  try {
    const body = await request.json();
    const timestamp = new Date().toISOString();
    const elementId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // First, check if company with same name exists
    const checkResult = await session.run(`
      MATCH (c:Company {name: $name})
      RETURN c
    `, {
      name: body.name
    });

    if (checkResult.records.length > 0) {
      return NextResponse.json({
        message: `Company with name "${body.name}" already exists`,
        success: false,
        error: 'DUPLICATE_COMPANY'
      }, { status: 409 }); // 409 Conflict
    }

    // If no duplicate, proceed with creation
    const result = await session.run(`
      CREATE (c:Company {
        elementId: $elementId,
        name: $name,
        description: $description,
        logo_urls: $logo_urls,
        created_at: $created_at
      })
      RETURN c
    `, {
      elementId: elementId,
      name: body.name || 'New Company',
      description: body.description || 'Description pending',
      logo_urls: body.logo_urls || '/placeholder.svg',
      created_at: timestamp
    });

    const createdCompany = result.records[0].get('c').properties;

    return NextResponse.json({
      message: 'Company added successfully',
      success: true,
      company: createdCompany
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/companies - Error:', error);
    return NextResponse.json({
      message: 'Internal server error',
      error: error.message,
      success: false
    }, { status: 500 });
  } finally {
    await session.close();
  }
}