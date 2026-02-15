#!/bin/bash

# Requirements:
# - theos jailed (https://github.com/kabiroberai/theos-jailed)
# - ideviceinstaller (https://github.com/libimobiledevice/ideviceinstaller)
# - zsign (https://github.com/zhlynn/zsign)

# Place your .p12 file and .mobileprovision file in the <project_root>/.local/ directory,
# and fill in the .env file with the correct values for PROVISIONING_PROFILE, P12, and P12_PASSWORD.

cd ./clients/ios-tweak
CODESIGN_IPA=0 make package
cd ./packages
IPA_FILE=$(find . -name "*.ipa" -type f)
cd ../../..

set -a && source .env && set +a

zsign -k "./.local/${P12}" -p "${P12_PASSWORD}" -m "./.local/${PROVISIONING_PROFILE}" -o "./clients/ios-tweak/packages/KakaoTalk+${IPA_FILE:2}" "./clients/ios-tweak/packages${IPA_FILE:1}"
rm ./clients/ios-tweak/packages${IPA_FILE:1}

ideviceinstaller install "./clients/ios-tweak/packages/KakaoTalk+${IPA_FILE:2}"
