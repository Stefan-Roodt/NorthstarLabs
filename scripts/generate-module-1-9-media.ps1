$ErrorActionPreference = "Stop"

$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null

$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) {
  throw "The bundled video encoder is unavailable."
}

$items = @(
  "module-1-9-ethereum-vs-ether",
  "module-1-9-smart-contracts-evm",
  "module-1-9-gas-staking-layer2"
)

$scripts = @(
  "Ethereum is a global execution network. It is not a bank, and ether is not the network itself. Keep that distinction clear: the platform executes rules, while ether powers transactions and incentives.",
  "A smart contract runs like a machine with strict inputs and deterministic outputs. The EVM is the environment every validating node uses, which is why one valid transaction creates the same state transition for everyone.",
  "Gas is the price of computation. Simple transactions are cheaper; complex protocol calls are more expensive. Layer Two lowers base costs but introduces an extra set of integration and withdrawal risks students must evaluate."
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

  & $ffmpeg -loglevel error -nostats -y -f lavfi -i "color=c=0x0c2146:s=1280x720:r=30" -i $wav -vf "scale=1280:720" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart $mp4
  if ($LASTEXITCODE -ne 0) { throw "Video generation failed for $file." }
  Remove-Item -LiteralPath $wav
}

Write-Output "Created three Module 1.9 narrated lessons."
