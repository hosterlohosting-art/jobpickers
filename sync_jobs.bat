@echo off
:: JobPickers Automated Sync Trigger for Local Windows Environments
echo =========================================================
echo  [JobPickers] Starting Daily Crawler Sync Import...
echo =========================================================

:: If you configure a CRON_SECRET in your .env file, replace 'YOUR_SECRET' below with that key.
:: If you don't use CRON_SECRET, you can leave it blank or leave the header check open.
powershell -Command "& { $secret = ''; if (Test-Path .env) { $line = Get-Content .env | Select-String -Pattern '^CRON_SECRET='; if ($line) { $secret = $line.ToString().Split('=')[1].Trim().Trim('\"').Trim('''') } }; if ($secret -eq '') { Write-Host 'No CRON_SECRET detected. Running public sync...'; try { $res = Invoke-WebRequest -Uri 'http://localhost:3000/api/jobs/import' -Method GET -UseBasicParsing; Write-Host 'Success: ' $res.Content } catch { Write-Host 'Error: ' $error[0].Exception.Message } } else { Write-Host 'CRON_SECRET detected. Running authorized sync...'; try { $res = Invoke-WebRequest -Uri 'http://localhost:3000/api/jobs/import' -Method GET -Headers @{ 'Authorization' = 'Bearer ' + $secret } -UseBasicParsing; Write-Host 'Success: ' $res.Content } catch { Write-Host 'Error: ' $error[0].Exception.Message } } }"

echo.
echo =========================================================
echo  [JobPickers] Crawler Sync Finished!
echo =========================================================
pause
