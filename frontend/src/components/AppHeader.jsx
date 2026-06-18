import { ActionIcon, Button, FileButton, Group, Stack, Text, Title } from "@mantine/core";
import { IconDownload, IconPlus, IconSettings2, IconUpload } from "@tabler/icons-react";

export function AppHeader({ onExport, onImport, onCreateJob, onOpenSettings }) {
  async function handleImport(file) {
    if (!file) {
      return;
    }

    const text = await file.text();
    onImport(text);
  }

  return (
    <Group justify="space-between" align="flex-start" gap="lg" wrap="wrap">
      <Stack gap={6}>
        <Text tt="uppercase" fw={700} fz="xs" c="sage.7" ls="0.08em">
          Local-first costing platform
        </Text>
        <Title order={1}>3D Print Costing</Title>
        <Text maw={860} c="dimmed">
          Mantine-based local pricing workspace for South African Rand costing with backend-backed defaults, durable jobs, and
          reusable filament pricing.
        </Text>
      </Stack>

      <Group gap="sm" wrap="wrap">
        <ActionIcon variant="light" color="sage" size={44} radius="xl" onClick={onOpenSettings} aria-label="Open settings">
          <IconSettings2 size={20} />
        </ActionIcon>
        <Button variant="default" leftSection={<IconDownload size={18} />} onClick={onExport}>
          Export JSON
        </Button>
        <FileButton accept="application/json" onChange={handleImport}>
          {(props) => (
            <Button variant="default" leftSection={<IconUpload size={18} />} {...props}>
              Import JSON
            </Button>
          )}
        </FileButton>
        <Button color="sage" leftSection={<IconPlus size={18} />} onClick={onCreateJob}>
          New Job
        </Button>
      </Group>
    </Group>
  );
}
