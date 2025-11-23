export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function submitContactForm(
  data: ContactFormData
): Promise<{ success: boolean; message: string }> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
      });
    }, 1000);
  });
}

