# 🧪 CERTAI — Interactive Manual Testing & Evaluation Guide

This guide provides a comprehensive, step-by-step walkthrough to test **every single feature** of CERTAI manually using our premium **Sandbox Simulator**. 

Because a real Privy connection requires a customized Web3 setup, we built a beautiful, fully functional **Sandbox Simulator** that bypasses all rate limits and lets you experience the absolute best of our dynamic frontend, on-chain state emulation, and LangGraph AI parsing.

---

## 🛠️ Getting Started: Launching the Sandbox

1. Open your browser and navigate to **`http://localhost:3000`**.
2. Click any of the prominent call-to-action buttons:
   * **"Verify Your Claims"** in the Hero section.
   * **"Launch Console"** in the Navigation bar.
3. The **Security Gateway Modal** will pop up with a high-tech laser scanner animation.
4. Select the **Sandbox Simulator** tab (default).
5. Choose one of our three pre-configured professional roles to log in instantly.

---

## 🎭 Predefined Sandbox Roles

You can test the entire lifecycle of a credential by switching between these three identities using the **Logout** button in the dashboard topbar:

| Identity | Address | Role | Description |
| :--- | :--- | :--- | :--- |
| **Dr. Okafor (Scholar)** | `0x742d35cc6634c0532925a3b844bc454e4438f44e` | `learner` | Professional claiming credentials, completing courses, and tracking points. |
| **Memorial Hospital (Issuer)** | `0x90F8bf6A479f320ead0075471d310030F88937f2` | `issuer` | Authoritative institution verifying professional hours and approving minting. |
| **NHS Trust (Verifier)** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293bc` | `verifier` | Third-party regulator executing on-chain compliance audits. |

---

## 🧠 Test Flow 1: AI Claim Parsing & Gasless Minting

### Step 1: Connect as Dr. Okafor (Scholar)
1. In the gateway, select **Dr. Okafor (Scholar)**.
2. If this is your first visit, you will land on our **Attestation Onboarding Page**.
3. Choose the **Scholar** role, customize your bio, and click **Save & Launch Console**.
4. You will land safely inside the active 3D Dashboard.

### Step 2: Input a Claim in Natural Language
1. Select the **Claim** tab in the sidebar.
2. You will be greeted by the **AI Attestation Assistant** (dynamic parsing engine).
3. Copy and paste one of the following high-stakes testing claims into the text area:

   * **ACLS Residency Claim**:
     ```text
     I finished a 12-hour Advanced Cardiac Life Support (ACLS) course at Memorial Hospital
     ```
   * **HIPAA Audit Claim**:
     ```text
     I successfully completed 16 hours of HIPAA Compliance training at Memorial Hospital last week
     ```
   * **Critical Care Claim**:
     ```text
     I finished 45 hours of Pediatric Intensive Care training at Memorial Hospital
     ```

4. Click **Analyze Credential Claim**.

### Step 3: Verify the AI Diagnostics & Mint
1. Watch the AI process the natural language.
2. **Expected Output**: The panel displays the structured metadata extracted by the Gemini/Groq model:
   * **Title**: e.g., `Advanced Cardiac Life Support (ACLS) course`
   * **Issuer**: `Memorial Hospital`
   * **Credit Hours**: `12`
   * **Extracted Skills**: e.g., `Cardiovascular Care`, `Emergency Medicine`, `ACLS`
   * **Diagnostics**: Confirms the model name (e.g. `Gemini 2.5 Flash`) and parsing confidence score.
3. Click the **"Request Institution Approval"** button. The claim will be sent to the backend database as `Pending Institution Verification`.

---

## 🏛️ Test Flow 2: Institutional Portal & Approval

### Step 1: Log in as Memorial Hospital (Issuer)
1. Click **Logout** at the top right of your dashboard.
2. Click **Launch Console** on the landing page, and select **Memorial Hospital (Issuer)** in the gateway.
3. Select the **Issuer Portal** tab in the sidebar.

### Step 2: Verify & Approve the Claim
1. **Expected Output**: You will see Dr. Okafor's pending claim listed in the **Pending Institution Approvals** table.
2. In the **Approval Note** input field, type:
   ```text
   Validated via Registry database. Hours are correct.
   ```
3. Click the green **Approve** button.
4. **Expected Output**: A success banner displays. The credential status is updated on-chain to **Institution Verified**, allowing the Scholar to mint their ERC-5192 SoulBound Token!

---

## 🪐 Test Flow 3: 3D Holographic Vault & Compliance Auditing

### Step 1: Switch back to Dr. Okafor (Scholar)
1. Log out, then log back in as **Dr. Okafor**.
2. Select the **3D Vault** (or **World**) tab in the sidebar.

### Step 2: Inspect in 3D
1. **Expected Output**: An interactive 3D particle universe launches, rendering your credentials as beautiful rotating holographic cards orbiting a glowing core.
2. Use your mouse to **click and rotate** the world. Click directly on any holographic card.
3. **Expected Output**: The slide-out **SBT Inspector Panel** expands, rendering live metadata, credit hours, and attested skills.

### Step 3: Run a Compliance Audit
1. Since the credential is now approved, click the prominent **"🛡️ Run On-Chain Compliance Audit"** button.
2. **Expected Output**: The audit triggers a live simulation check on Base Sepolia. The audit status changes to a glowing green **"✅ Audit Registry Passed"**, confirming the SBT is active, unrevoked, and certified valid. Dr. Okafor's point balance will instantly increase by **+10 Points**!

---

## 🤝 Test Flow 4: Peer Skill Endorsements

### Step 1: Attest a Colleague's Skill
1. Select the **Endorsements** tab in the sidebar.
2. Under the **Attest Colleague Skill** form, input:
   * **Peer EOA Wallet Address**: `0x742d35cc6634c0532925a3b844bc454e4438f44e` (Dr. Okafor's Address)
   * **Credential Token ID**: Enter any numeric ID (e.g., `1001` or your approved Token ID).
   * **Skill Tag**: `Critical Care` or `Adrenaline Protocol`
   * **Attestation Note**:
     ```text
     Demonstrated exceptional performance during high-stakes intensive care simulations.
     ```
3. Click **Log Attestation**.

### Step 2: Confirm Recipient Feed Update
1. Switch to the colleague profile or check the **My Skill Attestations Received** feed on the right.
2. **Expected Output**: The new peer endorsement card displays immediately, detailing who attested the skill and the corresponding Token ID, increasing Dr. Okafor's rank standing.

---

## 🏆 Test Flow 5: Leaderboard Points Ladder

1. Select the **Leaderboard** tab in the sidebar.
2. **Expected Output**: You will see a live ranking ladder.
3. Ranks 1, 2, and 3 are adorned with gold, silver, and bronze trophies respectively, utilizing custom glassmorphic neon glows tailored to each rank.
4. Points are dynamically calculated based on:
   * SBTs minted
   * Verified clinical hours completed
   * Peer endorsements logged

---

## 👤 Test Flow 6: Profile & Registry Customization

1. Select the **Profile** tab in the sidebar.
2. Customize your display name, specialty, bio, or choose from our six beautiful high-tech avatar presets.
3. Click **Save Profile Settings**.
4. **Expected Output**: The settings are instantly committed to the backend database. The new avatar and display name are dynamically updated in the sidebar and topbar.

---

> [!TIP]
> **Dynamic Testing Shortcut**: You can have two browser windows open at the same time—one logged in as **Dr. Okafor** and the other as **Memorial Hospital**—to watch the claim-approval-minting-audit cycle happen in real-time with zero friction!
