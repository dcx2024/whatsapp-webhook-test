const jwt = require('jsonwebtoken');

const decode = (req, res) => {
    try {
        // Use req.params because the token is in the URL path: /verify/:token
        const { token } = req.params; 

        if (!token) {
            return res.status(400).json({ message: "Token is missing" });
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

        // This is where the Buyer sees the OTP on their screen
        return res.status(200).send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>Payment Successful! ✅</h1>
                    <p>Show this code to the seller:</p>
                    <div style="font-size: 40px; font-weight: bold; color: #09a5db;">
                        ${decodedPayload.otp}
                    </div>
                </body>
            </html>
        `);

    } catch (error) {
        return res.status(401).send("Invalid or expired session.");
    }
};

module.exports={
    decode
}