const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendVerificationEmail(email, token) {
    const verifyUrl = `${process.env.BASE_URL}/auth/verify?token=${token}`;

    const html = `
    <div style="font-family: 'Arial', sans-serif; background:#f5f7fa; padding:30px;">
        
        <div style="
            max-width:520px;
            background:white;
            margin: auto;
            border-radius:12px;
            box-shadow:0 4px 15px rgba(0,0,0,0.1);
            overflow:hidden;
        ">

            <div style="background:#2563eb; padding:25px; text-align:center;">
                <h1 style="color:white; font-size:24px; margin:0;">🍽 Makan Ki'</h1>
                <p style="color:#dbeafe; margin-top:6px; font-size:14px;">
                    Jelajahi Kuliner Nusantara
                </p>
            </div>

            <div style="padding:30px;">
                <h2 style="color:#111827; margin-bottom:10px; font-size:22px;">Verifikasi Email Anda</h2>

                <p style="color:#4b5563; font-size:15px; line-height:1.6;">
                    Terima kasih telah mendaftar di <strong>Makan Ki'</strong>!  
                    Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini.
                </p>

                <div style="text-align:center; margin:25px 0;">
                    <a href="${verifyUrl}" target="_blank"
                        style="
                            background:#f97316;
                            padding:14px 26px;
                            color:white;
                            text-decoration:none;
                            font-size:16px;
                            font-weight:bold;
                            border-radius:8px;
                            display:inline-block;
                            box-shadow:0 3px 6px rgba(0,0,0,0.15);
                        "
                    >
                        Verifikasi Email
                    </a>
                </div>

                <p style="color:#6b7280; font-size:13px;">
                    Jika tombol tidak berfungsi, salin dan tempel link berikut ke browser Anda:
                </p>

                <p style="font-size:13px; color:#2563eb; word-break: break-all;">
                    ${verifyUrl}
                </p>
            </div>

            <div style="background:#f3f4f6; padding:18px; text-align:center;">
                <p style="font-size:12px; color:#9ca3af;">
                    Email ini dikirim otomatis oleh sistem Makan Ki'. Jangan balas email ini.
                </p>
            </div>

        </div>
    </div>
    `;

    await transporter.sendMail({
        from: `"Makan Ki'" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verifikasi Email Akun Anda — Makan Ki'",
        html
    });
}

module.exports = sendVerificationEmail;
