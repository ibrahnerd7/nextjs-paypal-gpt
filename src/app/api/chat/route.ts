import OpenAI from "openai";
import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";

import { DataAPIClient } from "@datastax/astra-db-ts";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPEN_API_KEY,
} = process.env;

const _openai = new OpenAI({
  apiKey: OPEN_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, {
  keyspace: ASTRA_DB_NAMESPACE,
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
   try {
    const latestMessage = messages[messages?.length - 1]?.parts[0]?.text;

    let docContext = "";

    const embedding = await _openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
    });

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });

      const documents = await cursor.toArray();

      const docsMap = documents?.map((doc) => doc.text);

      docContext = JSON.stringify(docsMap);
    } catch (err) {
      docContext = "";
    }

    const template = {
      role: "system",
      content: `
        You are an AI assistant who knows everything about Paypal.
        Use the below context to augment what you know about Paypal.
        The context will provide you with the most recent frequently asked questions and their answers,
        from the official Paypal website.
        If the context doesn't include the information you need answer based on your
        existing knowledge and don't mention the source of your information or
        what the context does or doesn't include.
        Format responses using markdown where applicable and don't return
        images.
        ----------------------------------------
        START CONTEXT
        ${docContext}
        END CONTEXT
        ---------------------------------------
        QUESTION: ${latestMessage}
        ---------------------------------------
        `,
    };

    const result = streamText({
    model: openai("gpt-4o"),
    messages: convertToModelMessages([{parts: [{type: "text", text: template.content}], role: "system"}, ...messages]),
  });
  return result.toUIMessageStreamResponse();

  } catch (error) {
  }

}