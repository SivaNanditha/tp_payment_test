// import { useState } from "react";
// import { QRCodeCanvas } from "qrcode.react";

// export default function Home() {
//   const [loading, setLoading] = useState(false);
//   const [paymentInfo, setPaymentInfo] = useState(null);
//   const [error, setError] = useState(null);

//   const handlePayment = async () => {
//     setLoading(true);
//     setError(null);
//     setPaymentInfo(null);

//     try {
//       const res = await fetch("/api/initiate-payment", { method: "POST" });
//       const data = await res.json();

//       if (data.status === "success" && data.upiIntent) {
//         setPaymentInfo(data);
//       } else {
//         setError(data.details || data.message || "Payment initiation failed");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Error initiating payment");
//     }

//     setLoading(false);
//   };

//   const openUPI = () => {
//     if (!paymentInfo?.upiIntent) return;
//     window.location.href = paymentInfo.upiIntent;
//   };

//   const copyToClipboard = async (text) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       alert("Copied to clipboard!");
//     } catch (err) {
//       console.error(err);
//       alert("Copy failed — select and copy manually.");
//     }
//   };

//   const fieldsOrder = [
//     "upiIntent",
//     "orderId",
//     "signature",
//     "amount",
//     "mobileNumber",
//     "description",
//     "emailId",
//     "userName",
//     "transactionId",
//     "txnCurr",
//     "udf1",
//     "udf2",
//   ];

//   return (
//     <div className="container">
//       <h1>TrustlyPay Demo</h1>

//       {!paymentInfo && (
//         <button
//           onClick={handlePayment}
//           disabled={loading}
//           className="btn-primary"
//         >
//           {loading ? "Processing..." : "Initiate Payment"}
//         </button>
//       )}

//       {error && <div className="error">{error}</div>}

//       {paymentInfo && (
//         <div className="card">
//           <h2>Payment Details</h2>
//           <div className="grid">
//             {fieldsOrder.map((key) => {
//               const value = paymentInfo[key] ?? "";
//               const label = key === "upiIntent" ? "UPI Intent Link" : key;

//               return (
//                 <div key={key} className="field">
//                   <div className="label">{label}</div>
//                   <div className="value">
//                     {value || (
//                       <span className="empty">(No value provided)</span>
//                     )}
//                     {key === "upiIntent" && value && (
//                       <button
//                         onClick={() => copyToClipboard(value)}
//                         className="btn-copy"
//                       >
//                         Copy
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <h3>Choose Your Payment App</h3>
//           <div className="button-group">
//             <button onClick={openUPI} className="btn-google">
//               Google Pay
//             </button>
//             <button onClick={openUPI} className="btn-phonepe">
//               PhonePe
//             </button>
//             <button onClick={openUPI} className="btn-paytm">
//               Paytm
//             </button>
//           </div>

//           <h3>Or Scan QR Code</h3>
//           <div className="qr-container">
//             {paymentInfo.upiIntent ? (
//               <QRCodeCanvas value={paymentInfo.upiIntent} size={250} />
//             ) : (
//               <p className="empty">QR code not available without UPI Intent.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setPaymentInfo(null);

    try {
      const res = await fetch("/api/initiate-payment", { method: "POST" });
      const data = await res.json();

      if (data.status === "success" && data.upiIntent) {
        setPaymentInfo(data);
      } else {
        setError(data.details || data.message || "Payment initiation failed");
      }
    } catch (err) {
      console.error(err);
      setError("Error initiating payment");
    }

    setLoading(false);
  };

  const openUPIApp = (app) => {
    if (!paymentInfo?.upiIntent) return;

    const upiUrl = paymentInfo.upiIntent;
    let appUrl = "";
    let fallbackUrl = "";

    switch (app) {
      case "gpay":
        appUrl = `intent://${upiUrl.replace(
          "upi://",
          ""
        )}#Intent;package=com.google.android.apps.nbu.paisa.user;end`;
        fallbackUrl =
          "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user&hl=en&gl=US";
        break;

      case "phonepe":
        appUrl = upiUrl.replace("upi://pay?", "phonepe://pay?");
        // PhonePe fallback is optional, you can add Play Store link if needed
        break;

      case "paytm":
        appUrl = upiUrl; // generic UPI link
        fallbackUrl =
          "https://play.google.com/store/apps/details?id=net.one97.paytm&hl=en&gl=US";
        break;

      default:
        appUrl = upiUrl;
    }

    if (fallbackUrl) {
      // Fallback logic: redirect to install if app not opened
      const timeout = setTimeout(() => {
        window.location.href = fallbackUrl;
      }, 2000); // wait 2 seconds

      window.location.href = appUrl;

      // If user leaves page to app, clear the timeout
      window.addEventListener("blur", () => clearTimeout(timeout));
    } else {
      window.location.href = appUrl;
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error(err);
      alert("Copy failed — select and copy manually.");
    }
  };

  const fieldsOrder = [
    "upiIntent",
    "orderId",
    "signature",
    "amount",
    "mobileNumber",
    "description",
    "emailId",
    "userName",
    "transactionId",
    "txnCurr",
    "udf1",
    "udf2",
  ];

  return (
    <div className="container">
      <h1>TrustlyPay Demo</h1>

      {!paymentInfo && (
        <button
          onClick={handlePayment}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Processing..." : "Initiate Payment"}
        </button>
      )}

      {error && <div className="error">{error}</div>}

      {paymentInfo && (
        <div className="card">
          <h2>Payment Details</h2>
          <div className="grid">
            {fieldsOrder.map((key) => {
              const value = paymentInfo[key] ?? "";
              const label = key === "upiIntent" ? "UPI Intent Link" : key;

              return (
                <div key={key} className="field">
                  <div className="label">{label}</div>
                  <div className="value">
                    {value || (
                      <span className="empty">(No value provided)</span>
                    )}
                    {key === "upiIntent" && value && (
                      <button
                        onClick={() => copyToClipboard(value)}
                        className="btn-copy"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <h3>Choose Your Payment App</h3>
          <div className="button-group">
            <button onClick={() => openUPIApp("gpay")} className="btn-google">
              Google Pay
            </button>
            <button
              onClick={() => openUPIApp("phonepe")}
              className="btn-phonepe"
            >
              PhonePe
            </button>
            <button onClick={() => openUPIApp("paytm")} className="btn-paytm">
              Paytm
            </button>
          </div>

          <h3>Or Scan QR Code</h3>
          <div className="qr-container">
            {paymentInfo.upiIntent ? (
              <QRCodeCanvas value={paymentInfo.upiIntent} size={250} />
            ) : (
              <p className="empty">QR code not available without UPI Intent.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
