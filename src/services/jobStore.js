// jobStore.js
const jobs = new Map(); // id -> job

exports.add = (job) => {
  jobs.set(job.id, job);
  return job;
};

exports.findById = (id) => jobs.get(id) || null;

exports.findByOwner = (ownerId) =>
  Array.from(jobs.values()).filter((j) => j.ownerId === ownerId);

