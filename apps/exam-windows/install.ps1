# Mendaftarkan tautan edusmart-ujian:// untuk pengguna saat ini (tanpa hak admin).
# Pakai:  powershell -ExecutionPolicy Bypass -File install.ps1 -Exe "C:\Program Files\EduSmartUjian\EduSmartUjian.exe"
param([Parameter(Mandatory = $true)][string]$Exe)
$key = "HKCU:\Software\Classes\edusmart-ujian"
New-Item -Path $key -Force | Out-Null
Set-ItemProperty -Path $key -Name "(Default)" -Value "URL:EduSmart Ujian"
Set-ItemProperty -Path $key -Name "URL Protocol" -Value ""
New-Item -Path "$key\shell\open\command" -Force | Out-Null
Set-ItemProperty -Path "$key\shell\open\command" -Name "(Default)" -Value "`"$Exe`" `"%1`""
Write-Host "Terdaftar: edusmart-ujian:// -> $Exe"
