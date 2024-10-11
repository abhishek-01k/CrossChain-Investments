const axios = require("axios")

const botToken = "7435591683:AAHrtQxEchDi0OznLeQeW_p_l71B9LgsB8s"

function sendTelegramMessage(userId, message) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const data = {
    chat_id: userId,
    text: message,
  }

  return axios
    .post(url, data)
    .then((response) => response.data)
    .catch((error) => console.error("Error sending message:", error))
}

module.exports = sendTelegramMessage
