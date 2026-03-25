import React from "react";
import type { Message, ExtractedEntities } from "./types";

export function getSenderId(): string {
  if (typeof window === "undefined") return "user_default";
  let id = localStorage.getItem("chatbot_sender_id");
  if (!id) {
    id = "user_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("chatbot_sender_id", id);
  }
  return id;
}

export function renderMarkdown(text: string): React.ReactNode {
  return text.split("\n").map((line, lineIndex, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
    return (
      <span key={lineIndex}>
        {rendered}
        {lineIndex < arr.length - 1 && <br />}
      </span>
    );
  });
}

export function extractEntitiesFromMessages(messages: Message[]): ExtractedEntities {
  const entities: ExtractedEntities = {};
  for (const msg of messages) {
    if (msg.sender !== "bot" || !msg.trip_package) continue;
    const pkg = msg.trip_package;
    if (pkg.destination) entities.destination = pkg.destination;
    if (pkg.duration_days) entities.duration = pkg.duration_days;
    if (pkg.flights[0]?.departure) entities.flight_from = pkg.flights[0].departure;
    if (pkg.flights[0]?.arrival) entities.flight_to = pkg.flights[0].arrival;
  }
  return entities;
}
