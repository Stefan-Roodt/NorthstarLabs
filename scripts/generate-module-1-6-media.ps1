$ErrorActionPreference = "Stop"

$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null

$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) {
  throw "The bundled video encoder is unavailable."
}

$items = @(
  "module-1-6-decentralisation-surfaces",
  "module-1-6-validator-user-role",
  "module-1-6-decentralise-for-purpose"
)

$scripts = @(
  "Decentralisation is not a single dial. It is a set of control surfaces, each with different safety and speed trade-offs. In this lesson, follow a transaction model and trace who controls validation, custody, governance and infrastructure. If one surface is concentrated, the system can fail in a predictable way even if another surface looks strong.",
  "A practical design map starts with role separation. Nodes observe and relay. Validators order and finalise. Users submit and carry keys. Custodians support operational access. Governance stewards change the rules. Collapse these roles and you create hidden dependencies. Keep them explicit and your learners can predict both resilience and failure modes much more accurately.",
  "The best architecture is not maximal decentralisation; it is the right decentralisation for your use case. Ask: what failure could cause most damage, and where does adding distributed control reduce that risk?"
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

Write-Output "Created three Module 1.6 narrated lessons."
