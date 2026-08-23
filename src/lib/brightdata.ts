export async function triggerBrightDataScrape(company: string, role: string, query: string) {
  const apiKey = process.env.BRIGHTDATA_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/scraper`;

  // Support multiple collector IDs
  const collectorIds = [
    process.env.BRIGHTDATA_COLLECTOR_ID, // Legacy/fallback
    process.env.BRIGHTDATA_TEAMBLIND_COLLECTOR_ID,
    process.env.BRIGHTDATA_REDDIT_COLLECTOR_ID,
    process.env.BRIGHTDATA_LEETCODE_COLLECTOR_ID,
    process.env.BRIGHTDATA_GITHUB_COLLECTOR_ID
  ].filter(Boolean) as string[];

  // Deduplicate
  const uniqueCollectorIds = Array.from(new Set(collectorIds));

  if (!apiKey || uniqueCollectorIds.length === 0) {
    console.error("Missing Bright Data API Key or Collector IDs in environment variables.");
    return;
  }

  const inputPayload = [
    {
      query,
      company,
      role
    }
  ];

  const triggerPromises = uniqueCollectorIds.map(async (collectorId) => {
    const endpoint = `https://api.brightdata.com/dca/trigger?collector=${collectorId}&queue_next=1&webhook=${encodeURIComponent(webhookUrl)}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Bright Data API error for collector ${collectorId} (${response.status}):`, errorText);
        return;
      }

      console.log(`Successfully triggered Bright Data scrape for collector ${collectorId}.`);
    } catch (error) {
      console.error(`Failed to trigger Bright Data scrape for collector ${collectorId}:`, error);
    }
  });

  await Promise.all(triggerPromises);
  console.log(`Finished triggering ${uniqueCollectorIds.length} scrapers for ${company}. Output will be sent to ${webhookUrl}`);
}
