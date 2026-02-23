package ui

// Content holds all the personal data displayed in the TUI.
// Edit this file to customise the information shown when someone SSHes in.

var Name = "Zander Martineau"
var TagLine = "Staff Software Engineer"
var Location = "London, UK"

var Bio = `Front-end web developer with over 15 years experience helping
companies bring products to market, rewriting apps, creating
POCs and more. I specialise in front-end but also work full-stack.`

var Website = "https://zander.wtf"
var Email = "hi@zander.wtf"

type Link struct {
	Label string
	URL   string
}

var Links = []Link{
	{Label: "Website", URL: "https://zander.wtf"},
	{Label: "GitHub", URL: "https://github.com/mrmartineau"},
	{Label: "Bluesky", URL: "https://bsky.app/profile/zander.wtf"},
	{Label: "Mastodon", URL: "https://toot.cafe/@zander"},
	{Label: "Email", URL: "hi@zander.wtf"},
}

type Project struct {
	Name        string
	Description string
	URL         string
}

var Projects = []Project{
	{
		Name:        "Otter",
		Description: "Self-hosted personal bookmarking app",
		URL:         "https://github.com/mrmartineau/Otter",
	},
	{
		Name:        "zander.wtf",
		Description: "My personal website, built with Astro",
		URL:         "https://github.com/mrmartineau/zander.wtf",
	},
	{
		Name:        "Journal",
		Description: "Personal journalling app with AI-powered text improvements",
		URL:         "https://github.com/mrmartineau/journal",
	},
	{
		Name:        "Code Notes",
		Description: "TILs, snippets — my digital code garden",
		URL:         "https://zander.wtf/notes",
	},
	{
		Name:        "Rigel VS Code",
		Description: "Port of Rigel theme for VS Code",
		URL:         "https://github.com/mrmartineau/rigel-vscode",
	},
	{
		Name:        "CF Worker Scraper",
		Description: "Page metadata scraper using Cloudflare Workers",
		URL:         "https://github.com/mrmartineau/cloudflare-worker-scraper",
	},
}

type Job struct {
	Company string
	Role    string
	Type    string // "employed" or "contract"
}

var CurrentJob = Job{
	Company: "Dare",
	Role:    "Staff Software Engineer",
	Type:    "employed",
}

var PreviousJobs = []Job{
	{Company: "Fathom", Role: "Senior Front-end Developer", Type: "contract"},
	{Company: "Utopia Music", Role: "Senior Front-end Developer", Type: "contract"},
	{Company: "Babylon Health", Role: "Senior Front-end Developer", Type: "contract"},
	{Company: "Curve", Role: "Senior Front-end Developer", Type: "contract"},
	{Company: "Heights", Role: "Senior Front-end Developer", Type: "contract"},
	{Company: "Nimbletank", Role: "Senior Front-end Developer", Type: "employed"},
	{Company: "TMW Unlimited", Role: "Front-end Developer", Type: "employed"},
}
