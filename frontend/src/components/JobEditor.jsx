import {
  Alert,
  Badge,
  Button,
  Checkbox,
  FileButton,
  Group,
  Image,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { IconInfoCircle, IconPhoto, IconPhotoOff, IconPlus, IconTrash, IconUpload } from "@tabler/icons-react";
import { createTempId } from "../utils/ids.js";

const JOB_STATUS_OPTIONS = [
  { value: "PLANNING", label: "Planning" },
  { value: "PRINTING", label: "Printing" },
  { value: "COMPLETE", label: "Complete" }
];

function getFilamentSupportText(filament) {
  const brand = filament?.brand?.trim();
  const color = filament?.color?.trim();

  if (brand && color) {
    return `${brand} - ${color}`;
  }

  if (brand || color) {
    return brand || color;
  }

  return "Unspecified";
}

function renderFilamentOption({ option }) {
  return (
    <Stack gap={2}>
      <Text fw={600} size="sm">
        {option.label}
      </Text>
      <Text size="xs" c="dimmed">
        {option.supportText}
      </Text>
    </Stack>
  );
}

export function JobEditor({
  jobs,
  activeJob,
  rowErrors,
  jobErrors,
  customers,
  filaments,
  saveState,
  onRetrySave,
  onSelectJob,
  onRequestDeleteJob,
  onChange,
  onAddPartRow,
  onRemovePartRow,
  onUploadJobImage,
  onRemoveJobImage
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
    label: filament.name || "Unnamed filament",
    supportText: getFilamentSupportText(filament),
    searchText: [filament.name || "", filament.brand || "", filament.color || ""].join(" ").trim()
  }));
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name
  }));
  const saveStateConfig =
    saveState?.status === "saving"
      ? { label: "Saving", color: "sand" }
      : saveState?.status === "failed"
        ? { label: "Save failed", color: "red" }
        : saveState?.status === "saved"
          ? { label: "Saved", color: "teal" }
          : { label: "Not saved yet", color: "gray" };

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
            <Group gap="xs" mt="sm">
              <Badge color={saveStateConfig.color} variant="light">
                {saveStateConfig.label}
              </Badge>
              {saveState?.status === "failed" ? (
                <Button variant="subtle" size="compact-sm" color="red" onClick={onRetrySave}>
                  Retry Save
                </Button>
              ) : null}
            </Group>
            {saveState?.status === "failed" && saveState?.error?.message ? (
              <Text size="sm" c="red" mt="xs">
                {saveState.error.message}
              </Text>
            ) : null}
          </div>

          <Stack gap="sm" miw={260}>
            <Select
              label="Saved Jobs"
              value={activeJob.id}
              onChange={(value) => value && onSelectJob(value)}
              data={jobs.map((job, index) => ({
                value: job.id,
                label: `${job.jobName || `Untitled Job ${index + 1}`} - ${JOB_STATUS_OPTIONS.find((option) => option.value === job.status)?.label || "Planning"}`
              }))}
            />
            <Button variant="default" color="red" onClick={() => onRequestDeleteJob(activeJob)}>
              Delete Job
            </Button>
          </Stack>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
          <TextInput label="Job Name" value={activeJob.jobName || ""} onChange={(event) => updateField("jobName", event.target.value)} />
          <Select
            label="Job Status"
            data={JOB_STATUS_OPTIONS}
            value={activeJob.status || "PLANNING"}
            onChange={(value) => updateField("status", value || "PLANNING")}
          />
          <Select
            label="Customer"
            placeholder="No customer selected"
            data={customerOptions}
            value={activeJob.customerId || null}
            onChange={(value) => updateField("customerId", value || "")}
            clearable
            searchable
            nothingFoundMessage="No saved customers yet"
          />
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
            allowDecimal={false}
            step={1}
            value={activeJob.printTimeInputHours ?? 0}
            onChange={(value) => updateField("printTimeInputHours", value)}
          />
          <NumberInput
            label="Print Time Minutes"
            min={0}
            max={59}
            allowDecimal={false}
            step={1}
            value={activeJob.printTimeInputMinutes ?? 0}
            onChange={(value) => updateField("printTimeInputMinutes", value)}
          />
        </SimpleGrid>

        <Paper p="md" radius="md" withBorder bg="rgba(255,255,255,0.66)">
          <Stack gap="sm">
            <Group justify="space-between" align="center" wrap="wrap">
              <div>
                <Title order={4}>Workflow Metadata</Title>
                <Text size="sm" c="dimmed">
                  These fields help track job progress and fulfillment. They do not affect costing.
                </Text>
              </div>
              <Badge color={activeJob.status === "COMPLETE" ? "teal" : activeJob.status === "PRINTING" ? "sand" : "sage"} variant="light">
                {JOB_STATUS_OPTIONS.find((option) => option.value === activeJob.status)?.label || "Planning"}
              </Badge>
            </Group>

            <Alert color="sage" variant="light" icon={<IconInfoCircle size={18} />}>
              Status, paid, and delivered are informational only. Totals, weights, and markup suggestions stay unchanged.
            </Alert>

            <Group gap="xl" wrap="wrap">
              <Checkbox
                label="Paid"
                checked={Boolean(activeJob.paid)}
                onChange={(event) => updateField("paid", event.currentTarget.checked)}
              />
              <Checkbox
                label="Delivered"
                checked={Boolean(activeJob.delivered)}
                onChange={(event) => updateField("delivered", event.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </Paper>

        <Paper p="md" radius="md" withBorder bg="rgba(255,255,255,0.66)">
          <Stack gap="sm">
            <Group justify="space-between" align="center" wrap="wrap">
              <div>
                <Title order={4}>Primary Job Image</Title>
                <Text size="sm" c="dimmed">
                  Attach one reference image for this job. It is visual only and does not affect pricing.
                </Text>
              </div>
              <Badge color={activeJob.imagePath ? "sage" : "gray"} variant="light" leftSection={activeJob.imagePath ? <IconPhoto size={14} /> : <IconPhotoOff size={14} />}>
                {activeJob.imagePath ? "Image Attached" : "No Image"}
              </Badge>
            </Group>

            {activeJob.imagePath ? (
              <>
                {activeJob.imageAvailable ? (
                  <Image
                    src={activeJob.imageUrl}
                    alt={activeJob.imageFileName || "Job image"}
                    radius="md"
                    mah={260}
                    fit="contain"
                  />
                ) : (
                  <Alert color="yellow" variant="light" icon={<IconPhotoOff size={18} />}>
                    The saved image reference exists on this job, but the local file is missing. You can replace or remove it.
                  </Alert>
                )}

                <Text size="sm" c="dimmed">
                  Saved file: {activeJob.imageFileName || activeJob.imagePath}
                </Text>
              </>
            ) : (
              <Alert color="sage" variant="light" icon={<IconPhoto size={18} />}>
                No image is attached yet. Upload a PNG, JPEG, WEBP, or GIF file.
              </Alert>
            )}

            <Group gap="sm" wrap="wrap">
              <FileButton accept="image/png,image/jpeg,image/webp,image/gif" onChange={onUploadJobImage}>
                {(props) => (
                  <Button variant={activeJob.imagePath ? "default" : "light"} color="sage" leftSection={<IconUpload size={18} />} {...props}>
                    {activeJob.imagePath ? "Replace Image" : "Upload Image"}
                  </Button>
                )}
              </FileButton>

              {activeJob.imagePath ? (
                <Button variant="subtle" color="red" leftSection={<IconTrash size={16} />} onClick={onRemoveJobImage}>
                  Remove Image
                </Button>
              ) : null}
            </Group>
          </Stack>
        </Paper>

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
          {activeJob.parts.map((part, index) => {
            const selectedFilament = filaments.find((filament) => filament.id === part.filamentId) || null;

            return (
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
                    renderOption={renderFilamentOption}
                    filter={({ options, search }) => {
                      const query = search.trim().toLowerCase();
                      if (!query) {
                        return options;
                      }

                      return options.filter((option) => {
                        const haystack = [option.label, option.supportText, option.searchText].join(" ").toLowerCase();
                        return haystack.includes(query);
                      });
                    }}
                    nothingFoundMessage="No filaments saved yet"
                  />
                  <NumberInput
                    label="Weight / Part (g)"
                    min={0}
                    decimalScale={2}
                    value={part.weightGramsPerPart ?? ""}
                    onChange={(value) => updatePart(part.id, "weightGramsPerPart", value)}
                  />
                  <NumberInput
                    label="Quantity"
                    min={1}
                    allowDecimal={false}
                    step={1}
                    value={part.quantity ?? 1}
                    onChange={(value) => updatePart(part.id, "quantity", value)}
                  />
                </SimpleGrid>

                {selectedFilament ? (
                  <Paper p="sm" radius="md" withBorder bg="rgba(255,255,255,0.8)">
                    <Stack gap={2}>
                      <Text size="xs" tt="uppercase" fw={700} c="sage.7" ls="0.08em">
                        Selected Filament
                      </Text>
                      <Text fw={600} size="sm">
                        {selectedFilament.name || "Unnamed filament"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {getFilamentSupportText(selectedFilament)}
                      </Text>
                    </Stack>
                  </Paper>
                ) : null}

                {(rowErrors[part.id] || []).length ? (
                  <Text c="red" size="sm">
                    {(rowErrors[part.id] || []).join(" ")}
                  </Text>
                ) : null}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
