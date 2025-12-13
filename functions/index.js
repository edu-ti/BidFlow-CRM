/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o Admin do Firebase para acessar o banco de dados
admin.initializeApp();
const db = admin.firestore();

// ===============================================================
// WEBHOOK PARA EVOLUTION API (WHATSAPP)
// ===============================================================
// Configure esta URL na sua Evolution API:
// URL: https://us-central1-SEU-PROJETO.cloudfunctions.net/whatsappWebhook
// ===============================================================

exports.whatsappWebhook = functions.https.onRequest(async (req, res) => {
  // 1. Verificação básica de segurança (Opcional: validar API Key no header)
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body;

  // A Evolution API envia o nome da instância e o tipo de evento
  const instanceName = body.instance;
  const type = body.type; // ex: "message", "connection.update"

  try {
    console.log(
      `[Webhook] Evento recebido: ${type} da instância ${instanceName}`
    );

    // -------------------------------------------------------------
    // CENÁRIO A: Recebimento de Mensagem de Texto
    // -------------------------------------------------------------
    if (type === "message") {
      const messageData = body.data;

      // Ignorar mensagens enviadas por mim mesmo (fromMe)
      if (messageData.key.fromMe) {
        return res.status(200).send("Ignored fromMe");
      }

      const remoteJid = messageData.key.remoteJid; // ID do remetente (ex: 551199999@s.whatsapp.net)
      const pushName = messageData.pushName || "Desconhecido"; // Nome do perfil

      // Extrair o texto (pode vir em conversation ou extendedTextMessage)
      const content =
        messageData.message?.conversation ||
        messageData.message?.extendedTextMessage?.text;

      if (!content) {
        console.log("Mensagem sem conteúdo de texto processável.");
        return res.status(200).send("No content");
      }

      // ID do documento é o número limpo (sem @s.whatsapp.net)
      const contactPhone = remoteJid.replace("@s.whatsapp.net", "");

      // LÓGICA DE SALVAMENTO NO FIRESTORE
      // 1. Achar o Dono da Instância (Empresa)
      // Nota: Em produção, você faria uma query para achar qual empresa tem essa 'instanceName'
      // Aqui vamos simular salvando numa coleção genérica ou fixa para teste

      // Vamos salvar um log na coleção 'webhook_logs' para você ver no painel "Integrações"
      await db
        .collection("artifacts")
        .doc("bidflow-crm")
        .collection("webhook_logs")
        .add({
          event: "message.received",
          source: `WhatsApp (${instanceName})`,
          status: "success",
          timestamp: new Date().toISOString(),
          payload: JSON.stringify({
            from: contactPhone,
            name: pushName,
            text: content,
          }),
        });

      console.log(`Mensagem de ${contactPhone}: ${content} salva nos logs.`);
    }

    // -------------------------------------------------------------
    // CENÁRIO B: Atualização de Status (Conectado/Desconectado)
    // -------------------------------------------------------------
    if (type === "connection.update") {
      const state = body.data.state; // 'open', 'close', 'connecting'

      // Logar mudança de status
      console.log(`Status da instância ${instanceName} mudou para: ${state}`);

      // Aqui você poderia buscar a instância no banco e atualizar o status field
      // Ex: db.collection('instances').where('name', '==', instanceName).update({ status: 'CONNECTED' })
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Erro no processamento do Webhook:", error);
    return res.status(500).send("Internal Server Error");
  }
});
