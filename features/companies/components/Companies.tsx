"use client";

import {
  Badge,
  Card,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { companies } from "../data/companiesData";

export function Companies() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return companies;
    }

    const query = searchQuery.toLowerCase();
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query) ||
        company.location.toLowerCase().includes(query) ||
        company.description?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
      <Container size="xl">
        <div className="text-center mb-12">
          <Title
            order={2}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Companies Using Our Platform
          </Title>
          <Text className="text-gray-700 dark:text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
            Used by companies and people working at leading organizations
            worldwide
          </Text>

          <TextInput
            placeholder="Search companies by name, industry, or location..."
            leftSection={<IconSearch size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="lg"
            radius="md"
            className="max-w-2xl mx-auto"
            styles={{
              input: {
                backgroundColor: "var(--mantine-color-gray-0)",
              },
            }}
            classNames={{
              input:
                "dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-500",
            }}
          />

          {searchQuery && (
            <Text
              size="sm"
              className="text-gray-600 dark:text-gray-400 mt-4"
            >
              Found {filteredCompanies.length} company
              {filteredCompanies.length !== 1 ? "ies" : ""}
            </Text>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => {
              const Icon = company.icon;
              return (
                <Card
                  key={company.id}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  className="hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start">
                      <Group gap="sm">
                        {Icon ? (
                          <Icon
                            size={32}
                            className="text-gray-700 dark:text-gray-300"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <Text
                            fw={700}
                            size="lg"
                            className="text-gray-900 dark:text-white"
                          >
                            {company.name}
                          </Text>
                          <Text
                            size="xs"
                            className="text-gray-500 dark:text-gray-400"
                          >
                            {company.industry}
                          </Text>
                        </div>
                      </Group>
                    </Group>

                    {company.description && (
                      <Text
                        size="sm"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {company.description}
                      </Text>
                    )}

                    <Group gap="xs" wrap="wrap">
                      <Badge
                        variant="light"
                        color="blue"
                        size="sm"
                        className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      >
                        {company.location}
                      </Badge>
                      <Badge
                        variant="light"
                        color="gray"
                        size="sm"
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {company.employees}
                      </Badge>
                    </Group>
                  </Stack>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Text
                size="lg"
                className="text-gray-500 dark:text-gray-400"
              >
                No companies found matching "{searchQuery}"
              </Text>
              <Text
                size="sm"
                className="text-gray-400 dark:text-gray-500 mt-2"
              >
                Try a different search term
              </Text>
            </div>
          )}
        </div>

        {!searchQuery && (
          <div className="mt-12 text-center">
            <Text
              size="sm"
              className="text-gray-500 dark:text-gray-400"
            >
              Showing {companies.length} companies
            </Text>
          </div>
        )}
      </Container>
    </section>
  );
}
