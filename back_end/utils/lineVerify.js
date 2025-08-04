import axios from "axios";
import qs from "qs"; // npm install qs

export async function verifyIdToken(idToken) {
  const body = qs.stringify({
    id_token: idToken,
    client_id: process.env.LINE_CHANNEL_ID
  });

  const res = await axios.post(
    "https://api.line.me/oauth2/v2.1/verify",
    body,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return res.data;
}
