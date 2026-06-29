'use strict';
'require view';
'require form';
'require rpc';
'require tools.widgets as widgets';

function frpT(text) {
	return _('frp Intranet Proxy') !== 'frp Intranet Proxy' ? _(text) : text;
}

function startupConf(name) {
	return [
		[ form.Flag, 'stdout', _('Log stdout') ],
		[ form.Flag, 'stderr', _('Log stderr') ],
		[ widgets.UserSelect, 'user', _('Run daemon as user') ],
		[ widgets.GroupSelect, 'group', _('Run daemon as group') ],
		[ form.Flag, 'respawn', _('Respawn when crashed') ],
		[ form.DynamicList, 'env', _('Environment variable'), _('OS environments pass to frp for config file template, see %s.'.format('<a href="https://github.com/fatedier/frp#configuration-file-template">frp README</a>')), { placeholder: 'ENV_NAME=value' } ],
		[ form.DynamicList, 'conf_inc', _('Additional INI configs'), _('INI config files include in temporary config file'), { placeholder: '/etc/config/%s_extra.ini'.format(name) } ]
	];
}

const clientCommonConf = [
	[ form.Value, 'server_addr', frpT('Server address'), _('ServerAddr specifies the address of the server to connect to.<br />By default, this value is "127.0.0.1".'), { datatype: 'host' } ],
	[ form.Value, 'server_port', _('Server port'), _('ServerPort specifies the port to connect to the server on.<br />By default, this value is 7000.'), { datatype: 'port' } ],
	[ form.Value, 'http_proxy', _('HTTP proxy'), _('HttpProxy specifies a proxy address to connect to the server through. If this value is "", the server will be connected to directly.<br />By default, this value is read from the "http_proxy" environment variable.') ],
	[ form.Value, 'log_file', _('Log file'), _('LogFile specifies a file where logs will be written to. This value will only be used if LogWay is set appropriately.<br />By default, this value is "console".') ],
	[ form.ListValue, 'log_level', frpT('Log level'), _('LogLevel specifies the minimum log level. Valid values are "trace", "debug", "info", "warn", and "error".<br />By default, this value is "info".'), { values: [ 'trace', 'debug', 'info', 'warn', 'error' ] } ],
	[ form.Value, 'log_max_days', _('Log max days'), _('LogMaxDays specifies the maximum number of days to store log information before deletion. This is only used if LogWay == "file".<br />By default, this value is 0.'), { datatype: 'uinteger' } ],
	[ form.Flag, 'disable_log_color', _('Disable log color'), _('DisableLogColor disables log colors when LogWay == "console" when set to true.'), { datatype: 'bool', default: 'false' } ],
	[ form.Value, 'token', _('Token'), _('Token specifies the authorization token used to create keys to be sent to the server. The server must have a matching token for authorization to succeed. <br />By default, this value is "".') ],
	[ form.Value, 'admin_addr', _('Admin address'), _('AdminAddr specifies the address that the admin server binds to.<br />By default, this value is "0.0.0.0".'), { datatype: 'ipaddr' } ],
	[ form.Value, 'admin_port', _('Admin port'), _('AdminPort specifies the port for the admin server to listen on. If this value is 0, the admin server will not be started.<br />By default, this value is 0.'), { datatype: 'port' } ],
	[ form.Value, 'admin_user', _('Admin user'), _('AdminUser specifies the username that the admin server will use for login.<br />By default, this value is "admin".') ],
	[ form.Value, 'admin_pwd', _('Admin password'), _('AdminPwd specifies the password that the admin server will use for login.<br />By default, this value is "admin".'), { password: true } ],
	[ form.Value, 'assets_dir', _('Assets dir'), _('AssetsDir specifies the local directory that the admin server will load resources from. If this value is "", assets will be loaded from the bundled executable using statik.<br />By default, this value is "".') ],
	[ form.Flag, 'tcp_mux', _('TCP mux'), _('TcpMux toggles TCP stream multiplexing. This allows multiple requests from a client to share a single TCP connection. If this value is true, the server must have TCP multiplexing enabled as well.<br />By default, this value is true.'), { datatype: 'bool', default: 'true' } ],
	[ form.Value, 'user', frpT('User'), _('User specifies a prefix for proxy names to distinguish them from other clients. If this value is not "", proxy names will automatically be changed to "{user}.{proxy_name}".<br />By default, this value is "".') ],
	[ form.Flag, 'login_fail_exit', _('Exit when login fail'), _('LoginFailExit controls whether or not the client should exit after a failed login attempt. If false, the client will retry until a login attempt succeeds.<br />By default, this value is true.'), { datatype: 'bool', default: 'true' } ],
	[ form.ListValue, 'protocol', frpT('Protocol'), _('Protocol specifies the protocol to use when interacting with the server. Valid values are "tcp", "kcp", "quic" and "websocket".<br />By default, this value is "tcp".'), { values: [ 'tcp', 'kcp', 'quic', 'websocket' ], placeholder: frpT('-- Please choose --') } ],
	[ form.Flag, 'tls_enable', _('TLS'), _('TLS Enable specifies whether or not TLS should be used when communicating with the server.'), { datatype: 'bool' } ],
	[ form.Value, 'heartbeat_interval', _('Heartbeat interval'), _('HeartBeatInterval specifies at what interval heartbeats are sent to the server, in seconds. It is not recommended to change this value.<br />By default, this value is 30.'), { datatype: 'uinteger' } ],
	[ form.Value, 'heartbeat_timeout', _('Heartbeat timeout'), _('HeartBeatTimeout specifies the maximum allowed heartbeat response delay before the connection is terminated, in seconds. It is not recommended to change this value.<br />By default, this value is 90.'), { datatype: 'uinteger' } ],
	[ form.DynamicList, '_', _('Additional settings'), _('This list can be used to specify INI parameters which have not been included in this LuCI.'), { placeholder: 'Key-A=Value-A' } ]
];

