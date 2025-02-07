// import {create} from "zustand/index";
// import {eventApiClient} from "@/lib/clients/logi.api";
//
// export const useEventStore = create<{
//   events: Event[];
//   isStreaming: boolean;
//   startEventStream: () => Promise<void>;
//   stopEventStream: () => Promise<void>;
// }>()((set, get) => ({
//   events: [],
//   isStreaming: false,
//   startEventStream: async () => {
//     if (get().isStreaming) return;
//
//     set({ isStreaming: true });
//     try {
//       const response = await eventApiClient.get('/stream', {
//         responseType: 'stream',
//       });
//
//       response.data.on('data', (chunk: string) => {
//         const event = JSON.parse(chunk.toString());
//         set((state) => ({ events: [...state.events, event] }));
//       });
//
//       response.data.on('end', () => {
//         set({ isStreaming: false });
//       });
//     } catch (error) {
//       console.error('Failed to start event stream', error);
//       set({ isStreaming: false, events: [] });
//     }
//   },
//   stopEventStream: async () => {
//     try {
//       await eventApiClient.patch('/close');
//       set({ isStreaming: false });
//     } catch (error) {
//       console.error('Failed to stop event stream', error);
//     }
//   },
// }));
