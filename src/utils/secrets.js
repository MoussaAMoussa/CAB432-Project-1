const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({ region: "ap-southeast-2" });
const secret_name = "n11988819-a2";

async function getSecrets() {
    const command = await sm.send(new GetSecretValueCommand({ SecretId: secretName }));
    return JSON.parse((command.SecretString));
}

module.exports = { getSecrets };


