$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "The bundled video encoder is unavailable." }

$items = @(
  @{
    File = "module-1-10-key-authority"; Kicker = "MODULE 1.10 | KEY AUTHORITY"; Title = "PRIVATE KEYS, PUBLIC KEYS, ADDRESSES"; Line1 = "SECRET"; Line2 = "VERIFY"; Line3 = "SIGN"; Close = "SHARE THE ADDRESS. KEEP THE SECRET.";
    Script = "A blockchain wallet is easier to understand when we separate authority from visibility. The private key is the secret that creates a valid signature. It should never be shared. The public key is the paired value that lets others verify a signature without learning the secret. The address is the receiving label people share when they want to send assets. These three things are related, but they do different jobs. That distinction matters because beginners often confuse the public part with the private part and then treat every wallet value as if it were equally sensitive. It is not. A signature proves that the holder of the corresponding private key authorised specific transaction data. It does not prove that the transaction is wise, safe or lawful. A receiving address can usually be shared openly, but the learner still has to check the correct network and asset before using it. The clean rule is simple: keep the secret secret, verify with the public key or address when needed, and sign only when the destination and permission are correct. That is the foundation for every later decision in the course."
  },
  @{
    File = "module-1-11-wallet-anatomy"; Kicker = "MODULE 1.11 | WALLET ANATOMY"; Title = "A WALLET IS CONTROL, NOT A COIN VAULT"; Line1 = "DERIVE KEYS"; Line2 = "VIEW BALANCES"; Line3 = "BUILD AND SIGN"; Close = "THE LEDGER HOLDS THE ASSET. THE WALLET HOLDS THE AUTHORITY.";
    Script = "A wallet does not store coins in the way a safe stores cash. The ledger holds the balance. The wallet manages the authority needed to interact with that balance. Once learners see that, many false assumptions disappear. Wallet software can derive many keys and addresses from one recovery structure, display balances from the network, help construct transactions, and sign those transactions with the correct key. That means the wallet is both a control surface and a user interface. It is not the asset itself. Different wallet types solve different problems. A custodial wallet reduces complexity but asks the learner to trust a service. A self-custodial wallet gives the learner more direct control but also places more responsibility on the learner. Some wallets are purpose-built for daily use, while others are better suited to savings, treasury or higher-value holdings. The best practice is to select the wallet by purpose rather than by brand hype. Ask who can sign, who can recover, who can observe the balance, and what happens if the device is lost or compromised. Once those questions are clear, wallet choice becomes a risk decision instead of a marketing decision."
  },
  @{
    File = "module-1-12-hot-cold-wallets"; Kicker = "MODULE 1.12 | HOT AND COLD"; Title = "MATCH THE WALLET TO THE JOB"; Line1 = "HOT FOR ACTION"; Line2 = "COLD FOR RESERVE"; Line3 = "VERIFY BEFORE SIGNING"; Close = "REDUCE EXPOSURE WITHOUT LOSING CONTROL.";
    Script = "Hot and cold wallets are not competing religions. They are tools for different exposure levels. A hot wallet stays connected to the internet or to routine online activity and is useful for spending, learning and experimentation. A cold wallet keeps signing authority away from ordinary network exposure and is better suited to reserves, larger balances and long-term storage. The trade-off is obvious: hot wallets are convenient, while cold wallets reduce one set of attack paths but increase the discipline required for recovery and verification. Neither model removes every risk. A hot wallet can be drained through phishing, malware or blind approval. A cold wallet can still fail through a bad backup, a stolen recovery phrase, a mistaken destination or a supply-chain problem. The practical answer is to separate roles. Keep only what you need for active use online. Keep reserve value in a colder setup. Test recovery before you need it. And whenever a transaction crosses from a hot environment into a cold one, verify the destination on the trusted display before you sign. Good wallet design reduces exposure without pretending that risk disappears."
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

Write-Output "Created three premium module videos for Modules 1.10 to 1.12."
