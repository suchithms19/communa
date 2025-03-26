import server from "./server";

const PORT = process.env.PORT || 3000;

// IIFE with proper error handling
(async () => {
  try {
    const app = await server();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();




