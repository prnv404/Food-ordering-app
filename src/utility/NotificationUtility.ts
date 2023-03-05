/* ------------------- Email --------------------- */

/* ------------------- Notification --------------------- */

/* ------------------- OTP --------------------- */

export const GenerateOtp = () => {

    const otp = Math.floor(10000 + Math.random() * 900000);
    let expiry = new Date()
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000));

    return {otp, expiry};
}

export const onRequestOTP = async(otp: number, toPhoneNumber: string) => {

    const accountSid = process.env.ACCOUNT_SID
    const authToken = process.env.AUTH_TOKEN
    const client = require('twilio')(accountSid, authToken);

    const response = await client.message.create({
        body: `Your OTP is ${otp}`,
        from: 'Your TWILIO PHONE NUMBER YOU CAN GET IT FROM YOUR DASHBOARD',
        to: `recipient_countrycode${toPhoneNumber}` // recipient phone number // Add country before the number
    })

    return response;
}

/* ------------------- Payment --------------------- */