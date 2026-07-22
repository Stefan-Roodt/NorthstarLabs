$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "The bundled video encoder is unavailable." }

$items = @(
  @{
    File = "module-1-1-three-jobs-of-money"; Kicker = "MODULE 1.1  |  MONEY LAB"; Title = "THE THREE JOBS OF MONEY"; Line1 = "EXCHANGE"; Line2 = "MEASURE"; Line3 = "STORE"; Close = "NAME THE JOB BEFORE THE OBJECT";
    Script = "Money is easier to understand when we stop treating it as a particular object and start treating it as a system that performs jobs. The first job is medium of exchange. Imagine that you grow wheat and need shoes. Under barter, the shoemaker must want wheat at the same time you want shoes. Money separates the two transactions. You sell the wheat for something widely accepted, then use that money to buy the shoes. The problem being solved is coordination. The second job is unit of account. A shared unit lets a cafe price coffee at thirty-eight rand and lets a household compare rent, transport and food in one budget. The price does not tell us whether an item is good or fairly valued. It gives different items a common measuring language. The third job is store of value. Money earned today can be kept for later. But storage is not perfect. Inflation can reduce purchasing power, institutions can fail and access can be interrupted. Store of value therefore describes a function, not a promise that value can never fall. The same thing can perform more than one job. A bank deposit can settle a purchase, quote a price and carry purchasing power forward. The important question is what job it is performing in the situation and how reliably the surrounding system performs it. Every monetary system also has a trust boundary. Users rely on acceptance, rules, settlement, record keeping and institutions or networks that continue to operate. In the activity below, classify the immediate job before judging the object."
  },
  @{
    File = "module-1-1-digital-balances"; Kicker = "MODULE 1.1  |  LEDGER COMPARISON"; Title = "THREE DIGITAL BALANCES"; Line1 = "BANK DEPOSIT"; Line2 = "CENTRAL BANK"; Line3 = "CRYPTOASSET"; Close = "DIGITAL IS A FORMAT. TRUST STILL SITS SOMEWHERE.";
    Script = "A balance can be digital without being a cryptocurrency. The format is only the beginning of the analysis. When your banking app shows a balance, it is displaying a record maintained by a commercial bank. The balance is generally a claim on that bank. The bank applies account rules, verifies instructions and participates in regulated clearing and settlement arrangements. In South Africa, the national payment system connects payment instruments, financial institutions and final interbank settlement through systems overseen by the South African Reserve Bank. Central-bank money is different. Notes and coin are central-bank liabilities available to the public, while central-bank reserves are electronic settlement balances used by eligible institutions. A commercial-bank deposit and a central-bank reserve may both be digital records, but they are not the same claim and they are not available to the same users. A cryptoasset record can use a distributed network and protocol rules rather than one account provider as the authoritative ledger. Cryptography can support authorisation and ledger integrity. Consensus rules can help nodes agree on valid state changes. But software does not remove trust. Users still rely on code, keys, governance, infrastructure, economic incentives and the behaviour of other participants. The practical comparison has four parts. Ask who records the balance, what claim the holder has, who controls access, and how errors or disputes are resolved. Digital is a delivery format. Use the ledger comparison below to locate authority and failure modes."
  },
  @{
    File = "module-1-1-digital-scarcity"; Kicker = "MODULE 1.1  |  SCARCITY TEST"; Title = "SCARCE IS NOT ENOUGH"; Line1 = "SUPPLY RULE"; Line2 = "OWNERSHIP"; Line3 = "DEMAND + SECURITY"; Close = "EVIDENCE STRENGTH IS NOT PRICE CERTAINTY";
    Script = "Digital information is easy to copy. That is useful for documents, photographs and software, but it creates a problem for digital value. If one valid unit could be spent repeatedly, the record would not support reliable ownership or settlement. Blockchain systems address this problem by maintaining a shared transaction history and applying validation rules. Nodes check whether a proposed state change follows the rules and whether the same digital asset has already been spent. NIST describes blockchains as distributed, tamper-evident and tamper-resistant ledgers. Those properties can make conflicting histories detectable and accepted records progressively harder to alter. Some networks also make issuance rules transparent. Bitcoin is the best-known example of a protocol with a defined issuance schedule and maximum supply. A learner can inspect the rule and observe how the network enforces it. That is a form of verifiable scarcity. Scarcity, however, is not a complete value argument. A unique password you invent can be scarce and still have no market value. A digital asset also needs credible ownership, security, demand, usefulness or social acceptance. Its rules must remain durable under economic and technical pressure. This distinction protects you from a common shortcut: limited supply means guaranteed price appreciation. Supply may be one input, while demand, liquidity, regulation, competition, concentration and security can change the outcome. Use the confidence lab below as an evidence test, not a forecast."
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
Write-Output "Created three Module 1.1 narrated lessons."
