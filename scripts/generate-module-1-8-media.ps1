$ErrorActionPreference = "Stop"

$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null

$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) {
  throw "The bundled video encoder is unavailable."
}

$items = @(
  "module-1-8-ledger-ownership",
  "module-1-8-proof-of-work",
  "module-1-8-scarcity-claims"
)

$scripts = @(
  "A wallet helps you sign and send a transaction; it does not hold your Bitcoin state in the same way a bank ledger entry is held in a core system. Learn to track inputs, outputs and signatures together.",
  "Miners search for valid proof, but nodes independently validate every candidate. If rules are not followed, proof work does not make it valid. Confirmations reduce risk, they do not erase uncertainty immediately.",
  "Bitcoin's issuance and script rules are verifiable. Market expectations and future prices are separate. Keep protocol facts, external evidence, and hypotheses in separate buckets before drawing conclusions."
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

Write-Output "Created three Module 1.8 narrated lessons."
