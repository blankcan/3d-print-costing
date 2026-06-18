const JSON_HEADERS = {
  "Content-Type": "application/json"
};

async function request(path, options = {}) {
  const response = await fetch(path, options);
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

export const api = {
  bootstrap() {
    return request("/api/bootstrap");
  },
  getSettings() {
    return request("/api/settings");
  },
  updateSettings(payload) {
    return request("/api/settings", {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload)
    });
  },
  listFilaments() {
    return request("/api/filaments");
  },
  createFilament(payload) {
    return request("/api/filaments", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload)
    });
  },
  updateFilament(id, payload) {
    return request(`/api/filaments/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload)
    });
  },
  deleteFilament(id) {
    return request(`/api/filaments/${id}`, { method: "DELETE" });
  },
  listJobs() {
    return request("/api/jobs");
  },
  createJob() {
    return request("/api/jobs", { method: "POST" });
  },
  getJob(id) {
    return request(`/api/jobs/${id}`);
  },
  getActiveJob() {
    return request("/api/jobs/active/current");
  },
  updateJob(id, payload) {
    return request(`/api/jobs/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload)
    });
  },
  deleteJob(id) {
    return request(`/api/jobs/${id}`, { method: "DELETE" });
  },
  exportAppState() {
    return request("/api/app-state/export");
  },
  importAppState(payload) {
    return request("/api/app-state/import", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload)
    });
  }
};
