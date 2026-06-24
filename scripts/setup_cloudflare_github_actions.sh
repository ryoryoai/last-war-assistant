#!/usr/bin/env bash
set -euo pipefail

repo="ryoryoai/last-war-assistant"
workflow="deploy-cloudflare-pages.yml"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh command is not installed. Install GitHub CLI first: https://cli.github.com/"
  exit 1
fi

if ! gh auth status -h github.com >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Opening browser login..."
  gh auth login -h github.com --web --git-protocol https --scopes repo,workflow
fi

if [ "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  cf_account_id="$CLOUDFLARE_ACCOUNT_ID"
else
  read -r -p "Cloudflare Account ID: " cf_account_id
fi

if [ "${CLOUDFLARE_API_TOKEN:-}" ]; then
  cf_api_token="$CLOUDFLARE_API_TOKEN"
else
  read -r -s -p "Cloudflare API Token: " cf_api_token
  echo
fi

if [ -z "$cf_account_id" ] || [ -z "$cf_api_token" ]; then
  echo "Cloudflare Account ID and API Token are required."
  exit 1
fi

printf '%s' "$cf_account_id" | gh secret set CLOUDFLARE_ACCOUNT_ID -R "$repo"
printf '%s' "$cf_api_token" | gh secret set CLOUDFLARE_API_TOKEN -R "$repo"

echo "Cloudflare secrets were saved to GitHub Actions."
gh workflow run "$workflow" -R "$repo" --ref main

echo "Deployment workflow started. Watching the latest run..."
gh run watch -R "$repo" --exit-status
