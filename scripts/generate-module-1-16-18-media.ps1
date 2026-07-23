$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "The bundled video encoder is unavailable." }

$items = @(
  @{
    File = "module-1-16-true-cost"; Kicker = "MODULE 1.16 | TRUE COST"; Title = "THE REAL COST OF BUYING CRYPTO"; Line1 = "QUOTE"; Line2 = "SPREAD"; Line3 = "DELIVERY"; Close = "COUNT WHAT YOU RECEIVE, NOT JUST WHAT YOU CLICKED.";
    Script = "A quoted price is only the beginning of the cost story. A learner must think in terms of the full receipt, not the marketing banner. The true cost of buying crypto can include the displayed quote, the spread between bids and asks, trading or funding fees, conversion costs, withdrawal charges and the network cost required to actually control the asset. A cheap-looking buy can become expensive if the spread is wide or if moving the asset off the platform is costly. The right habit is to compare the amount delivered to the final destination. Ask what the final all-in cost is, what amount you actually receive, and what it will cost to get the asset where you need it. A bank card fee, a platform fee and a blockchain fee can all appear separately, but the learner still pays the sum of every step. If the route is hard to explain, the route is probably expensive. This lesson turns that into a process rather than a guess. Once the learner can calculate the true cost, they are less likely to choose a platform because of a small headline fee and more likely to choose one that is operationally honest."
  },
  @{
    File = "module-1-17-transfer-flow"; Kicker = "MODULE 1.17 | TRANSFER FLOW"; Title = "SENDING AND RECEIVING WITHOUT MISTAKES"; Line1 = "VERIFY"; Line2 = "TEST"; Line3 = "RECEIPT"; Close = "THE SAFE TRANSFER IS THE ONE THAT REACHES THE RIGHT PLACE.";
    Script = "Sending and receiving cryptocurrency is not just a button click. It is a sequence of checks that should happen before and after the transfer. First, the asset must match the receiving network. A token on one network is not automatically the same thing on another. Second, the destination must be correct, including any memo or destination tag if the platform uses one. Third, the signature authorises the exact transaction details, so the learner must inspect what is actually being signed. Fourth, a small test transaction can provide evidence before larger value moves. Fifth, the transaction hash and platform status can be used to diagnose what happened if the transfer is delayed. If a transfer goes wrong, the safest response is not panic. It is to stop, identify whether the problem is on the blockchain or on the platform, and avoid adding a second mistake while trying to fix the first. Good transfer practice is really about controlling error rates, not chasing speed."
  },
  @{
    File = "module-1-18-confirmations"; Kicker = "MODULE 1.18 | CONFIRMATIONS"; Title = "WHAT CONFIRMATIONS REALLY TELL YOU"; Line1 = "BROADCAST"; Line2 = "INCLUSION"; Line3 = "CONFIDENCE"; Close = "MORE CONFIRMATIONS MEAN STRONGER HISTORY, NOT PERFECT TRUTH.";
    Script = "A blockchain transaction has a lifecycle, and confirmations are just one part of that lifecycle. A signed transaction is first broadcast to the network and may wait in a pool before a block includes it. Once included, it gains its first confirmation. Additional confirmations make it harder for the history to be replaced under that network's rules. But confirmations do not prove that the original instruction was wise, lawful or safe. They only strengthen the network evidence that the transaction happened. That is why a learner should separate technical confirmation from business legitimacy. An explorer can show public status, block height, transaction fields and whether a transaction is pending, included or replaced. It cannot tell you whether the counterparty is honest or whether the transfer was a good idea. The useful habit is to treat confirmations as confidence-building evidence, not as a substitute for judgment or due diligence."
  }
)

$font = "C\:/Windows/Fonts/arial.ttf"
$bold = "C\:/Windows/Fonts/arialbd.ttf"
$python = "C:\Users\Hugo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$speechAssembly = "System" + ".Speech"
Add-Type -AssemblyName $speechAssembly
$speech = New-Object "$speechAssembly.Synthesis.SpeechSynthesizer"
$speech.Rate = -1
$speech.Volume = 85
if ($speech.GetInstalledVoices().Name -contains "Microsoft David Desktop") {
  $speech.SelectVoice("Microsoft David Desktop")
}

foreach ($item in $items) {
  $wav = Join-Path $output "$($item.File).wav"
  $mp4 = Join-Path $output "$($item.File).mp4"
  & $python (Join-Path $PSScriptRoot "generate-neural-voice.py") --text $item.Script --output $wav --voice bm_george --speed 0.98
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Neural narration failed for $($item.File); falling back to system voice."
    $speech.SetOutputToWaveFile($wav)
    $speech.Speak($item.Script)
    $speech.SetOutputToNull()
  }
  if (-not (Test-Path -LiteralPath $wav)) { throw "Narration failed for $($item.File)." }
  $filter = "drawbox=x=0:y=0:w=1280:h=720:color=0x171827:t=fill," +
    "drawbox=x=72:y=68:w=1136:h=584:color=0x22253a:t=fill," +
    "drawbox=x=72:y=68:w=9:h=584:color=0x3556d8:t=fill," +
    "drawtext=fontfile='$bold':text='$($item.Kicker)':fontcolor=0xd9ff65:fontsize=23:x=112:y=108," +
    "drawtext=fontfile='$bold':text='$($item.Title)':fontcolor=white:fontsize=56:x=112:y=230:enable='between(t,0,22)'," +
    "drawtext=fontfile='$font':text='Watch the model. Then make the decision.':fontcolor=0xc9ccda:fontsize=30:x=112:y=335:enable='between(t,0,22)'," +
    "drawtext=fontfile='$bold':text='$($item.Line1)':fontcolor=white:fontsize=48:x=112:y=202:enable='between(t,22,63)'," +
    "drawtext=fontfile='$bold':text='$($item.Line2)':fontcolor=0xffbd8a:fontsize=48:x=112:y=284:enable='between(t,22,63)'," +
    "drawtext=fontfile='$bold':text='$($item.Line3)':fontcolor=0xd9ff65:fontsize=48:x=112:y=366:enable='between(t,22,63)'," +
    "drawtext=fontfile='$bold':text='$($item.Close)':fontcolor=white:fontsize=35:x=112:y=260:enable='gte(t,63)'," +
    "drawtext=fontfile='$font':text='Complete the interactive lab below':fontcolor=0xc9ccda:fontsize=29:x=112:y=352:enable='gte(t,63)'," +
    "drawtext=fontfile='$bold':text='COGNIZEN CONSULTING  |  NORTHSTARLABS':fontcolor=white:fontsize=21:x=112:y=592"
  & $ffmpeg -loglevel error -nostats -y -f lavfi -i "color=c=0x171827:s=1280x720:r=30" -i $wav -vf $filter -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart $mp4
  if ($LASTEXITCODE -ne 0) { throw "Video generation failed for $($item.File)." }
  Remove-Item -LiteralPath $wav
}

Write-Output "Created three Module 1.16 to 1.18 narrated lessons."
