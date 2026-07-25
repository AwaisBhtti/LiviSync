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
