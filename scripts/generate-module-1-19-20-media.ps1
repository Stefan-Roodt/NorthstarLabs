$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "The bundled video encoder is unavailable." }

$items = @(
  @{
    File = "module-1-19-fees-and-gas"; Kicker = "MODULE 1.19 | FEES"; Title = "NETWORK FEES AND GAS FEES"; Line1 = "FEE"; Line2 = "WORK"; Line3 = "DELIVERED"; Close = "LOW FEES DO NOT MATTER IF THE ASSET NEVER ARRIVES.";
    Script = "Fees are not one thing. They are a stack. A learner may pay a platform fee, a funding fee, a spread, a withdrawal fee and a blockchain fee, and each one appears at a different point in the journey. On Bitcoin, the protocol fee is linked to transaction size and fee rate. On Ethereum, gas measures computational work and the final cost depends on gas used and the effective price per unit. A failed contract transaction can still cost gas because the network already performed work before the revert. That means the learner should read the fee quote in context, not as a slogan. A cheap withdrawal can still be a bad deal if it leaves the asset on the wrong platform or on the wrong network. The smart habit is to compare the amount delivered, the network route and the total impact on the learner's actual objective. If two routes start with the same headline fee, the better route may still be the one that is faster, safer or easier to explain at the end. The goal is not the lowest sticker price. The goal is the best value after all the steps are counted."
  },
  @{
    File = "module-1-20-stablecoin-models"; Kicker = "MODULE 1.20 | STABLECOINS"; Title = "HOW STABLECOINS TRY TO HOLD A PEG"; Line1 = "PEG"; Line2 = "RESERVE"; Line3 = "REDEMPTION"; Close = "STABLE DOES NOT MEAN RISK-FREE.";
    Script = "A stablecoin is a token designed to track a reference value, usually a fiat currency. The design matters because different stabilisation models carry different risks. Fiat-backed stablecoins rely on reserves and redemption arrangements. Crypto-collateralised models rely on extra collateral and liquidation systems because the underlying collateral can move quickly. Algorithmic models rely on market incentives and can become reflexive when confidence falls. The important lesson is that the word stable describes the target, not a guarantee. A depeg can happen when the market price moves away from the target, and reserve disclosure alone does not settle questions about liabilities, liquidity, redemption rights or governance. A learner should ask what backs the peg, who can redeem, how quickly, under what conditions and what happens if confidence drops. Stablecoins can be useful, but usefulness is not the same thing as invulnerability."
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

Write-Output "Created two Module 1.19 to 1.20 narrated lessons."
