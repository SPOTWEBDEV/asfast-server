const db = require("../config/db");
const axios = require("axios");

const VTU_URL = "https://client.peyflex.com.ng/api/airtime/topup/";

exports.purchaseAirtime = async (req, res) => {
  try {
    const { action, network, amount, mobile_number } = req.body;

    if (action !== "topup") {
      return res.json({
        success: false,
        message: "Invalid request"
      });
    }

    const user_id = req.user.user_id;

    if (!network || !amount || !mobile_number) {
      return res.json({
        success: false,
        message: "Missing parameters"
      });
    }

    /* -------------------------
       Create transaction
    ------------------------- */
    const reference = `ASF_${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    await db.query(
      `INSERT INTO airtime_data 
       (user_id, type, network, mobile_number, amount, reference, status)
       VALUES (?, 'airtime', ?, ?, ?, ?, 'pending')`,
      [user_id, network, mobile_number, amount, reference]
    );

    /* -------------------------
       Call VTU API
    ------------------------- */
    let vtuResponse;

    try {
      vtuResponse = await axios.post(
        VTU_URL,
        {
          network,
          mobile_number,
          amount
        },
        {
          headers: {
            Authorization: `Token ${process.env.VTU_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );
    } catch (err) {
      // VTU failed
      await db.query(
        "UPDATE airtime_data SET status='failed' WHERE reference=?",
        [reference]
      );

      return res.json({
        success: false,
        message: "VTU request failed",
        data: {
          error: err.message,
          reference
        }
      });
    }

    const result = vtuResponse.data;

    /* -------------------------
       Update transaction
    ------------------------- */
    const status =
      result?.status === true ? "success" : "failed";

    await db.query(
      "UPDATE airtime_data SET status=? WHERE reference=?",
      [status, reference]
    );

    /* -------------------------
       Response
    ------------------------- */
    if (status === "success") {
      return res.json({
        success: true,
        message: "Airtime sent successfully",
        data: { reference }
      });
    } else {
      return res.json({
        success: false,
        message: result?.message || "Airtime failed",
        data: { reference }
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
