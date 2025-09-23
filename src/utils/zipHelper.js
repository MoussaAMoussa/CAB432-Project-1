// src/utils/zipHelper.js
const archiver = require("archiver");
const fs = require("fs");

exports.streamZipOfFiles = (res, files) =>
  new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });

    // debug: lifecycle
    archive.on("warning", (err) => console.warn("[ZIP warning]", err.message));
    archive.on("error", (err) => { console.error("[ZIP error]", err); reject(err); });
    archive.on("entry", (entry) => console.log("[ZIP entry]", entry.name));
    archive.on("finish", () => console.log("[ZIP] archive finish"));
    archive.on("end", () => console.log("[ZIP] archive end"));

    // pipe first
    archive.pipe(res);

    // add files
    let added = 0;
    for (const f of files || []) {
      if (f && f.filePath && fs.existsSync(f.filePath)) {
        console.log("[ZIP add]", f.filePath, "->", f.name || "file");
        archive.file(f.filePath, { name: f.name || "file" });
        added++;
      } else {
        console.warn("[ZIP skip] missing:", f && f.filePath);
      }
    }
    if (added === 0) console.warn("[ZIP] no files added!");

    // resolve when the response finishes or closes
    res.on("finish", () => { console.log("[ZIP] res finish"); resolve(); });
    res.on("close", () => { console.log("[ZIP] res close"); resolve(); });

    // finalize to actually write the central directory
    archive.finalize();
  });

