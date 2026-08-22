export const SOURCES = [
  {
    id: "teamblind",
    name: "TeamBlind",
    domain: "teamblind.com",
  },
  {
    id: "leetcode-discuss",
    name: "LeetCode Discuss",
    domain: "leetcode.com",
    path: "/discuss/interview-experience",
  },
  {
    id: "reddit-cscareerquestions",
    name: "r/cscareerquestions",
    domain: "reddit.com",
    path: "/r/cscareerquestions",
  },
  {
    id: "reddit-leetcode",
    name: "r/leetcode",
    domain: "reddit.com",
    path: "/r/leetcode",
  },
  {
    id: "reddit-developersindia",
    name: "r/developersIndia",
    domain: "reddit.com",
    path: "/r/developersIndia",
  },
  {
    id: "reddit-csmajors",
    name: "r/csMajors",
    domain: "reddit.com",
    path: "/r/csMajors",
  },
  {
    id: "1point3acres",
    name: "1Point3Acres",
    domain: "1point3acres.com",
  },
  {
    id: "hack2hire",
    name: "Hack2Hire Forums",
    domain: "hack2hire.com",
    path: "/forum",
  },
  {
    id: "geeksforgeeks",
    name: "GeeksforGeeks Interview Experiences",
    domain: "geeksforgeeks.org",
  },
  {
    id: "ambitionbox",
    name: "AmbitionBox",
    domain: "ambitionbox.com",
  },
  {
    id: "glassdoor",
    name: "Glassdoor Interview Questions",
    domain: "glassdoor.com",
  },
  {
    id: "interviewdb",
    name: "InterviewDB",
    domain: "interviewdb.io",
  },
  {
    id: "hackernews",
    name: "Hacker News",
    domain: "news.ycombinator.com",
    note: "Queried via Algolia search API",
  },
  {
    id: "github",
    name: "GitHub",
    domain: "github.com",
    note: "Repos matching awesome-interview-experiences or company-interview-questions",
  },
  {
    id: "reddit-netsec",
    name: "r/netsecstudents",
    domain: "reddit.com",
    path: "/r/netsecstudents",
  },
  {
    id: "reddit-cybersecurity",
    name: "r/cybersecurity",
    domain: "reddit.com",
    path: "/r/cybersecurity",
  },
  {
    id: "hackthebox",
    name: "HackTheBox Discussions",
    domain: "hackthebox.com",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    domain: "x.com",
    note: 'Advanced search: "interview experience" AND "backend" min_faves:10',
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    domain: "linkedin.com",
    note: "Public posts tagged #interviewexperience or #technicalinterview",
  },
  {
    id: "medium",
    name: "Medium",
    domain: "medium.com",
    note: "Tag: technical-interview",
  },
  {
    id: "devto",
    name: "Dev.to",
    domain: "dev.to",
    note: "Tag: interview",
  },
  {
    id: "hashnode",
    name: "Hashnode",
    domain: "hashnode.com",
    note: "Tag: interview",
  },
] as const;

export type SourceId = (typeof SOURCES)[number]["id"];
