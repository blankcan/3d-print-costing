(function () {
  var state = window.Persistence.loadState();
  var ui;

  function deriveState() {
    var activeJob = window.AppState.getActiveJob(state);
    if (!activeJob) {
      state = window.AppState.resetActiveJob(state);
      activeJob = window.AppState.getActiveJob(state);
    }

    var calculationResult = window.Calculations.calculateJob(activeJob, state.filaments);
    return {
      activeJob: activeJob,
      calculationResult: calculationResult
    };
  }

  function persistAndRender(message, isError) {
    state = window.Persistence.saveState(state);
    var derived = deriveState();
    ui.render(state, derived);
    ui.setMessage(message || "", isError);
  }

  function validateFilamentForm(filament) {
    if (!filament.name) {
      return "Filament name is required.";
    }
    if (!filament.materialType) {
      return "Material type is required.";
    }
    if (!filament.costPerKgZar) {
      return "Cost per kg is required.";
    }
    var cost = Number(filament.costPerKgZar);
    if (!Number.isFinite(cost) || cost <= 0) {
      return "Cost per kg must be greater than 0.";
    }
    return "";
  }

  function normalizeFilamentInput(filament) {
    return {
      id: filament.id,
      name: filament.name,
      materialType: filament.materialType,
      brand: filament.brand,
      color: filament.color,
      costPerKgZar: Number(filament.costPerKgZar),
      notes: filament.notes
    };
  }

  function bootstrap() {
    ui = window.AppUi.createUi({
      root: document,
      onFilamentSubmit: function (filament) {
        var error = validateFilamentForm(filament);
        ui.setFilamentFormError(error);
        if (error) {
          return;
        }
        state = window.AppState.upsertFilament(state, normalizeFilamentInput(filament));
        ui.clearFilamentForm();
        persistAndRender("Filament saved.");
      },
      onFilamentEdit: function () {
        ui.setFilamentFormError("");
      },
      onFilamentDelete: function (filamentId) {
        state = window.AppState.deleteFilament(state, filamentId);
        persistAndRender("Filament deleted.");
      },
      onFilamentCancelEdit: function () {
        ui.setMessage("Filament edit cancelled.", false);
      },
      onJobFieldChange: function (fieldName, value) {
        state = window.AppState.updateJobField(state, fieldName, value);

        if (fieldName === "printTimeInputHours" || fieldName === "printTimeInputMinutes") {
          var activeJob = window.AppState.getActiveJob(state);
          var normalizedTime = window.Calculations.normalizeTimeHours(activeJob.printTimeInputHours, activeJob.printTimeInputMinutes);
          state = window.AppState.updateJobField(state, "printTimeHours", normalizedTime);
        }

        persistAndRender("");
      },
      onJobSelect: function (jobId) {
        state = window.AppState.setActiveJob(state, jobId);
        persistAndRender("Loaded saved job.");
      },
      getJobs: function () {
        return state.jobs;
      },
      onAddPartRow: function () {
        state = window.AppState.addPartRow(state);
        persistAndRender("Part row added.");
      },
      onPartRowChange: function (rowId, fieldName, value) {
        var nextValue = value;
        if (fieldName === "quantity" || fieldName === "weightGramsPerPart") {
          nextValue = value;
        }
        state = window.AppState.updatePartRow(state, rowId, buildPatch(fieldName, nextValue));
        persistAndRender("");
      },
      onPartRowRemove: function (rowId) {
        state = window.AppState.removePartRow(state, rowId);
        persistAndRender("Part row removed.");
      },
      onExport: function () {
        var timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        var filename = "3d-print-costing-backup-" + timestamp + ".json";
        window.Persistence.triggerJsonDownload(filename, window.Persistence.exportState(state));
        ui.setMessage("State exported to JSON.");
      },
      onImport: function (text, fileError) {
        if (fileError) {
          ui.setMessage(fileError.message, true);
          return;
        }
        try {
          state = window.Persistence.importStateFromText(text);
          persistAndRender("State imported from JSON.");
        } catch (error) {
          ui.setMessage(error.message, true);
        }
      },
      onResetJob: function () {
        state = window.AppState.resetActiveJob(state);
        persistAndRender("Started a new job.");
      }
    });

    var workedExampleCheck = window.Calculations.runWorkedExampleCheck();
    if (!workedExampleCheck.passed) {
      console.error("Worked example check failed:", workedExampleCheck.result);
    }

    persistAndRender(workedExampleCheck.passed ? "Worked example calculation check passed." : "Worked example calculation check failed. Inspect the console for details.", !workedExampleCheck.passed);
  }

  function buildPatch(fieldName, value) {
    var patch = {};
    patch[fieldName] = value;
    return patch;
  }

  bootstrap();
}());
