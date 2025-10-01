// COGNITO AWS n11988819-a2
// ap-southeast-2_VNZ0oJBaV user pool id


// user groups

const jwt = require("aws-jwt-verify");
const Cognito = require("@aws-sdk/client-cognito-identity-provider");
const crypto = require("crypto");
const { token } = require("morgan");

const { getSecrets } = require("../utils/secrets");

let clientId;
let clientSecret;
let idVerifier;      
let accessVerifier;

async function initCognito() {
  if (!clientId) {
    const secrets = await getSecrets();
    clientId = secrets.clientId;
    clientSecret = secrets.clientSecret;

    accessVerifier = jwt.CognitoJwtVerifier.create({
      userPoolId: "ap-southeast-2_VNZ0oJBaV",
      tokenUse: "access",
      clientId,
    });

    idVerifier = jwt.CognitoJwtVerifier.create({
      userPoolId: "ap-southeast-2_VNZ0oJBaV",
      tokenUse: "id",
      clientId,
    });
  }
}

async function ensureCognito() {
  if (!clientId || !clientSecret) await initCognito();
}


function secretHash(clientId, clientSecret, username) {
  const hasher = crypto.createHmac('sha256', clientSecret);
  hasher.update(`${username}${clientId}`);
  return hasher.digest('base64');
}

async function signup(username, password, email, usertype) {
  //TODO add admin group in sign up func
  console.log("Signing up user");
  const client = new Cognito.CognitoIdentityProviderClient({ region: 'ap-southeast-2' });
  const command = new Cognito.SignUpCommand({
    ClientId: clientId,
    SecretHash: secretHash(clientId, clientSecret, username),
    Username: username,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  });
  const res = await client.send(command);
  console.log(res);

  if (usertype === "admin") {
    const groupCMD = new Cognito.AdminAddUserToGroupCommand({
      UserPoolId: "ap-southeast-2_VNZ0oJBaV",
      Username: username,
      GroupName: "admin",
    });
  const res2 = await client.send(groupCMD);
  console.log(res2);
}}

async function confirm(username, confirmationCode) {
    const client = new Cognito.CognitoIdentityProviderClient({ region: 'ap-southeast-2' });
  const command2 = new Cognito.ConfirmSignUpCommand({
    ClientId: clientId,
    SecretHash: secretHash(clientId, clientSecret, username),
    Username: username,
    ConfirmationCode: confirmationCode,
  });

  res2 = await client.send(command2);
}



async function authenticate(username, password) {
  await ensureCognito();
    const client = new Cognito.CognitoIdentityProviderClient({ region: 'ap-southeast-2' });

    console.log("Getting auth token");
    const command = new Cognito.InitiateAuthCommand({
        AuthFlow: Cognito.AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: secretHash(clientId, clientSecret, username),
        },
        ClientId: clientId,
    });

    const res = await client.send(command);

    const IdToken = res.AuthenticationResult.IdToken;
    const IdTokenVerifyResult = await idVerifier.verify(IdToken);
    console.log("ID Token is valid. Payload:", IdTokenVerifyResult);

    const AccessToken = res.AuthenticationResult.AccessToken;
    const AccessTokenVerifyResult = await accessVerifier.verify(AccessToken);
    console.log("Access Token is valid. Payload:", AccessTokenVerifyResult);
    return { IdToken, AccessToken };
}


module.exports = { signup, confirm, authenticate };