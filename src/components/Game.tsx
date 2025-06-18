import React, { useEffect, useState } from "react";
import Board from "./Board";

const Game: React.FC = () => {
  const [position, setPosition] = useState("startpos");
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    if (!streaming || !sessionId) return;

    const eventSource = new EventSource(
      `http://localhost:8000/stream-fen?session_id=${sessionId}`
    );

    eventSource.addEventListener("fen_update", (event) => {
      console.log("Received FEN:", event.data);
      setPosition(event.data);
    });

    eventSource.addEventListener("end", () => {
      console.log("Streaming finished.");
      eventSource.close();
      setStreaming(false);
    });

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [streaming, sessionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleStart = async () => {
    if (!file) {
      alert("Please select a video file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8000/upload-video-stream",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setStreaming(true);
      } else {
        console.error("Failed to get session ID from backend.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Board curPosition={position} />

      <input type="file" accept="video/*" onChange={handleFileChange} />

      <button
        onClick={handleStart}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload & Start Live Detection
      </button>
    </div>
  );
};

export default Game;
