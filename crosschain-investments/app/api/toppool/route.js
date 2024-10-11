import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// Token Symbol -> Address mapping
const tokenAddresses = {
  usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  bnb: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
  dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
};

export default async function handler(req , res ) {
  try {
    // Get the token parameter or default to 'usdc'
    const token = req.query.token || "usdc";
    const tokenAddress =
      tokenAddresses[token.toLowerCase()] || tokenAddresses["usdc"];

    // Fetch data from GeckoTerminal
    const geckoResponse = await axios.get(
      `https://api.geckoterminal.com/api/v2/networks/eth/tokens/${tokenAddress}/pools?page=1`
    );

    // Initialize OpenAI
    const openai = new OpenAI();

    // Create a message for GPT-3.5-turbo model
    const message = {
      role: "system",
      content: `Given the following pool data from GeckoTerminal: ${JSON.stringify(
        geckoResponse.data
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

    // Send the JSON response back
    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
}
