(function () {
  function createUi(config) {
    var root = config.root;
    var onFilamentSubmit = config.onFilamentSubmit;
    var onFilamentEdit = config.onFilamentEdit;
    var onFilamentDelete = config.onFilamentDelete;
    var onFilamentCancelEdit = config.onFilamentCancelEdit;
    var onJobFieldChange = config.onJobFieldChange;
    var onAddPartRow = config.onAddPartRow;
    var onPartRowChange = config.onPartRowChange;
    var onPartRowRemove = config.onPartRowRemove;
    var onExport = config.onExport;
    var onImport = config.onImport;
    var onResetJob = config.onResetJob;

    var elements = {
      appMessage: root.querySelector("#app-message"),
      filamentForm: root.querySelector("#filament-form"),
      filamentId: root.querySelector("#filament-id"),
      filamentName: root.querySelector("#filament-name"),
      filamentMaterialType: root.querySelector("#filament-material-type"),
      filamentBrand: root.querySelector("#filament-brand"),
      filamentColor: root.querySelector("#filament-color"),
      filamentCost: root.querySelector("#filament-cost"),
      filamentNotes: root.querySelector("#filament-notes"),
      filamentFormErrors: root.querySelector("#filament-form-errors"),
      filamentCancelButton: root.querySelector("#filament-cancel-button"),
      filamentTableBody: root.querySelector("#filament-table-body"),
      filamentEmptyState: root.querySelector("#filament-empty-state"),
      jobName: root.querySelector("#job-name"),
      jobSelector: root.querySelector("#job-selector"),
      jobWasteFactor: root.querySelector("#job-waste-factor"),
      jobMachineRate: root.querySelector("#job-machine-rate"),
      jobTimeHours: root.querySelector("#job-time-hours"),
      jobTimeMinutes: root.querySelector("#job-time-minutes"),
      jobFormErrors: root.querySelector("#job-form-errors"),
      addPartButton: root.querySelector("#add-part-button"),
      partRows: root.querySelector("#part-rows"),
      partsEmptyState: root.querySelector("#parts-empty-state"),
      resultsValidation: root.querySelector("#results-validation"),
      summaryMaterialCost: root.querySelector("#summary-material-cost"),
      summaryMachineCost: root.querySelector("#summary-machine-cost"),
      summaryGrandTotal: root.querySelector("#summary-grand-total"),
      summaryAdjustedWeight: root.querySelector("#summary-adjusted-weight"),
      breakdownTableBody: root.querySelector("#breakdown-table-body"),
      breakdownEmptyState: root.querySelector("#breakdown-empty-state"),
      suggestionsTableBody: root.querySelector("#suggestions-table-body"),
      exportButton: root.querySelector("#export-button"),
      importInput: root.querySelector("#import-input"),
      resetJobButton: root.querySelector("#reset-job-button")
    };

    var editingFilamentId = null;

    elements.filamentForm.addEventListener("submit", function (event) {
      event.preventDefault();
      onFilamentSubmit(readFilamentForm());
    });

    elements.filamentCancelButton.addEventListener("click", function () {
      clearFilamentForm();
      onFilamentCancelEdit();
    });

    ["input", "change"].forEach(function (eventName) {
      elements.jobName.addEventListener(eventName, handleJobFieldChange);
      elements.jobWasteFactor.addEventListener(eventName, handleJobFieldChange);
      elements.jobMachineRate.addEventListener(eventName, handleJobFieldChange);
      elements.jobTimeHours.addEventListener(eventName, handleJobFieldChange);
      elements.jobTimeMinutes.addEventListener(eventName, handleJobFieldChange);
    });
    elements.jobSelector.addEventListener("change", function () {
      config.onJobSelect(elements.jobSelector.value);
    });

    elements.addPartButton.addEventListener("click", onAddPartRow);
    elements.exportButton.addEventListener("click", onExport);
    elements.resetJobButton.addEventListener("click", onResetJob);
    elements.importInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        onImport(String(reader.result || ""));
        elements.importInput.value = "";
      };
      reader.onerror = function () {
        onImport(null, new Error("Unable to read the selected file."));
        elements.importInput.value = "";
      };
      reader.readAsText(file);
    });

    function readFilamentForm() {
      return {
        id: elements.filamentId.value || undefined,
        name: elements.filamentName.value.trim(),
        materialType: elements.filamentMaterialType.value.trim(),
        brand: elements.filamentBrand.value.trim(),
        color: elements.filamentColor.value.trim(),
        costPerKgZar: elements.filamentCost.value.trim(),
        notes: elements.filamentNotes.value.trim()
      };
    }

    function clearFilamentForm() {
      editingFilamentId = null;
      elements.filamentForm.reset();
      elements.filamentId.value = "";
      elements.filamentFormErrors.textContent = "";
      elements.filamentCancelButton.hidden = true;
    }

    function handleJobFieldChange(event) {
      var fieldMap = {
        "job-name": "jobName",
        "job-waste-factor": "wasteFactorPercent",
        "job-machine-rate": "machineRatePerHourZar",
        "job-time-hours": "printTimeInputHours",
        "job-time-minutes": "printTimeInputMinutes"
      };
      onJobFieldChange(fieldMap[event.target.id], event.target.value);
    }

    function renderFilamentTable(state) {
      elements.filamentTableBody.innerHTML = "";
      elements.filamentEmptyState.style.display = state.filaments.length ? "none" : "block";

      state.filaments.forEach(function (filament) {
        var row = document.createElement("tr");
        row.innerHTML = [
          "<td><strong>" + escapeHtml(filament.name || "Unnamed filament") + "</strong></td>",
          "<td>" + escapeHtml(filament.materialType || "Unspecified") + "</td>",
          "<td>" + escapeHtml(filament.brand || "Unspecified") + "</td>",
          "<td>" + escapeHtml(filament.color || "Unspecified") + "</td>",
          "<td>" + formatCurrency(filament.costPerKgZar || 0) + "</td>",
          "<td><div class='row-actions'><button type='button' class='text-button' data-action='edit'>Edit</button><button type='button' class='text-button is-danger' data-action='delete'>Delete</button></div></td>"
        ].join("");

        row.querySelector("[data-action='edit']").addEventListener("click", function () {
          editingFilamentId = filament.id;
          elements.filamentId.value = filament.id;
          elements.filamentName.value = filament.name || "";
          elements.filamentMaterialType.value = filament.materialType || "";
          elements.filamentBrand.value = filament.brand || "";
          elements.filamentColor.value = filament.color || "";
          elements.filamentCost.value = filament.costPerKgZar === "" ? "" : String(filament.costPerKgZar);
          elements.filamentNotes.value = filament.notes || "";
          elements.filamentCancelButton.hidden = false;
          onFilamentEdit(filament.id);
        });

        row.querySelector("[data-action='delete']").addEventListener("click", function () {
          onFilamentDelete(filament.id);
          if (editingFilamentId === filament.id) {
            clearFilamentForm();
          }
        });

        elements.filamentTableBody.appendChild(row);
      });
    }

    function renderJobForm(job, validation) {
      renderJobSelector(config.getJobs(), job.id);
      elements.jobName.value = job.jobName || "";
      elements.jobWasteFactor.value = job.wasteFactorPercent === "" ? "" : String(job.wasteFactorPercent);
      elements.jobMachineRate.value = job.machineRatePerHourZar === "" ? "" : String(job.machineRatePerHourZar);
      elements.jobTimeHours.value = job.printTimeInputHours === "" ? "" : String(job.printTimeInputHours || "");
      elements.jobTimeMinutes.value = job.printTimeInputMinutes === "" ? "" : String(job.printTimeInputMinutes || "");
      elements.jobFormErrors.textContent = validation.errors.join(" ");
    }

    function renderJobSelector(jobs, activeJobId) {
      elements.jobSelector.innerHTML = "";
      jobs.forEach(function (job, index) {
        var option = document.createElement("option");
        option.value = job.id;
        option.textContent = job.jobName ? job.jobName : "Untitled Job " + (index + 1);
        option.selected = job.id === activeJobId;
        elements.jobSelector.appendChild(option);
      });
    }

    function renderPartRows(job, state, calculationResult) {
      var filaments = state.filaments;
      elements.partRows.innerHTML = "";
      elements.partsEmptyState.style.display = job.parts.length ? "none" : "block";

      job.parts.forEach(function (part, index) {
        var card = document.createElement("article");
        card.className = "part-row-card";

        var rowMessages = calculationResult.validation.rowErrors[part.id] || [];
        card.innerHTML = [
          "<header>",
          "<div><h3>Part Row " + (index + 1) + "</h3><div class='part-row-meta'>" + escapeHtml(part.partName || "Unnamed part") + "</div></div>",
          "<button type='button' class='ghost-button' data-remove-row>Remove</button>",
          "</header>",
          "<div class='field-grid two-up'>",
          "<label><span>Part Name</span><input type='text' data-field='partName' value='" + escapeAttribute(part.partName || "") + "' maxlength='120' placeholder='Left Bracket'></label>",
          "<label><span>Filament</span>" + buildFilamentSelectMarkup(filaments, part.filamentId) + "</label>",
          "<label><span>Weight / Part (g)</span><input type='number' data-field='weightGramsPerPart' min='0' step='0.01' value='" + escapeAttribute(part.weightGramsPerPart === "" ? "" : String(part.weightGramsPerPart || "")) + "' placeholder='35'></label>",
          "<label><span>Quantity</span><input type='number' data-field='quantity' min='1' step='1' value='" + escapeAttribute(part.quantity === "" ? "" : String(part.quantity || "")) + "' placeholder='4'></label>",
          "</div>",
          "<div class='inline-errors'>" + escapeHtml(rowMessages.join(" ")) + "</div>"
        ].join("");

        var inputs = card.querySelectorAll("[data-field]");
        inputs.forEach(function (input) {
          ["input", "change"].forEach(function (eventName) {
            input.addEventListener(eventName, function () {
              onPartRowChange(part.id, input.getAttribute("data-field"), input.value);
            });
          });
        });

        card.querySelector("[data-remove-row]").addEventListener("click", function () {
          onPartRowRemove(part.id);
        });

        elements.partRows.appendChild(card);
      });
    }

    function renderResults(calculationResult) {
      elements.resultsValidation.textContent = "";
      elements.breakdownTableBody.innerHTML = "";
      elements.suggestionsTableBody.innerHTML = "";

      if (!calculationResult.validation.isValid) {
        var messages = calculationResult.validation.errors.slice();
        if (Object.keys(calculationResult.validation.rowErrors).length) {
          messages.push("Complete the highlighted part rows to unlock full costing results.");
        }
        elements.resultsValidation.textContent = messages.join(" ");
      }

      elements.summaryMaterialCost.textContent = formatCurrency(calculationResult.totalMaterialCostZar);
      elements.summaryMachineCost.textContent = formatCurrency(calculationResult.totalMachineCostZar);
      elements.summaryGrandTotal.textContent = formatCurrency(calculationResult.grandTotalCostZar);
      elements.summaryAdjustedWeight.textContent = formatWeight(calculationResult.totalAdjustedWeightGrams);

      var showRows = calculationResult.validation.isValid && calculationResult.rows.length > 0;
      elements.breakdownEmptyState.style.display = showRows ? "none" : "block";

      calculationResult.rows.forEach(function (row) {
        if (!showRows) {
          return;
        }
        var tr = document.createElement("tr");
        tr.innerHTML = [
          "<td>" + escapeHtml(row.partName || "Unnamed part") + "</td>",
          "<td>" + escapeHtml(row.filamentLabel || "Unknown filament") + "</td>",
          "<td>" + escapeHtml(String(row.quantity)) + "</td>",
          "<td>" + formatWeight(row.baseWeightGrams) + "</td>",
          "<td>" + formatWeight(row.adjustedWeightGrams) + "</td>",
          "<td>" + formatCurrency(row.materialCostZar) + "</td>",
          "<td>" + formatCurrency(row.allocatedMachineCostZar) + "</td>",
          "<td>" + formatCurrency(row.lineTotalCostZar) + "</td>",
          "<td>" + formatCurrency(row.costPerPartZar) + "</td>"
        ].join("");
        elements.breakdownTableBody.appendChild(tr);
      });

      calculationResult.suggestions.forEach(function (suggestion) {
        var tr = document.createElement("tr");
        tr.innerHTML = [
          "<td>" + suggestion.markupPercent + "%</td>",
          "<td>" + formatCurrency(suggestion.suggestedTotalPriceZar) + "</td>",
          "<td>" + formatCurrency(suggestion.profitZar) + "</td>"
        ].join("");
        elements.suggestionsTableBody.appendChild(tr);
      });
    }

    function buildFilamentSelectMarkup(filaments, selectedId) {
      var options = ["<select data-field='filamentId'><option value=''>Select filament</option>"];
      filaments.forEach(function (filament) {
        var isSelected = filament.id === selectedId ? " selected" : "";
        options.push("<option value='" + escapeAttribute(filament.id) + "'" + isSelected + ">" + escapeHtml(filament.name || "Unnamed filament") + " - " + escapeHtml(formatCurrency(filament.costPerKgZar || 0)) + "</option>");
      });
      options.push("</select>");
      return options.join("");
    }

    function render(state, derived) {
      renderFilamentTable(state);
      renderJobForm(derived.activeJob, derived.calculationResult.validation);
      renderPartRows(derived.activeJob, state, derived.calculationResult);
      renderResults(derived.calculationResult);
      elements.filamentCancelButton.hidden = !editingFilamentId;
    }

    function setFilamentFormError(message) {
      elements.filamentFormErrors.textContent = message || "";
    }

    function setMessage(message, isError) {
      elements.appMessage.textContent = message || "";
      elements.appMessage.classList.toggle("is-error", Boolean(isError));
    }

    return {
      render: render,
      clearFilamentForm: clearFilamentForm,
      setFilamentFormError: setFilamentFormError,
      setMessage: setMessage
    };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  }

  function formatWeight(value) {
    return window.Calculations.roundTo(Number(value || 0), 2) + " g";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  window.AppUi = {
    createUi: createUi,
    formatCurrency: formatCurrency,
    formatWeight: formatWeight
  };
}());
