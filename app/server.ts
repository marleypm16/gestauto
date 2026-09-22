import dotenv from "dotenv";
dotenv.config();

import app from ".";
import connectDB from "./database/db";

const start = async () => {
  await connectDB();
  app.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Servidor rodando em ${address}`);
  });
};

start();