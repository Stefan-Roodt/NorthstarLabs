$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project "public\media\faculty"
New-Item -ItemType Directory -Force -Path $output | Out-Null
$ffmpeg = node -e "process.stdout.write(require('ffmpeg-static'))"
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw "The bundled video encoder is unavailable." }

$items = @(
  @{ File="module-1-2-obligations-to-coins"; Kicker="MODULE 1.2  |  EXCHANGE"; Title="MONEY DID NOT BEGIN ON A STRAIGHT LINE"; Line1="OBLIGATION + CREDIT"; Line2="COMMODITY"; Line3="STANDARDISED COINS"; Close="EACH SOLUTION MOVES THE TRUST BOUNDARY"; Script="The history of money is not a straight line from barter to coins. Communities have long combined direct exchange, reciprocal obligation and credit. A neighbour might supply food today because the relationship carries an expectation of future return. A merchant might record a debt and settle it later. Barter mattered, especially when people lacked a shared unit, but it was one tool among several. Direct exchange becomes difficult when each party must want the other's exact offer at the same time. Economists call this the double coincidence of wants. Goods may also spoil, resist division or be difficult to compare. Societies responded by using things that many people would accept: grain, shells, salt, livestock and metals. Commodity money had value as a product as well as a medium of exchange. Commodity systems still needed quality checks, weighing and transport. Standardised coins changed the operating model. A recognised issuer marked a piece of metal with a weight and denomination. The object became easier to identify, divide and count. The stamp reduced repeated verification, but it introduced a governance question: could the issuer be trusted to maintain the standard? This is the pattern to notice. Monetary innovations do not simply replace an object. They rearrange coordination, verification and trust. Use the timeline lab below to identify the problem each system solved and the dependency it added." },
  @{ File="module-1-2-claims-ledgers-fiat"; Kicker="MODULE 1.2  |  CLAIMS + LEDGERS"; Title="THE RECORD BECAME THE MONEY"; Line1="REPRESENTATIVE CLAIM"; Line2="BANK LEDGER"; Line3="FIAT SYSTEM"; Close="ASK WHAT THE BALANCE IS A CLAIM ON"; Script="Paper money began partly as a safer way to move claims. Instead of carrying heavy metal, a holder could carry a receipt for metal stored elsewhere. When other people accepted the receipt directly, the claim itself began to circulate. This is representative money: the note represents something redeemable under the system's rules. Banking moved money further toward ledger entries. Deposits are recorded claims on a bank. Payments update records across institutions, and bank lending can create new deposit balances. The majority of everyday money can therefore be digital without being a cryptocurrency. Modern fiat currency is not normally redeemable for a fixed quantity of gold. It operates through a wider institutional system: the issuing state, central bank, legal rules, taxation, monetary policy, productive capacity and public acceptance. Calling fiat money unbacked misses those dependencies. It is not commodity-backed, but it is institutionally supported. Every stage changes the trust boundary. A metal holder may verify weight and purity. A note holder relies on redemption. A bank customer relies on the bank and payment system. A fiat user relies on monetary governance and broad acceptance. In the activity below, locate the claim, the ledger and the failure mode instead of judging a system only by what its money looks like." },
  @{ File="module-1-2-why-money-changes"; Kicker="MODULE 1.2  |  INNOVATION TEST"; Title="PROGRESS CHANGES RISK"; Line1="PROBLEM SOLVED"; Line2="DEPENDENCY ADDED"; Line3="STRESS TEST"; Close="COMPARE THE TRADE. DO NOT PRESELECT A WINNER."; Script="Money changes when a new arrangement solves a useful coordination problem. Coins improved standardisation and portability. Paper reduced the burden of moving metal. Bank ledgers made credit and remote transfer scalable. Electronic payments improved speed and convenience. Each improvement also created dependencies and risks. Coins could be debased. Paper claims could be over-issued or refused. Banks could fail. Digital payment accounts could be hacked, frozen or excluded. Progress changes risk; it does not erase it. Cryptocurrency belongs in this continuing history. Bitcoin combined digital signatures, peer-to-peer networking, proof of work and economic incentives so that independent participants could agree on a transaction history without one account provider maintaining the authoritative ledger. The important innovation was not simply digital money. Bank balances were already digital. The change was the ledger and control model. That does not prove that cryptocurrency will replace cash, bank deposits or state currency. Monetary systems commonly coexist because they serve different needs. A useful comparison asks what problem is being solved, what new dependency is introduced, who can change the rules, how disputes are handled and what happens under stress. Use the innovation scorecard below to compare systems without slogans. A faster payment is not automatically safer. A decentralised ledger is not automatically suitable for every transaction. The goal is to understand the trade, not choose a winner in advance." }
)

$font = "C\:/Windows/Fonts/arial.ttf"; $bold = "C\:/Windows/Fonts/arialbd.ttf"
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
  $wav = Join-Path $output "$($item.File).wav"; $mp4 = Join-Path $output "$($item.File).mp4"
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
    "drawtext=fontfile='$bold':text='$($item.Title)':fontcolor=white:fontsize=43:x=112:y=230:enable='between(t,0,22)'," +
    "drawtext=fontfile='$font':text='Follow the system, not just the object.':fontcolor=0xc9ccda:fontsize=30:x=112:y=335:enable='between(t,0,22)'," +
    "drawtext=fontfile='$bold':text='$($item.Line1)':fontcolor=white:fontsize=43:x=112:y=202:enable='between(t,22,63)'," +
    "drawtext=fontfile='$bold':text='$($item.Line2)':fontcolor=0xffbd8a:fontsize=43:x=112:y=284:enable='between(t,22,63)'," +
    "drawtext=fontfile='$bold':text='$($item.Line3)':fontcolor=0xd9ff65:fontsize=43:x=112:y=366:enable='between(t,22,63)'," +
    "drawtext=fontfile='$bold':text='$($item.Close)':fontcolor=white:fontsize=31:x=112:y=260:enable='gte(t,63)'," +
    "drawtext=fontfile='$font':text='Complete the comparison lab below':fontcolor=0xc9ccda:fontsize=29:x=112:y=352:enable='gte(t,63)'," +
    "drawtext=fontfile='$bold':text='COGNIZEN CONSULTING  |  NORTHSTARLABS':fontcolor=white:fontsize=21:x=112:y=592"
  & $ffmpeg -loglevel error -nostats -y -f lavfi -i "color=c=0x171827:s=1280x720:r=30" -i $wav -vf $filter -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart $mp4
  if ($LASTEXITCODE -ne 0) { throw "Video generation failed for $($item.File)." }
  Remove-Item -LiteralPath $wav
}
Write-Output "Created three Module 1.2 narrated lessons."
