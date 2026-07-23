$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "The bundled video encoder is unavailable." }

$items = @(
  @{
    File = "module-1-13-recovery-chain"; Kicker = "MODULE 1.13 | RECOVERY"; Title = "SEED PHRASES AND WALLET RECOVERY"; Line1 = "PHRASE"; Line2 = "SEED"; Line3 = "RESTORE"; Close = "TEST THE BACKUP BEFORE YOU NEED IT.";
    Script = "A recovery phrase is portable authority, not a password hint. It can recreate the wallet keys associated with a compatible wallet, which is why the phrase must be treated like the highest value secret in the system. The order of the words matters, the spelling matters and the optional passphrase matters. If any part is wrong, the restored wallet can be different or inaccessible. The local wallet password or PIN is not the same thing. A password may protect the interface on one device, but the recovery phrase can recreate the wallet elsewhere. That is why cloud screenshots, photos and chat messages are risky backups even when they feel convenient. A good recovery design balances confidentiality and recoverability. The learner should keep durable copies in separated locations, test the process with disposable credentials and know what to do if the phrase is exposed. If compromise is suspected, changing the app password is not enough. The safe response is to create a new secure wallet and move value under new keys after verifying the plan."
  },
  @{
    File = "module-1-14-exchange-ledger"; Kicker = "MODULE 1.14 | EXCHANGE LEDGER"; Title = "WHAT ACTUALLY HAPPENS INSIDE AN EXCHANGE"; Line1 = "BANK IN"; Line2 = "INTERNAL LEDGER"; Line3 = "CHAIN OUT"; Close = "DO NOT CONFUSE THE PLATFORM BALANCE WITH THE BLOCKCHAIN BALANCE.";
    Script = "A centralised exchange is a service provider, not the blockchain itself. The clean way to understand it is to follow the money and the records separately. A bank deposit enters the exchange through ordinary payment rails. The platform then updates an internal customer ledger. A trade usually changes those internal records before anything moves on chain. Only when a withdrawal is made does the platform broadcast a blockchain transaction. That distinction matters because the balance visible in the account depends on the exchange's database and controls. It is not the same thing as a balance on the public network. This is why operational risk, custody risk and solvency risk matter so much. A learner must ask who holds the keys, who can freeze the account, what the fee structure is, what the withdrawal rules are and how the platform is regulated. The platform can make buying easy, but it also creates trust dependency. The right habit is to treat the exchange like a service you use, not like proof that you own the asset until you have withdrawn it to your own wallet."
  },
  @{
    File = "module-1-15-dex-risk-stack"; Kicker = "MODULE 1.15 | DEX RISK"; Title = "DECENTRALISED EXCHANGES, CENTRALIZED RISK"; Line1 = "SMART CONTRACT"; Line2 = "LIQUIDITY POOL"; Line3 = "WALLET APPROVAL"; Close = "DECENTRALISED DOES NOT MEAN RISK-FREE.";
    Script = "A decentralised exchange looks different because the trade is coordinated by smart contracts rather than a traditional custodial platform, but the learner still needs to inspect the risk stack. A DEX can reduce some custody dependence, yet it introduces contract risk, interface risk, token-approval risk, oracle risk, liquidity risk and bridge risk. A wallet approval is especially important because the user may authorise a contract to move tokens later without realising how broad the permission is. Liquidity pools also create a different execution model from an order book. Large swaps can move the price against the trader, creating slippage and price impact. That is why a low-fee swap is not automatically a safer swap. The learner should verify the contract address, inspect the permission being requested, understand the network and size the transaction against available liquidity. The lesson is not that DEXs are bad. The lesson is that decentralised is a description of architecture, not a guarantee of safety, simplicity or fairness. Good judgment still matters."
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

Write-Output "Created three Module 1.13 to 1.15 narrated lessons."
