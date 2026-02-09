# ssh zander.wtf

An SSH-accessible terminal portfolio powered by [Charm](https://charm.sh)'s [Wish](https://github.com/charmbracelet/wish) and [Bubble Tea](https://github.com/charmbracelet/bubbletea).

When someone runs `ssh hi.zander.wtf`, they see a styled terminal UI with bio, projects, experience, and links.

## Architecture

```
Internet                    Your Network
────────────────────────────────────────────────

User runs:
  ssh hi.zander.wtf
        │
        ▼
  Cloudflare DNS ──────► Router ──────► Synology NAS
  (DNS-only, grey)       (port         (Docker container
   A record pointing      forward       running Wish SSH
   to your public IP)     22 → NAS)     server on port 22)
```

## Project structure

```
ssh-server/
├── main.go              # Wish SSH server entry point
├── ui/
│   ├── model.go         # Bubble Tea model (views, update, navigation)
│   ├── styles.go        # Lipgloss styles (colours, layout)
│   └── content.go       # Personal content (bio, projects, jobs, links)
├── go.mod               # Go module definition
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Docker Compose for Synology deployment
└── README.md            # This file
```

## Customising content

Edit `ui/content.go` to change:
- Name, tagline, location, bio
- Projects list
- Work experience
- Social links

Edit `ui/styles.go` to change colours, fonts, and layout.

## Local development

### Prerequisites

- [Go 1.22+](https://go.dev/dl/)

### Run locally

```bash
cd ssh-server
go mod tidy       # download dependencies
go run .          # starts on port 22 (needs sudo) or set SSH_PORT
```

To run on a non-privileged port during development:

```bash
SSH_PORT=2222 go run .
```

Then in another terminal:

```bash
ssh localhost -p 2222
```

### Build and run with Docker (local test)

```bash
cd ssh-server
docker compose up --build
ssh localhost -p 2222
```

## Deploying to Synology NAS

### Step 1: Install Container Manager

1. Open **Package Center** on your Synology NAS
2. Install **Container Manager** (formerly called "Docker")

### Step 2: Get the files onto your NAS

Option A — Clone the repo:

```bash
# SSH into your Synology NAS
ssh your-nas-user@your-nas-ip
git clone https://github.com/mrmartineau/zander.wtf.git
cd zander.wtf/ssh-server
```

Option B — Copy the `ssh-server/` directory to your NAS via SMB/SCP:

```bash
scp -r ssh-server/ your-nas-user@your-nas-ip:/volume1/docker/ssh-zander-wtf/
```

### Step 3: Build and start the container

SSH into your NAS and run:

```bash
cd /volume1/docker/ssh-zander-wtf  # or wherever you put the files
docker compose up -d --build
```

Verify it's running:

```bash
docker compose logs -f
# You should see: "Starting SSH server" host=0.0.0.0 port=22
```

Test locally on your network:

```bash
ssh your-nas-ip -p 2222
```

### Step 4: Configure port forwarding on your router

You need to forward an external port to your NAS so the internet can reach the SSH server.

1. Log into your router's admin panel
2. Find the **Port Forwarding** section
3. Add a rule:

   | Setting           | Value                      |
   |-------------------|----------------------------|
   | External port     | `22`                       |
   | Internal IP       | Your NAS's local IP (e.g. `192.168.1.100`) |
   | Internal port     | `2222` (matching docker-compose) |
   | Protocol          | TCP                        |

> **Note:** If your ISP blocks port 22, use an external port like `2222` instead.
> Users would then connect with `ssh hi.zander.wtf -p 2222`.

> **Note:** If your Synology's built-in SSH is on port 22, the docker-compose file
> maps to host port 2222 by default. You can change this if needed.

### Step 5: Configure Cloudflare DNS

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select the `zander.wtf` domain
3. Go to **DNS** > **Records**
4. Add a new record:

   | Setting    | Value                          |
   |------------|--------------------------------|
   | Type       | `A`                            |
   | Name       | `hi` (creates `hi.zander.wtf`) |
   | IPv4       | Your home public IP            |
   | Proxy      | **DNS only** (grey cloud)      |
   | TTL        | Auto                           |

> **Critical:** The proxy status MUST be "DNS only" (grey cloud icon).
> Cloudflare's orange-cloud proxy does not pass SSH/TCP traffic.

To find your public IP:

```bash
curl -s https://ifconfig.me
```

### Step 6: Set up Dynamic DNS (if your ISP gives you a dynamic IP)

Most home ISPs change your public IP periodically. You need to keep the Cloudflare DNS record updated.

#### Option A: Synology DDNS (built-in)

Synology has built-in DDNS support, but it doesn't natively support Cloudflare. You can install a community Cloudflare DDNS package or use Option B.

#### Option B: Cron script using Cloudflare API

Create a script on your NAS at `/volume1/scripts/cloudflare-ddns.sh`:

```bash
#!/bin/bash

# Cloudflare API credentials
CF_API_TOKEN="your-cloudflare-api-token"
CF_ZONE_ID="your-zone-id"
CF_RECORD_NAME="hi.zander.wtf"

# Get current public IP
CURRENT_IP=$(curl -s https://ifconfig.me)

# Get existing DNS record
RECORD=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${CF_RECORD_NAME}&type=A" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json")

RECORD_ID=$(echo "$RECORD" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
RECORD_IP=$(echo "$RECORD" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)

# Update only if IP has changed
if [ "$CURRENT_IP" != "$RECORD_IP" ]; then
  curl -s -X PUT \
    "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${RECORD_ID}" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"A\",\"name\":\"${CF_RECORD_NAME}\",\"content\":\"${CURRENT_IP}\",\"ttl\":1,\"proxied\":false}"
  echo "$(date): Updated DNS to ${CURRENT_IP}"
else
  echo "$(date): IP unchanged (${CURRENT_IP})"
fi
```

Make it executable and add to cron:

```bash
chmod +x /volume1/scripts/cloudflare-ddns.sh
```

Add to Synology Task Scheduler (Control Panel > Task Scheduler):
- Create a **Scheduled Task** > **User-defined script**
- Run every 15 minutes
- Command: `bash /volume1/scripts/cloudflare-ddns.sh`

To get your Cloudflare API token and Zone ID:
1. **API Token**: Cloudflare Dashboard > My Profile > API Tokens > Create Token > "Edit zone DNS" template
2. **Zone ID**: Cloudflare Dashboard > zander.wtf > Overview (right sidebar)

### Step 7: Test it

```bash
ssh hi.zander.wtf
```

You should see the terminal UI with your bio, projects, experience, and links.

## Updating content

1. Edit `ui/content.go` with your changes
2. Rebuild and restart the container:

```bash
cd /volume1/docker/ssh-zander-wtf
docker compose up -d --build
```

## Security notes

- The SSH server is **read-only** — visitors can only view the TUI, they cannot execute commands or access a shell
- Wish generates its own host keys (stored in the Docker volume), completely separate from your NAS's SSH keys
- The container runs as an isolated process with no access to the NAS filesystem
- Consider adding rate limiting on your router/firewall if you get unwanted traffic
