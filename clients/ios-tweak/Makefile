TARGET := iphone:clang:latest:14.0
ARCHS = arm64 arm64e

MODULES = jailed
include $(THEOS)/makefiles/common.mk

TWEAK_NAME = RKClient
DISPLAY_NAME = RKClient
BUNDLE_ID = com.iwilab.KakaoTalk

RKClient_FILES = Tweak.xm
RKClient_IPA = ../../.local/KakaoTalk.ipa

RKClient_FRAMEWORKS = UIKit

include $(THEOS_MAKE_PATH)/tweak.mk
