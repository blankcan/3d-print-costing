import {
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { createTempId } from "../utils/ids.js";

export function JobEditor({
  jobs,
  activeJob,
  rowErrors,
  jobErrors,
  filaments,
  onSelectJob,
  onRequestDeleteJob,
  onChange,
  onAddPartRow,
  onRemovePartRow
}) {
  if (!activeJob) {
    return (
      <Paper>
        <Text c="dimmed">No job loaded yet.</Text>
      </Paper>
    );
  }

  const filamentOptions = filaments.map((filament) => ({
    value: filament.id,
    label: `${filament.name} - ${new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(filament.costPerKgZar || 0)}`
  }));

  function updateField(field, value) {
    onChange({ ...activeJob, [field]: value });
  }

  function updatePart(partId, field, value) {
    onChange({
      ...activeJob,
      parts: activeJob.parts.map((part) => (part.id === partId ? { ...part, [field]: value } : part))
    });
  }

  return (
    <Paper>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
          <div>
            <Text tt="uppercase" fw={700} fz="xs" c="sage.7" ls="0.08em">
              Job Builder
            </Text>
            <Title order={2} mt={4}>
              Active Costing Job
            </Title>
          </div>

          <Stack gap="sm" miw={260}>
            <Select
              label="Saved Jobs"
              value={activeJob.id}
              onChange={(value) => value && onSelectJob(value)}
              data={jobs.map((job, index) => ({
                value: job.id,
                label: job.jobName || `Untitled Job ${index + 1}`
              }))}
            />
            <Button variant="default" color="red" onClick={() => onRequestDeleteJob(activeJob)}>
              Delete Job
            </Button>
          </Stack>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
          <TextInput label="Job Name" value={activeJob.jobName || ""} onChange={(event) => updateField("jobName", event.target.value)} />
          <NumberInput
            label="Waste Factor (%)"
            min={0}
            decimalScale={2}
            value={activeJob.wasteFactorPercent ?? 0}
            onChange={(value) => updateField("wasteFactorPercent", value)}
          />
          <NumberInput
            label="Machine Rate / Hour (R)"
            min={0}
            decimalScale={2}
            value={activeJob.machineRatePerHourZar ?? 0}
            onChange={(value) => updateField("machineRatePerHourZar", value)}
          />
          <NumberInput
            label="Print Time Hours"
            min={0}
            value={activeJob.printTimeInputHours ?? 0}
            onChange={(value) => updateField("printTimeInputHours", value)}
          />
          <NumberInput
            label="Print Time Minutes"
            min={0}
            value={activeJob.printTimeInputMinutes ?? 0}
            onChange={(value) => updateField("printTimeInputMinutes", value)}
          />
        </SimpleGrid>

        {jobErrors.length ? (
          <Text c="red" size="sm">
            {jobErrors.join(" ")}
          </Text>
        ) : null}

        <Group justify="space-between" align="center">
          <Title order={3}>Part Rows</Title>
          <Button
            variant="light"
            color="sage"
            leftSection={<IconPlus size={18} />}
            onClick={() =>
              onAddPartRow({
                id: createTempId("part"),
                partName: "",
                filamentId: "",
                weightGramsPerPart: "",
                quantity: 1
              })
            }
          >
            Add Part Row
          </Button>
        </Group>

        <Stack gap="md">
          {activeJob.parts.map((part, index) => (
            <Paper key={part.id} p="md" radius="md" withBorder bg="rgba(255,255,255,0.72)">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start" gap="sm">
                  <div>
                    <Title order={4}>Part Row {index + 1}</Title>
                    <Text size="sm" c="dimmed">
                      {part.partName || "Unnamed part"}
                    </Text>
                  </div>
                  <Button
                    variant="subtle"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => onRemovePartRow(part.id)}
                  >
                    Remove
                  </Button>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput label="Part Name" value={part.partName || ""} onChange={(event) => updatePart(part.id, "partName", event.target.value)} />
                  <Select
                    label="Filament"
                    placeholder="Select filament"
                    value={part.filamentId || null}
                    onChange={(value) => updatePart(part.id, "filamentId", value || "")}
                    data={filamentOptions}
                    searchable
                    nothingFoundMessage="No filaments saved yet"
                  />
                  <NumberInput
                    label="Weight / Part (g)"
                    min={0}
                    decimalScale={2}
                    value={part.weightGramsPerPart ?? ""}
                    onChange={(value) => updatePart(part.id, "weightGramsPerPart", value)}
                  />
                  <NumberInput label="Quantity" min={1} value={part.quantity ?? 1} onChange={(value) => updatePart(part.id, "quantity", value)} />
                </SimpleGrid>

                {(rowErrors[part.id] || []).length ? (
                  <Text c="red" size="sm">
                    {(rowErrors[part.id] || []).join(" ")}
                  </Text>
                ) : null}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
