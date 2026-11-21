# סקריפט העלאה אוטומטי ל-GitHub Pages (גישה מהטלפון ומהמחשב)
$ErrorActionPreference = "Continue"

$repoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoName = "personal-physio-atlas"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) לא נמצא במערכת. התקן gh ונסה שוב."
    exit 1
}

Push-Location $repoDir
try {
    Write-Host "=== בדיקת חיבור GitHub CLI ===" -ForegroundColor Cyan
    gh auth status *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "פותח התחברות ל-GitHub בדפדפן..." -ForegroundColor Yellow
        gh auth login -p https -w
        if ($LASTEXITCODE -ne 0) {
            Write-Error "ההתחברות ל-GitHub בוטלה או נכשלה."
            exit 1
        }
    }

    $ghUser = (gh api user -q ".login" | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($ghUser)) {
        Write-Error "לא הצלחתי לזהות את שם המשתמש ב-GitHub."
        exit 1
    }
    Write-Host "מחובר כמשתמש: $ghUser" -ForegroundColor Green

    $remoteUrl = (git remote get-url origin 2>$null | Out-String).Trim()
    $hasRemote = ($LASTEXITCODE -eq 0) -and (-not [string]::IsNullOrWhiteSpace($remoteUrl))

    if (-not $hasRemote) {
        gh repo view "$ghUser/$repoName" *> $null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "המאגר $ghUser/$repoName כבר קיים ב-GitHub — מחבר origin ודוחף לענף main..." -ForegroundColor Cyan
            git remote add origin "https://github.com/$ghUser/$repoName.git"
            if ($LASTEXITCODE -ne 0) {
                Write-Error "חיבור ה-remote נכשל."
                exit 1
            }
            git push -u origin main
            if ($LASTEXITCODE -ne 0) {
                Write-Error "דחיפת הקוד ל-GitHub נכשלה."
                exit 1
            }
        } else {
            Write-Host "יוצר מאגר ציבורי (חובה עבור GitHub Pages חינמי) ודוחף את הקוד..." -ForegroundColor Cyan
            gh repo create $repoName --public --source="." --remote=origin --push
            if ($LASTEXITCODE -ne 0) {
                Write-Error "יצירת המאגר או הדחיפה ל-GitHub נכשלו."
                exit 1
            }
        }
    } else {
        Write-Host "מאגר מרוחק קיים ($remoteUrl) — דוחף עדכונים לענף main..." -ForegroundColor Cyan
        git push -u origin main
        if ($LASTEXITCODE -ne 0) {
            Write-Error "דחיפת העדכונים לענף main נכשלה."
            exit 1
        }
    }

    Write-Host "מפעיל GitHub Pages על ענף main (root)..." -ForegroundColor Cyan
    gh api "repos/$ghUser/$repoName/pages" *> $null
    if ($LASTEXITCODE -ne 0) {
        gh api -X POST "repos/$ghUser/$repoName/pages" -f "source[branch]=main" -f "source[path]=/" *> $null
    } else {
        gh api -X PUT "repos/$ghUser/$repoName/pages" -f "source[branch]=main" -f "source[path]=/" *> $null
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Error "הפעלת GitHub Pages נכשלה."
        exit 1
    }

    $rootUrl = "https://$($ghUser.ToLower()).github.io/$repoName/"
    $liveUrl = "${rootUrl}tracker/"
    Write-Host ""
    Write-Host "=== הצלחה! האתר עולה תוך כ-30-60 שניות בכתובת: ===" -ForegroundColor Green
    Write-Host $liveUrl -ForegroundColor Yellow
    Write-Host "(גם הכתובת הראשית $rootUrl מפנה ישירות לאפליקציה)" -ForegroundColor Gray
    Write-Host "שלח את הקישור לטלפון ובדפדפן בחר 'הוסף למסך הבית' כדי שייפתח כאפליקציה!" -ForegroundColor Cyan
}
finally {
    Pop-Location
}
