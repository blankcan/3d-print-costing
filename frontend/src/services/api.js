const JSON_HEADERS = {
  "Content-Type": "application/json"
};

export class ApiError extends Error {
  constructor(message, { status, validation } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.validation = validation || null;
  }
}

async function request(path, options = {}) {
  const response = await fetch(path, options);
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(data.error || "Request failed.", {
      status: response.status,
      validation: data.validation || null
    });
  }
  return data;
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const [, base64Data = ""] = result.split(",", 2);
      resolve(base64Data);
    };
    reader.onerror = () => reject(new Error("Failed to read the selected image file."));
    reader.readAsDataURL(file);
  });
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
  listCustomers() {
    return request("/api/customers");
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
  createCustomer(payload) {
    return request("/api/customers", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload)
    });
  },
  updateCustomer(id, payload) {
    return request(`/api/customers/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload)
    });
  },
  deleteCustomer(id) {
    return request(`/api/customers/${id}`, { method: "DELETE" });
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
  async uploadJobImage(id, file) {
    const base64Data = await fileToBase64(file);
    return request(`/api/jobs/${id}/image`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        base64Data
      })
    });
  },
  removeJobImage(id) {
    return request(`/api/jobs/${id}/image`, { method: "DELETE" });
  },
  deleteJob(id) {
    return request(`/api/jobs/${id}`, { method: "DELETE" });
  }
};
