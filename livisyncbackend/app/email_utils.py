import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading
import logging
from .config import settings

logger = logging.getLogger("uvicorn.error")

def send_email_sync(subject: str, recipient: str, html_content: str, text_content: str):
    """Synchronous function to send email, should be run in a separate thread."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP configuration is missing. Invitation email not sent.")
        return
        
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"LiviSync <{settings.SMTP_FROM}>"
    msg['To'] = recipient

    # Attach plain text version
    part1 = MIMEText(text_content, 'plain')
    # Attach HTML version
    part2 = MIMEText(html_content, 'html')
    
    msg.attach(part1)
    msg.attach(part2)

    try:
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.ehlo()
            server.starttls()
            server.ehlo()
            
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, recipient, msg.as_string())
        server.quit()
        logger.info(f"Invitation email successfully sent to {recipient}")
    except Exception as e:
        logger.error(f"Failed to send email to {recipient}: {e}")


def send_invitation_email(recipient_email: str, invite_link: str):
    """Asynchronously dispatches an invitation email using a background thread."""
    subject = "LiviSync Partner Invitation: Register your Hostel Listing"
    
    text_content = (
        f"Hello,\n\n"
        f"You have been invited by LiviSync administrators to register as a Hostel Owner and list your property.\n"
        f"Please register using the following link:\n{invite_link}\n\n"
        f"Best regards,\nThe LiviSync Team"
    )
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }}
            .container {{
                max-width: 580px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
                overflow: hidden;
            }}
            .header {{
                background-color: #6366f1;
                padding: 32px;
                text-align: center;
            }}
            .header h1 {{
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: -0.02em;
            }}
            .body {{
                padding: 40px 32px;
                color: #334155;
            }}
            .body p {{
                font-size: 16px;
                line-height: 1.6;
                margin-top: 0;
                margin-bottom: 24px;
            }}
            .btn-container {{
                text-align: center;
                margin: 32px 0;
            }}
            .btn {{
                background-color: #6366f1;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 28px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;
                display: inline-block;
                box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
                transition: background-color 0.2s;
            }}
            .btn:hover {{
                background-color: #4f46e5;
            }}
            .footer {{
                background-color: #f8fafc;
                padding: 24px 32px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                font-size: 13px;
                color: #64748b;
            }}
            .footer a {{
                color: #6366f1;
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to LiviSync</h1>
            </div>
            <div class="body">
                <p>Hello,</p>
                <p>You have been invited by LiviSync administration to register as a partner <strong>Hostel Owner</strong>. Listed partners can verify properties, publish vacancies, and connect directly with student tenants.</p>
                <div class="btn-container">
                    <a href="{invite_link}" class="btn" target="_blank">Accept Invitation & Register</a>
                </div>
                <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                <p style="word-break: break-all; font-size: 14px; color: #64748b; background-color: #f1f5f9; padding: 12px; border-radius: 6px;">
                    {invite_link}
                </p>
                <p>This invitation link is unique to your email address.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 LiviSync. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Spawn background thread to prevent blocking FastAPI request lifecycle
    thread = threading.Thread(target=send_email_sync, args=(subject, recipient_email, html_content, text_content))
    thread.daemon = True
    thread.start()


def send_warning_email(recipient_email: str, name: str, reason: str, description: str):
    """Asynchronously dispatches a safety warning email using a background thread."""
    subject = "LiviSync Safety Alert: Official Warning"
    
    text_content = (
        f"Hello {name},\n\n"
        f"This is an official warning from LiviSync Administration. We have received a safety/abuse report concerning your profile.\n"
        f"Reason for report: {reason}\n"
        f"Details reported: {description}\n\n"
        f"Please ensure you adhere strictly to our Community Guidelines. Further violations will lead to immediate account suspension.\n\n"
        f"Best regards,\nThe LiviSync Safety Team"
    )
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: sans-serif; background-color: #f8fafc; color: #334155; padding: 20px; }}
            .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e2e8f0; }}
            .header {{ color: #dc2626; font-size: 20px; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }}
            .warning-box {{ background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Official Safety Warning</div>
            <p>Hello {name},</p>
            <p>We are writing to inform you that LiviSync Administration has received an official safety and conduct report concerning your profile activity.</p>
            
            <div class="warning-box">
                <strong>Reported Issue:</strong> {reason}<br/>
                <strong>Details:</strong> {description}
            </div>
            
            <p>Please review our Community Guidelines. We strive to maintain a safe, welcoming environment for all students. <strong>Further infractions or reports will result in immediate suspension of your LiviSync account.</strong></p>
            
            <p>Best regards,<br/>The LiviSync Safety & Moderation Team</p>
            
            <div class="footer">
                &copy; 2026 LiviSync. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    
    thread = threading.Thread(target=send_email_sync, args=(subject, recipient_email, html_content, text_content))
    thread.daemon = True
    thread.start()


def send_suspension_email(recipient_email: str, name: str):
    """Asynchronously dispatches an account suspension email using a background thread."""
    subject = "LiviSync Account Status: Suspended"
    
    text_content = (
        f"Hello {name},\n\n"
        f"We regret to inform you that your LiviSync account has been suspended by Administration due to violations of our safety guidelines.\n"
        f"You will no longer be able to log in, search for roommates, view hostels, or chat with other users.\n\n"
        f"If you believe this was in error, you may contact our support team.\n\n"
        f"Best regards,\nThe LiviSync Safety Team"
    )
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: sans-serif; background-color: #f8fafc; color: #334155; padding: 20px; }}
            .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e2e8f0; }}
            .header {{ color: #b91c1c; font-size: 20px; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }}
            .alert-box {{ background-color: #fef2f2; border-left: 4px solid #b91c1c; padding: 16px; margin: 20px 0; border-radius: 4px; color: #991b1b; }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Account Suspension Notice</div>
            <p>Hello {name},</p>
            
            <div class="alert-box">
                <strong>Your account has been suspended indefinitely.</strong>
            </div>
            
            <p>Following review of safety reports received concerning your account, LiviSync Administration has suspended your profile for failing to comply with our community safety and code of conduct standards.</p>
            <p>As a result of this suspension:
                <ul>
                    <li>You can no longer log in or access your account.</li>
                    <li>Your profile is hidden from the student and roommate directories.</li>
                    <li>All your active connections, match requests, and chats have been disabled.</li>
                </ul>
            </p>
            <p>If you believe this action was taken in error and wish to appeal, please contact support.</p>
            
            <p>Best regards,<br/>The LiviSync Safety & Moderation Team</p>
            
            <div class="footer">
                &copy; 2026 LiviSync. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    
    thread = threading.Thread(target=send_email_sync, args=(subject, recipient_email, html_content, text_content))
    thread.daemon = True
    thread.start()
