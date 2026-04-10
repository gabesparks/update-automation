# TalentOps Automation 🤖

A growing library of recruiting automation scripts. 
Connects Greenhouse and Slack to automate repetitive recruiting operations 
so the team can focus on what matters most - finding and hiring great people.

---

## Scripts

### 📋 Weekly Open Roles Update
Automatically posts a formatted list of all open roles to Slack every Friday at 12pm EST.

**What it does:**
- Pulls all open roles from Greenhouse (posted and unposted)
- Separates actively posted vs open but not posted roles
- Includes total open role count and offers signed this week
- Posts a clean formatted message to a designated Slack channel

**Built with:** Google Apps Script · Greenhouse Harvest API · Slack Webhooks

---

## Setup

### Prerequisites
- Google Workspace account (for Google Apps Script)
- Greenhouse account with API access
- Slack workspace with incoming webhook permissions

### Configuration
Each script has a configuration section at the top. Fill in the following before running:

| Variable | Description |
|---|---|
| `GREENHOUSE_API_KEY` | Your Greenhouse Harvest API key |
| `SLACK_WEBHOOK_URL` | Your Slack incoming webhook URL |

### Running a script
1. Open [Google Apps Script](https://script.google.com)
2. Create a new project and paste the script contents in
3. Fill in your credentials in the configuration section
4. Click **Run** to test immediately
5. Set up a time-based trigger for automated scheduling

---

## Roadmap
- [ ] CV screener - AI-powered candidate ranking using Claude
- [ ] New role announcements - Auto-post when a role opens
- [ ] New hire announcements - Auto-post when an offer is signed
- [ ] Scorecard reminders - Nudge interviewers to submit feedback
- [ ] Monthly and quarterly recruiting reports

---

## Built by
Gabe - Talent Partner
