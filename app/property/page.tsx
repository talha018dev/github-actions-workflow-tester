import { Table, Container, Title, Paper } from '@mantine/core';

const properties = [
  { id: 1, address: '123 Main St', price: '$250,000', status: 'Available' },
  { id: 2, address: '456 Oak Ave', price: '$350,000', status: 'Pending' },
  { id: 3, address: '789 Pine Ln', price: '$150,000', status: 'Sold' },
  { id: 4, address: '101 Elm St', price: '$450,000', status: 'Available' },
  { id: 5, address: '202 Maple Dr', price: '$550,000', status: 'Available' },
];

export default function PropertyPage() {
  const rows = properties.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td>{element.id}</Table.Td>
      <Table.Td>{element.address}</Table.Td>
      <Table.Td>{element.price}</Table.Td>
      <Table.Td>{element.status}</Table.Td>
    </Table.Tr>
  ));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-8">
      <Container size="lg">
        <Title order={2} mb="lg" className="text-gray-900 dark:text-white">Property Listings</Title>
        <Paper shadow="xs" p="md">
            <Table striped highlightOnHover>
            <Table.Thead>
                <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Address</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Status</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Paper>
      </Container>
    </main>
  );
}

