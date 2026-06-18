import { Alert, Card, Grid, Paper, ScrollArea, Stack, Table, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { formatCurrency, formatPercent, formatWeight } from "../utils/formatters.js";

export function ResultsPanel({ calculations }) {
  const validation = calculations?.validation;
  const rowErrors = validation?.rowErrors || {};
  const validationMessages = validation?.errors ? [...validation.errors] : [];
  if (Object.keys(rowErrors).length) {
    validationMessages.push("Complete the highlighted part rows to unlock full costing results.");
  }

  return (
    <Paper>
      <Stack gap="lg">
        <div>
          <Text tt="uppercase" fw={700} fz="xs" c="sage.7" ls="0.08em">
            Results
          </Text>
          <Title order={2} mt={4}>
            Cost Breakdown
          </Title>
        </div>

        {validationMessages.length ? (
          <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
            {validationMessages.join(" ")}
          </Alert>
        ) : null}

        <Grid>
          <Grid.Col span={{ base: 12, xs: 6 }}>
            <Card>
              <Text c="dimmed" size="sm">
                Total Material Cost
              </Text>
              <Title order={3} mt="xs">
                {formatCurrency(calculations?.totalMaterialCostZar)}
              </Title>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6 }}>
            <Card>
              <Text c="dimmed" size="sm">
                Total Machine Cost
              </Text>
              <Title order={3} mt="xs">
                {formatCurrency(calculations?.totalMachineCostZar)}
              </Title>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6 }}>
            <Card>
              <Text c="dimmed" size="sm">
                Grand Total
              </Text>
              <Title order={3} mt="xs">
                {formatCurrency(calculations?.grandTotalCostZar)}
              </Title>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6 }}>
            <Card>
              <Text c="dimmed" size="sm">
                Adjusted Weight
              </Text>
              <Title order={3} mt="xs">
                {formatWeight(calculations?.totalAdjustedWeightGrams)}
              </Title>
            </Card>
          </Grid.Col>
        </Grid>

        {calculations?.validation?.isValid ? (
          <>
            <Stack gap="sm">
              <Title order={4}>Part Breakdown</Title>
              <ScrollArea>
                <Table striped highlightOnHover withTableBorder className="results-table">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Part</Table.Th>
                      <Table.Th>Filament</Table.Th>
                      <Table.Th>Qty</Table.Th>
                      <Table.Th>Base Weight</Table.Th>
                      <Table.Th>Adjusted Weight</Table.Th>
                      <Table.Th>Material Cost</Table.Th>
                      <Table.Th>Machine Cost</Table.Th>
                      <Table.Th>Line Total</Table.Th>
                      <Table.Th>Cost / Part</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {calculations.rows.map((row) => (
                      <Table.Tr key={row.id}>
                        <Table.Td>{row.partName || "Unnamed part"}</Table.Td>
                        <Table.Td>{row.filamentLabel || "Unknown filament"}</Table.Td>
                        <Table.Td>{row.quantity}</Table.Td>
                        <Table.Td>{formatWeight(row.baseWeightGrams)}</Table.Td>
                        <Table.Td>{formatWeight(row.adjustedWeightGrams)}</Table.Td>
                        <Table.Td>{formatCurrency(row.materialCostZar)}</Table.Td>
                        <Table.Td>{formatCurrency(row.allocatedMachineCostZar)}</Table.Td>
                        <Table.Td>{formatCurrency(row.lineTotalCostZar)}</Table.Td>
                        <Table.Td>{formatCurrency(row.costPerPartZar)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Stack>

            <Stack gap="sm">
              <Title order={4}>Selling Suggestions</Title>
              <ScrollArea className="suggestions-table-scroll">
                <Table striped highlightOnHover withTableBorder className="suggestions-table">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Markup</Table.Th>
                      <Table.Th>Suggested Price</Table.Th>
                      <Table.Th>Profit</Table.Th>
                      <Table.Th>Margin %</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {calculations.suggestions.map((suggestion) => (
                      <Table.Tr key={suggestion.markupPercent}>
                        <Table.Td>{suggestion.markupPercent}%</Table.Td>
                        <Table.Td>{formatCurrency(suggestion.suggestedTotalPriceZar)}</Table.Td>
                        <Table.Td>{formatCurrency(suggestion.profitZar)}</Table.Td>
                        <Table.Td>{formatPercent(suggestion.marginPercent)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Stack>
          </>
        ) : (
          <Text c="dimmed">Enter valid job and part inputs to see the breakdown.</Text>
        )}
      </Stack>
    </Paper>
  );
}
