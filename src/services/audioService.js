// src/services/audioService.js
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// Optional: if you installed ffmpeg-static, uncomment to pin the binary locally
// const ffmpegPath = require("ffmpeg-static");
// if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Transcode an input audio file into 3 MP3 variants:
 * - HQ: 320 kbps, stereo
 * - MQ: 192 kbps, stereo
 * - LQ: 96 kbps, mono
 *
 * @param {Object} opts
 * @param {string} opts.inputPath  - Absolute path to uploaded file
 * @param {string} opts.baseName   - Safe base filename (no extension)
 * @param {string} opts.workDir    - Per-request working directory for outputs
 * @returns {Promise<Array<{filePath:string,name:string}>>}
 */
exports.transcodeVariants = async ({ inputPath, baseName, workDir }) => {
  const profiles = [
    { name: `${baseName}_HQ_320kbps.mp3`, args: { bitrate: "320k", channels: 2, sampleRate: 44100 } },
    { name: `${baseName}_MQ_192kbps.mp3`, args: { bitrate: "192k", channels: 2, sampleRate: 44100 } },
    { name: `${baseName}_LQ_96kbps_mono.mp3`, args: { bitrate: "96k",  channels: 1, sampleRate: 44100 } },
  ];

  const runOne = (outName, { bitrate, channels, sampleRate }) =>
    new Promise((resolve, reject) => {
      const outPath = path.join(workDir, outName);
      let stderr = "";

      ffmpeg(inputPath)
        .audioCodec("libmp3lame")          // force mp3 encoder (use libshine if your ffmpeg lacks lame)
        .audioBitrate(bitrate)             // e.g. "192k"
        .audioChannels(channels)           // 1 or 2
        .audioFrequency(sampleRate)        // e.g. 44100
        .format("mp3")
        .on("start", (cmd) => console.log(`[ffmpeg] ${outName} -> ${cmd}`))
        .on("stderr", (line) => { stderr += line + "\n"; })
        .on("end", () => {
          console.log(`[ffmpeg] done: ${outName}`);
          resolve(outPath);
        })
        .on("error", (err) => {
          err.message = `FFmpeg failed for ${outName}: ${err.message}\n${stderr}`;
          reject(err);
        })
        .save(outPath);
    });

  const results = [];
  // Run sequentially for a sustained CPU load (parallel is possible if you prefer)
  for (const p of profiles) {
    const filePath = await runOne(p.name, p.args);
    results.push({ filePath, name: p.name });
  }

  return results;
};

