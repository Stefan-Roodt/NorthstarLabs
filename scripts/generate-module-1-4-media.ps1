$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "The bundled video encoder is unavailable." }

$items = @(
  @{
    File="module-1-4-define-cryptocurrency"; Kicker="MODULE 1.4  |  DEFINITION ENGINE"; Title="DEFINE BEFORE YOU EVALUATE"; Line1="UNIT"; Line2="LEDGER"; Line3="VALIDATION"; Close="A TOKEN IS A SYSTEM OF CLAIMS"; Prompt="START WITH CONTEXT, NOT A LABEL"; Script=("The word cryptocurrency is often used too quickly. A useful start is to define what gets claimed, who records it, who validates it and what rights attach to it. If your definition only says 'digital money', you miss the trust model and usage context. If the term is a coin, a token, a unit in an application or a representation of another claim, the rights are different. Use this lesson to separate the unit, ledger and governance model before discussing value." + " A project with a strong user story but weak control model is not the same as one with a distributed, durable claim process. The most practical question is: what exact thing is being promised and to whom.")
  },
  @{
    File="module-1-4-decentralisation-spectrum"; Kicker="MODULE 1.4  |  DEEPER MODEL"; Title="CENTRALISED IN SOME LAYERS, DISTRIBUTED IN OTHERS"; Line1="VALIDATION"; Line2="CUSTODY"; Line3="GOVERNANCE"; Close="MEASURE CONTROL IN LAYERS"; Prompt="A LABEL IS A STARTING HYPOTHESIS"; Script=("The phrase decentralisation can be useful only when treated as a design profile. One network can be permissionless in transaction verification yet highly concentrated in governance. It can have diverse validators but one dominant wallet dependency. It can include on-chain censorship resistance while still depending on a few infrastructure services. The key discipline: map each control surface separately. What matters most for a learner is not a slogan, but which layer is strongest and which is weakest for their use case and risk tolerance." + " That is how they decide if a design is suitable for payment, identity, membership, utility access or high-value transfer.")
  },
  @{
    File="module-1-4-transaction-flow"; Kicker="MODULE 1.4  |  TRANSACTION JOURNEY"; Title="AUTHORISED, RELAYED, INCLUDED, CONFIRMED"; Line1="AUTHORISE"; Line2="VALIDATE"; Line3="CONFIRM"; Close="VALID = TRUE, SAFE = NOT ALWAYS"; Prompt="THE HUMAN AND THE PROTOCOL ARE DIFFERENT"; Script=("A single learner often expects a signed wallet action to remove all error risk. It does not. A signature proves control of a key. The network then performs checks, and later a producer may include the transfer in a block or equivalent unit. Confirmations increase settlement confidence because changing the candidate history becomes costly under specific rules. This is a protocol success criterion, not a guarantee of perfect operational outcome. Wrong addresses, poor key hygiene or unsupported recipient systems are still real failure modes. This lesson is about teaching protocol confidence and user-safety together." + " Learners who can describe both layers make better decisions across asset and project selection.")
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
    "drawtext=fontfile='$bold':text='$($item.Title)':fontcolor=white:fontsize=52:x=108:y=214:enable='between(t,0,22)'," +
    "drawtext=fontfile='$font':text='Watch first, then decide with a framework.':fontcolor=0xc9ccda:fontsize=30:x=108:y=324:enable='between(t,0,22)'," +
    "drawtext=fontfile='$bold':text='$($item.Line1)':fontcolor=white:fontsize=45:x=108:y=198:enable='between(t,22,64)'," +
    "drawtext=fontfile='$bold':text='$($item.Line2)':fontcolor=0xffbd8a:fontsize=45:x=108:y=280:enable='between(t,22,64)'," +
    "drawtext=fontfile='$bold':text='$($item.Line3)':fontcolor=0xd9ff65:fontsize=45:x=108:y=362:enable='between(t,22,64)'," +
    "drawtext=fontfile='$bold':text='$($item.Close)':fontcolor=white:fontsize=34:x=108:y=264:enable='gte(t,64)'," +
    "drawtext=fontfile='$font':text='$($item.Prompt)':fontcolor=0xc9ccda:fontsize=28:x=108:y=358:enable='gte(t,64)'," +
    "drawtext=fontfile='$bold':text='COGNIZEN CONSULTING  |  NORTHSTARLABS':fontcolor=white:fontsize=21:x=108:y=598"
  & $ffmpeg -loglevel error -nostats -y -f lavfi -i "color=c=0x171827:s=1280x720:r=30" -i $wav -vf $filter -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart $mp4
  if ($LASTEXITCODE -ne 0) { throw "Video generation failed for $($item.File)." }
  Remove-Item -LiteralPath $wav
}
Write-Output "Created three Module 1.4 narrated lessons."
