import axios from "axios";
import { decryptAES } from "../../utils/decrypt";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const requestData = {
      clientId: "TP_live_9uiCZrRnqYnG6sY4",
      encryptedData:
        "905bb3bbf2df39141e8e9a4d72f76cd4c8292bcf34738b66560222442b0d52db2bfdf4004200641e12b57b4695d0d7a2e7eb4840b0c7da5573b0e29d19c69cae0d759b8b855e7a49f51d89cc10dd6e54b03cd6136d6b6dc77b974645bb07897d9c4c69c0b57a5588fa029541b2cc8366684e22ba3784294f946c8ec22b9fe32cc5990330c75f76aee947e11553a983018bd3ab60765eba02fdc15f81e4fbf31c56d947f781e3160bb4dc0de80af1cd707d748d7b904dada3961bfae7344fdab9000754e5a1cc724f9d6e0e6aaa1fd4ed8b37a423a807dcaddea32e7f7264bcae5732b8a9040c7dcdadf3668662e30d811aa3f77ffe3cbf83752911bb3320cdce91b96596c4b1ce6051c8f28870b246568369b3d6671bec719b3bf025b517e4525bc1d8d97f5963c83e0c04ac6e42c9248198f0667a96f6862194b7f078b4f71a",
    };

    const response = await axios.post(
      "https://www.trustlypay.com/api/gateway/v2/intent/initialrequest",
      requestData,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("TrustlyPay raw response:", response.data);

    const encryptedResponse = response.data.encryptedData;
    const salt = "iq2sulxnpmPWzfX7";
    const key = "0X82DrBelusUr7jY";

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