const serverCommonConf = [
	[ form.Value, 'bind_addr', _('Bind address'), _('BindAddr specifies the address that the server binds to.<br />By default, this value is "0.0.0.0".'), { datatype: 'ipaddr' } ],
	[ form.Value, 'bind_port', _('Bind port'), _('BindPort specifies the port that the server listens on.<br />By default, this value is 7000.'), { datatype: 'port' } ],
	[ form.Value, 'bind_udp_port', _('UDP bind port'), _('BindUdpPort specifies the UDP port that the server listens on. If this value is 0, the server will not listen for UDP connections.<br />By default, this value is 0.'), { datatype: 'port' } ],
	[ form.Value, 'kcp_bind_port', _('KCP bind port'), _('BindKcpPort specifies the KCP port that the server listens on. If this value is 0, the server will not listen for KCP connections.<br />By default, this value is 0.'), { datatype: 'port' } ],
	[ form.Value, 'quic_bind_port', _('QUIC bind port'), _('BindQuicPort specifies the QUIC port that the server listens on. If this value is 0, the server will not listen for QUIC connections.<br />By default, this value is 0.'), { datatype: 'port' } ],
	[ form.Value, 'proxy_bind_addr', _('Proxy bind address'), _('ProxyBindAddr specifies the address that the proxy binds to. This value may be the same as BindAddr.<br />By default, this value is "0.0.0.0".'), { datatype: 'ipaddr' } ],
	[ form.Value, 'vhost_http_port', _('Vhost HTTP port'), _('VhostHttpPort specifies the port that the server listens for HTTP Vhost requests. If this value is 0, the server will not listen for HTTP requests.<br />By default, this value is 0.'), { datatype: 'port' } ],
	[ form.Value, 'vhost_https_port', _('Vhost HTTPS port'), _('VhostHttpsPort specifies the port that the server listens for HTTPS Vhost requests. If this value is 0, the server will not listen for HTTPS requests.<br />By default, this value is 0.'), { datatype: 'port' } ],
	[ form.Value, 'vhost_http_timeout', _('Vhost HTTP timeout'), _('VhostHttpTimeout specifies the response header timeout for the Vhost HTTP server, in seconds.<br />By default, this value is 60.'), { datatype: 'uinteger' } ],
	[ form.Value, 'dashboard_addr', _('Dashboard address'), _('DashboardAddr specifies the address that the dashboard binds to.<br />By default, this value is "0.0.0.0".'), { datatype: 'ipaddr' } ],
	[ form.Value, 'dashboard_port', _('Dashboard port'), _('DashboardPort specifies the port that the dashboard listens on. If this value is 0, the dashboard will not be started.<br />By default, this value is 0.'), { datatype: 'port' } ],
	[ form.Value, 'dashboard_user', _('Dashboard user'), _('DashboardUser specifies the username that the dashboard will use for login.<br />By default, this value is "admin".') ],
	[ form.Value, 'dashboard_pwd', _('Dashboard password'), _('DashboardPwd specifies the password that the dashboard will use for login.<br />By default, this value is "admin".'), { password: true } ],
	[ form.Flag, 'dashboard_tls_mode', _('Dashboard TLS mode'), _('Enable or disable TLS encryption for the dashboard. When enabled, HTTPS is used for secure communication.'), { datatype: 'bool' } ],
	[ form.Value, 'dashboard_tls_cert_file', _('Dashboard TLS certificate'), _('Dashboard TLS Cert File specifies the path to the TLS certificate file for enabling HTTPS access.<br />Required if HTTPS is enabled.'), { datatype: 'filepath' } ],
	[ form.Value, 'dashboard_tls_key_file', _('Dashboard TLS private key'), _('Dashboard TLS Key File specifies the path to the TLS private key file for enabling HTTPS access.<br />Required if HTTPS is enabled.'), { datatype: 'filepath' } ],
	[ form.Value, 'assets_dir', _('Assets dir'), _('AssetsDir specifies the local directory that the dashboard will load resources from. If this value is "", assets will be loaded from the bundled executable using statik.<br />By default, this value is "".') ],
	[ form.Value, 'log_file', _('Log file'), _('LogFile specifies a file where logs will be written to. This value will only be used if LogWay is set appropriately.<br />By default, this value is "console".') ],
	[ form.ListValue, 'log_level', frpT('Log level'), _('LogLevel specifies the minimum log level. Valid values are "trace", "debug", "info", "warn", and "error".<br />By default, this value is "info".'), { values: [ 'trace', 'debug', 'info', 'warn', 'error' ] } ],
	[ form.Value, 'log_max_days', _('Log max days'), _('LogMaxDays specifies the maximum number of days to store log information before deletion. This is only used if LogWay == "file".<br />By default, this value is 0.'), { datatype: 'uinteger' } ],
	[ form.Flag, 'disable_log_color', _('Disable log color'), _('DisableLogColor disables log colors when LogWay == "console" when set to true.<br />By default, this value is false.'), { datatype: 'bool', default: 'true' } ],
	[ form.Value, 'token', _('Token'), _('Token specifies the authorization token used to authenticate keys received from clients. Clients must have a matching token to be authorized to use the server.<br />By default, this value is "".') ],
	[ form.Value, 'subdomain_host', _('Subdomain host'), _('SubDomainHost specifies the domain that will be attached to sub-domains requested by the client when using Vhost proxying. For example, if this value is set to "frps.com" and the client requested the subdomain "test", the resulting URL would be "test.frps.com".<br />By default, this value is "".') ],
	[ form.Flag, 'tcp_mux', _('TCP mux'), _('TcpMux toggles TCP stream multiplexing. This allows multiple requests from a client to share a single TCP connection.<br />By default, this value is true.'), { datatype: 'bool', default: 'true' } ],
	[ form.Value, 'custom_404_page', _('Custom 404 page'), _('Custom404Page specifies a path to a custom 404 page to display. If this value is "", a default page will be displayed.<br />By default, this value is "".') ],
	[ form.Value, 'allow_ports', _('Allow ports'), _('AllowPorts specifies a set of ports that clients are able to proxy to. If the length of this value is 0, all ports are allowed.<br />By default, this value is an empty set.') ],
	[ form.Value, 'max_ports_per_client', _('Max ports per client'), _('MaxPortsPerClient specifies the maximum number of ports a single client may proxy to. If this value is 0, no limit will be applied.<br />By default, this value is 0.'), { datatype: 'uinteger' } ],
	[ form.Value, 'heartbeat_timeout', _('Heartbeat timeout'), _('HeartBeatTimeout specifies the maximum time to wait for a heartbeat before terminating the connection. It is not recommended to change this value.<br />By default, this value is 90.'), { datatype: 'uinteger' } ],
	[ form.DynamicList, '_', _('Additional settings'), _('This list can be used to specify INI parameters which have not been included in this LuCI.'), { placeholder: 'Key-A=Value-A' } ]
];

