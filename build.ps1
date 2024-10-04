function CheckLastExitCode {
    param ([int[]]$SuccessCodes = @(0))
    if (!$?) {
        Write-Host "Last CMD failed" -ForegroundColor Red
        #GoToWrapperDirectory in my code I go back to the original directory that launched the script
        exit
    }
    if ($SuccessCodes -notcontains $LastExitCode) {
        Write-Host "EXE RETURNED EXIT CODE $LastExitCode" -ForegroundColor Red
        #GoToWrapperDirectory in my code I go back to the original directory that launched the script
        exit
    }  
}

$DateString = Get-Date -Format yyyyMMddHHmm
$Version = Get-Content .\version.txt
$ImageVersion="$version.$datestring"
Write-Host "Image Version $ImageVersion"

npm i
CheckLastExitCode

npm run build
CheckLastExitCode

docker build -t "test-nexus-sdi:$ImageVersion" -t "test-nexus-sdi:latest" -f SingleDockerImage.Dockerfile .
CheckLastExitCode

Write-Host "Webserver Docker Image Built"
Write-Host "Database Docker Image Built"
Write-Host "Completed Build"
