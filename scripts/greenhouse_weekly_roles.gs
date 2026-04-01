// ============================================================
// CONFIGURATION — Fill in these values before running
// ============================================================
const GREENHOUSE_API_KEY = "YOUR_GREENHOUSE_API_KEY_HERE";
const SLACK_WEBHOOK_URL  = "YOUR_SLACK_WEBHOOK_URL_HERE";
// ============================================================


function postOpenRolesToSlack() {

  // --- 1. Fetch all open jobs from Greenhouse ---
  const jobsUrl = "https://harvest.greenhouse.io/v1/jobs?status=open&per_page=500";
  const credentials = Utilities.base64Encode(GREENHOUSE_API_KEY + ":");

  const options = {
    method: "GET",
    headers: { Authorization: "Basic " + credentials },
    muteHttpExceptions: true
  };

  const jobsResponse = UrlFetchApp.fetch(jobsUrl, options);

  if (jobsResponse.getResponseCode() !== 200) {
    Logger.log("Greenhouse Jobs API error: " + jobsResponse.getResponseCode() + " — " + jobsResponse.getContentText());
    return;
  }

  const jobs = JSON.parse(jobsResponse.getContentText());

  if (!jobs || jobs.length === 0) {
    Logger.log("No open roles found.");
    return;
  }

  // --- 2. For each job, check its job posts to determine if actively posted ---
  const postedRoles   = [];
  const unpostedRoles = [];

  jobs.forEach(function(job) {
    const jobPostsUrl = "https://harvest.greenhouse.io/v1/jobs/" + job.id + "/job_posts";
    const jobPostsResponse = UrlFetchApp.fetch(jobPostsUrl, options);

    let isPosted = false;

    if (jobPostsResponse.getResponseCode() === 200) {
      const jobPosts = JSON.parse(jobPostsResponse.getContentText());
      isPosted = jobPosts.some(function(post) {
        return post.live === true && post.active === true;
      });
    }

    if (isPosted) {
      postedRoles.push(job.name);
    } else {
      unpostedRoles.push(job.name);
    }
  });

  // --- 3. Fetch offers signed this week ---
  // Pull all offers and filter by status and date in the script
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const offersUrl = "https://harvest.greenhouse.io/v1/offers?per_page=500";
  const offersResponse = UrlFetchApp.fetch(offersUrl, options);

  let offersSigned = 0;

  if (offersResponse.getResponseCode() === 200) {
    const offers = JSON.parse(offersResponse.getContentText());
    offersSigned = offers.filter(function(offer) {
      const isSigned = offer.status === "signed";
      const createdAt = new Date(offer.created_at);
      const isThisWeek = createdAt >= oneWeekAgo;
      return isSigned && isThisWeek;
    }).length;
  } else {
    Logger.log("Offers API error: " + offersResponse.getResponseCode() + " — " + offersResponse.getContentText());
  }

  // --- 4. Build the Slack message ---
  const totalCount = jobs.length;
  const today = Utilities.formatDate(new Date(), "America/New_York", "MMMM dd, yyyy");

  let message = "*📋 Open Roles Update — " + today + "*\n";
  message += "*Total Open Roles: " + totalCount + "*\n";
  message += "*✍️ Offers Signed This Week: " + offersSigned + "*\n\n";

  if (postedRoles.length > 0) {
    message += "*🟢 Actively Posted (" + postedRoles.length + ")*\n";
    postedRoles.forEach(function(role) {
      message += "• " + role + "\n";
    });
    message += "\n";
  }

  if (unpostedRoles.length > 0) {
    message += "*⚪ Open but Not Posted (" + unpostedRoles.length + ")*\n";
    unpostedRoles.forEach(function(role) {
      message += "• " + role + "\n";
    });
  }

  // --- 5. Post to Slack ---
  const slackPayload = JSON.stringify({ text: message });

  const slackOptions = {
    method: "POST",
    contentType: "application/json",
    payload: slackPayload,
    muteHttpExceptions: true
  };

  const slackResponse = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, slackOptions);

  if (slackResponse.getResponseCode() === 200) {
    Logger.log("Successfully posted to Slack!");
  } else {
    Logger.log("Slack error: " + slackResponse.getContentText());
  }
}


// ============================================================
// HOW TO SET UP THE WEEKLY FRIDAY 12PM EST TRIGGER:
//
// 1. In Apps Script, click the clock icon ("Triggers") in the left sidebar
// 2. Click "+ Add Trigger" (bottom right)
// 3. Choose function: postOpenRolesToSlack
// 4. Select event source: Time-driven
// 5. Select type: Week timer
// 6. Select day: Every Friday
// 7. Select time: 12pm to 1pm
// 8. Click Save
//
// TO TEST IMMEDIATELY (without waiting for Friday):
// Just click the "Run" button at the top while
// postOpenRolesToSlack is selected. It will post to Slack instantly.
// ============================================================
