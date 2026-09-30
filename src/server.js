import express from "express";
import {
  decryptRequest,
  encryptResponse,
  FlowEndpointException
} from "./encryption.js";
import { getNextScreen } from "./flow.js";
import crypto from "crypto";

const app = express();

app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf?.toString(encoding || "utf8");
    }
  })
);

const {
  APP_SECRET,
  PRIVATE_KEY,
  PASSPHRASE = "",
  PORT = "3000"
} = process.env;

app.post("/", async (req, res) => {
  if (!PRIVATE_KEY) {
    return res.status(500).send(
      'Private key is not configured. Please set the PRIVATE_KEY environment variable.'
    );
  }

  if (!isRequestSignatureValid(req)) {
    return res.status(432).send();
  }

  let decryptedRequest;

  try {
    decryptedRequest = decryptRequest(
      req.body,
      PRIVATE_KEY,
      PASSPHRASE
    );
  } catch (err) {
    console.error(err);

    if (err instanceof FlowEndpointException) {
      return res.status(err.statusCode).send();
    }

    return res.status(500).send();
  }

  const {
    aesKeyBuffer,
    initialVectorBuffer,
    decryptedBody
  } = decryptedRequest;

  console.log("Decrypted Request:", decryptedBody);

  try {
    const screenResponse = await getNextScreen(decryptedBody);

    console.log("Response:", screenResponse);

    res.send(
      encryptResponse(
        screenResponse,
        aesKeyBuffer,
        initialVectorBuffer
      )
    );
  } catch (err) {
    console.error("Flow logic error:", err);
    return res.status(500).send();
  }
});

app.get("/", (req, res) => {
  res.send("WhatsApp Property Owner Flow Endpoint is running.");
});

function isRequestSignatureValid(req) {
  if (!APP_SECRET) {
    return true;
  }

  const signatureHeader = req.get("x-hub-signature-256");

  if (!signatureHeader) {
    return false;
  }

  const signatureBuffer = Buffer.from(
    signatureHeader.replace("sha256=", ""),
    "utf-8"
  );

  const hmac = crypto.createHmac("sha256", APP_SECRET);
  const digestString = hmac
    .update(req.rawBody)
    .digest("hex");

  const digestBuffer = Buffer.from(
    digestString,
    "utf-8"
  );

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    digestBuffer,
    signatureBuffer
  );
}

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
