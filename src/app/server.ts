import app from "./app";
import { envVars } from "./config/env";
import { prisma } from "../lib/prisma";

const PORT = envVars.PORT || 5000;

const server = async () => {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    await prisma.$disconnect();
    process.exit(1);        
  }
};

server();
