import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";

export function ConfirmDialog({ opened, title, message, confirmLabel = "Confirm", onCancel, onConfirm, loading }) {
  return (
    <Modal opened={opened} onClose={onCancel} centered title={<Title order={4}>{title}</Title>}>
      <Stack gap="lg">
        <Text c="dimmed">{message}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
