import fs from "node:fs/promises";

const API_BASE_URL = "https://api.sws.speechify.com";

const API_KEY = process.env.SPEECHIFY_API_KEY;

const VOICE_ID = process.env.SPEECHIFY_VOICE_ID;

async function getAudio(text) {
  const res = await fetch(`${API_BASE_URL}/v1/audio/speech`, {
    method: "POST",
    body: JSON.stringify({
      input: `<speak>${text}</speak>`,
      voice_id: VOICE_ID,
      audio_format: "mp3",
    }),
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "content-type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`${res.status}${res.statusText}\n${await res.text()}`);
  }

  const responseData = await res.json();

  const decodedAudioData = Buffer.from(responseData.audio_data, "base64");

  return decodedAudioData;
}

async function main() {
  const audio = await getAudio(
    "Good morning, in case I didn't see you. Good afternoon, and good night.",
  );

  await fs.writeFile("speech.mp3", audio);

  console.log("Audio saved successfully!");
}

main().catch(console.error);
