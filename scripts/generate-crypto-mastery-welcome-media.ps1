$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "The bundled video encoder is unavailable." }

$script = @"
Welcome to Crypto Mastery: Foundations. This programme is designed to help you reason clearly about digital assets - not to sell you a prediction, a token or a shortcut.

You are about to work through thirty-one focused modules. Together they move from the nature of money, through Bitcoin, blockchains, keys, wallets and transactions, into markets, tokenomics, security, regulation and a final capstone. Each lesson is intentionally short. The goal is not to rush. The goal is to make one useful distinction, apply it, and keep evidence of what you can now do.

The learning rhythm is simple: learn, do and prove. First, a guided story explains the concept. Next, you make a decision, classify evidence or test a scenario. Then a scored check shows whether the idea is usable rather than merely familiar. If you miss a question, use the explanation and try again. Correction is part of the course.

Crypto creates strong opinions. This programme will ask you to separate a technical fact from an economic claim, a possible outcome from a promised outcome, and a popular narrative from reliable evidence. It is education, not financial advice. Never share a private key or seed phrase here. Never risk money merely to complete an exercise. All practical examples can be completed without purchasing an asset.

At the end, you will not be asked to predict a price. You will build a defensible digital-asset decision framework, a personal safety plan and a capstone that states what the evidence supports, what remains uncertain and what you would do next.

Begin by choosing your purpose. Are you here to understand the technology, participate more safely, evaluate claims, support clients or prepare for deeper study? Write that purpose down. It will become your filter as the course grows more technical.

Welcome. Move deliberately, question confidently and finish with proof of progress.
"@

$wav = Join-Path $output "crypto-mastery-welcome.wav"
$mp4 = Join-Path $output "crypto-mastery-welcome.mp4"
$python = "C:\Users\Hugo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
& $python (Join-Path $PSScriptRoot "generate-neural-voice.py") --text $script --output $wav --voice bm_george --speed 0.98
if ($LASTEXITCODE -ne 0) { throw "Neural narration failed." }

$font = "C\:/Windows/Fonts/arial.ttf"
$bold = "C\:/Windows/Fonts/arialbd.ttf"
$filter = "drawbox=x=0:y=0:w=1280:h=720:color=0x171827:t=fill," +
  "drawbox=x=0:y=0:w='1280*min(t/125,1)':h=7:color=0xd9ff65:t=fill," +
  "drawbox=x=75:y=70:w=1130:h=580:color=0x22253a:t=fill," +
  "drawbox=x=75:y=70:w=9:h=580:color=0x3556d8:t=fill," +
  "drawtext=fontfile='$bold':text='COGNIZEN CONSULTING':fontcolor=0xd9ff65:fontsize=23:x=112:y=110," +
  "drawtext=fontfile='$bold':text='Welcome to':fontcolor=white:fontsize=66:x=112:y=205:enable='lt(t,20)'," +
  "drawtext=fontfile='$bold':text='Crypto Mastery':fontcolor=white:fontsize=66:x=112:y=282:enable='lt(t,20)'," +
  "drawtext=fontfile='$font':text='Reason clearly. Act safely. Prove progress.':fontcolor=0xc9ccda:fontsize=31:x=112:y=390:enable='lt(t,20)'," +
  "drawtext=fontfile='$bold':text='LEARN':fontcolor=white:fontsize=62:x=112:y=230:enable='between(t,20,42.999)'," +
  "drawtext=fontfile='$bold':text='DO':fontcolor=0xffbd8a:fontsize=62:x=430:y=230:enable='between(t,20,42.999)'," +
  "drawtext=fontfile='$bold':text='PROVE':fontcolor=0xd9ff65:fontsize=62:x=650:y=230:enable='between(t,20,42.999)'," +
  "drawtext=fontfile='$font':text='Short explanation  |  real decision  |  evidence kept':fontcolor=0xc9ccda:fontsize=29:x=112:y=350:enable='between(t,20,42.999)'," +
  "drawtext=fontfile='$bold':text='NO HYPE. NO REQUIRED PURCHASE.':fontcolor=white:fontsize=44:x=112:y=225:enable='between(t,43,69.999)'," +
  "drawtext=fontfile='$bold':text='NO SHARED SECRETS.':fontcolor=0xffbd8a:fontsize=44:x=112:y=292:enable='between(t,43,69.999)'," +
  "drawtext=fontfile='$font':text='Education, not financial advice':fontcolor=0xc9ccda:fontsize=29:x=112:y=395:enable='between(t,43,69.999)'," +
  "drawtext=fontfile='$bold':text='31 MODULES':fontcolor=white:fontsize=58:x=112:y=210:enable='between(t,70,95.999)'," +
  "drawtext=fontfile='$bold':text='ONE DECISION FRAMEWORK':fontcolor=0xd9ff65:fontsize=50:x=112:y=286:enable='between(t,70,95.999)'," +
  "drawtext=fontfile='$font':text='Money  |  networks  |  custody  |  markets  |  safety':fontcolor=0xc9ccda:fontsize=27:x=112:y=388:enable='between(t,70,95.999)'," +
  "drawtext=fontfile='$bold':text='MOVE DELIBERATELY':fontcolor=white:fontsize=58:x=112:y=220:enable='gte(t,96)'," +
  "drawtext=fontfile='$bold':text='QUESTION CONFIDENTLY':fontcolor=0xffbd8a:fontsize=51:x=112:y=292:enable='gte(t,96)'," +
  "drawtext=fontfile='$bold':text='FINISH WITH PROOF':fontcolor=0xd9ff65:fontsize=51:x=112:y=360:enable='gte(t,96)'," +
  "drawtext=fontfile='$bold':text='NORTHSTARLABS':fontcolor=white:fontsize=23:x=112:y=585"

& $ffmpeg -loglevel error -nostats -y -f lavfi -i "color=c=0x171827:s=1280x720:r=30" -i $wav `
  -vf $filter -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p `
  -c:a aac -b:a 144k -shortest -movflags +faststart $mp4
if ($LASTEXITCODE -ne 0) { throw "Video generation failed." }
Remove-Item -LiteralPath $wav
Write-Output "Created $mp4"
