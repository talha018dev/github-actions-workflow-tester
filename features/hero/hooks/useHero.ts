export function useHero() {
  const handleGetStarted = () => {
    console.log("Get Started clicked");
    // Add navigation or action logic here
  };

  return {
    handleGetStarted,
  };
}

