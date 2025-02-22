// src/app/api/ibm-token/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.IBM_API_KEY;
  if (!apiKey) {
    console.error("IBM_API_KEY is not defined");
    return NextResponse.json(
      { error: "IBM_API_KEY is not defined" },
      { status: 500 }
    );
  }

  try {
    const tokenResponse = await fetch("https://iam.cloud.ibm.com/identity/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      const errorMsg = `IBM token request failed: ${errorText}`;
      console.error(errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    return NextResponse.json(tokenData, { status: 200 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching IBM token:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
