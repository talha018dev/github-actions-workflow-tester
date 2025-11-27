"use client";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Group,
  MultiSelect,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { companies } from "../data/companiesData";

export function CompanyList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Get unique industries and locations for filters
  const industries = useMemo(() => {
    const unique = Array.from(new Set(companies.map((c) => c.industry)));
    return unique.sort();
  }, []);

  const locations = useMemo(() => {
    const unique = Array.from(new Set(companies.map((c) => c.location)));
    return unique.sort();
  }, []);

  // Filter companies based on search and filters
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.industry.toLowerCase().includes(query) ||
          company.location.toLowerCase().includes(query) ||
          company.description?.toLowerCase().includes(query) ||
          company.employees.toLowerCase().includes(query)
      );
    }

    // Industry filter
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter((company) =>
        selectedIndustries.includes(company.industry)
      );
    }

    // Location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((company) =>
        selectedLocations.includes(company.location)
      );
    }

    return filtered;
  }, [searchQuery, selectedIndustries, selectedLocations]);

  // Handle row selection
  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === filteredCompanies.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredCompanies.map((company) => company.id));
    }
  };

  const clearSelection = () => {
    setSelectedRows([]);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedIndustries([]);
    setSelectedLocations([]);
  };

  const allSelected =
    filteredCompanies.length > 0 &&
    selectedRows.length === filteredCompanies.length;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < filteredCompanies.length;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Box>
          <Title order={1} className="text-3xl font-bold mb-2">
            Company List
          </Title>
          <Text className="text-gray-600 dark:text-gray-400">
            Manage and filter companies with search and selection capabilities
          </Text>
        </Box>

        {/* Search and Filters */}
        <Paper p="md" withBorder className="bg-white dark:bg-gray-800">
          <Stack gap="md">
            <Group grow>
              <TextInput
                placeholder="Search companies..."
                leftSection={<IconSearch size={18} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                rightSection={
                  searchQuery && (
                    <IconX
                      size={18}
                      className="cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  )
                }
              />
            </Group>

            <Group grow>
              <MultiSelect
                placeholder="Filter by industry"
                data={industries}
                value={selectedIndustries}
                onChange={setSelectedIndustries}
                clearable
                searchable
              />
              <MultiSelect
                placeholder="Filter by location"
                data={locations}
                value={selectedLocations}
                onChange={setSelectedLocations}
                clearable
                searchable
              />
            </Group>

            <Group justify="space-between">
              <Text size="sm" className="text-gray-600 dark:text-gray-400">
                Showing {filteredCompanies.length} of {companies.length} companies
                {selectedRows.length > 0 && ` • ${selectedRows.length} selected`}
              </Text>
              <Group gap="xs">
                {(searchQuery ||
                  selectedIndustries.length > 0 ||
                  selectedLocations.length > 0) && (
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={clearFilters}
                    leftSection={<IconX size={16} />}
                  >
                    Clear Filters
                  </Button>
                )}
                {selectedRows.length > 0 && (
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={clearSelection}
                    color="red"
                  >
                    Clear Selection ({selectedRows.length})
                  </Button>
                )}
              </Group>
            </Group>
          </Stack>
        </Paper>

        {/* Table */}
        <Paper withBorder className="bg-white dark:bg-gray-800 overflow-x-auto">
          <Table.ScrollContainer minWidth={800}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 40 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      aria-label="Select all rows"
                    />
                  </Table.Th>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Industry</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Employees</Table.Th>
                  <Table.Th>Description</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <Table.Tr
                      key={company.id}
                      className={
                        selectedRows.includes(company.id)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }
                    >
                      <Table.Td>
                        <Checkbox
                          checked={selectedRows.includes(company.id)}
                          onChange={() => toggleRow(company.id)}
                          aria-label={`Select ${company.name}`}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="sm">
                          {company.icon && (
                            <company.icon
                              size={24}
                              className="text-gray-700 dark:text-gray-300"
                            />
                          )}
                          <Text fw={500} className="text-gray-900 dark:text-white">
                            {company.name}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color="blue"
                          className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        >
                          {company.industry}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text className="text-gray-700 dark:text-gray-300">
                          {company.location}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text className="text-gray-700 dark:text-gray-300">
                          {company.employees}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text
                          size="sm"
                          className="text-gray-600 dark:text-gray-400"
                          lineClamp={2}
                        >
                          {company.description || "—"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={6} className="text-center py-12">
                      <Text className="text-gray-500 dark:text-gray-400">
                        No companies found matching your criteria
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>

        {/* Selected Actions */}
        {selectedRows.length > 0 && (
          <Paper
            p="md"
            withBorder
            className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          >
            <Group justify="space-between">
              <Text fw={500} className="text-blue-900 dark:text-blue-100">
                {selectedRows.length} company{selectedRows.length !== 1 ? "ies" : ""}{" "}
                selected
              </Text>
              <Group gap="xs">
                <Button
                  variant="light"
                  color="blue"
                  size="sm"
                  onClick={() => {
                    const selected = companies.filter((c) =>
                      selectedRows.includes(c.id)
                    );
                    console.log("Selected companies:", selected);
                    // Add your action here
                  }}
                >
                  Export Selected
                </Button>
                <Button
                  variant="light"
                  color="blue"
                  size="sm"
                  onClick={() => {
                    console.log("Bulk action on:", selectedRows);
                    // Add your bulk action here
                  }}
                >
                  Bulk Action
                </Button>
              </Group>
            </Group>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}


