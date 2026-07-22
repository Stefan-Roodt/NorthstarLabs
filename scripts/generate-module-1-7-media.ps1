$ErrorActionPreference = "Stop"

$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null

$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) {
  throw "The bundled video encoder is unavailable."
}

$items = @(
  "module-1-7-asset-taxonomy",
  "module-1-7-token-rights",
  "module-1-7-stable-nft-rwa"
)

$scripts = @(
  "A coin can be native, a token can be contract-issued, and a token can still represent a real-world claim. In this lesson, we classify by ledger control, rights and legal enforceability before naming. That prevents expensive confusion.",
  "Never buy labels. Start by separating transferability from ownership rights, and ownership rights from governance control. Good learners test code rules, governance power and enforceable obligations before believing a claim.",
  "Represented-value assets are only as strong as their dependency chain. We will map reserves, custodians, bridges, contracts and legal remedies so every assumption is explicit, measurable and auditable."
)

Add-Type -AssemblyName System.Speech
$speech = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speech.Rate = -1
$speech.Volume = 85
if ($speech.GetInstalledVoices().Name -contains "Microsoft David Desktop") {
  $speech.SelectVoice("Microsoft David Desktop")
}

for ($i = 0; $i -lt $items.Length; $i++) {
  $file = $items[$i]
  $text = $scripts[$i]

  $wav = Join-Path $output "$file.wav"
  $mp4 = Join-Path $output "$file.mp4"

  $speech.SetOutputToWaveFile($wav)
  $speech.Speak($text)
  $speech.SetOutputToNull()
  if (-not (Test-Path -LiteralPath $wav)) { throw "Narration failed for $file." }

  & $ffmpeg -loglevel error -nostats -y -f lavfi -i "color=c=0x0b1a3d:s=1280x720:r=30" -i $wav -vf "scale=1280:720" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart $mp4
  if ($LASTEXITCODE -ne 0) { throw "Video generation failed for $file." }
  Remove-Item -LiteralPath $wav
}

Write-Output "Created three Module 1.7 narrated lessons."
