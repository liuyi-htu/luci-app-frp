# luci-app-frp

用于 OpenWrt/ImmortalWrt 的 frp LuCI 管理界面，将 `frpc` 客户端和 `frps` 服务端整合到同一个页面中。

项目地址：`https://github.com/liuyi-htu/luci-app-frp`。

本仓库只保存 LuCI 应用源码。

## 融合与参考来源

本项目将 `frpc` 客户端和 `frps` 服务端的 LuCI 管理功能整合到同一个应用中，对应的 LuCI 开源项目地址如下：

- `luci-app-frpc` 开源地址：<https://github.com/kuoruan/luci-app-frpc>
- `luci-app-frps` 开源地址：<https://github.com/lwz322/luci-app-frps>

## 功能

- 在 LuCI 中提供 `Services -> frp Intranet Proxy` 菜单入口。
- 同一页面管理 `frpc` 客户端和 `frps` 服务端。
- 启动项配置写入现有的 UCI 配置：`frpc` 和 `frps`。
- 客户端代理段在客户端通用设置下管理。
- 运行脚本、配置生成逻辑和二进制文件由 `frpc`、`frps` 运行包提供。
- 提供简体中文翻译包 `luci-i18n-frp-zh-cn`。

## 从源码编译

准备一个与目标固件版本和架构匹配的 OpenWrt/ImmortalWrt 源码树或 SDK。

1. 进入 OpenWrt buildroot 或 SDK：

   ```sh
   cd /path/to/openwrt
   ```

2. 克隆本仓库到 package 目录：

   ```sh
   git clone https://github.com/liuyi-htu/luci-app-frp.git package/luci-app-frp
   ```

3. 更新并安装 feeds：

   ```sh
   ./scripts/feeds update -a
   ./scripts/feeds install -a
   ```

4. 选择软件包：

   ```sh
   make menuconfig
   ```

   启用：

   ```text
   LuCI -> Applications -> luci-app-frp
   ```

5. 编译软件包：

   ```sh
   make package/luci-app-frp/compile V=s
   ```

6. 查找生成的软件包：

   ```sh
   find bin/packages \( -name 'luci-app-frp*.apk' -o -name 'luci-app-frp*.ipk' -o -name 'luci-i18n-frp*.apk' -o -name 'luci-i18n-frp*.ipk' \)
   ```

不同 SDK 会生成不同包格式：

- 较新的 apk-based 固件生成 `.apk`。
- 较旧的 opkg-based 固件生成 `.ipk`。

通常会生成：

- `luci-app-frp-1.0-r9.apk`
- `luci-i18n-frp-zh-cn-1.0-r9.apk`
- `luci-app-frp_1.0-r9_all.ipk`
- `luci-i18n-frp-zh-cn_1.0-r9_all.ipk`

## 离线安装

从最新 Release 下载与固件包管理器匹配的文件：

```text
https://github.com/liuyi-htu/luci-app-frp/releases
```

apk-based 固件使用 `.apk`，opkg-based 固件使用 `.ipk`。

Release 附件会在扩展名前追加架构后缀，例如 `x86-64`、`armsr-armv7` 或 `armsr-armv8`。下面以 `armsr-armv8` 为例，请按实际固件架构替换。

### 安装 `.apk`

```sh
scp luci-app-frp_1.0-r9_all_armsr-armv8.apk root@192.168.1.1:/tmp/
scp luci-i18n-frp-zh-cn_1.0-r9_all_armsr-armv8.apk root@192.168.1.1:/tmp/
```

SSH 到路由器：

```sh
ssh root@192.168.1.1
```

安装软件包：

```sh
apk add --allow-untrusted /tmp/luci-app-frp_1.0-r9_all_armsr-armv8.apk
apk add --allow-untrusted /tmp/luci-i18n-frp-zh-cn_1.0-r9_all_armsr-armv8.apk
```

### 安装 `.ipk`

```sh
scp luci-app-frp_1.0-r9_all_armsr-armv8.ipk root@192.168.1.1:/tmp/
scp luci-i18n-frp-zh-cn_1.0-r9_all_armsr-armv8.ipk root@192.168.1.1:/tmp/
```

SSH 到路由器：

```sh
ssh root@192.168.1.1
```

如果路由器可以联网，先更新软件包索引：

```sh
opkg update
```

安装软件包：

```sh
opkg install /tmp/luci-app-frp_1.0-r9_all_armsr-armv8.ipk
opkg install /tmp/luci-i18n-frp-zh-cn_1.0-r9_all_armsr-armv8.ipk
```

如果提示缺少依赖，请先安装与固件版本和架构匹配的 `luci-base`、`uci`、`frpc` 和 `frps`。

刷新 LuCI 缓存并重载服务：

```sh
rm -f /tmp/luci-indexcache*
rm -rf /tmp/luci-modulecache/
/etc/init.d/rpcd reload
```

然后打开 LuCI：

```text
Services -> frp Intranet Proxy
```

## 注意事项

- 请安装与固件版本、架构和包管理器匹配的软件包。
- 不要用 `opkg` 安装 `.apk`，也不要用 `apk` 安装 `.ipk`。
- 本 LuCI 包依赖 `luci-base`、`uci`、`frpc` 和 `frps`。
- 本包不安装 `/etc/init.d/frpc`、`/etc/init.d/frps`、`/etc/config/frpc`、`/etc/config/frps`、`/usr/bin/frpc` 或 `/usr/bin/frps`，这些文件由运行包提供。