const baseProxyConf = [
	[ form.Value, 'name', _('Proxy name'), undefined, { rmempty: false, optional: false } ],
	[ form.ListValue, 'type', _('Proxy type'), _('ProxyType specifies the type of this proxy. Valid values include "tcp", "udp", "http", "https", "stcp" and "xtcp".<br />By default, this value is "tcp".'), { values: [ 'tcp', 'udp', 'http', 'https', 'stcp', 'xtcp' ] } ],
	[ form.Flag, 'use_encryption', _('Encryption'), _('UseEncryption controls whether or not communication with the server will be encrypted. Encryption is done using the tokens supplied in the server and client configuration.<br />By default, this value is false.'), { datatype: 'bool' } ],
	[ form.Flag, 'use_compression', _('Compression'), _('UseCompression controls whether or not communication with the server will be compressed.<br />By default, this value is false.'), { datatype: 'bool' } ],
	[ form.Value, 'local_ip', _('Local IP'), _('LocalIp specifies the IP address or host name to proxy to.'), { datatype: 'host' } ],
	[ form.Value, 'local_port', _('Local port'), _('LocalPort specifies the port to proxy to.'), { datatype: 'port' } ]
];

const bindInfoConf = [
	[ form.Value, 'remote_port', _('Remote port'), _('If remote_port is 0, frps will assign a random port for you'), { datatype: 'port' } ]
];

