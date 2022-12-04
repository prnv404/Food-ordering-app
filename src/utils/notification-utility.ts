import 'dotenv/config'
// Email

// Notification

// OTP

export const GenerateOtp = () => {
    
    const otp = Math.floor(100000 + Math.random() * 900000)
    
    const expiry = new Date()

    expiry.setTime(new Date().getTime() + (30 * 60 * 1000))

    return { otp, expiry }
    
}

const authToken = process.env.AUTH_TOKEN
const accountSID = process.env.ACCOUNT_SID
 
export const onRequestOtp = async (otp: number, toPhoneNumber: string) => {

    const client = require('twilio')(accountSID,authToken)
    const response = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: '+13608688893',
        to:`+91${toPhoneNumber}`
    })
    
    return response
}

// Payment Notifications or email


