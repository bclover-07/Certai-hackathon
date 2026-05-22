const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'node_modules', '@privy-io', 'node', 'lib', 'auth.js');

if (!fs.existsSync(targetPath)) {
  console.log('Target file not found:', targetPath);
  process.exit(0);
}

let content = fs.readFileSync(targetPath, 'utf8');

// If already patched, skip
if (content.includes('const josePromise = import("jose");')) {
  console.log('@privy-io/node is already patched.');
  process.exit(0);
}

console.log('Patching @privy-io/node/lib/auth.js...');

// Replace the require statement
content = content.replace(
  'const jose_1 = require("jose");',
  'const josePromise = import("jose");'
);

// Update verifyPrivyIssuedJwt
content = content.replace(
  'async function verifyPrivyIssuedJwt(jwt, appId, verificationKey) {',
  'async function verifyPrivyIssuedJwt(jwt, appId, verificationKey) {\n    const jose_1 = await josePromise;'
);

// Update verifyAccessToken
content = content.replace(
  'async function verifyAccessToken({ access_token: accessToken, app_id: appId, verification_key: verificationKeyOrString, }) {',
  'async function verifyAccessToken({ access_token: accessToken, app_id: appId, verification_key: verificationKeyOrString, }) {\n    const jose_1 = await josePromise;'
);

// Update verifyIdentityToken
content = content.replace(
  'async function verifyIdentityToken({ identity_token: identityToken, app_id: appId, verification_key: verificationKeyOrString, }) {',
  'async function verifyIdentityToken({ identity_token: identityToken, app_id: appId, verification_key: verificationKeyOrString, }) {\n    const jose_1 = await josePromise;'
);

// Update mapAndThrowJoseErrors
content = content.replace(
  'function mapAndThrowJoseErrors(error) {',
  'async function mapAndThrowJoseErrors(error) {\n    const jose_1 = await josePromise;'
);

// Update createPrivyAppJWKS
const originalJWKS = `function createPrivyAppJWKS({ appId, apiUrl, headers, verificationKeyOverride, }) {
    if (verificationKeyOverride !== undefined) {
        // Use a closure to cache the verification key once imported
        let verificationKey;
        return async () => {
            if (verificationKey === undefined) {
                try {
                    verificationKey = await (0, jose_1.importSPKI)(verificationKeyOverride, JWT_ALGORITHM);
                }
                catch (error) {
                    throw new InvalidAuthTokenError('Failed to import the provided verification key override');
                }
            }
            return verificationKey;
        };
    }
    const url = new URL(\`\${apiUrl}/v1/apps/\${appId}/jwks.json\`);
    return (0, jose_1.createRemoteJWKSet)(url, {
        cacheMaxAge: 60 * 60 * 1000, // 60 minutes
        cooldownDuration: 10 * 60 * 1000, // 10 minutes
        headers,
    });
}`;

const patchedJWKS = `function createPrivyAppJWKS({ appId, apiUrl, headers, verificationKeyOverride, }) {
    if (verificationKeyOverride !== undefined) {
        // Use a closure to cache the verification key once imported
        let verificationKey;
        return async () => {
            if (verificationKey === undefined) {
                try {
                    const jose_1 = await josePromise;
                    verificationKey = await (0, jose_1.importSPKI)(verificationKeyOverride, JWT_ALGORITHM);
                }
                catch (error) {
                    throw new InvalidAuthTokenError('Failed to import the provided verification key override');
                }
            }
            return verificationKey;
        };
    }
    const url = new URL(\`\${apiUrl}/v1/apps/\${appId}/jwks.json\`);
    let jwksetResolver;
    return async (...args) => {
        if (!jwksetResolver) {
            const jose_1 = await josePromise;
            jwksetResolver = (0, jose_1.createRemoteJWKSet)(url, {
                cacheMaxAge: 60 * 60 * 1000, // 60 minutes
                cooldownDuration: 10 * 60 * 1000, // 10 minutes
                headers,
            });
        }
        return jwksetResolver(...args);
    };
}`;

const normalize = str => str.replace(/\r\n/g, '\n');
content = normalize(content).replace(normalize(originalJWKS), normalize(patchedJWKS));

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully patched @privy-io/node/lib/auth.js!');
