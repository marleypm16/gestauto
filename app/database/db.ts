// import connectMongoDb from '../plugin/mongodb';

// const connectDB = async () => {
//     await connectMongoDb(); 
// }

// export default connectDB;

import prisma from "../plugin/postgres";

const connectDB = async () => {
  prisma.$connect()
    .then(() => {
      console.log("Conexão com o banco de dados PostgreSQL estabelecida com sucesso.");
    })
    .catch((error) => {
      console.error("Erro ao conectar ao banco de dados PostgreSQL:", error);
    });
};

export { prisma };
export default connectDB;