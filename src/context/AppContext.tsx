// ============================================
// Application Context - Shared State Management
// ============================================
// This context provides real-time event broadcasting between modules
// When an order/request/booking is created, it notifies the admin dashboard

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { AppEvent, EventType } from "../types";

interface AppContextType {
  events: AppEvent[];
  emitEvent: (type: EventType, payload: any) => void;
  subscribe: (callback: (event: AppEvent) => void, options?: { replayRecent?: boolean; eventTypes?: EventType[] }) => () => void;
  getRecentEvents: (eventTypes?: EventType[], limit?: number) => AppEvent[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [subscribers, setSubscribers] = useState<Set<(event: AppEvent) => void>>(new Set());
  const eventsRef = useRef<AppEvent[]>([]);
  const subscribersRef = useRef<Set<(event: AppEvent) => void>>(new Set());

  // Keep refs in sync with state
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    subscribersRef.current = subscribers;
  }, [subscribers]);

  const emitEvent = (type: EventType, payload: any) => {
    const event: AppEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    console.log("📡 Context: Emitting event", event.type, event.payload);

    setEvents((prev) => {
      const updated = [event, ...prev].slice(0, 100); // Keep last 100 events
      eventsRef.current = updated; // Update ref immediately
      console.log("📡 Context: Events updated, total:", updated.length);
      return updated;
    });

    // Notify all subscribers using ref to get current subscribers
    console.log("📡 Context: Notifying subscribers, count:", subscribersRef.current.size);
    subscribersRef.current.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("📡 Context: Error in subscriber callback:", error);
      }
    });

    // In a real app, you would also send this to a WebSocket server
    // or use a service like Firebase Realtime Database or Supabase Realtime
  };

  const getRecentEvents = (eventTypes?: EventType[], limit: number = 50): AppEvent[] => {
    let filtered = eventsRef.current;
    if (eventTypes && eventTypes.length > 0) {
      filtered = eventsRef.current.filter(e => eventTypes.includes(e.type));
    }
    return filtered.slice(0, limit);
  };

  const subscribe = (
    callback: (event: AppEvent) => void,
    options?: { replayRecent?: boolean; eventTypes?: EventType[] }
  ) => {
    // Replay recent events if requested (for components that mount after events were emitted)
    if (options?.replayRecent) {
      let filtered = eventsRef.current;
      if (options.eventTypes && options.eventTypes.length > 0) {
        filtered = eventsRef.current.filter(e => options.eventTypes!.includes(e.type));
      }
      const recentEvents = filtered.slice(0, 50);
      console.log("📡 Context: Replaying recent events to new subscriber", recentEvents.length, "events");
      // Replay events asynchronously to avoid state update issues
      setTimeout(() => {
        recentEvents.forEach((event) => {
          try {
            callback(event);
          } catch (error) {
            console.error("Error replaying event:", error);
          }
        });
      }, 0);
    }

    setSubscribers((prev) => {
      const updated = new Set([...prev, callback]);
      subscribersRef.current = updated; // Update ref immediately
      console.log("📡 Context: New subscriber added, total subscribers:", updated.size);
      return updated;
    });

    // Return unsubscribe function
    return () => {
      setSubscribers((prev) => {
        const next = new Set(prev);
        next.delete(callback);
        subscribersRef.current = next; // Update ref immediately
        console.log("📡 Context: Subscriber removed, remaining:", next.size);
        return next;
      });
    };
  };

  return (
    <AppContext.Provider value={{ events, emitEvent, subscribe, getRecentEvents }}>
      {children}
    </AppContext.Provider>
  );
}

// Export hook separately to maintain Fast Refresh compatibility
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

