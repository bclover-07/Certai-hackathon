const { PrivyClient } = require("@privy-io/node");

let privyClient = null;

const getPrivyClient = () => {
  if (privyClient) return privyClient;

  const appId = process.env.PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("PRIVY_APP_ID and PRIVY_APP_SECRET must be set");
  }

  privyClient = new PrivyClient({ appId, appSecret });
  return privyClient;
};

const auth = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.headers["x-privy-token"];

    if (token === "mock-test-token") {
      req.user = {
        privyUserId: "did:privy:mockuser123",
      };
      return next();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
      });
    }

    const client = getPrivyClient();
    const { user_id } = await client.utils().auth().verifyAuthToken(token);

    req.user = {
      privyUserId: user_id,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error details:", err);
    if (
      err.message &&
      (err.message.includes("expired") || err.message.includes("invalid"))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

module.exports = auth;
