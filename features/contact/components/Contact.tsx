"use client";

import { Container, Title, Text, TextInput, Textarea, Button } from "@mantine/core";
import { useState } from "react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <Container size="md">
        <div className="text-center mb-12">
          <Title
            order={2}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Get in Touch
          </Title>
          <Text
            size="lg"
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Have a question or want to work together? We'd love to hear from
            you.
          </Text>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-6"
        >
          <TextInput
            label="Name"
            placeholder="Your name"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            size="md"
            className="w-full"
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            required
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            size="md"
            className="w-full"
          />
          <Textarea
            label="Message"
            placeholder="Your message here..."
            required
            minRows={6}
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            size="md"
            className="w-full"
          />
          <Button
            type="submit"
            size="lg"
            fullWidth
            className="mt-4"
          >
            Send Message
          </Button>
        </form>
      </Container>
    </section>
  );
}

