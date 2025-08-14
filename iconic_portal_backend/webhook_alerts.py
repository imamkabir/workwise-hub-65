import requests
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class WebhookNotifier:
    def __init__(self):
        self.discord_webhook = os.getenv("DISCORD_WEBHOOK_URL")
        self.slack_webhook = os.getenv("SLACK_WEBHOOK_URL")
        self.email_enabled = bool(os.getenv("SMTP_EMAIL") and os.getenv("SMTP_PASSWORD"))
        
        self.logger = logging.getLogger("webhooks")
        self.logger.setLevel(logging.INFO)

    def send_discord_alert(self, title: str, description: str, color: int = 0xff0000, fields: Optional[list] = None):
        """Send alert to Discord webhook"""
        if not self.discord_webhook:
            return False
            
        try:
            embed = {
                "title": title,
                "description": description,
                "color": color,
                "timestamp": datetime.utcnow().isoformat(),
                "footer": {
                    "text": "Iconic Portal Security Alert"
                }
            }
            
            if fields:
                embed["fields"] = fields
            
            payload = {
                "embeds": [embed]
            }
            
            response = requests.post(
                self.discord_webhook,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 204:
                self.logger.info("Discord alert sent successfully")
                return True
            else:
                self.logger.error(f"Discord alert failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Discord alert error: {str(e)}")
            return False

    def send_slack_alert(self, text: str, color: str = "danger", fields: Optional[list] = None):
        """Send alert to Slack webhook"""
        if not self.slack_webhook:
            return False
            
        try:
            attachment = {
                "color": color,
                "text": text,
                "ts": int(datetime.utcnow().timestamp())
            }
            
            if fields:
                attachment["fields"] = fields
            
            payload = {
                "text": "🚨 Iconic Portal Security Alert",
                "attachments": [attachment]
            }
            
            response = requests.post(
                self.slack_webhook,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                self.logger.info("Slack alert sent successfully")
                return True
            else:
                self.logger.error(f"Slack alert failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Slack alert error: {str(e)}")
            return False

    def send_critical_alert(self, event_type: str, details: Dict[str, Any]):
        """Send critical security alerts to all configured channels"""
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Prepare alert content
        alerts = {
            "failed_login": {
                "title": "🚫 Failed Login Attempt",
                "description": f"Multiple failed login attempts detected",
                "color": 0xff4444
            },
            "suspicious_upload": {
                "title": "⚠️ Suspicious File Upload",
                "description": f"Potentially malicious file upload detected",
                "color": 0xffaa00
            },
            "admin_login_new_ip": {
                "title": "🔐 Admin Login from New IP",
                "description": f"Admin logged in from a new IP address",
                "color": 0x0099ff
            },
            "admin_login": {
                "title": "👑 Admin Login",
                "description": f"Admin user has logged into the system",
                "color": 0x00ff00
            },
            "database_backup": {
                "title": "💾 Database Backup",
                "description": f"Database backup operation completed",
                "color": 0x888888
            }
        }
        
        alert_config = alerts.get(event_type, {
            "title": f"🔔 Security Event: {event_type}",
            "description": "Security event detected",
            "color": 0xff0000
        })
        
        # Prepare fields for detailed information
        fields = []
        for key, value in details.items():
            fields.append({
                "name": key.replace("_", " ").title(),
                "value": str(value),
                "inline": True
            })
        
        # Add timestamp field
        fields.append({
            "name": "Timestamp",
            "value": timestamp,
            "inline": False
        })
        
        # Send to Discord
        if self.discord_webhook:
            self.send_discord_alert(
                title=alert_config["title"],
                description=alert_config["description"],
                color=alert_config["color"],
                fields=fields
            )
        
        # Send to Slack
        if self.slack_webhook:
            slack_text = f"{alert_config['title']}\n{alert_config['description']}\n"
            for field in fields:
                slack_text += f"*{field['name']}:* {field['value']}\n"
            
            self.send_slack_alert(text=slack_text)
        
        # Log the alert
        self.logger.info(f"Critical alert sent: {event_type} - {details}")

    def test_webhooks(self):
        """Test all configured webhook endpoints"""
        results = {}
        
        # Test Discord
        if self.discord_webhook:
            results["discord"] = self.send_discord_alert(
                title="🧪 Test Alert",
                description="Testing Discord webhook integration",
                color=0x00ff00,
                fields=[
                    {"name": "Status", "value": "Testing", "inline": True},
                    {"name": "Timestamp", "value": datetime.utcnow().isoformat(), "inline": True}
                ]
            )
        else:
            results["discord"] = "Not configured"
        
        # Test Slack
        if self.slack_webhook:
            results["slack"] = self.send_slack_alert(
                text="Testing Slack webhook integration",
                color="good",
                fields=[
                    {"title": "Status", "value": "Testing", "short": True},
                    {"title": "Timestamp", "value": datetime.utcnow().isoformat(), "short": True}
                ]
            )
        else:
            results["slack"] = "Not configured"
        
        return results

# Global webhook notifier instance
webhook_notifier = WebhookNotifier()

# Helper functions for specific events
def alert_failed_login(email: str, ip: str, attempts: int):
    webhook_notifier.send_critical_alert("failed_login", {
        "email": email,
        "ip_address": ip,
        "failed_attempts": attempts
    })

def alert_suspicious_upload(filename: str, user_email: str, ip: str, reason: str):
    webhook_notifier.send_critical_alert("suspicious_upload", {
        "filename": filename,
        "user": user_email,
        "ip_address": ip,
        "reason": reason
    })

def alert_admin_login(email: str, ip: str, new_ip: bool = False):
    event_type = "admin_login_new_ip" if new_ip else "admin_login"
    webhook_notifier.send_critical_alert(event_type, {
        "admin_email": email,
        "ip_address": ip,
        "new_ip": new_ip
    })

def alert_database_backup(backup_path: str, success: bool):
    webhook_notifier.send_critical_alert("database_backup", {
        "backup_path": backup_path,
        "success": success,
        "status": "Success" if success else "Failed"
    })