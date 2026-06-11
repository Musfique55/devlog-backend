import { server } from "./app";
import { envVars } from "./config/env";
import { prisma } from "../lib/prisma";

const PORT = envVars.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    await prisma.$disconnect();
    process.exit(1);        
  }
};

startServer();
