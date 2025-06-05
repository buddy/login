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