import { Event } from "@/lib/types";
import axios from "axios";
// import { env } from "@/lib/env";

const createApiClient = (baseURL: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const apiClient = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    events: {
      stream: () => streamEvents(),
    },
  };

  async function* streamEvents(): AsyncGenerator<Event, void, unknown> {
    // const source = apiClient.CancelToken.source();
    const streamClient = axios.create({
      baseURL,
      // timeout: 10000,
      headers: {
        // 'Content-Type': 'application/json',
      },
      // cancelToken: source.token,
    });

    try {
      const response = await streamClient.get(`api/events/stream`, {
        responseType: "stream",
        // cancelToken: source.token,
      });

      const stream = response.data;

      for await (const chunk of stream) {
        try {
          console.log(chunk);
          const parsedChunk = JSON.parse(chunk.toString()) as Event;
          console.log(parsedChunk);
          yield parsedChunk;
        } catch (parseError) {
          console.error("Error parsing stream data:", parseError);
        }
      }
    } catch (error) {
      // if (apiClient.isCancel(error)) {
      //   console.log("Stream canceled:", error.message);
      // } else {
      //   console.error("Streaming error:", error);
      // }
      console.error("Streaming error:", error);
    } finally {
      // source.cancel("Streaming canceled by client.");
    }
  }
};

export const eventApi = createApiClient(process.env.NEXT_PUBLIC_EVENT_API_URL || "");
