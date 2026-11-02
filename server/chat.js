//aim: react LLm through longchain and openai

import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 1, // deterministic [0, 1]
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const chat = async (question) => {
  const aiMsg = await llm.invoke([
    {
      role: "system",
      content:
        "You are a helpful assistant who will engage in a conversation with me. Keep your reply short and concise.",
    },
    {
      role: "user",
      content: question,
    },
  ]);

  return aiMsg?.content;
};

export default chat;
