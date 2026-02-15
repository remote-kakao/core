TARGET := iphone:clang:latest:14.0
ARCHS = arm64 arm64e
libFLEX_ARCHS = arm64 arm64e

MODULES = jailed
include $(THEOS)/makefiles/common.mk

TWEAK_NAME = RKClient
DISPLAY_NAME = RKClient
BUNDLE_ID = com.iwilab.KakaoTalk

RKClient_FILES = Tweak.xm
RKClient_IPA = ../../.local/KakaoTalk.ipa
RKClient_FRAMEWORKS = UIKit
RKClient_INJECT_DYLIBS = $(THEOS_OBJ_DIR)/libFLEX.dylib

SUBPROJECTS += tweaks/FLEXing/libflex
include $(THEOS_MAKE_PATH)/aggregate.mk

include $(THEOS_MAKE_PATH)/tweak.mk
