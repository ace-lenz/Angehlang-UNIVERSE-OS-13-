export interface Scene {
  id: number;
  time: string;
  description: string;
  vfx: string;
  color?: number; // HSL hue 0-360
}

export interface VideoData {
  title: string;
  duration: string;
  fps: number;
  scenes: Scene[];
}

export const DEFAULT_VIDEO_DATA: VideoData = {
  title: "Untitled Sovereign Render",
  duration: "01:00",
  fps: 60,
  scenes: [
    { id: 1, time: "00:00", description: "Initialization Sequence", vfx: "data stream neural", color: 210 },
    { id: 2, time: "00:15", description: "Core Manifestation", vfx: "quantum bloom", color: 280 },
  ]
};
