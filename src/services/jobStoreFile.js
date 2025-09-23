// src/services/jobStoreFile.js
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "storage", "data");
const DB_PATH = path.join(DATA_DIR, "jobs.json");

// simple in-process write queue to avoid concurrent writes corrupting the file
let writing = Promise.resolve();

async function ensureDataFile() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsp.access(DB_PATH, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(DB_PATH, "[]\n", "utf8");
  }
}

async function readAll() {
  const buf = await fsp.readFile(DB_PATH, "utf8");
  try {
    const arr = JSON.parse(buf);
    return Array.isArray(arr) ? arr : [];
  } catch {
    // if file got corrupted somehow, fall back (and do not overwrite)
    return [];
  }
}

async function atomicWrite(arr) {
  const tmp = DB_PATH + ".tmp";
  await fsp.writeFile(tmp, JSON.stringify(arr, null, 2) + "\n", "utf8");
  await fsp.rename(tmp, DB_PATH);
}

function enqueueWrite(fn) {
  // serialize writes to avoid races
  writing = writing.then(fn, fn);
  return writing;
}

exports.init = ensureDataFile;

exports.add = async (job) => {
  await ensureDataFile();
  await enqueueWrite(async () => {
    const all = await readAll();
    all.push(job);
    await atomicWrite(all);
  });
  return job;
};

exports.findById = async (id) => {
  await ensureDataFile();
  const all = await readAll();
  return all.find((j) => j.id === id) || null;
};

exports.findByOwner = async (ownerId, { from, to } = {}) => {
  await ensureDataFile();
  const all = await readAll();
  let list = all.filter((j) => j.ownerId === ownerId);
  if (from) {
    const f = new Date(from);
    list = list.filter((j) => new Date(j.startedAt) >= f);
  }
  if (to) {
    const t = new Date(to);
    list = list.filter((j) => new Date(j.startedAt) <= t);
  }
  // newest first
  list.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  return list;
};

