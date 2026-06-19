import { AppShell, Box, Grid, Paper, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateJob } from "../../shared/calculations/index.js";
import { AppHeader } from "./components/AppHeader.jsx";
import { ConfirmDialog } from "./components/ConfirmDialog.jsx";
import { JobEditor } from "./components/JobEditor.jsx";
import { ResultsPanel } from "./components/ResultsPanel.jsx";
import { SettingsDrawer } from "./components/SettingsDrawer.jsx";
import { api } from "./services/api.js";
import { createJobAutosaveManager } from "./utils/jobAutosave.js";

const EMPTY_SETTINGS = {
  defaultMachineRatePerHourZar: 0,
  defaultWasteFactorPercent: 0
};

function toJobListItem(job) {
  return {
    id: job.id,
    jobName: job.jobName,
    wasteFactorPercent: job.wasteFactorPercent,
    printTimeHours: job.printTimeHours,
    machineRatePerHourZar: job.machineRatePerHourZar,
    status: job.status,
    paid: Boolean(job.paid),
    delivered: Boolean(job.delivered),
    customerId: job.customerId || "",
    imagePath: job.imagePath || null,
    imageFileName: job.imageFileName || null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    partsCount: Array.isArray(job.parts) ? job.parts.length : job.partsCount || 0
  };
}

function upsertJobListItem(jobs, job) {
  const nextItem = toJobListItem(job);
  const withoutCurrent = jobs.filter((entry) => entry.id !== job.id);
  return [nextItem, ...withoutCurrent].sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")));
}

