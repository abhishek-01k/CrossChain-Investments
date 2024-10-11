import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    // Fetch data from GeckoTerminal
    const coingeckoResponse = await axios.get("https://api.geckoterminal.com/api/v2/networks/eth/pools?page=1");

    const firstTenPools = coingeckoResponse.data.data.slice(0, 10);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create a message for GPT-3.5-turbo model
    const message = {
      role: "system",
      content: `Given the following pool data from GeckoTerminal: ${JSON.stringify(
        firstTenPools
      )}\n\nIdentify which pool is the best opportunity and return all fields in json:`,
    };

    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      messages: [message],
      model: "gpt-3.5-turbo-1106",
    });

    // Extract the GPT response
    const gptResponse = completion.choices[0]["message"]["content"];

    // Directly attempt to parse the GPT response
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(gptResponse);
    } catch (jsonParseError) {
      console.error("Error parsing JSON from GPT response:", jsonParseError);
      return res
        .status(500)
        .json({ message: "Error parsing JSON from GPT response" });
    }

    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
}
