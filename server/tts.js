//aim： speechify API generate through cloned voice
const API_BASE_URL = "https://api.sws.speechify.com";
const API_KEY = process.env.SPEECHIFY_API_KEY;
const VOICE_ID = process.env.SPEECHIFY_VOICE_ID;

async function tts(text) {
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

  //const decodedAudioData = Buffer.from(responseData.audio_data, "base64");

  return decodedAudioData;
}

export default tts;