const domainConf = [
	[ form.Value, 'custom_domains', _('Custom domains') ],
	[ form.Value, 'subdomain', _('Subdomain') ]
];

const httpProxyConf = [
	[ form.Value, 'locations', _('Locations') ],
	[ form.Value, 'http_user', _('HTTP user') ],
	[ form.Value, 'http_pwd', _('HTTP password') ],
	[ form.Value, 'host_header_rewrite', _('Host header rewrite') ]
];

const stcpProxyConf = [
	[ form.ListValue, 'role', _('Role'), undefined, { values: [ 'server', 'visitor' ] } ],
	[ form.Value, 'server_name', _('Server name'), undefined, { depends: [ { role: 'visitor' } ] } ],
	[ form.Value, 'bind_addr', _('Bind addr'), undefined, { depends: [ { role: 'visitor' } ] } ],
	[ form.Value, 'bind_port', _('Bind port'), undefined, { depends: [ { role: 'visitor' } ] } ],
	[ form.Value, 'sk', _('Sk') ]
];

const pluginConf = [
	[ form.ListValue, 'plugin', _('Plugin'), undefined, { values: [ '', 'http_proxy', 'socks5', 'unix_domain_socket' ], rmempty: true } ],
	[ form.Value, 'plugin_http_user', _('HTTP user'), undefined, { depends: { plugin: 'http_proxy' } } ],
	[ form.Value, 'plugin_http_passwd', _('HTTP password'), undefined, { depends: { plugin: 'http_proxy' } } ],
	[ form.Value, 'plugin_user', _('SOCKS5 user'), undefined, { depends: { plugin: 'socks5' } } ],
	[ form.Value, 'plugin_passwd', _('SOCKS5 password'), undefined, { depends: { plugin: 'socks5' } } ],
	[ form.Value, 'plugin_unix_path', _('Unix domain socket path'), undefined, { depends: { plugin: 'unix_domain_socket' }, optional: false, rmempty: false, datatype: 'file', placeholder: '/var/run/docker.sock', default: '/var/run/docker.sock' } ]
];

