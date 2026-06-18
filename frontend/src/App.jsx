import {
  AppShell,
  Box,
  Grid,
  Group,
  Paper,
  Stack,
  Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "./components/AppHeader.jsx";
import { ConfirmDialog } from "./components/ConfirmDialog.jsx";
import { FilamentPanel } from "./components/FilamentPanel.jsx";
import { JobEditor } from "./components/JobEditor.jsx";
import { ResultsPanel } from "./components/ResultsPanel.jsx";
import { SettingsDrawer } from "./components/SettingsDrawer.jsx";
import { api } from "./services/api.js";

export function App() {
  const [filaments, setFilaments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [calculations, setCalculations] = useState(null);
  const [settings, setSettings] = useState({
    defaultMachineRatePerHourZar: 0,
    defaultWasteFactorPercent: 0
  });
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

  useEffect(() => {
    loadBootstrap();
  }, []);

  function showSuccess(title, message) {
    notifications.show({ color: "sage", title, message });
  }

  function showError(title, error) {
    notifications.show({ color: "red", title, message: error.message || String(error) });
  }

  async function loadBootstrap() {
    setLoading(true);
    try {
      const data = await api.bootstrap();
      setSettings(data.settings || { defaultMachineRatePerHourZar: 0, defaultWasteFactorPercent: 0 });
      setFilaments(data.filaments);
      setJobs(data.jobs);
      setActiveJob(data.activeJob);
      setCalculations(data.calculations);
      showSuccess("Loaded local data", "Your saved catalog, job list, settings, and current job are ready.");
    } catch (error) {
      showError("Load failed", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshJobListsAndActive(jobResponse) {
    const jobsResponse = await api.listJobs();
    setJobs(jobsResponse.jobs);
    setActiveJob(jobResponse.job);
    setCalculations(jobResponse.calculations);
  }

  async function handleSaveFilament(editingId, draft) {
    const payload = { ...draft, costPerKgZar: draft.costPerKgZar };
    const result = editingId ? await api.updateFilament(editingId, payload) : await api.createFilament(payload);
    setFilaments(result.filaments);
    if (activeJob) {
      const refreshedJob = await api.getJob(activeJob.id);
      setActiveJob(refreshedJob.job);
      setCalculations(refreshedJob.calculations);
    }
    showSuccess(editingId ? "Filament updated" : "Filament saved", "The filament catalog is up to date.");
  }

  async function handleDeleteFilament(filamentId) {
    await api.deleteFilament(filamentId);
    const filamentResponse = await api.listFilaments();
    setFilaments(filamentResponse.filaments);
    if (activeJob) {
      const refreshedJob = await api.getJob(activeJob.id);
      setActiveJob(refreshedJob.job);
      setCalculations(refreshedJob.calculations);
    }
    showSuccess("Filament deleted", "The catalog entry was removed.");
  }

  async function handleCreateJob() {
    const result = await api.createJob();
    await refreshJobListsAndActive(result);
    showSuccess("Started a new job", "The new job inherited the current saved defaults.");
  }

  async function handleSelectJob(jobId) {
    const result = await api.getJob(jobId);
    setActiveJob(result.job);
    setCalculations(result.calculations);
    showSuccess("Loaded saved job", "The selected job is now active.");
  }

  async function deleteJob(jobId) {
    await api.deleteJob(jobId);
    const bootstrap = await api.bootstrap();
    setSettings(bootstrap.settings || { defaultMachineRatePerHourZar: 0, defaultWasteFactorPercent: 0 });
    setFilaments(bootstrap.filaments);
    setJobs(bootstrap.jobs);
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

  async function saveJob(nextJob) {
    if (!activeJob) {
      return;
    }
    const result = await api.updateJob(activeJob.id, nextJob);
    await refreshJobListsAndActive(result);
  }

  async function handleJobChange(nextJob) {
    try {
      await saveJob(nextJob);
    } catch (error) {
      showError("Job update failed", error);
    }
  }

  async function handleAddPartRow(part) {
    if (!activeJob) {
      return;
    }
    await handleJobChange({
      ...activeJob,
      parts: [...activeJob.parts, part]
    });
    showSuccess("Part row added", "The costing job now includes the new row.");
  }

  async function handleRemovePartRow(partId) {
    if (!activeJob) {
      return;
    }
    const nextParts = activeJob.parts.filter((part) => part.id !== partId);
    await handleJobChange({
      ...activeJob,
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

  async function handleExport() {
    const state = await api.exportAppState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `3d-print-costing-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showSuccess("State exported", "The portable app-state JSON file has been downloaded.");
  }

  async function handleImport(text) {
    try {
      const parsed = JSON.parse(text);
      const state = await api.importAppState(parsed);
      const activeJobId = state.lastOpenJobId || state.jobs[0]?.id || null;
      const jobsResponse = await api.listJobs();
      setJobs(jobsResponse.jobs);
      setSettings(state.settings || { defaultMachineRatePerHourZar: 0, defaultWasteFactorPercent: 0 });
      setFilaments(state.filaments);

      if (activeJobId) {
        const active = await api.getJob(activeJobId);
        setActiveJob(active.job);
        setCalculations(active.calculations);
      } else {
        setActiveJob(null);
        setCalculations(null);
      }

      showSuccess("State imported", "The imported settings, catalog, and jobs have been restored.");
    } catch (error) {
      showError("Import failed", error);
    }
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
            <AppHeader
              onExport={handleExport}
              onImport={handleImport}
              onCreateJob={handleCreateJob}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </Box>
        </AppShell.Header>

        <AppShell.Main>
          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={{ base: 12, md: 4, xl: 3 }}>
              <FilamentPanel filaments={filaments} onSave={handleSaveFilament} onRequestDelete={requestDeleteFilament} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 8, xl: 9 }}>
              <Grid gutter="lg" align="flex-start">
                <Grid.Col span={{ base: 12, xl: 7 }}>
                  <JobEditor
                    jobs={jobs}
                    activeJob={activeJob}
                    rowErrors={rowErrors}
                    jobErrors={jobErrors}
                    filaments={filaments}
                    onSelectJob={handleSelectJob}
                    onRequestDeleteJob={requestDeleteJob}
                    onChange={handleJobChange}
                    onAddPartRow={handleAddPartRow}
                    onRemovePartRow={handleRemovePartRow}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xl: 5 }}>
                  <ResultsPanel calculations={calculations} />
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>
        </AppShell.Main>
      </AppShell>

      <SettingsDrawer isOpen={isSettingsOpen} settings={settings} onClose={() => setIsSettingsOpen(false)} onSave={handleSaveSettings} />
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
