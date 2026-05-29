$body = Get-Content "C:\Users\skyeu\dev\20260404_upwork-portfolio\n8n\hubspot-crm-sync\test-payload.json" -Raw
Invoke-RestMethod -Uri "http://localhost:5678/webhook/hubspot-contact" -Method POST -ContentType "application/json" -Body $body
