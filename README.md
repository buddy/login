# Buddy Login GitHub Action

Authenticate with Buddy CI/CD using either API key or GitHub's OIDC provider.

## Usage

### Method 1: API Key Authentication (Simplest)

```yaml
name: Deploy
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to Buddy
        uses: buddy/login@v1
        with:
          api_key: ${{ secrets.BUDDY_API_KEY }}
          region: 'EU' # or 'US' (default)

      - name: Use Buddy API
        run: |
          # API endpoint is automatically set based on region
          # EU: https://eu.api.buddy.works
          # US: https://api.buddy.works
          curl -H "Authorization: Bearer $BUDDY_TOKEN" \
               "$BUDDY_API_ENDPOINT/workspaces"
```

### Method 2: OIDC Authentication (No Stored Secrets)

#### Setup
1. Configure GitHub as an OIDC provider in your Buddy workspace
2. Note the provider UUID
3. Add to your workflow with `id-token: write` permission

#### With Region (EU/US)

```yaml
name: Deploy
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - name: Login to Buddy
        uses: buddy/login@v1
        with:
          provider_id: 'c778e240-9750-4a8f-b04a-5be9045badd3'
          region: 'EU' # or 'US' (default)

      - name: Use Buddy API
        run: |
          # API endpoint is automatically set based on region
          # EU: https://eu.api.buddy.works
          # US: https://api.buddy.works
          curl -H "Authorization: Bearer $BUDDY_TOKEN" \
               "$BUDDY_API_ENDPOINT/workspaces"
```

#### With Custom API URL (On-Premise)

```yaml
- name: Login to Buddy
  uses: buddy/login@v1
  with:
    provider_id: 'c778e240-9750-4a8f-b04a-5be9045badd3'
    api_url: 'https://buddy.company.com'
```

## Inputs

| Input         | Required | Description                                                                                      |
| ------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `api_key`     | No*      | Buddy API key (required if not using OIDC). Store in GitHub Secrets. UUID v4 format.            |
| `provider_id` | No*      | UUID of your Buddy OIDC provider (required if not using API key)                                |
| `region`      | No**     | Buddy region: `EU` or `US` (default: `US`)                                                      |
| `api_url`     | No**     | Custom API URL for on-premise installations                                                     |
| `audience`    | No       | OIDC audience (uses GitHub default if not set)                                                  |
| `debug`       | No       | Enable debug logging (`true`/`false`)                                                           |

\* Either `api_key` or `provider_id` must be provided  
\** Either `region` or `api_url` must be provided

## Outputs

- `api_key` - The Buddy API key
- `api_endpoint` - The Buddy API endpoint URL
- Environment variables set:
  - `BUDDY_TOKEN` - The API key
  - `BUDDY_API_ENDPOINT` - The API endpoint URL

## License

MIT - See [LICENSE.md](LICENSE.md) for details.
