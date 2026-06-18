import {
  Button,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title
} from "@mantine/core";
import { useEffect, useState } from "react";

const EMPTY_FILAMENT = {
  name: "",
  materialType: "",
  brand: "",
  color: "",
  costPerKgZar: "",
  notes: ""
};

export function FilamentPanel({ filaments, onSave, onRequestDelete }) {
  const [draft, setDraft] = useState(EMPTY_FILAMENT);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingId && !filaments.some((filament) => filament.id === editingId)) {
      setEditingId(null);
      setDraft(EMPTY_FILAMENT);
      setError("");
    }
  }, [editingId, filaments]);

  function startEdit(filament) {
    setEditingId(filament.id);
    setDraft({
      name: filament.name || "",
      materialType: filament.materialType || "",
      brand: filament.brand || "",
      color: filament.color || "",
      costPerKgZar: String(filament.costPerKgZar ?? ""),
      notes: filament.notes || ""
    });
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSave(editingId, draft);
      setDraft(EMPTY_FILAMENT);
      setEditingId(null);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY_FILAMENT);
    setError("");
  }

  return (
    <Paper className="rail-surface">
      <Stack gap="lg">
        <div>
          <Text tt="uppercase" fw={700} fz="xs" c="sage.7" ls="0.08em">
            Catalog
          </Text>
          <Title order={2} mt={4}>
            Filament Management
          </Title>
        </div>

        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput label="Name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
            <TextInput
              label="Material Type"
              value={draft.materialType}
              onChange={(event) => setDraft((current) => ({ ...current, materialType: event.target.value }))}
            />
            <TextInput label="Brand" value={draft.brand} onChange={(event) => setDraft((current) => ({ ...current, brand: event.target.value }))} />
            <TextInput label="Color" value={draft.color} onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))} />
            <TextInput
              label="Cost Per Kg (R)"
              type="number"
              min="0"
              step="0.01"
              value={draft.costPerKgZar}
              onChange={(event) => setDraft((current) => ({ ...current, costPerKgZar: event.target.value }))}
            />
            <Textarea label="Notes" minRows={3} value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} />
            {error ? (
              <Text c="red" size="sm">
                {error}
              </Text>
            ) : null}
            <Group>
              <Button type="submit" color="sage" loading={submitting}>
                {editingId ? "Update Filament" : "Save Filament"}
              </Button>
              {editingId ? (
                <Button type="button" variant="default" onClick={cancelEdit}>
                  Cancel Edit
                </Button>
              ) : null}
            </Group>
          </Stack>
        </form>

        <Divider />

        {filaments.length === 0 ? (
          <Text c="dimmed">No saved filaments yet. Add one to unlock costing rows.</Text>
        ) : (
          <ScrollArea.Autosize mah={540} offsetScrollbars>
            <Table striped highlightOnHover withTableBorder withColumnBorders={false} className="compact-filament-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Material</Table.Th>
                  <Table.Th>Cost / Kg</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filaments.map((filament) => (
                  <Table.Tr key={filament.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={600}>{filament.name || "Unnamed filament"}</Text>
                        <Text size="xs" c="dimmed">
                          {[filament.brand || "Unspecified", filament.color || "Unspecified"].join(" • ")}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{filament.materialType || "Unspecified"}</Table.Td>
                    <Table.Td>
                      {new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(filament.costPerKgZar || 0)}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button variant="subtle" size="compact-sm" onClick={() => startEdit(filament)}>
                          Edit
                        </Button>
                        <Button variant="subtle" color="red" size="compact-sm" onClick={() => onRequestDelete(filament)}>
                          Delete
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Paper>
  );
}
