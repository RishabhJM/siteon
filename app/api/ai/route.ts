import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req:NextRequest) {
    const url = process.env.CHAT_COMPLETIONS_URL;
    const model = process.env.CHAT_COMPLETIONS_MODEL;
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const { messages } = await req.json();
        if (!url || !model || !apiKey) {
            throw new Error("Chat completions url or model or api key is not configured");
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            console.error("[api/ai POST] Missing messages in request");
            return NextResponse.json({ error: "At least one message is required" }, { status: 400 });
        }

        // The Interactions API accepts a string input. The client currently
        // sends OpenAI-shaped messages, so flatten their text before sending.
        const input = messages
            .map((message: { role?: string; content?: string }) => {
                const content = typeof message.content === "string" ? message.content : "";
                return message.role && message.role !== "user"
                    ? `${message.role}:\n${content}`
                    : content;
            })
            .filter(Boolean)
            .join("\n\n");

        const response = await axios.post(
            url,
            {
                model,
                input,
                stream: true,
            },
            {
                headers: {
                    "x-goog-api-key": apiKey,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000", // optional
                    "X-Title": "My Next.js App", // optional
                },
                responseType: "stream", // important for streaming
            }
        );

        const stream = response.data;

        // Return as a web stream so frontend can consume
        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            start(controller) {
                let buffer = "";
                let closed = false;

                const close = () => {
                    if (!closed) {
                        closed = true;
                        controller.close();
                    }
                };

                stream.on("data", (chunk:any) => {
                    buffer += chunk.toString("utf8");
                    const payloads = buffer.split(/\r?\n\r?\n/);
                    buffer = payloads.pop() ?? "";

                    for (const payload of payloads) {
                        const data = payload
                            .split(/\r?\n/)
                            .filter((line: string) => line.startsWith("data:"))
                            .map((line: string) => line.slice("data:".length).trimStart())
                            .join("\n");

                        if (!data) continue;
                        if (data === "[DONE]") {
                            close();
                            return;
                        }

                        try {
                            const event = JSON.parse(data);
                            if (event.event_type === "step.delta" && event.delta?.type === "text" && event.delta.text) {
                                controller.enqueue(encoder.encode(event.delta.text));
                            }
                        } catch (err) {
                            console.error("Error parsing Gemini stream event", err);
                        }
                    }
                });

                stream.on("end", () => {
                    close();
                });

                stream.on("error", (err:any) => {
                    console.error("Stream error", err);
                    if (!closed) controller.error(err);
                });
            },
        });

        return new NextResponse(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error(
            "[api/ai POST] Request failed:",
            error instanceof Error ? error.message : error
        );
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
