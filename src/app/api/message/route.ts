import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const POST = async (req: NextRequest) => {
  //to ask questions

  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { id: userId } = user;

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) {
    return new Response("Not Found", { status: 404 });
  }

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  //vectorise message

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!) as any;

  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY || "",
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const prevMessages = await db.message.findMany({
    where: {
      fileId: fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((msg: any) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  const chatPrompt = `
Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

----------------

PREVIOUS CONVERSATION:
${formattedPrevMessages
  .map((message) =>
    message.role === "user"
      ? `User: ${message.content}\n`
      : `Assistant: ${message.content}\n`
  )
  .join("")}

----------------

CONTEXT:
${results.map((r) => r.pageContent).join("\n\n")}

USER INPUT: ${message}
`;

  // Create the payload for the Hugging Face API
  const payload = {
    inputs: chatPrompt,
    parameters: {
      temperature: 0.1,
      // Add any other generation parameters as needed
    },
    options: {
      wait_for_model: true,
      stream: true, // Enable streaming if supported by the model
    },
  };

  const modelUrl = process.env.AI_MODEL_URL as string;

  // Call the Hugging Face Inference API
  const hfResponse = await fetch(modelUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  /* const response = await hfResponse.json();
  console.log("---------------HFResponse_------------", response); */

  // Helper function to process the Hugging Face streaming response
  function HuggingFaceStream(
    response: Response,
    { onCompletion }: { onCompletion: (text: string) => Promise<void> }
  ) {
    const decoder = new TextDecoder();
    let buffer = "";
    // let fullCompletion = "";

    return new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();

        // while (true) {
        const { value } = await reader!.read();
        // if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        /* const lines = buffer.split("\n");
        const data = typeof buffer === "string" ? JSON.parse(buffer) : buffer;
        console.log("***********", JSON.parse(buffer));

        const data = JSON.parse(buffer);

        const fullText = data[0]; */

        const markers = [
          "Assistant: RESPONSE:",
          "RESPONSE:",
          "ANSWER:",
          "ASSISTANT:",
          "ASSISTANT OUTPUT:",
          "Assistant:",
        ];

        let lastIndex = -1;
        let selectedMarker = "";

        for (const marker of markers) {
          const index = buffer.lastIndexOf(marker);
          if (index > lastIndex) {
            lastIndex = index;
            selectedMarker = marker;
          }
        }

        console.log(buffer);

        // let answer;

        if (lastIndex !== -1) {
          const answer = buffer
            .substring(lastIndex + selectedMarker.length)
            .trim();
          const fullText = answer.slice(0, -3);
          const result = fullText.replace(/\\n/g, "\n");
          const encoder = new TextEncoder();

          console.log(typeof fullText);
          console.log("*******", fullText);

          controller.enqueue(encoder.encode(result));

          await onCompletion(result);
          controller.close();
          // console.log("Assistant Response:", answer);
        } else {
          await onCompletion("Model busy ! Please try again later");
          console.error("Assistant response not found.");
        }

        // const answer = fullText.slice(markerIndex + marker.length).trim();
        // console.log("@@@@@@@@@@@@@@ANSWER**********", answer);
      },
    });
  }

  // Create a stream using the helper and define the onCompletion callback
  const stream = HuggingFaceStream(hfResponse, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      // Other headers as needed
    },
  });
};