const pageStyle = [
	'.frp-service-status { display: inline-flex; gap: 2.5em; align-items: center; flex-wrap: wrap; }',
	'.frp-service-status-item { white-space: nowrap; }',
	'.cbi-tabmenu { display: flex; flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; }',
	'.cbi-tabmenu > li { flex: 0 0 auto; }'
].join('\n');

function setParams(o, params) {
	if (!params)
		return;

	for (let key in params) {
		let val = params[key];

		if (key === 'values') {
			for (let v of val) {
				let args = v;

				if (!Array.isArray(args))
					args = [ args ];

				o.value.apply(o, args);
			}
		}
		else if (key === 'depends') {
			if (!Array.isArray(val))
				val = [ val ];

			const oldDeps = o.deps && o.deps.length ? o.deps : [ {} ];
			const deps = [];

			for (let v of val) {
				const d = {};

				for (let vkey in v)
					d[vkey] = v[vkey];

				for (let od of oldDeps) {
					const merged = {};

					for (let dkey in od)
						merged[dkey] = od[dkey];

					for (let dkey in d)
						merged[dkey] = d[dkey];

					deps.push(merged);
				}
			}

			o.deps = deps;
		}
		else {
			o[key] = params[key];
		}
	}

	if (params.datatype === 'bool') {
		o.enabled = 'true';
		o.disabled = 'false';
	}
}

function defTabOpts(s, t, opts, params) {
	for (let opt of opts) {
		const o = s.taboption(t, opt[0], opt[1], opt[2], opt[3]);

		setParams(o, opt[4]);
		setParams(o, params);
	}
}

function defOpts(s, opts, params) {
	for (let opt of opts) {
		const o = s.option(opt[0], opt[1], opt[2], opt[3]);

		setParams(o, opt[4]);
		setParams(o, params);
	}
}

const callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function getServiceStatus(name) {
	return L.resolveDefault(callServiceList(name), {}).then(function(res) {
		try {
			const instances = res[name].instances;

			for (let key in instances)
				if (instances[key].running)
					return true;
		}
		catch (e) {}

		return false;
	});
}

function getAllServiceStatus() {
	return Promise.all([
		getServiceStatus('frpc'),
		getServiceStatus('frps')
	]).then(function(res) {
		return {
			frpc: res[0],
			frps: res[1]
		};
	});
}

function renderOneStatus(label) {
	return '<em class="frp-service-status-item"><span style="color:green"><strong>%s %s</strong></span></em>'.format(label, frpT('Running'));
}

function renderStatus(status) {
	const items = [];

	if (status.frpc)
		items.push(renderOneStatus(_('frp Client')));

	if (status.frps)
		items.push(renderOneStatus(_('frp Server')));

	return items.length ? '<span class="frp-service-status">%s</span>'.format(items.join('')) : '';
}

