(function () {
  var STORAGE_KEY = "3d-print-costing-app-state";
  var STORAGE_VERSION = window.AppState.STORAGE_VERSION;

  function normalizeTopLevelState(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Imported file does not contain a valid app state object.");
    }

    if (payload.version !== STORAGE_VERSION) {
      throw new Error("Unsupported data version. Expected version " + STORAGE_VERSION + ".");
    }

    if (!Array.isArray(payload.filaments) || !Array.isArray(payload.jobs)) {
      throw new Error("Imported data is missing filaments or jobs arrays.");
    }

    var nextState = {
      version: STORAGE_VERSION,
      filaments: payload.filaments.map(validateFilament),
      jobs: payload.jobs.map(validateJob),
      lastOpenJobId: payload.lastOpenJobId || null
    };

    if (!nextState.jobs.length) {
      var newState = window.AppState.createDefaultState();
      nextState.jobs = newState.jobs;
      nextState.lastOpenJobId = newState.lastOpenJobId;
    }

    if (!nextState.lastOpenJobId || !nextState.jobs.some(function (job) { return job.id === nextState.lastOpenJobId; })) {
      nextState.lastOpenJobId = nextState.jobs[0].id;
    }

    return nextState;
  }

  function validateFilament(item) {
    if (!item || typeof item !== "object") {
      throw new Error("A filament entry is invalid.");
    }

    return {
      id: String(item.id || window.AppState.createFilament().id),
      name: String(item.name || ""),
      materialType: String(item.materialType || ""),
      brand: String(item.brand || ""),
      color: String(item.color || ""),
      costPerKgZar: item.costPerKgZar === "" ? "" : Number(item.costPerKgZar),
      notes: String(item.notes || ""),
      createdAt: String(item.createdAt || new Date().toISOString()),
      updatedAt: String(item.updatedAt || item.createdAt || new Date().toISOString())
    };
  }

  function validateJob(job) {
    if (!job || typeof job !== "object") {
      throw new Error("A job entry is invalid.");
    }

    if (!Array.isArray(job.parts)) {
      throw new Error("A job is missing its parts array.");
    }

    return {
      id: String(job.id || window.AppState.createJob().id),
      jobName: String(job.jobName || ""),
      wasteFactorPercent: job.wasteFactorPercent === "" ? "" : Number(job.wasteFactorPercent || 0),
      printTimeHours: Number(job.printTimeHours || 0),
      printTimeInputHours: job.printTimeInputHours === undefined ? String(Math.floor(Number(job.printTimeHours || 0))) : String(job.printTimeInputHours),
      printTimeInputMinutes: job.printTimeInputMinutes === undefined ? String(Math.round((Number(job.printTimeHours || 0) % 1) * 60)) : String(job.printTimeInputMinutes),
      machineRatePerHourZar: job.machineRatePerHourZar === "" ? "" : Number(job.machineRatePerHourZar || 0),
      parts: job.parts.map(validatePart),
      createdAt: String(job.createdAt || new Date().toISOString()),
      updatedAt: String(job.updatedAt || job.createdAt || new Date().toISOString())
    };
  }

  function validatePart(part) {
    if (!part || typeof part !== "object") {
      throw new Error("A part row is invalid.");
    }

    return {
      id: String(part.id || window.AppState.createPartRow().id),
      partName: String(part.partName || ""),
      filamentId: String(part.filamentId || ""),
      weightGramsPerPart: part.weightGramsPerPart === "" ? "" : Number(part.weightGramsPerPart || 0),
      quantity: part.quantity === "" ? "" : Number(part.quantity || 0)
    };
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return window.AppState.createDefaultState();
      }
      return normalizeTopLevelState(JSON.parse(raw));
    } catch (error) {
      console.warn("Failed to load saved state:", error);
      return window.AppState.createDefaultState();
    }
  }

  function saveState(state) {
    var normalized = normalizeTopLevelState(state);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function exportState(state) {
    return JSON.stringify(normalizeTopLevelState(state), null, 2);
  }

  function importStateFromText(text) {
    var parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error("Import file is not valid JSON.");
    }
    return normalizeTopLevelState(parsed);
  }

  function triggerJsonDownload(filename, text) {
    var blob = new Blob([text], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  window.Persistence = {
    STORAGE_KEY: STORAGE_KEY,
    STORAGE_VERSION: STORAGE_VERSION,
    normalizeTopLevelState: normalizeTopLevelState,
    loadState: loadState,
    saveState: saveState,
    exportState: exportState,
    importStateFromText: importStateFromText,
    triggerJsonDownload: triggerJsonDownload
  };
}());
