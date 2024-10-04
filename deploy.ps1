# Deploy Nexus' Images to AWS ECR
# You must be logged in to AWS prior to using this script
# To Allow AWS to Access Docker HUB and Configure it for ECS, See: https://docs.docker.com/cloud/ecs-integration/

param (
    # AWS Region
    [string]
    $Region = "us-east-2"
)

$Identity = aws sts get-caller-identity | ConvertFrom-Json
$AccountId = $Identity.Account
$Version = Get-Content .\version.txt
$EcrBaseARN = "$AccountId.dkr.ecr.$Region.amazonaws.com"

$NexusWebServer_EcrArnUri = "$EcrBaseARN/nexus"
$NexusDatabase_EcrArnUri = "$EcrBaseARN/nexus-db"

function PushImageToAWS {
    param (
        [Parameter(Mandatory)]
        [string]
        $ImageName,
        [Parameter(Mandatory)]
        [string]
        $EcrArn,
        [Parameter(Mandatory)]
        [string]
        $Tag
    )

    $ImageTag = "$($EcrArn):$Tag"
    $LatestImageTag = "$($EcrArn):latest"
 
    aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $EcrArn
    Write-Host "Obtained Token for ECR $EcrArn"
    
    docker tag $ImageName $ImageTag
    docker push $ImageTag

    docker tag $ImageName $LatestImageTag
    docker push $LatestImageTag
    
    Write-Host "Pushed $ImageName"
}

PushImageToAWS -ImageName nexus -EcrArn $NexusWebServer_EcrArnUri -Tag $Version
PushImageToAWS -ImageName nexus-db -EcrArn $NexusDatabase_EcrArnUri -Tag $Version