return view.extend({
	render: function() {
		let m, s, o;

		m = new form.Map('frpc', _('frp Intranet Proxy'));
		m.chain('frps');

		s = m.section(form.NamedSection, '_status');
		s.anonymous = true;
		s.render = function(section_id) {
			L.Poll.add(function() {
				return L.resolveDefault(getAllServiceStatus()).then(function(res) {
					const statusView = document.getElementById('service_status');

					if (statusView)
						statusView.innerHTML = renderStatus(res);
				});
			});

			return E('div', { class: 'cbi-map' }, [
				E('style', {}, pageStyle),
				E('fieldset', { class: 'cbi-section' }, [
					E('p', { id: 'service_status' }, _('Collecting data ...'))
				])
			]);
		};

		s = m.section(form.NamedSection, 'common', 'conf');
		s.dynamic = true;
		s.tab('client_common', _('Client Common Settings'));
		s.tab('client_init', _('Client Startup Settings'));
		s.tab('server_common', _('Server Common Settings'));
		s.tab('server_init', _('Server Startup Settings'));
		defTabOpts(s, 'client_common', clientCommonConf, { optional: true });

		o = s.taboption('client_common', form.SectionValue, 'client_proxy', form.GridSection, 'conf', _('Client Proxy Settings'));
		let clientProxySection = o.subsection;
		clientProxySection.anonymous = true;
		clientProxySection.addremove = true;
		clientProxySection.sortable = true;
		clientProxySection.addbtntitle = _('Add new proxy...');
		clientProxySection.filter = function(section_id) {
			return section_id !== 'common';
		};
		clientProxySection.tab('general', _('General Settings'));
		clientProxySection.tab('http', _('HTTP Settings'));
		clientProxySection.tab('plugin', _('Plugin Settings'));
		clientProxySection.option(form.Value, 'name', _('Proxy name')).modalonly = false;
		clientProxySection.option(form.Value, 'type', _('Proxy type')).modalonly = false;
		clientProxySection.option(form.Value, 'local_ip', _('Local IP')).modalonly = false;
		clientProxySection.option(form.Value, 'local_port', _('Local port')).modalonly = false;
		o = clientProxySection.option(form.Value, 'remote_port', _('Remote port'));
		o.modalonly = false;
		o.depends('type', 'tcp');
		o.depends('type', 'udp');
		o.cfgvalue = function() {
			const v = this.super('cfgvalue', arguments);

			return v && v != '0' ? v : '#';
		};
		defTabOpts(clientProxySection, 'general', baseProxyConf, { modalonly: true });
		defTabOpts(clientProxySection, 'general', bindInfoConf, { optional: true, modalonly: true, depends: [ { type: 'tcp' }, { type: 'udp' } ] });
		defTabOpts(clientProxySection, 'http', domainConf, { optional: true, modalonly: true, depends: [ { type: 'http' }, { type: 'https' } ] });
		defTabOpts(clientProxySection, 'http', httpProxyConf, { optional: true, modalonly: true, depends: { type: 'http' } });
		defTabOpts(clientProxySection, 'general', stcpProxyConf, { modalonly: true, depends: [ { type: 'stcp' }, { type: 'xtcp' } ] });
		defTabOpts(clientProxySection, 'plugin', pluginConf, { modalonly: true });

		o = s.taboption('client_init', form.SectionValue, 'client_init', form.TypedSection, 'init', _('Client Startup Settings'));
		let clientInitSection = o.subsection;
		clientInitSection.anonymous = true;
		clientInitSection.dynamic = true;
		defOpts(clientInitSection, startupConf('frpc'));

		defTabOpts(s, 'server_common', serverCommonConf, { optional: true, uciconfig: 'frps' });

		o = s.taboption('server_init', form.SectionValue, 'server_init', form.TypedSection, 'init', _('Server Startup Settings'));
		o.uciconfig = 'frps';
		let serverInitSection = o.subsection;
		serverInitSection.uciconfig = 'frps';
		serverInitSection.anonymous = true;
		serverInitSection.dynamic = true;
		defOpts(serverInitSection, startupConf('frps'));

		return m.render();
	}
});
