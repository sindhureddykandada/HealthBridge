const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '', // Email
        pass: '' // App password
    }
});

const sendAppointmentEmail = async (doctorEmail, patientName, appointmentDate) => {
    try {
        const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const mailOptions = {
            from: '', // Email
            to: doctorEmail,
            subject: 'New Appointment Scheduled',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Appointment Notification</h2>
                    <p style="font-size: 16px; color: #666;">
                        Hello Dr.,
                    </p>
                    <p style="font-size: 16px; color: #666;">
                        A new appointment has been scheduled with patient <strong>${patientName}</strong>.
                    </p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Patient Name:</strong> ${patientName}</p>
                        <p style="margin: 5px 0;"><strong>Appointment Date:</strong> ${formattedDate}</p>
                    </div>
                    <p style="font-size: 16px; color: #666;">
                        Please check your dashboard for more details.
                    </p>
                    <p style="font-size: 14px; color: #888; margin-top: 30px;">
                        This is an automated message, please do not reply.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendAppointmentEmail
};