# Buddy Login GitHub Action

A GitHub Action that authenticates with Buddy CI/CD platform using GitHub's OIDC provider to obtain a Personal Access
Token (PAT) for use in subsequent workflow steps.

## Overview

This action uses GitHub's built-in OIDC provider to securely authenticate with Buddy without storing long-lived
credentials. It exchanges a short-lived GitHub JWT token for a Buddy PAT that can be used in your CI/CD workflows.

**Note: This action is currently in development. The Buddy API integration is mocked until the backend service becomes
available.**

## Inputs

### `region`

**Optional** The Buddy region where your workspace is located.

- Cannot be used together with `api_url`
- Supported values: `EU`, `US`
- Default: `US`

### `api_url`

**Optional** Custom API URL for on-premise Buddy installations.

- Cannot be used together with `region`
- Must be an HTTPS URL
- Useful for self-hosted Buddy instances

### `provider_id`

**Required** The UUID of your Buddy OIDC provider configuration.

- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Must be a valid UUID v4

### `audience`

**Optional** The audience for which the GitHub OIDC provider token is intended.

- If not specified, uses GitHub's default audience

## Outputs

### `token`

The Buddy Personal Access Token that can be used to authenticate API requests in subsequent workflow steps. This is the
same value that is set in the `BUDDY_TOKEN` environment variable.

## Environment Variables

After successful authentication, this action sets the following environment variable:

### `BUDDY_TOKEN`

The Buddy Personal Access Token that can be used to authenticate API requests in subsequent workflow steps.

## Usage

### Basic Usage

```yaml
- name: Login to Buddy
  uses: buddy/login@v1
  with:
    provider_id: c778e240-9750-4a8f-b04a-5be9045badd3
```

### With Region (EU)

```yaml
- name: Login to Buddy
  uses: buddy/login@v1
  with:
    region: EU
    provider_id: c778e240-9750-4a8f-b04a-5be9045badd3
```

### With Custom Audience

```yaml
- name: Login to Buddy
  uses: buddy/login@v1
  with:
    region: EU
    provider_id: c778e240-9750-4a8f-b04a-5be9045badd3
    audience: myaudience
```

### With Custom API URL (On-Premise)

```yaml
- name: Login to Buddy
  uses: buddy/login@v1
  with:
    api_url: https://buddy.company.com
    provider_id: c778e240-9750-4a8f-b04a-5be9045badd3
```

### Using in Subsequent Steps

Once authenticated, the `BUDDY_TOKEN` environment variable will be available for use in subsequent workflow steps. You
can also access the token via the step output:

```yaml
- name: Login to Buddy
  id: buddy_login
  uses: buddy/login@v1
  with:
    region: EU
    provider_id: c778e240-9750-4a8f-b04a-5be9045badd3

# Using environment variable
- name: Use Buddy API with environment variable
  run: |
    curl -H "Authorization: Bearer $BUDDY_TOKEN" \
         https://api.buddy.works/workspaces

# Using step output
- name: Use Buddy API with step output
  run: |
    curl -H "Authorization: Bearer ${{ steps.buddy_login.outputs.token }}" \
         https://api.buddy.works/workspaces
```

## Required Permissions

This action requires the following permissions in your workflow:

```yaml
permissions:
  contents: read
  id-token: write
```

The `id-token: write` permission is necessary for the action to request GitHub's OIDC token.

## Complete Workflow Example

```yaml
name: Deploy with Buddy
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login to Buddy
        id: buddy_login
        uses: buddy/login@v1
        with:
          region: EU
          provider_id: c778e240-9750-4a8f-b04a-5be9045badd3
          audience: myaudience

      - name: Trigger Buddy Pipeline
        run: |
          curl -X POST \
            -H "Authorization: Bearer $BUDDY_TOKEN" \
            -H "Content-Type: application/json" \
            https://api.buddy.works/workspaces/myworkspace/projects/myproject/pipelines/1/executions

      # Alternative: Using step output
      - name: List Workspaces
        run: |
          curl -H "Authorization: Bearer ${{ steps.buddy_login.outputs.token }}" \
            https://api.buddy.works/workspaces
```

## What to do with the Token

Once you have the `BUDDY_TOKEN`, you can use it to authenticate with any Buddy API endpoint. The token should be
included in the `Authorization` header as a Bearer token.

### Basic API Request Example

```yaml
- name: Login to Buddy
  id: buddy_login
  uses: buddy/login@v1
  with:
    region: EU
    provider_id: c778e240-9750-4a8f-b04a-5be9045badd3

- name: Make API request to Buddy
  run: |
    curl -H "Authorization: Bearer $BUDDY_TOKEN" \
         https://api.buddy.works/workspaces
```

### Using the Token in Scripts

```yaml
- name: Login to Buddy
  id: buddy_login
  uses: buddy/login@v1
  with:
    region: EU
    provider_id: c778e240-9750-4a8f-b04a-5be9045badd3

- name: Use token in custom script
  run: |
    # The token is available as an environment variable
    ./scripts/deploy.sh
  env:
    BUDDY_API_TOKEN: ${{ steps.buddy_login.outputs.token }}
```

### Passing Token to Other Actions

```yaml
- name: Login to Buddy
  id: buddy_login
  uses: buddy/login@v1
  with:
    region: EU
    provider_id: c778e240-9750-4a8f-b04a-5be9045badd3

- name: Use another action that needs Buddy token
  uses: some-org/buddy-deploy-action@v1
  with:
    token: ${{ steps.buddy_login.outputs.token }}
    workspace: myworkspace
    project: myproject
```

For specific API endpoints and operations, please refer to
the [Buddy API documentation](https://buddy.works/docs/api/getting-started).

## Setup Requirements

1. **Configure OIDC Provider in Buddy**: Set up GitHub as an OIDC provider in your Buddy workspace
2. **Note the Provider ID**: Save the generated provider UUID for use in your workflows
3. **Set Workflow Permissions**: Ensure your workflow has `id-token: write` permission

## How It Works

1. The action requests a JWT token from GitHub's OIDC provider using the specified audience
2. It sends this JWT token along with your provider ID to Buddy's authentication API
3. Buddy validates the token and returns a short-lived PAT
4. The PAT is set as the `BUDDY_TOKEN` environment variable for subsequent steps

## Security Considerations

- The GitHub JWT token is short-lived and specific to the workflow run
- The resulting Buddy PAT is also short-lived and automatically expires
- No long-lived credentials need to be stored as repository secrets
- Access is controlled through Buddy's OIDC provider configuration

## Development Status

This action is currently in active development. The authentication flow is implemented but uses mocked responses until
the Buddy API backend becomes available. The core functionality and interface are stable and ready for testing.

## Support

For issues and questions related to this action, please refer to the Buddy documentation or contact Buddy support.
