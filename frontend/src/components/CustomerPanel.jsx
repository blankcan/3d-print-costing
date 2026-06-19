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

const EMPTY_CUSTOMER = {
  name: "",
  cellNumber: "",
  email: "",
  deliveryAddress: ""
};

export function CustomerPanel({ customers, onSave, onRequestDelete }) {
  const [draft, setDraft] = useState(EMPTY_CUSTOMER);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingId && !customers.some((customer) => customer.id === editingId)) {
      setEditingId(null);
      setDraft(EMPTY_CUSTOMER);
      setError("");
    }
  }, [customers, editingId]);

  function startEdit(customer) {
    setEditingId(customer.id);
    setDraft({
      name: customer.name || "",
      cellNumber: customer.cellNumber || "",
      email: customer.email || "",
      deliveryAddress: customer.deliveryAddress || ""
    });
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSave(editingId, draft);
      setDraft(EMPTY_CUSTOMER);
      setEditingId(null);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY_CUSTOMER);
    setError("");
  }

  return (
    <Paper>
      <Stack gap="lg">
        <div>
          <Text tt="uppercase" fw={700} fz="xs" c="sage.7" ls="0.08em">
            Catalog
          </Text>
          <Title order={3} mt={4}>
            Customers
          </Title>
        </div>

        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput
              label="Name"
              required
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            />
            <TextInput
              label="Cell Number"
              value={draft.cellNumber}
              onChange={(event) => setDraft((current) => ({ ...current, cellNumber: event.target.value }))}
            />
            <TextInput
              label="Email"
              value={draft.email}
              onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
            />
            <Textarea
              label="Delivery Address"
              minRows={3}
              value={draft.deliveryAddress}
              onChange={(event) => setDraft((current) => ({ ...current, deliveryAddress: event.target.value }))}
            />
            {error ? (
              <Text c="red" size="sm">
                {error}
              </Text>
            ) : null}
            <Group>
              <Button type="submit" color="sage" loading={submitting}>
                {editingId ? "Update Customer" : "Save Customer"}
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

        {customers.length === 0 ? (
          <Text c="dimmed">No saved customers yet. Add one if you want to link jobs to a person or delivery destination.</Text>
        ) : (
          <ScrollArea.Autosize mah={540} offsetScrollbars>
            <Table striped highlightOnHover withTableBorder withColumnBorders={false}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Address</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {customers.map((customer) => (
                  <Table.Tr key={customer.id}>
                    <Table.Td>
                      <Text fw={600}>{customer.name || "Unnamed customer"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm">{customer.cellNumber || "No cell number"}</Text>
                        <Text size="xs" c="dimmed">
                          {customer.email || "No email"}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={customer.deliveryAddress ? undefined : "dimmed"}>
                        {customer.deliveryAddress || "No delivery address"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button variant="subtle" size="compact-sm" onClick={() => startEdit(customer)}>
                          Edit
                        </Button>
                        <Button variant="subtle" size="compact-sm" color="red" onClick={() => onRequestDelete(customer)}>
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
