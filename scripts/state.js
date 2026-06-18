(function () {
  var STORAGE_VERSION = 1;

  function nowIso() {
    return new Date().toISOString();
  }

  function createId(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function createFilament(overrides) {
    var timestamp = nowIso();
    return Object.assign({
      id: createId("fil"),
      name: "",
      materialType: "",
      brand: "",
      color: "",
      costPerKgZar: "",
      notes: "",
      createdAt: timestamp,
      updatedAt: timestamp
    }, overrides || {});
  }

  function createPartRow(overrides) {
    return Object.assign({
      id: createId("part"),
      partName: "",
      filamentId: "",
      weightGramsPerPart: "",
      quantity: 1
    }, overrides || {});
  }

  function createJob(overrides) {
    var timestamp = nowIso();
    return Object.assign({
      id: createId("job"),
      jobName: "",
      wasteFactorPercent: "",
      printTimeHours: 0,
      printTimeInputHours: "",
      printTimeInputMinutes: "",
      machineRatePerHourZar: "",
      parts: [createPartRow()],
      createdAt: timestamp,
      updatedAt: timestamp
    }, overrides || {});
  }

  function createDefaultState() {
    var job = createJob();
    return {
      version: STORAGE_VERSION,
      filaments: [],
      jobs: [job],
      lastOpenJobId: job.id
    };
  }

  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function touchRecord(record) {
    record.updatedAt = nowIso();
    return record;
  }

  function getActiveJob(state) {
    var activeId = state.lastOpenJobId;
    var job = state.jobs.find(function (item) {
      return item.id === activeId;
    });
    return job || state.jobs[0] || null;
  }

  function upsertFilament(state, filamentInput) {
    var nextState = cloneState(state);
    var index = nextState.filaments.findIndex(function (item) {
      return item.id === filamentInput.id;
    });

    if (index >= 0) {
      nextState.filaments[index] = touchRecord(Object.assign({}, nextState.filaments[index], filamentInput));
    } else {
      nextState.filaments.push(createFilament(filamentInput));
    }

    return nextState;
  }

  function deleteFilament(state, filamentId) {
    var nextState = cloneState(state);
    nextState.filaments = nextState.filaments.filter(function (item) {
      return item.id !== filamentId;
    });
    nextState.jobs = nextState.jobs.map(function (job) {
      job.parts = job.parts.map(function (part) {
        if (part.filamentId === filamentId) {
          return Object.assign({}, part, { filamentId: "" });
        }
        return part;
      });
      return touchRecord(job);
    });
    return nextState;
  }

  function setActiveJob(state, jobId) {
    var nextState = cloneState(state);
    nextState.lastOpenJobId = jobId;
    return nextState;
  }

  function replaceActiveJob(state, jobInput) {
    var nextState = cloneState(state);
    var activeJob = getActiveJob(nextState);
    var normalizedJob = touchRecord(Object.assign({}, activeJob || createJob(), jobInput));
    var index = nextState.jobs.findIndex(function (job) {
      return job.id === normalizedJob.id;
    });

    if (index >= 0) {
      nextState.jobs[index] = normalizedJob;
    } else {
      nextState.jobs.push(normalizedJob);
    }

    nextState.lastOpenJobId = normalizedJob.id;
    return nextState;
  }

  function resetActiveJob(state) {
    var nextState = cloneState(state);
    var newJob = createJob();
    nextState.jobs.push(newJob);
    nextState.lastOpenJobId = newJob.id;
    return nextState;
  }

  function updateJobField(state, fieldName, value) {
    var activeJob = getActiveJob(state);
    if (!activeJob) {
      return state;
    }
    var nextJob = Object.assign({}, activeJob);
    nextJob[fieldName] = value;
    return replaceActiveJob(state, nextJob);
  }

  function addPartRow(state) {
    var activeJob = getActiveJob(state);
    if (!activeJob) {
      return state;
    }
    var nextJob = Object.assign({}, activeJob, {
      parts: activeJob.parts.concat([createPartRow()])
    });
    return replaceActiveJob(state, nextJob);
  }

  function updatePartRow(state, rowId, patch) {
    var activeJob = getActiveJob(state);
    if (!activeJob) {
      return state;
    }

    var nextJob = Object.assign({}, activeJob, {
      parts: activeJob.parts.map(function (part) {
        if (part.id !== rowId) {
          return part;
        }
        return Object.assign({}, part, patch);
      })
    });

    return replaceActiveJob(state, nextJob);
  }

  function removePartRow(state, rowId) {
    var activeJob = getActiveJob(state);
    if (!activeJob) {
      return state;
    }

    var nextParts = activeJob.parts.filter(function (part) {
      return part.id !== rowId;
    });

    if (!nextParts.length) {
      nextParts = [createPartRow()];
    }

    return replaceActiveJob(state, Object.assign({}, activeJob, {
      parts: nextParts
    }));
  }

  window.AppState = {
    STORAGE_VERSION: STORAGE_VERSION,
    createDefaultState: createDefaultState,
    createFilament: createFilament,
    createJob: createJob,
    createPartRow: createPartRow,
    cloneState: cloneState,
    getActiveJob: getActiveJob,
    upsertFilament: upsertFilament,
    deleteFilament: deleteFilament,
    setActiveJob: setActiveJob,
    replaceActiveJob: replaceActiveJob,
    resetActiveJob: resetActiveJob,
    updateJobField: updateJobField,
    addPartRow: addPartRow,
    updatePartRow: updatePartRow,
    removePartRow: removePartRow
  };
}());
