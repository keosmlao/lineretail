// ❌ แบบผิด
// import line from "@line/bot-sdk";

// ✅ แบบถูกต้อง
import * as line from "@line/bot-sdk";
import dotenv from "dotenv";
dotenv.config();

const lineClient = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

export default lineClient;
