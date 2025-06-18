import React, { useRef, useState, useEffect } from "react";

interface Props {
  updatePosition: (newPosition: string) => void;
  addMove: (move: string) => void;
}

const VideoCapture: React.FC<Props> = ({ updatePosition, addMove }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"CALIBRATE" | "MOVE">("CALIBRATE");
  const [resultMessage, setResultMessage] = useState(
    "Upload a video and press Calibrate"
  );

  useEffect(() => {
    if (videoFile && videoRef.current) {
      videoRef.current.src = URL.createObjectURL(videoFile);
    }
  }, [videoFile]);

  const getFrame = (): string | null => {
    const canvas = canvasRef.current!;
    const video = videoRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx || !video.videoWidth) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg");
  };

  const sendFrame = async (url: string, payload: object) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  const handleCalibrate = async () => {
    const img = getFrame();
    if (!img) return setResultMessage("No frame available");
    setResultMessage("Calibrating...");
    const res = await sendFrame("http://localhost:8000/calibrate", {
      data: img,
    });
    setResultMessage(res.message);
    if (res.status === "CALIBRATION_COMPLETE") setMode("MOVE");
  };

  const handleMove = async () => {
    const img = getFrame();
    if (!img) return setResultMessage("No frame available");
    setResultMessage("Detecting move...");
    const res = await sendFrame("http://localhost:8000/make_move", {
      data: img,
    });
    setResultMessage(res.message);
    if (res.status === "OK") {
      updatePosition(res.position);
      addMove(res.move);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
      />
      <video ref={videoRef} controls width="500" />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div>
        <button
          onClick={() =>
            videoRef.current && (videoRef.current.currentTime -= 1 / 30)
          }
        >
          ⏪ Prev
        </button>
        <button
          onClick={() =>
            videoRef.current && (videoRef.current.currentTime += 1 / 30)
          }
        >
          ⏩ Next
        </button>
      </div>
      <button onClick={mode === "CALIBRATE" ? handleCalibrate : handleMove}>
        {mode === "CALIBRATE" ? "Calibrate" : "Confirm Move"}
      </button>
      <p>{resultMessage}</p>
    </div>
  );
};

export default VideoCapture;
