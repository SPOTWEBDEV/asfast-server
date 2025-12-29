const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { createJWT } = require("../helpers/jwt");

exports.login = async (req, res) => {
  try {
    const { email = "", password = "" } = req.body;

    if (!email.trim() || !password) {
      return res.json({
        success: false,
        message: "Email and password required"
      });
    }

    /* 1️⃣ Fetch user */
    const [users] = await db.query(
      `SELECT id, email, first_name, last_name, password, kyc_level, bal,
              user_invite_code, ref_bal, transactionpin
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email.trim()]
    );

    if (users.length === 0) {
      return res.json({
        success: false,
        message: "Invalid login credentials"
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid login credentials"
      });
    }

    /* 2️⃣ Check bank account */
    const [bankRows] = await db.query(
      "SELECT id FROM bank_accounts WHERE user_id = ? LIMIT 1",
      [user.id]
    );

    const hasBankAccount = bankRows.length > 0 ? 1 : 0;
    const bankId = hasBankAccount ? bankRows[0].id : null;

    /* 3️⃣ Check transaction pin */
    const haspin = user.transactionpin ? 1 : 0;

    /* 4️⃣ Create JWT */
    const token = createJWT({
      user_id: user.id,
      kyc: user.kyc_level
    });

    /* 5️⃣ Response */
    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          kyc_level: Number(user.kyc_level),
          bal: Number(user.bal),
          user_invite_code: user.user_invite_code,
          ref_bal: Number(user.ref_bal),

          /* 🔑 Important flags */
          haspin,
          has_bank_account: hasBankAccount,
          bank_id: bankId
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
