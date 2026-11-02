import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const API_BASE_URL = "https://api.speechify.ai";
const API_KEY = process.env.SPEECHIFY_API_KEY;

const SPEAKER_FULL_NAME = "Bo Zhu";
const VOICE_NAME = "Bo's voice";
const VOICE_GENDER = "not_specified"; // male, female, not_specified
const VOICE_LOCALE = "en-US";

const SAMPLE_FILE_PATH = "server/voices/consent.wav";
const CONSENT_FILE_PATH = "server/voices/consent.wav";

if (!API_KEY) {
  throw new Error(
    "Missing SPEECHIFY_API_KEY. Please set the environment variable first.",
  );
}

function getAudioMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  const mimeTypes = {
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".mp4": "audio/mp4",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
    ".webm": "audio/webm",
  };

  return mimeTypes[extension] ?? "application/octet-stream";
}

async function parseResponse(res) {
  const responseText = await res.text();

  let responseData;

  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = responseText;
  }

  if (!res.ok) {
    const details =
      typeof responseData === "string"
        ? responseData
        : JSON.stringify(responseData, null, 2);

    throw new Error(
      `Speechify API error ${res.status} ${res.statusText}:\n${details}`,
    );
  }

  return responseData;
}

async function createConsentChallenge(fullName) {
  const res = await fetch(`${API_BASE_URL}/v1/voices/consent-challenges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      full_name: fullName,
    }),
  });

  return parseResponse(res);
}

async function createVoice({
  name,
  gender,
  locale,
  sampleFilePath,
  consentFilePath,
  consentChallengeId,
}) {
  const [sampleFile, consentFile] = await Promise.all([
    fs.readFile(sampleFilePath),
    fs.readFile(consentFilePath),
  ]);

  const formData = new FormData();

  formData.set("name", name);
  formData.set("gender", gender);
  formData.set("locale", locale);
  formData.set("consent_challenge_id", consentChallengeId);

  formData.set(
    "sample",
    new Blob([sampleFile], {
      type: getAudioMimeType(sampleFilePath),
    }),
    path.basename(sampleFilePath),
  );

  formData.set(
    "consent_recording",
    new Blob([consentFile], {
      type: getAudioMimeType(consentFilePath),
    }),
    path.basename(consentFilePath),
  );

  const res = await fetch(`${API_BASE_URL}/v1/voices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Idempotency-Key": randomUUID(),
    },
    body: formData,
  });

  return parseResponse(res);
}

async function main() {
  const terminal = createInterface({ input, output });

  try {
    await fs.access(SAMPLE_FILE_PATH);

    console.log("Authorization is being created challenge...");

    const challenge = await createConsentChallenge(SPEAKER_FULL_NAME);

    console.log(
      "\nPlease have the person in the audio sample accurately read the following sentence:\n",
    );
    console.log(challenge.phrase);
    console.log(`\nChallenge expiration time:${challenge.expires_at}`);
    console.log(`\nPlease save the sampel in: ${CONSENT_FILE_PATH}`);

    await terminal.question(
      "\nFinish recordings and save files, then press Enter to continue...",
    );

    await fs.access(CONSENT_FILE_PATH);

    console.log("\nUploading...");

    const voiceData = await createVoice({
      name: VOICE_NAME,
      gender: VOICE_GENDER,
      locale: VOICE_LOCALE,
      sampleFilePath: SAMPLE_FILE_PATH,
      consentFilePath: CONSENT_FILE_PATH,
      consentChallengeId: challenge.id,
    });

    console.log("\nSound created successfully：");
    console.log(JSON.stringify(voiceData, null, 2));
    console.log(`\nVoice ID: ${voiceData.id}`);
  } finally {
    terminal.close();
  }
}

main().catch((error) => {
  console.error("\nFailed to create sound：");
  console.error(error.message);
  process.exitCode = 1;
});
