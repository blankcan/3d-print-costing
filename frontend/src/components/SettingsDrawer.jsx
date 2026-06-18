import { Button, Drawer, NumberInput, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

export function SettingsDrawer({ isOpen, settings, onClose, onSave }) {
  const [draft, setDraft] = useState({
    defaultWasteFactorPercent: 0,
    defaultMachineRatePerHourZar: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft({
      defaultWasteFactorPercent: Number(settings?.defaultWasteFactorPercent ?? 0),
      defaultMachineRatePerHourZar: Number(settings?.defaultMachineRatePerHourZar ?? 0)
    });
  }, [isOpen, settings]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSave(draft);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer opened={isOpen} onClose={onClose} position="right" size="md" title={<Title order={3}>Global Defaults</Title>}>
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Text c="dimmed">
            These defaults apply to new jobs only. Existing jobs keep their own saved Waste % and Machine Rate values.
          </Text>
          <NumberInput
            label="Default Waste %"
            min={0}
            decimalScale={2}
            value={draft.defaultWasteFactorPercent}
            onChange={(value) =>
              setDraft((current) => ({ ...current, defaultWasteFactorPercent: typeof value === "number" ? value : Number(value || 0) }))
            }
          />
          <NumberInput
            label="Default Machine Rate / Hour (R)"
            min={0}
            decimalScale={2}
            value={draft.defaultMachineRatePerHourZar}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                defaultMachineRatePerHourZar: typeof value === "number" ? value : Number(value || 0)
              }))
            }
          />
          <Button type="submit" color="sage" loading={submitting}>
            Save Defaults
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}
