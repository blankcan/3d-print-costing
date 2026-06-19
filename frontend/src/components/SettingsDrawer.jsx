import {
  Button,
  Divider,
  Drawer,
  Group,
  NavLink,
  NumberInput,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Title
} from "@mantine/core";
import { IconAdjustments, IconBook2, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CustomerPanel } from "./CustomerPanel.jsx";
import { FilamentPanel } from "./FilamentPanel.jsx";

export function SettingsDrawer({
  isOpen,
  settings,
  customers,
  filaments,
  onClose,
  onSaveDefaults,
  onSaveFilament,
  onRequestDeleteFilament,
  onSaveCustomer,
  onRequestDeleteCustomer
}) {
  const [draft, setDraft] = useState({
    defaultWasteFactorPercent: 0,
    defaultMachineRatePerHourZar: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [section, setSection] = useState("defaults");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft({
      defaultWasteFactorPercent: Number(settings?.defaultWasteFactorPercent ?? 0),
      defaultMachineRatePerHourZar: Number(settings?.defaultMachineRatePerHourZar ?? 0)
    });
    setSection("defaults");
  }, [isOpen, settings]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSaveDefaults(draft);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer opened={isOpen} onClose={onClose} position="right" size="min(92vw, 1100px)" title={<Title order={3}>Settings</Title>}>
      <Group align="flex-start" gap="lg" wrap="nowrap">
        <Paper miw={210} p="sm" withBorder>
          <Stack gap="xs">
            <Text tt="uppercase" fw={700} fz="xs" c="sage.7" ls="0.08em">
              Menu
            </Text>
            <NavLink
              active={section === "defaults"}
              label="Defaults"
              description="Global defaults for new jobs"
              leftSection={<IconAdjustments size={18} />}
              onClick={() => setSection("defaults")}
            />
            <NavLink
              active={section === "catalog"}
              label="Catalog"
              description="Filaments and customers"
              leftSection={<IconBook2 size={18} />}
              onClick={() => setSection("catalog")}
            />
          </Stack>
        </Paper>

        <ScrollArea style={{ flex: 1 }}>
          {section === "defaults" ? (
            <Paper p="lg" withBorder>
              <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                  <div>
                    <Text tt="uppercase" fw={700} fz="xs" c="sage.7" ls="0.08em">
                      Settings
                    </Text>
                    <Title order={2} mt={4}>
                      Defaults
                    </Title>
                  </div>

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
            </Paper>
          ) : (
            <Paper p="lg" withBorder>
              <Stack gap="lg">
                <div>
                  <Text tt="uppercase" fw={700} fz="xs" c="sage.7" ls="0.08em">
                    Settings
                  </Text>
                  <Title order={2} mt={4}>
                    Catalog
                  </Title>
                </div>

                <Text c="dimmed">
                  Manage reusable filaments and optional customer records here. Jobs can reference these saved catalog entries without changing pricing behavior.
                </Text>

                <Divider />

                <Tabs defaultValue="filaments">
                  <Tabs.List>
                    <Tabs.Tab value="filaments" leftSection={<IconBook2 size={16} />}>
                      Filaments
                    </Tabs.Tab>
                    <Tabs.Tab value="customers" leftSection={<IconUsers size={16} />}>
                      Customers
                    </Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="filaments" pt="lg">
                    <FilamentPanel filaments={filaments} onSave={onSaveFilament} onRequestDelete={onRequestDeleteFilament} />
                  </Tabs.Panel>

                  <Tabs.Panel value="customers" pt="lg">
                    <CustomerPanel customers={customers} onSave={onSaveCustomer} onRequestDelete={onRequestDeleteCustomer} />
                  </Tabs.Panel>
                </Tabs>
              </Stack>
            </Paper>
          )}
        </ScrollArea>
      </Group>
    </Drawer>
  );
}
