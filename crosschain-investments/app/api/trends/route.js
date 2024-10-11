import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const calculateAdvancedMetrics = (priceData) => {
  const prices = priceData.map((entry) => entry[1]);
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const average = prices.reduce((acc, price) => acc + price, 0) / prices.length;
  const sma = prices.slice(-10).reduce((acc, price) => acc + price, 0) / 10;
  const stdDeviation = Math.sqrt(
    prices.reduce((acc, price) => acc + Math.pow(price - average, 2), 0) /
      prices.length
  );

  return { high, low, average, sma, stdDeviation };
};

const cryptoMapping = {
  eth: "ethereum",
  link: "link",
  usdc: "usd-coin",
  usdt: "tether",
};

export default async function handler(req, res ) {
  try {
    const cryptoQueryId = req.query.Id;
    const cryptoId = cryptoMapping[cryptoQueryId.toLowerCase()] || "eth";
    const vsCurrency = "usd";
    const days = "10";

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=${vsCurrency}&days=${days}`
    );
    const priceData = response.data.prices;

    if (!priceData) {
      return res.status(404).json({ message: "Price data not found" });
    }

    const metrics = calculateAdvancedMetrics(priceData);

    // Initialize OpenAI
    const openai = new OpenAI();

    // Create a message for the GPT model
    const message = {
      role: "system",
      content: `Given the following cryptocurrency metrics: ${JSON.stringify(
        metrics
      )}\n\nEvaluate and provide a score out of 100 on how investable this asset is currently: just a number `,
    };

    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      messages: [message],
      model: "gpt-3.5-turbo-1106",
    });

    // Parse the GPT response for the score
    const gptResponse = completion.choices[0]["message"]["content"];

    res.status(200).json({ metrics, priceData, score: gptResponse });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Error processing request", details: error.message });
  }
}
