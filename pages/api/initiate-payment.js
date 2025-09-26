import axios from "axios";
import { decryptAES } from "../../utils/decrypt";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const requestData = {
      clientId: "TP_live_oah28kRLwXk51TNs",
      encryptedData:
        "921f1710c5850ea31e2296f2f82b8047b99bab6c6b057c776709d6c58be9d129cfc1a687172bc95f2b40f8e8d878ca515ab5865453cb537bf317f71b33b26a8e6df2c8f1c74f867503c26d1361e1828f4e4c93d7b751dde7b1e274b4a319a53de8a9b8b4687fa2ca2cfb15b967aba36bf9a6ccb0582e09b68c138691e92734907d3707a5c70b278b3354c270c8a791f547f4995e6fbee6504471791aa762083b16e897bb771f82d85faaed2345d78661e5231c4c0e4051494ae911b668a650a1e6f2ecfbb34653a4c29995f9c781b022cd5473b11dbcf86ab924778525bfb564b9bf72df638c66e3baa79561ec2dcad73d6885d7e68c0a0b783a00638edc1fcab5af6ec35994e4c4a0e285277538870c7fc4e85be5cbb3a4a3d18ef7a37ec7d7",
    };

    const response = await axios.post(
      "https://www.trustlypay.com/api/gateway/v2/intent/initialrequest",
      requestData,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("TrustlyPay raw response:", response.data);

    const encryptedResponse = response.data.encryptedData;
    const salt = "I62yJhap0FO5W0YZ";
    const key = "286C8AoxVG8RNkl9";

    let paymentData;
    try {
      const decryptedJSON = decryptAES(encryptedResponse, salt, key);
      paymentData = JSON.parse(decryptedJSON);
      console.log("Decrypted payment data:", paymentData);
    } catch (e) {
      console.error("Decryption failed:", e.message);
      return res
        .status(500)
        .json({ error: "Decryption failed", details: e.message });
    }

    res.status(200).json({
      upiIntent: paymentData.upiIntent,
      status: paymentData.status,
      statusCode: paymentData.statusCode, // optional
      orderId: paymentData.orderId,
      signature: paymentData.signature || "", // if available
      amount: paymentData.amount,
      mobileNumber: paymentData.mobileNumber || "",
      description: paymentData.description || "",
      emailId: paymentData.emailId || "",
      userName: paymentData.userName || "",
      transactionId: paymentData.transactionId || "",
      txnCurr: paymentData.txnCurr || "",
      udf1: paymentData.udf1 || "",
      udf2: paymentData.udf2 || "",
    });
  } catch (err) {
    console.error("API call error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Payment initiation failed",
      details: err.response?.data || err.message,
    });
  }
}
