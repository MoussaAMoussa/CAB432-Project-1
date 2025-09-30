const { SecretsManagerClient, GetSecretValueCommand } =
  require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({ region: "ap-southeast-2" });

// Use env var if set, otherwise try teammate’s then yours
const secretNames = [
  process.env.SECRET_NAME,
  "n11988819-a2",  // teammate
  "n11585820-a2"   // you
].filter(Boolean);

async function getSecrets() {
  for (const secretName of secretNames) {
    try {
      const response = await client.send(
        new GetSecretValueCommand({ SecretId: secretName })
      );

      if (response.SecretString) {
        return JSON.parse(response.SecretString);
      }

      if (response.SecretBinary) {
        return JSON.parse(
          Buffer.from(response.SecretBinary, "base64").toString("utf8")
        );
      }
    } catch (err) {
      console.warn(`[getSecrets] Failed for ${secretName}: ${err.message}`);
    }
  }

  console.warn("[getSecrets] No secrets found, falling back to process.env");
  return {};
}

module.exports = { getSecrets };


