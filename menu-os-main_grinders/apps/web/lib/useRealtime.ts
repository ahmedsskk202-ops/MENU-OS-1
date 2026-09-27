"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { RealtimeEvent } from "./realtime";

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io({ path: "/socket.io", autoConnect: true });
  }
  return sharedSocket;
}

/** Subscribe to real-time events for one or more rooms (branch/table-session/game-session ids). */
export function useRealtime(rooms: string[], onEvent: (event: RealtimeEvent) => void) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (rooms.length === 0) return;
    const socket = getSocket();
    const join = () => rooms.forEach((room) => socket.emit("join", room));
    join();

    const handler = (event: RealtimeEvent) => handlerRef.current(event);
    socket.on("event", handler);
    // Room membership lives on the server, keyed to a specific socket connection — it
    // does not survive a reconnect (a new connection gets a new socket id and starts in
    // no rooms at all). Without rejoining here, a client that quietly reconnects after a
    // network blip or the tab being backgrounded would keep "listening" forever without
    // the server ever broadcasting to it again, silently going stale.
    socket.on("connect", join);

    return () => {
      socket.off("event", handler);
      socket.off("connect", join);
      rooms.forEach((room) => socket.emit("leave", room));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.join(",")]);
}
