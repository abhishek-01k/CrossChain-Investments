import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      console.log(req.body); // Log every incoming message

      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

      if (req.body.message) {
        const chatId = req.body.message.chat.id;
        const text = req.body.message.text;

        if (text === "/start") {
          await sendTelegramMessage(
            chatId,
            "👋 Welcome to AlvaraXChainInvestment! Let's start your journey toward smarter investments.",
            null,
            TELEGRAM_API
          );

          setTimeout(async () => {
            const keyboard = [
              [
                { text: "Yes ✅", callback_data: "change_yes" },
                { text: "No ❌", callback_data: "change_no" },
              ],
            ];
            await sendTelegramMessage(
              chatId,
              `😔 <b>Important Update:</b>\n\nOur current BTS strategy is underperforming due to market conditions.\n\n<b>Suggestion:</b> Deploy a new strategy incorporating "Sentiment Analysis" to gain insights into market emotions and dynamics. This could help turn things around.\n\n[Learn More](https://trade-bot.netlify.app)`,
              keyboard,
              TELEGRAM_API
            );
          }, 5000);

          setTimeout(async () => {
            const message = `📢 <b>New Token Alert!</b> 📢\n\n🚀 <b>AEUR</b> is now available in the market! [View details](https://trade-bot.netlify.app)\n\n🔥 Don't miss out! Add to your portfolio today to maximize your gains.`;
            await sendTelegramMessage(chatId, message, null, TELEGRAM_API);
          }, 15000);
        } else if (text === "/changestrategy") {
          const keyboard = [
            [
              { text: "Yes ✅", callback_data: "change_yes" },
              { text: "No ❌", callback_data: "change_no" },
            ],
          ];
          await sendTelegramMessage(
            chatId,
            `🚨 <b>Urgent Notice:</b> \n\nOur current strategy is not optimized, and we're experiencing losses. 😟\n\n<b>Suggestion:</b> Deploy a new strategy focused on "Sentiment Analysis" to improve our market position.\n\n[Learn More](https://trade-bot.netlify.app)`,
            keyboard,
            TELEGRAM_API
          );
        } else if (text === "/showforecast") {
          const imageUrl = "https://i.ibb.co/jvjw8LY/Screenshot-2023-12-07-at-5-29-00-PM.png";
          const caption = `📊 <b>Profit Forecast:</b>\n\n💰 Actual: $600\n💸 Estimate: $1000\n\n🚀 Keep up the momentum!`;
          await sendTelegramPhoto(chatId, imageUrl, caption, TELEGRAM_API);
        } else if (text === "/tax") {
          const keyboard = [
            [{ text: "Send ✅", callback_data: "send_tax_info" }],
          ];
          await sendTelegramMessage(
            chatId,
            `📄 <b>Your Tax Information</b>\n\nTax details for the financial year 2023-2024 will be sent to you via email. Please check your inbox.`,
            keyboard,
            TELEGRAM_API
          );
        } else {
          // Echo the received message
          await sendTelegramMessage(
            chatId,
            `You said: ${text}`,
            null,
            TELEGRAM_API
          );
        }
      } else if (req.body.callback_query) {
        const callbackQuery = req.body.callback_query;
        const data = callbackQuery.data; 
        const chatId = callbackQuery.message.chat.id;

        await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
          callback_query_id: callbackQuery.id,
        });

        if (data === "send_tax_info") {
          await sendTelegramMessage(
            chatId,
            "📧 Your tax info will be mailed to you shortly.",
            null,
            TELEGRAM_API
          );
        } else {
          await sendTelegramMessage(
            chatId,
            "✅ Your strategy will be updated soon!",
            null,
            TELEGRAM_API
          );
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("An error occurred");
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Function to send a message with optional inline keyboard
async function sendTelegramMessage(chatId, text, keyboard, TELEGRAM_API) {
  const data = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    ...(keyboard && {
      reply_markup: JSON.stringify({ inline_keyboard: keyboard }),
    }),
  };

  return axios.post(`${TELEGRAM_API}/sendMessage`, data);
}

async function sendTelegramPhoto(chatId, photoUrl, caption, TELEGRAM_API) {
  const data = {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption,
    parse_mode: "HTML",
  };

  return axios.post(`${TELEGRAM_API}/sendPhoto`, data);
}
