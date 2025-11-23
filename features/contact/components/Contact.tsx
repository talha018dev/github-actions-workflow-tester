"use client";

import { Container, Paper, TextInput, Textarea, Button, Title, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconMail, IconUser, IconMessage } from "@tabler/icons-react";

export function Contact() {
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name must be at least 2 characters" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      message: (value) => (value.length < 10 ? "Message must be at least 10 characters" : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log("Form submitted:", values);
    // Here you would typically send the form data to your backend
    alert("Thank you for your message! We'll get back to you soon.");
    form.reset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 py-16 md:py-24">
      <Container size="md">
        <div className="text-center mb-12">
          <Title order={2} className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Get in Touch
          </Title>
          <Text size="lg" c="dimmed" className="text-gray-600 dark:text-gray-400">
            Have a question? We'd love to hear from you.
          </Text>
        </div>
        <Paper shadow="md" p="xl" radius="md" className="bg-gray-50 dark:bg-gray-700">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <div className="space-y-4">
              <TextInput
                label="Name"
                placeholder="Your name"
                leftSection={<IconUser size={16} />}
                required
                {...form.getInputProps("name")}
                className="dark:text-white"
              />
              <TextInput
                label="Email"
                placeholder="your.email@example.com"
                leftSection={<IconMail size={16} />}
                required
                {...form.getInputProps("email")}
                className="dark:text-white"
              />
              <Textarea
                label="Message"
                placeholder="Your message here..."
                leftSection={<IconMessage size={16} />}
                required
                minRows={6}
                {...form.getInputProps("message")}
                className="dark:text-white"
              />
              <Button
                type="submit"
                fullWidth
                size="md"
                className="bg-blue-600 hover:bg-blue-700 mt-6"
              >
                Send Message
              </Button>
            </div>
          </form>
        </Paper>
      </Container>
    </div>
  );
}

