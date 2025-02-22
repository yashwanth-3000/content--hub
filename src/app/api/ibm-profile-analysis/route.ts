// src/app/api/ibm-profile-analysis/route.ts
import { NextResponse } from "next/server";

async function getIBMAccessToken() {
  const apiKey = process.env.IBM_API_KEY;
  if (!apiKey) throw new Error("IBM_API_KEY is not defined");
  const tokenResponse = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`,
  });
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`IBM token request failed: ${errorText}`);
  }
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Obtain IBM access token using our server-side secret key.
    const accessToken = await getIBMAccessToken();
    // Call IBM's Profile Analysis API.
    const ibmResponse = await fetch(
      "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    if (!ibmResponse.ok) {
      const errorText = await ibmResponse.text();
      throw new Error(`IBM Profile Analysis API call failed: ${errorText}`);
    }
    const ibmData = await ibmResponse.json();
    return NextResponse.json(ibmData, { status: 200 });
  } catch (error) {
    console.error("Error in IBM Profile Analysis API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
