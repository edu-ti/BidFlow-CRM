import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Rota de Login (Substitui o Firebase Auth)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: "Senha incorreta" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: { email: user.email, name: user.name, role: user.role },
  });
});

// Exemplo: Rota de Empresas (Substitui Firestore GetDocs)
app.get("/companies", async (req, res) => {
  const companies = await prisma.company.findMany();
  res.json(companies);
});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
