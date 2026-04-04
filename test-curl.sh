#!/bin/bash
KEY=$(grep SUPERMEMORY_API_KEY .env.local | cut -d '=' -f 2 | tr -d '\n\r')
echo "Key: $KEY"
curl -s -H "Authorization: Bearer $KEY" https://api.supermemory.ai/v3/documents/list -d '{}' -H 'Content-Type: application/json'
echo ""
curl -s -H "Authorization: $KEY" https://api.supermemory.ai/v3/documents/list -d '{}' -H 'Content-Type: application/json'
echo ""