export function App() {
  const [customers, setCustomers] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [calculations, setCalculations] = useState(null);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmState, setConfirmState] = useState({
    opened: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: null
  });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState({
    status: "idle",
    jobId: null,
    error: null
  });

  const activeJobRef = useRef(activeJob);
  const filamentsRef = useRef(filaments);
  const autosaveRef = useRef(null);

  useEffect(() => {
    activeJobRef.current = activeJob;
  }, [activeJob]);

  useEffect(() => {
    filamentsRef.current = filaments;
  }, [filaments]);

  useEffect(() => {
    autosaveRef.current = createJobAutosaveManager({
      delay: 450,
      persist: (job) => api.updateJob(job.id, job),
      onStateChange: (nextState) => {
        setSaveState((currentActive) => {
          if (nextState.status === "idle") {
            return nextState;
          }

          if (!activeJobRef.current || nextState.jobId === activeJobRef.current.id) {
            return nextState;
          }

          return currentActive;
        });
      },
      onApplyServerState: (result) => {
        setJobs((current) => upsertJobListItem(current, result.job));
        if (activeJobRef.current?.id === result.job.id) {
          setActiveJob(result.job);
          setCalculations(result.calculations);
        }
      }
    });

    return () => {
      autosaveRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    loadBootstrap();
  }, []);

  function showSuccess(title, message) {
    notifications.show({ color: "sage", title, message });
  }

  function showError(title, error) {
    notifications.show({ color: "red", title, message: error.message || String(error) });
  }

  async function flushPendingJobSave() {
    if (!autosaveRef.current) {
      return true;
    }

    try {
      await autosaveRef.current.flushNow();
      return true;
    } catch (error) {
      setSaveState((current) => ({
        ...current,
        status: "failed",
        error
      }));
      return false;
    }
  }

  async function loadBootstrap() {
    setLoading(true);
    autosaveRef.current?.reset();

    try {
      const data = await api.bootstrap();
      setSettings(data.settings || EMPTY_SETTINGS);
      setCustomers(data.customers || []);
      setFilaments(data.filaments || []);
      setJobs(data.jobs || []);
      setActiveJob(data.activeJob);
      setCalculations(data.calculations);
    } catch (error) {
      showError("Load failed", error);
    } finally {
      setLoading(false);
    }
  }

  function applyLocalJob(nextJob) {
    setActiveJob(nextJob);
    setCalculations(calculateJob(nextJob, filamentsRef.current));
    setJobs((current) => upsertJobListItem(current, nextJob));
    autosaveRef.current?.schedule(nextJob);
  }

  async function handleRetrySave() {
    try {
      await autosaveRef.current?.retry();
    } catch (error) {
      setSaveState((current) => ({
        ...current,
        status: "failed",
        error
      }));
    }
  }

  async function handleSaveFilament(editingId, draft) {
    const payload = { ...draft, costPerKgZar: draft.costPerKgZar };
    const result = editingId ? await api.updateFilament(editingId, payload) : await api.createFilament(payload);
    setFilaments(result.filaments);
    if (activeJobRef.current) {
      const refreshedJob = await api.getJob(activeJobRef.current.id);
      setActiveJob(refreshedJob.job);
      setCalculations(refreshedJob.calculations);
      setJobs((current) => upsertJobListItem(current, refreshedJob.job));
    }
    showSuccess(editingId ? "Filament updated" : "Filament saved", "The filament catalog is up to date.");
  }

  async function handleSaveCustomer(editingId, draft) {
    const result = editingId ? await api.updateCustomer(editingId, draft) : await api.createCustomer(draft);
    setCustomers(result.customers);
    if (activeJobRef.current) {
      const refreshedJob = await api.getJob(activeJobRef.current.id);
      setActiveJob(refreshedJob.job);
      setCalculations(refreshedJob.calculations);
      setJobs((current) => upsertJobListItem(current, refreshedJob.job));
    }
    showSuccess(editingId ? "Customer updated" : "Customer saved", "The customer catalog is up to date.");
  }

  async function handleDeleteFilament(filamentId) {
    await api.deleteFilament(filamentId);
    const filamentResponse = await api.listFilaments();
    setFilaments(filamentResponse.filaments);
    if (activeJobRef.current) {
      const refreshedJob = await api.getJob(activeJobRef.current.id);
      setActiveJob(refreshedJob.job);
      setCalculations(refreshedJob.calculations);
      setJobs((current) => upsertJobListItem(current, refreshedJob.job));
    }
    showSuccess("Filament deleted", "The catalog entry was removed.");
  }

  async function handleDeleteCustomer(customerId) {
    await api.deleteCustomer(customerId);
    const customersResponse = await api.listCustomers();
    setCustomers(customersResponse.customers);
    const bootstrap = await api.bootstrap();
    setJobs(bootstrap.jobs);
    setActiveJob(bootstrap.activeJob);
    setCalculations(bootstrap.calculations);
    showSuccess("Customer deleted", "Any linked jobs were cleared and the customer entry was removed.");
  }

  async function handleCreateJob() {
    if (!(await flushPendingJobSave())) {
      return;
    }

    const result = await api.createJob();
    setActiveJob(result.job);
    setCalculations(result.calculations);
    setJobs((current) => upsertJobListItem(current, result.job));
    autosaveRef.current?.reset();
    showSuccess("Started a new job", "The new job inherited the current saved defaults.");
  }

  async function handleUploadJobImage(file) {
    if (!file || !activeJobRef.current) {
      return;
    }

    try {
      const result = await api.uploadJobImage(activeJobRef.current.id, file);
      setActiveJob(result.job);
      setCalculations(result.calculations);
      setJobs((current) => upsertJobListItem(current, result.job));
      showSuccess(activeJobRef.current.imagePath ? "Job image replaced" : "Job image attached", "The job image is saved locally and ready to preview.");
    } catch (error) {
      showError("Image upload failed", error);
    }
  }

  async function handleRemoveJobImage() {
    if (!activeJobRef.current?.imagePath) {
      return;
    }

    try {
      const result = await api.removeJobImage(activeJobRef.current.id);
      setActiveJob(result.job);
      setCalculations(result.calculations);
      setJobs((current) => upsertJobListItem(current, result.job));
      showSuccess("Job image removed", "The primary image reference was cleared from this job.");
    } catch (error) {
      showError("Image removal failed", error);
    }
  }

  async function handleSelectJob(jobId) {
    if (activeJobRef.current?.id === jobId) {
      return;
    }

    if (!(await flushPendingJobSave())) {
      showError("Save failed", saveState.error || new Error("The current job could not be saved yet. Fix the highlighted issues or retry saving first."));
      return;
    }

    const result = await api.getJob(jobId);
    autosaveRef.current?.reset();
    setActiveJob(result.job);
    setCalculations(result.calculations);
  }

  async function deleteJob(jobId) {
    if (activeJobRef.current?.id === jobId && !(await flushPendingJobSave())) {
      showError("Save failed", saveState.error || new Error("The current job could not be saved yet. Fix the highlighted issues or retry saving first."));
      return;
    }

    await api.deleteJob(jobId);
    const bootstrap = await api.bootstrap();
    autosaveRef.current?.reset();
    setSettings(bootstrap.settings || EMPTY_SETTINGS);
    setCustomers(bootstrap.customers || []);
    setFilaments(bootstrap.filaments || []);
    setJobs(bootstrap.jobs || []);
    setActiveJob(bootstrap.activeJob);
    setCalculations(bootstrap.calculations);
    showSuccess("Job deleted", "The active job list has been refreshed.");
  }

  function requestDeleteJob(job) {
    setConfirmState({
      opened: true,
      title: "Delete job",
      message: `Delete ${job.jobName || "this job"}? This cannot be undone.`,
      confirmLabel: "Delete Job",
      onConfirm: async () => {
        await deleteJob(job.id);
      }
    });
  }

  function requestDeleteFilament(filament) {
    setConfirmState({
      opened: true,
      title: "Delete filament",
      message: `Delete ${filament.name || "this filament"}? Part rows that referenced it will need a new selection.`,
      confirmLabel: "Delete Filament",
      onConfirm: async () => {
        await handleDeleteFilament(filament.id);
      }
    });
  }

  function requestDeleteCustomer(customer) {
    setConfirmState({
      opened: true,
      title: "Delete customer",
      message: `Delete ${customer.name || "this customer"}? Any linked jobs will keep their costing data but lose the customer assignment.`,
      confirmLabel: "Delete Customer",
      onConfirm: async () => {
        await handleDeleteCustomer(customer.id);
      }
    });
  }

  async function handleConfirm() {
    if (!confirmState.onConfirm) {
      return;
    }

    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
      setConfirmState((current) => ({ ...current, opened: false, onConfirm: null }));
    } catch (error) {
      showError("Action failed", error);
    } finally {
      setConfirmLoading(false);
    }
  }

  function handleJobChange(nextJob) {
    applyLocalJob(nextJob);
  }

  function handleAddPartRow(part) {
    if (!activeJobRef.current) {
      return;
    }

    applyLocalJob({
      ...activeJobRef.current,
      parts: [...activeJobRef.current.parts, part]
    });
    showSuccess("Part row added", "The costing job now includes the new row.");
  }

  function handleRemovePartRow(partId) {
    if (!activeJobRef.current) {
      return;
    }

    const nextParts = activeJobRef.current.parts.filter((part) => part.id !== partId);
    applyLocalJob({
      ...activeJobRef.current,
      parts: nextParts.length
        ? nextParts
        : [
            {
              id: `part_${Date.now()}`,
              partName: "",
              filamentId: "",
              weightGramsPerPart: "",
              quantity: 1
            }
          ]
    });
    showSuccess("Part row removed", "The costing breakdown has been refreshed.");
  }

  async function handleSaveSettings(nextSettings) {
    try {
      const result = await api.updateSettings(nextSettings);
      setSettings(result.settings);
      showSuccess("Global defaults saved", "New jobs will use the updated Waste % and Machine Rate defaults.");
    } catch (error) {
      showError("Settings update failed", error);
      throw error;
    }
  }

  const rowErrors = useMemo(() => calculations?.validation?.rowErrors || {}, [calculations]);
  const jobErrors = useMemo(() => calculations?.validation?.errors || [], [calculations]);

  if (loading) {
    return (
      <Box className="loading-screen">
        <Paper>
          <Text c="dimmed">Loading local platform...</Text>
        </Paper>
      </Box>
    );
  }

  return (
    <>
      <AppShell padding="lg" className="app-shell" header={{ height: "auto" }}>
        <AppShell.Header className="app-header-shell">
          <Box className="app-header-box">
            <AppHeader onCreateJob={handleCreateJob} onOpenSettings={() => setIsSettingsOpen(true)} />
          </Box>
        </AppShell.Header>

        <AppShell.Main>
          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={12}>
              <Grid gutter="lg" align="flex-start">
                <Grid.Col span={{ base: 12, xl: 8 }}>
                  <JobEditor
                    jobs={jobs}
                    activeJob={activeJob}
                    rowErrors={rowErrors}
                    jobErrors={jobErrors}
                    customers={customers}
                    filaments={filaments}
                    saveState={saveState}
                    onRetrySave={handleRetrySave}
                    onSelectJob={handleSelectJob}
                    onRequestDeleteJob={requestDeleteJob}
                    onChange={handleJobChange}
                    onAddPartRow={handleAddPartRow}
                    onRemovePartRow={handleRemovePartRow}
                    onUploadJobImage={handleUploadJobImage}
                    onRemoveJobImage={handleRemoveJobImage}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xl: 4 }}>
                  <ResultsPanel calculations={calculations} />
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>
        </AppShell.Main>
      </AppShell>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        settings={settings}
        customers={customers}
        filaments={filaments}
        onClose={() => setIsSettingsOpen(false)}
        onSaveDefaults={handleSaveSettings}
        onSaveFilament={handleSaveFilament}
        onRequestDeleteFilament={requestDeleteFilament}
        onSaveCustomer={handleSaveCustomer}
        onRequestDeleteCustomer={requestDeleteCustomer}
      />
      <ConfirmDialog
        opened={confirmState.opened}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        onCancel={() => setConfirmState((current) => ({ ...current, opened: false, onConfirm: null }))}
        onConfirm={handleConfirm}
        loading={confirmLoading}
      />
    </>
  );
}
