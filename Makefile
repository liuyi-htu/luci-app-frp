include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-frp
PKG_VERSION:=2.0
PKG_RELEASE:=2
PKG_PO_VERSION:=$(PKG_VERSION)-r$(PKG_RELEASE)
PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=local

LUCI_TITLE:=frp Intranet Proxy
LUCI_BASENAME:=frp
LUCI_DEPENDS:=+frpc +frps
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
