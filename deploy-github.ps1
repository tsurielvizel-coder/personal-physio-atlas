# סקריפט העלאה אוטומטי ל-GitHub Pages (גישה מהטלפון ומהמחשב)
$ErrorActionPreference = "Stop"

$repoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoName = "personal-physio-atlas"

Write-Host "=== בדיקת חיבור GitHub CLI ===" -ForegroundColor Cyan
$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "פותח התחברות ל-GitHub בדפדפן..." -ForegroundColor Yellow
    gh auth login -p https -w
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

$ghUser = (gh api user -q ".login").Trim()
if (-not $ghUser) {
    Write-Error "לא הצלחתי לזהות את שם המשתמש ב-GitHub."
    exit 1
}
Write-Host "מחובר כמשתמש: $ghUser" -ForegroundColor Green

$remoteUrl = git -C $repoDir remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "יוצר מאגר ציבורי (חובה עבור GitHub Pages חינמי) ודוחף את הקוד..." -ForegroundColor Cyan
    gh repo create $repoName --public --source=$repoDir --remote=origin --push
    if ($LASTEXITCODE -ne 0) { exit 1 }
} else {
    Write-Host "מאגר מרוחק קיים ($remoteUrl) — דוחף עדכונים לענף main..." -ForegroundColor Cyan
    git -C $repoDir push -u origin main
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "מפעיל GitHub Pages על ענף main (root)..." -ForegroundColor Cyan
$pagesBody = '{"source":{"branch":"main","path":"/"}}'
$pagesExists = gh api "repos/$ghUser/$repoName/pages" 2>$null
if ($LASTEXITCODE -ne 0) {
    $pagesBody | gh api -X POST "repos/$ghUser/$repoName/pages" --input - | Out-Null
} else {
    $pagesBody | gh api -X PUT "repos/$ghUser/$repoName/pages" --input - | Out-Null
}

$liveUrl = "https://$($ghUser.ToLower()).github.io/$repoName/tracker/"
Write-Host ""
Write-Host "=== הצלחה! האתר עולה תוך כ-30-60 שניות בכתובת: ===" -ForegroundColor Green
Write-Host $liveUrl -ForegroundColor Yellow
Write-Host "שלח את הקישור לטלפון ובדפדפן בחר 'הוסף למסך הבית' כדי שייפתח כאפליקציה!" -ForegroundColor Cyan
