$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) {
  throw "The bundled video encoder is unavailable."
}

$items = @(
  @{
    File = "ai-workflow-introduction"
    Kicker = "AI WORKFLOW FACULTY"
    Title = "Build AI systems you can trust"
    Subtitle = "AI Command Studio"
    Script = "Welcome to AI Command Studio. This course is not a collection of prompt tricks. It is a practical system for identifying responsible leverage, writing decision-grade briefs, checking evidence, designing human approval points, and measuring whether artificial intelligence actually improves the work. The NorthstarLabs AI Workflow Faculty will ask you to build one real operating system, test it against a baseline, document its limitations, and present proof of the result. By the end, you should be able to use AI with more confidence precisely because you know where confidence is not justified."
  },
  @{
    File = "bitcoin-intelligence-introduction"
    Kicker = "BITCOIN RESEARCH FACULTY"
    Title = "Judge Bitcoin from first principles"
    Subtitle = "Bitcoin Intelligence"
    Script = "Welcome to Bitcoin Intelligence. This programme begins before Bitcoin, with the failed attempts and design problems that shaped it. It then follows transactions, proof of work, nodes, custody, market structure, privacy, governance, scaling, regulation, and the strongest bear case. The NorthstarLabs Bitcoin Research Faculty will not ask you to believe a price prediction or repeat a slogan. You will work from evidence, separate facts from contested claims, build conditional scenarios, and finish with a board-ready briefing that states both its recommendation and its limits."
  },
  @{
    File = "web3-product-introduction"
    Kicker = "WEB3 PRODUCT FACULTY"
    Title = "Make the technology earn its complexity"
    Subtitle = "Web3 Product Lab"
    Script = "Welcome to Web3 Product Lab. The central question is not whether blockchain is exciting. It is whether shared verification solves a real problem better than a simpler system. The NorthstarLabs Web3 Product Faculty will guide you through wallets, contracts, tokens, oracles, identity, scaling, bridges, governance, recovery, and human security. You will expose hidden control points, test the strongest rejection case, and design the minimum responsible architecture. Your final product defence must explain what the system proves, what it cannot prove, who still has power, and how a user recovers when something goes wrong."
  }
)

Add-Type -AssemblyName System.Speech
foreach ($item in $items) {
  $wav = Join-Path $output "$($item.File).wav"
  $mp4 = Join-Path $output "$($item.File).mp4"
  $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice.Rate = -1
  $voice.Volume = 100
  $voice.SetOutputToWaveFile($wav)
  $voice.Speak($item.Script)
  $voice.Dispose()

  $font = "C\:/Windows/Fonts/arial.ttf"
  $bold = "C\:/Windows/Fonts/arialbd.ttf"
  $filter = "drawbox=x=0:y=0:w=1280:h=720:color=0x171827:t=fill," +
    "drawbox=x=72:y=80:w=8:h=560:color=0x3556d8:t=fill," +
    "drawbox=x=80:y=80:w=1128:h=3:color=0xd9ff65:t=fill," +
    "drawtext=fontfile='$bold':text='$($item.Kicker)':fontcolor=0xd9ff65:fontsize=25:x=112:y=128," +
    "drawtext=fontfile='$bold':text='$($item.Title)':fontcolor=white:fontsize=58:x=112:y=238," +
    "drawtext=fontfile='$font':text='$($item.Subtitle)':fontcolor=0xc9ccda:fontsize=34:x=112:y=338," +
    "drawtext=fontfile='$bold':text='NORTHSTARLABS':fontcolor=white:fontsize=24:x=112:y=552," +
    "drawtext=fontfile='$font':text='INTRODUCTION  |  01':fontcolor=0x9ea3b6:fontsize=20:x=914:y=557"

  & $ffmpeg -y -f lavfi -i "color=c=0x171827:s=1280x720:r=30" -i $wav `
    -vf $filter -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p `
    -c:a aac -b:a 128k -shortest -movflags +faststart $mp4
  if ($LASTEXITCODE -ne 0) {
    throw "Video generation failed for $($item.File)."
  }
  Remove-Item -LiteralPath $wav
}
