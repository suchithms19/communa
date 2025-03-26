import Env from "./loaders/v1/Env";
import server from "./server";
import Logger from "./universe/v1/libraries/logger";


// IIFE with proper error handling
(async () => {
  try {
    const app = await server();
    
    app.listen(Env.variable.PORT, () => {
      Logger.instance.info(`Server is running on port ${Env.variable.PORT}`);
    });
  } catch (error) {
    Logger.instance.error('Failed to start server:', error);
    process.exit(1);
  }
})();




