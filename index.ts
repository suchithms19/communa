import server from "./server";
import Logger from "./universe/v1/libraries/logger";

const PORT = process.env.PORT || 3000;

// IIFE with proper error handling
(async () => {
  try {
    const app = await server();
    
    app.listen(PORT, () => {
      Logger.instance.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    Logger.instance.error('Failed to start server:', error);
    process.exit(1);
  }
})();




