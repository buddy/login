# Buddy Login GitHub Action

Authenticate with Buddy CI/CD using GitHub's OIDC provider - no stored secrets required.

## Setup

1. Configure GitHub as an OIDC provider in your Buddy workspace
2. Note the provider UUID
3. Add to your workflow with `id-token: write` permission

## Usage

### With Region (EU/US)

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
          curl -H "Authorization: Bearer $BUDDY_TOKEN" \
               https://api.eu.buddy.works/workspaces
```

### With Custom API URL (On-Premise)

```yaml
- name: Login to Buddy
  uses: buddy/login@v1
  with:
    provider_id: 'c778e240-9750-4a8f-b04a-5be9045badd3'
    api_url: 'https://buddy.company.com'
```

## Inputs

| Input         | Required | Description                                    |
| ------------- | -------- | ---------------------------------------------- |
| `provider_id` | **Yes**  | UUID of your Buddy OIDC provider               |
| `region`      | No       | Buddy region: `EU` or `US` (default: `US`)     |
| `api_url`     | No       | Custom API URL for on-premise installations    |
| `audience`    | No       | OIDC audience (uses GitHub default if not set) |
| `debug`       | No       | Enable debug logging (`true`/`false`)          |

## Outputs

- `token` - The Buddy access token
- Environment variable `BUDDY_TOKEN` is also set

## License

MIT - See [LICENSE.md](LICENSE.md) for details.
