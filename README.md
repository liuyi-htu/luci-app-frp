# luci-app-frp

A LuCI management interface for frp on OpenWrt and ImmortalWrt. It brings `frpc` client settings and `frps` server settings into a single LuCI page.

Project URL: `https://github.com/liuyi-htu/luci-app-frp`.

This repository contains only the LuCI application source code.

## Sources And Credits

This project combines LuCI management features for both `frpc` and `frps`. It references the following LuCI projects:

- `luci-app-frpc`: <https://github.com/kuoruan/luci-app-frpc>
- `luci-app-frps`: <https://github.com/lwz322/luci-app-frps>

## Features

- Adds a `Services -> frp Intranet Proxy` menu entry in LuCI.
- Manages both `frpc` client settings and `frps` server settings on one page.
- Writes startup settings to the existing UCI configs: `frpc` and `frps`.
- Keeps client proxy sections under the client common settings.
- Uses the runtime packages `frpc` and `frps` for init scripts, config generation, and binaries.
- Provides the Simplified Chinese translation package `luci-i18n-frp-zh-cn`.

## Build From Source

Prepare an OpenWrt or ImmortalWrt buildroot or SDK that produces the package format you need.

1. Enter the OpenWrt buildroot or SDK:

   ```sh
   cd /path/to/openwrt
   ```

2. Clone this repository into the `package` directory:

   ```sh
   git clone https://github.com/liuyi-htu/luci-app-frp.git package/luci-app-frp
   ```

3. Update and install feeds:

   ```sh
   ./scripts/feeds update -a
   ./scripts/feeds install -a
   ```

4. Select the package:

   ```sh
   make menuconfig
   ```

   Enable:

   ```text
   LuCI -> Applications -> luci-app-frp
   ```

5. Build the package:

   ```sh
   make package/luci-app-frp/compile V=s
   ```

6. Find the generated packages:

   ```sh
   find bin/packages \( -name 'luci-app-frp*.apk' -o -name 'luci-app-frp*.ipk' -o -name 'luci-i18n-frp*.apk' -o -name 'luci-i18n-frp*.ipk' \)
   ```

Different SDKs produce different package formats:

- Newer apk-based firmware builds `.apk` packages.
- Older opkg-based firmware builds `.ipk` packages.

Typical local build outputs include:

- `luci-app-frp-1.0-r9.apk`
- `luci-i18n-frp-zh-cn-1.0-r9.apk`
- `luci-app-frp_1.0-r9_all.ipk`
- `luci-i18n-frp-zh-cn_1.0-r9_all.ipk`

## GitHub Release Packages

Release packages are generated only when the GitHub Actions workflow is started manually. Pushing project changes does not start a build.

Download the package that matches your firmware package manager:

```text
https://github.com/liuyi-htu/luci-app-frp/releases
```

Use `.apk` for apk-based firmware and `.ipk` for opkg-based firmware. Release packages are architecture-independent LuCI packages, so the release artifacts are distinguished only by package format.

### Install `.apk`

```sh
scp luci-app-frp_1.0-r9.apk root@192.168.1.1:/tmp/
scp luci-i18n-frp-zh-cn_1.0-r9.apk root@192.168.1.1:/tmp/
```

SSH into the router:

```sh
ssh root@192.168.1.1
```

Install the packages:

```sh
apk add --allow-untrusted /tmp/luci-app-frp_1.0-r9.apk
apk add --allow-untrusted /tmp/luci-i18n-frp-zh-cn_1.0-r9.apk
```

### Install `.ipk`

```sh
scp luci-app-frp_1.0-r9.ipk root@192.168.1.1:/tmp/
scp luci-i18n-frp-zh-cn_1.0-r9.ipk root@192.168.1.1:/tmp/
```

SSH into the router:

```sh
ssh root@192.168.1.1
```

If the router can access the internet, update the package index first:

```sh
opkg update
```

Install the packages:

```sh
opkg install /tmp/luci-app-frp_1.0-r9.ipk
opkg install /tmp/luci-i18n-frp-zh-cn_1.0-r9.ipk
```

If dependencies are missing, install `luci-base`, `uci`, `frpc`, and `frps` from the package feeds that match your firmware.

Refresh the LuCI cache and reload services:

```sh
rm -f /tmp/luci-indexcache*
rm -rf /tmp/luci-modulecache/
/etc/init.d/rpcd reload
```

Then open LuCI:

```text
Services -> frp Intranet Proxy
```

## Notes

- Install packages that match your firmware package manager.
- Do not install `.apk` packages with `opkg`, and do not install `.ipk` packages with `apk`.
- This LuCI package depends on `luci-base`, `uci`, `frpc`, and `frps`.
- This package does not install `/etc/init.d/frpc`, `/etc/init.d/frps`, `/etc/config/frpc`, `/etc/config/frps`, `/usr/bin/frpc`, or `/usr/bin/frps`; those files are provided by the runtime packages.
