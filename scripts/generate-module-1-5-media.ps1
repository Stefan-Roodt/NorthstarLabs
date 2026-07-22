$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "The bundled video encoder is unavailable." }

$items = @(
  @{
    File="module-1-5-blockchain-chain"; Kicker="MODULE 1.5  |  CHAIN ENGINE"; Title="BUILD A CHAIN FROM FIRST PRINCIPLES"; Line1="TRANSACTION"; Line2="BLOCK"; Line3="INTEGRITY"; Close="CHAINING IS A SECURITY METHOD"; Prompt="START WITH A PROBLEM, NOT A LABEL"; Script="A blockchain is practical when you can map what changed, what was grouped and what was linked. If a learner can explain the full path of a transaction, they stop mistaking marketing terms for real guarantees."
  },
  @{
    File="module-1-5-consensus-contract"; Kicker="MODULE 1.5  |  CONSENSUS BOUNDARY"; Title="AGREEMENT UNDER RULES, NOT TRUTH FOR THE WORLD"; Line1="PROPOSAL"; Line2="VALIDATION"; Line3="ACCEPTANCE"; Close="SEPARATE LEDGER CONSENSUS FROM EXTERNAL TRUTH"; Prompt="CHECK THE SOURCE OF EACH CLAIM"; Script="Consensus is coordination. Nodes agree on the best valid state they can verify together, not every external claim in the universe. In operations, this matters whenever an external system feeds values into smart logic."
  },
  @{
    File="module-1-5-tamper-resistance"; Kicker="MODULE 1.5  |  RESISTANCE MODEL"; Title="SECURITY UNDER ASSUMPTIONS, NOT ABSOLUTES"; Line1="COST"; Line2="DIVERSITY"; Line3="GOVERNANCE"; Close="ASK: WHO COULD CHANGE HISTORY AND AT WHAT COST?"; Prompt="SAY WHAT IS TRUE, THEN LIST THE LIMITS"; Script="Immutability is not a slogan. We need the conditions: computational cost, concentration, client diversity and governance pathways. If any layer is single-pointed, the risk posture changes and outcomes change."
  }
)

$font = "C\:/Windows/Fonts/arial.ttf"
$bold = "C\:/Windows/Fonts/arialbd.ttf"

Add-Type -AssemblyName System.Speech
$speech = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speech.Rate = -1
$speech.Volume = 85
if ($speech.GetInstalledVoices().Name -contains "Microsoft David Desktop") {
  $speech.SelectVoice("Microsoft David Desktop")
}

foreach ($item in $items) {
  $wav = Join-Path $output "$($item.File).wav"; $mp4 = Join-Path $output "$($item.File).mp4"
  $speech.SetOutputToWaveFile($wav)
  $speech.Speak($item.Script)
  $speech.SetOutputToNull()
  if (-not (Test-Path -LiteralPath $wav)) { throw "Narration failed for $($item.File)." }
  $filter = "drawbox=x=0:y=0:w=1280:h=720:color=0x171827:t=fill," +
    "drawbox=x=68:y=64:w=1144:h=592:color=0x23263d:t=fill," +
    "drawbox=x=68:y=64:w=10:h=592:color=0x3556d8:t=fill," +
    "drawbox=x=68:y=64:w=1144:h=8:color=0xd9ff65:t=fill," +
    "drawtext=fontfile='$bold':text='$($item.Kicker)':fontcolor=0xd9ff65:fontsize=23:x=108:y=102," +
    "drawtext=fontfile='$bold':text='$($item.Title)':fontcolor=white:fontsize=46:x=108:y=214:enable='between(t,0,24)'," +
    "drawtext=fontfile='$font':text='Watch first, then evaluate the assumptions.':fontcolor=0xc9ccda:fontsize=29:x=108:y=324:enable='between(t,0,24)'," +
    "drawtext=fontfile='$bold':text='$($item.Line1)':fontcolor=white:fontsize=45:x=108:y=198:enable='between(t,24,66)'," +
    "drawtext=fontfile='$bold':text='$($item.Line2)':fontcolor=0xffbd8a:fontsize=45:x=108:y=280:enable='between(t,24,66)'," +
    "drawtext=fontfile='$bold':text='$($item.Line3)':fontcolor=0xd9ff65:fontsize=45:x=108:y=362:enable='between(t,24,66)'," +
    "drawtext=fontfile='$bold':text='$($item.Close)':fontcolor=white:fontsize=34:x=108:y=264:enable='gte(t,66)'," +
    "drawtext=fontfile='$font':text='$($item.Prompt)':fontcolor=0xc9ccda:fontsize=28:x=108:y=358:enable='gte(t,66)'," +
    "drawtext=fontfile='$bold':text='COGNIZEN CONSULTING  |  NORTHSTARLABS':fontcolor=white:fontsize=21:x=108:y=598"
  & $ffmpeg -loglevel error -nostats -y -f lavfi -i "color=c=0x171827:s=1280x720:r=30" -i $wav -vf $filter -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart $mp4
  if ($LASTEXITCODE -ne 0) { throw "Video generation failed for $($item.File)." }
  Remove-Item -LiteralPath $wav
}
Write-Output "Created three Module 1.5 narrated lessons."
