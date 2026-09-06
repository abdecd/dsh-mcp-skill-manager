window.__ModuleLoader__.load({
	id: "dsh-mcp-skill-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/run/media/user1/78E6859DE6855BEE/code/js/dsh-mcp-skill-manager/src/client/McpSkillManager.module.css.mjs
		const css = ".VlMPOq_inputBtn{background:var(--dsw-specific-selector,#ffffff14);width:28px;height:28px;color:var(--dsw-alias-label-primary,#e2e8f0);cursor:pointer;border:1px solid var(--dsw-alias-border-l2,#ffffff1f);border-radius:999px;outline:none;flex:none;justify-content:center;align-items:center;padding:0;transition:all .15s;display:flex;position:relative}.VlMPOq_inputBtn:hover{background:var(--dsw-alias-interactive-bg-hover-solid,#ffffff29);border-color:var(--dsw-alias-border-l3,#ffffff3d);color:#fff;transform:translateY(-1px)}.VlMPOq_inputBtn:active{transform:translateY(0)}.VlMPOq_inputBtnActive{background:var(--dsw-alias-state-business-primary,#3b82f6)!important;color:#fff!important;border-color:#0000!important}.VlMPOq_backdrop{backdrop-filter:blur(6px);z-index:99999;background:#000000a6;justify-content:center;align-items:center;padding:20px;animation:.15s cubic-bezier(.16,1,.3,1) VlMPOq_fadeIn;display:flex;position:fixed;inset:0}@keyframes VlMPOq_fadeIn{0%{opacity:0}to{opacity:1}}.VlMPOq_modal{box-sizing:border-box;background:var(--dsw-specific-input-major,#1e1e24);width:680px;max-width:95vw;max-height:86vh;color:var(--dsw-alias-label-primary,#e2e8f0);border:1px solid var(--dsw-alias-border-l2,#ffffff24);box-shadow:var(--dsw-elevation-soft,0 16px 40px #00000080);border-radius:16px;flex-direction:column;animation:.18s cubic-bezier(.16,1,.3,1) VlMPOq_slideUp;display:flex;overflow:hidden}@keyframes VlMPOq_slideUp{0%{opacity:0;transform:translateY(12px)scale(.98)}to{opacity:1;transform:translateY(0)scale(1)}}.VlMPOq_header{border-bottom:1px solid var(--dsw-alias-border-l2,#ffffff14);background:var(--dsw-alias-bg-secondary,#ffffff05);justify-content:space-between;align-items:center;padding:16px 20px;display:flex}.VlMPOq_titleArea{flex-direction:column;gap:3px;display:flex}.VlMPOq_titleRow{align-items:center;gap:8px;display:flex}.VlMPOq_title{color:var(--dsw-alias-label-primary,#fff);margin:0;font-size:16px;font-weight:600}.VlMPOq_subtitle{color:var(--dsw-alias-label-secondary,#94a3b8);margin:0;font-size:12px}.VlMPOq_headerActions{align-items:center;gap:8px;display:flex}.VlMPOq_iconBtn{color:var(--dsw-alias-label-secondary,#94a3b8);cursor:pointer;background:0 0;border:none;border-radius:8px;justify-content:center;align-items:center;width:30px;height:30px;padding:0;transition:all .12s;display:flex}.VlMPOq_iconBtn:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff14);color:var(--dsw-alias-label-primary,#fff)}.VlMPOq_filterBar{border-bottom:1px solid var(--dsw-alias-border-l2,#ffffff0f);justify-content:space-between;align-items:center;gap:12px;padding:12px 20px;display:flex}.VlMPOq_searchInput{background:var(--dsw-alias-bg-tertiary,#ffffff0d);border:1px solid var(--dsw-alias-border-l2,#ffffff1a);color:var(--dsw-alias-label-primary,#fff);border-radius:8px;outline:none;flex:1;padding:6px 12px;font-size:13px;transition:border-color .15s}.VlMPOq_searchInput:focus{border-color:var(--dsw-alias-state-business-primary,#3b82f6)}.VlMPOq_searchInput::placeholder{color:var(--dsw-alias-label-tertiary,#64748b)}.VlMPOq_tabs{background:var(--dsw-alias-bg-tertiary,#ffffff0d);border-radius:8px;gap:2px;padding:3px;display:flex}.VlMPOq_tabBtn{color:var(--dsw-alias-label-secondary,#94a3b8);cursor:pointer;background:0 0;border:none;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:500;transition:all .12s}.VlMPOq_tabBtn:hover{color:var(--dsw-alias-label-primary,#fff)}.VlMPOq_tabBtnActive{background:var(--dsw-alias-interactive-bg-hover-solid,#ffffff24);font-weight:600;color:#fff!important}.VlMPOq_content{flex-direction:column;flex:1;gap:20px;padding:16px 20px;display:flex;overflow-y:auto}.VlMPOq_content::-webkit-scrollbar{width:6px}.VlMPOq_content::-webkit-scrollbar-thumb{background:#ffffff26;border-radius:999px}.VlMPOq_content::-webkit-scrollbar-thumb:hover{background:#ffffff40}.VlMPOq_section{flex-direction:column;gap:10px;display:flex}.VlMPOq_sectionHeader{justify-content:space-between;align-items:center;padding-bottom:4px;display:flex}.VlMPOq_sectionTitle{letter-spacing:.5px;text-transform:uppercase;color:var(--dsw-alias-label-secondary,#94a3b8);align-items:center;gap:6px;font-size:13px;font-weight:700;display:flex}.VlMPOq_sectionSubtitle{color:var(--dsw-alias-label-tertiary,#64748b);text-overflow:ellipsis;white-space:nowrap;max-width:320px;font-family:monospace;font-size:11px;overflow:hidden}.VlMPOq_cardList{flex-direction:column;gap:8px;display:flex}.VlMPOq_itemCard{background:var(--dsw-alias-bg-secondary,#ffffff08);border:1px solid var(--dsw-alias-border-l2,#ffffff14);border-radius:10px;justify-content:space-between;align-items:center;gap:12px;padding:10px 14px;transition:all .12s;display:flex}.VlMPOq_itemCard:hover{border-color:var(--dsw-alias-border-l3,#ffffff29);background:var(--dsw-alias-interactive-bg-hover,#ffffff0d)}.VlMPOq_itemCardDisabled{opacity:.65;background:#ffffff03}.VlMPOq_itemCardDisabled:hover{opacity:.85}.VlMPOq_itemInfo{flex-direction:column;flex:1;gap:3px;min-width:0;display:flex}.VlMPOq_itemTitleRow{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.VlMPOq_itemName{color:var(--dsw-alias-label-primary,#fff);font-size:14px;font-weight:600}.VlMPOq_itemBadge{border-radius:4px;padding:1px 6px;font-size:11px;font-weight:500;line-height:16px}.VlMPOq_badgeProject{color:#60a5fa;background:#3b82f626;border:1px solid #3b82f64d}.VlMPOq_badgeGlobal{color:#c084fc;background:#a855f726;border:1px solid #a855f74d}.VlMPOq_badgeMcp{color:#fbbf24;background:#f59e0b26;border:1px solid #f59e0b4d}.VlMPOq_badgeActive{color:#4ade80;background:#22c55e26}.VlMPOq_badgeInactive{color:#94a3b8;background:#94a3b826}.VlMPOq_itemDesc{color:var(--dsw-alias-label-secondary,#94a3b8);text-overflow:ellipsis;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:12px;line-height:18px;display:-webkit-box;overflow:hidden}.VlMPOq_itemExtra{color:var(--dsw-alias-label-tertiary,#64748b);text-overflow:ellipsis;white-space:nowrap;font-family:monospace;font-size:11px;overflow:hidden}.VlMPOq_itemAction{flex:none;align-items:center;gap:10px;display:flex}.VlMPOq_switchTrack{cursor:pointer;background:#ffffff2e;border:1px solid #0000;border-radius:999px;width:40px;height:22px;transition:background-color .2s cubic-bezier(.16,1,.3,1);position:relative}.VlMPOq_switchTrackChecked{background:var(--dsw-alias-state-business-primary,#3b82f6)}.VlMPOq_switchTrackDisabled{cursor:not-allowed;opacity:.5}.VlMPOq_switchThumb{background:#fff;border-radius:50%;width:16px;height:16px;transition:transform .2s cubic-bezier(.16,1,.3,1);position:absolute;top:2px;left:3px;box-shadow:0 1px 3px #0000004d}.VlMPOq_switchThumbChecked{transform:translate(18px)}.VlMPOq_loadingSpinner{border:2px solid #ffffff4d;border-top-color:#fff;border-radius:50%;width:12px;height:12px;animation:.6s linear infinite VlMPOq_spin}@keyframes VlMPOq_spin{to{transform:rotate(360deg)}}.VlMPOq_emptyState{border:1px dashed var(--dsw-alias-border-l2,#ffffff1a);text-align:center;color:var(--dsw-alias-label-tertiary,#64748b);border-radius:10px;padding:16px;font-size:13px}.VlMPOq_footer{border-top:1px solid var(--dsw-alias-border-l2,#ffffff14);background:var(--dsw-alias-bg-secondary,#ffffff05);color:var(--dsw-alias-label-secondary,#94a3b8);justify-content:space-between;align-items:center;padding:12px 20px;font-size:12px;display:flex}.VlMPOq_footerTip{color:var(--dsw-alias-label-tertiary,#64748b);align-items:center;gap:6px;max-width:480px;display:flex}.VlMPOq_closeBtn{background:var(--dsw-alias-interactive-bg-hover-solid,#ffffff1a);color:var(--dsw-alias-label-primary,#fff);cursor:pointer;border:none;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:500;transition:all .12s}.VlMPOq_closeBtn:hover{background:#ffffff29}";
		const tagId = "dsh-mcp-skill-manager/McpSkillManager.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mcp-skill-manager";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var McpSkillManager_module_css_default = {
			"itemDesc": "VlMPOq_itemDesc",
			"backdrop": "VlMPOq_backdrop",
			"itemName": "VlMPOq_itemName",
			"footer": "VlMPOq_footer",
			"footerTip": "VlMPOq_footerTip",
			"cardList": "VlMPOq_cardList",
			"tabBtn": "VlMPOq_tabBtn",
			"itemCardDisabled": "VlMPOq_itemCardDisabled",
			"modal": "VlMPOq_modal",
			"inputBtnActive": "VlMPOq_inputBtnActive",
			"tabs": "VlMPOq_tabs",
			"itemExtra": "VlMPOq_itemExtra",
			"titleArea": "VlMPOq_titleArea",
			"switchTrackChecked": "VlMPOq_switchTrackChecked",
			"searchInput": "VlMPOq_searchInput",
			"tabBtnActive": "VlMPOq_tabBtnActive",
			"title": "VlMPOq_title",
			"sectionSubtitle": "VlMPOq_sectionSubtitle",
			"itemInfo": "VlMPOq_itemInfo",
			"badgeGlobal": "VlMPOq_badgeGlobal",
			"content": "VlMPOq_content",
			"section": "VlMPOq_section",
			"badgeMcp": "VlMPOq_badgeMcp",
			"itemAction": "VlMPOq_itemAction",
			"fadeIn": "VlMPOq_fadeIn",
			"switchThumb": "VlMPOq_switchThumb",
			"loadingSpinner": "VlMPOq_loadingSpinner",
			"subtitle": "VlMPOq_subtitle",
			"switchThumbChecked": "VlMPOq_switchThumbChecked",
			"spin": "VlMPOq_spin",
			"emptyState": "VlMPOq_emptyState",
			"badgeInactive": "VlMPOq_badgeInactive",
			"closeBtn": "VlMPOq_closeBtn",
			"sectionTitle": "VlMPOq_sectionTitle",
			"itemBadge": "VlMPOq_itemBadge",
			"sectionHeader": "VlMPOq_sectionHeader",
			"switchTrack": "VlMPOq_switchTrack",
			"iconBtn": "VlMPOq_iconBtn",
			"badgeActive": "VlMPOq_badgeActive",
			"inputBtn": "VlMPOq_inputBtn",
			"itemTitleRow": "VlMPOq_itemTitleRow",
			"headerActions": "VlMPOq_headerActions",
			"header": "VlMPOq_header",
			"badgeProject": "VlMPOq_badgeProject",
			"itemCard": "VlMPOq_itemCard",
			"switchTrackDisabled": "VlMPOq_switchTrackDisabled",
			"filterBar": "VlMPOq_filterBar",
			"titleRow": "VlMPOq_titleRow",
			"slideUp": "VlMPOq_slideUp"
		};
		//#endregion
		//#region src/client/Switch.tsx
		function Switch({ checked, onChange, disabled = false, loading = false, ariaLabel }) {
			const handleClick = (e) => {
				e.stopPropagation();
				if (disabled || loading) return;
				onChange(!checked);
			};
			const handleKeyDown = (e) => {
				if (disabled || loading) return;
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					e.stopPropagation();
					onChange(!checked);
				}
			};
			const trackClass = [
				McpSkillManager_module_css_default.switchTrack,
				checked ? McpSkillManager_module_css_default.switchTrackChecked : "",
				disabled || loading ? McpSkillManager_module_css_default.switchTrackDisabled : ""
			].filter(Boolean).join(" ");
			const thumbClass = [McpSkillManager_module_css_default.switchThumb, checked ? McpSkillManager_module_css_default.switchThumbChecked : ""].filter(Boolean).join(" ");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				role: "switch",
				"aria-checked": checked,
				"aria-label": ariaLabel,
				tabIndex: disabled || loading ? -1 : 0,
				className: trackClass,
				onClick: handleClick,
				onKeyDown: handleKeyDown,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: thumbClass,
					children: loading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							width: "100%",
							height: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center"
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: McpSkillManager_module_css_default.loadingSpinner })
					})
				})
			});
		}
		//#endregion
		//#region src/client/McpSkillModal.tsx
		function McpSkillModal({ rpc, sessionId, onClose }) {
			const [data, setData] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const [searchQuery, setSearchQuery] = (0, react.useState)("");
			const [activeTab, setActiveTab] = (0, react.useState)("all");
			const [togglingIds, setTogglingIds] = (0, react.useState)(/* @__PURE__ */ new Set());
			const loadData = async () => {
				setLoading(true);
				setError(null);
				try {
					if (!rpc) throw new Error("RPC 服务不可用");
					const res = await rpc.call("/mcp-skill-manager", "list", { sessionId });
					if (res && res.ok) setData(res.value);
					else throw new Error(res?.error?.message ?? "获取 MCP/Skill 列表失败");
				} catch (err) {
					setError(String(err?.message ?? err));
				} finally {
					setLoading(false);
				}
			};
			(0, react.useEffect)(() => {
				loadData();
			}, [sessionId]);
			(0, react.useEffect)(() => {
				const handleKeyDown = (e) => {
					if (e.key === "Escape") onClose();
				};
				window.addEventListener("keydown", handleKeyDown);
				return () => window.removeEventListener("keydown", handleKeyDown);
			}, [onClose]);
			const handleToggleSkill = async (skill) => {
				if (togglingIds.has(skill.id)) return;
				setTogglingIds((prev) => new Set(prev).add(skill.id));
				const nextState = !skill.enabled;
				try {
					const res = await rpc.call("/mcp-skill-manager", "toggle-skill", {
						path: skill.path,
						parentDir: skill.parentDir,
						filename: skill.filename,
						isBundle: skill.isBundle,
						enabled: nextState
					});
					if (res && res.ok) setData((prev) => {
						if (!prev) return prev;
						const updater = (items) => items.map((it) => it.id === skill.id ? {
							...it,
							enabled: nextState,
							path: res.value.newPath
						} : it);
						return {
							...prev,
							projectSkills: updater(prev.projectSkills),
							globalSkills: updater(prev.globalSkills)
						};
					});
					else alert(`切换技能失败: ${res?.error?.message ?? "未知错误"}`);
				} catch (err) {
					alert(`切换技能失败: ${String(err?.message ?? err)}`);
				} finally {
					setTogglingIds((prev) => {
						const next = new Set(prev);
						next.delete(skill.id);
						return next;
					});
				}
			};
			const handleToggleMcp = async (mcp) => {
				if (togglingIds.has(mcp.id)) return;
				setTogglingIds((prev) => new Set(prev).add(mcp.id));
				const nextState = !mcp.enabled;
				try {
					const res = await rpc.call("/mcp-skill-manager", "toggle-mcp", {
						id: mcp.id,
						serverName: mcp.serverName,
						enabled: nextState
					});
					if (res && res.ok) setData((prev) => {
						if (!prev) return prev;
						return {
							...prev,
							globalMcps: prev.globalMcps.map((it) => it.id === mcp.id ? {
								...it,
								enabled: nextState
							} : it)
						};
					});
					else alert(`切换 MCP 失败: ${res?.error?.message ?? "未知错误"}`);
				} catch (err) {
					alert(`切换 MCP 失败: ${String(err?.message ?? err)}`);
				} finally {
					setTogglingIds((prev) => {
						const next = new Set(prev);
						next.delete(mcp.id);
						return next;
					});
				}
			};
			const query = searchQuery.trim().toLowerCase();
			const filteredProjectSkills = (0, react.useMemo)(() => {
				if (!data) return [];
				return data.projectSkills.filter((it) => !query || it.name.toLowerCase().includes(query) || it.description.toLowerCase().includes(query) || it.filename.toLowerCase().includes(query));
			}, [data, query]);
			const filteredGlobalSkills = (0, react.useMemo)(() => {
				if (!data) return [];
				return data.globalSkills.filter((it) => !query || it.name.toLowerCase().includes(query) || it.description.toLowerCase().includes(query) || it.filename.toLowerCase().includes(query));
			}, [data, query]);
			const filteredGlobalMcps = (0, react.useMemo)(() => {
				if (!data) return [];
				return data.globalMcps.filter((it) => !query || it.serverName.toLowerCase().includes(query) || it.id.toLowerCase().includes(query) || it.command && it.command.toLowerCase().includes(query));
			}, [data, query]);
			const projectCount = data ? data.projectSkills.length : 0;
			const globalSkillCount = data ? data.globalSkills.length : 0;
			const globalMcpCount = data ? data.globalMcps.length : 0;
			const modalContent = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: McpSkillManager_module_css_default.backdrop,
				onClick: onClose,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: McpSkillManager_module_css_default.modal,
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: McpSkillManager_module_css_default.header,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: McpSkillManager_module_css_default.titleArea,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: McpSkillManager_module_css_default.titleRow,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
										className: McpSkillManager_module_css_default.title,
										children: "MCP & Skill 管理"
									})
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: McpSkillManager_module_css_default.subtitle,
									children: "先显示项目级，再显示全局级 · 开关即时激活与停用"
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: McpSkillManager_module_css_default.headerActions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: McpSkillManager_module_css_default.iconBtn,
									onClick: loadData,
									title: "刷新列表",
									"aria-label": "刷新列表",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
										width: "15",
										height: "15",
										viewBox: "0 0 16 16",
										fill: "none",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M13.65 2.35A7.95 7.95 0 0 0 8 0C3.58 0 0 3.58 0 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 8 14c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z",
											fill: "currentColor"
										})
									})
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: McpSkillManager_module_css_default.iconBtn,
									onClick: onClose,
									title: "关闭",
									"aria-label": "关闭",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
										width: "15",
										height: "15",
										viewBox: "0 0 16 16",
										fill: "none",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5",
											stroke: "currentColor",
											strokeWidth: "1.5",
											strokeLinecap: "round"
										})
									})
								})]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: McpSkillManager_module_css_default.filterBar,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "text",
								className: McpSkillManager_module_css_default.searchInput,
								placeholder: "搜索技能或 MCP 服务名称、描述...",
								value: searchQuery,
								onChange: (e) => setSearchQuery(e.target.value)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: McpSkillManager_module_css_default.tabs,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: `${McpSkillManager_module_css_default.tabBtn} ${activeTab === "all" ? McpSkillManager_module_css_default.tabBtnActive : ""}`,
										onClick: () => setActiveTab("all"),
										children: [
											"全部 (",
											projectCount + globalSkillCount + globalMcpCount,
											")"
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: `${McpSkillManager_module_css_default.tabBtn} ${activeTab === "project" ? McpSkillManager_module_css_default.tabBtnActive : ""}`,
										onClick: () => setActiveTab("project"),
										children: [
											"项目级 (",
											projectCount,
											")"
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: `${McpSkillManager_module_css_default.tabBtn} ${activeTab === "global" ? McpSkillManager_module_css_default.tabBtnActive : ""}`,
										onClick: () => setActiveTab("global"),
										children: [
											"全局级 (",
											globalSkillCount + globalMcpCount,
											")"
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: McpSkillManager_module_css_default.content,
							children: loading && !data ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: McpSkillManager_module_css_default.emptyState,
								children: "正在加载 MCP 和 Skill 列表..."
							}) : error ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: McpSkillManager_module_css_default.emptyState,
								style: { color: "#ef4444" },
								children: ["加载失败: ", error]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(activeTab === "all" || activeTab === "project") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: McpSkillManager_module_css_default.section,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: McpSkillManager_module_css_default.sectionHeader,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: McpSkillManager_module_css_default.sectionTitle,
										children: "📁 项目级技能 (Project Skills)"
									}), data?.projectRoot && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: McpSkillManager_module_css_default.sectionSubtitle,
										title: data.projectRoot,
										children: ["项目: ", data.projectRoot]
									})]
								}), filteredProjectSkills.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: McpSkillManager_module_css_default.emptyState,
									children: "当前项目目录下未发现技能 (支持 .agents/skills 或 .dsh/skills)"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: McpSkillManager_module_css_default.cardList,
									children: filteredProjectSkills.map((skill) => {
										const isToggling = togglingIds.has(skill.id);
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: `${McpSkillManager_module_css_default.itemCard} ${!skill.enabled ? McpSkillManager_module_css_default.itemCardDisabled : ""}`,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: McpSkillManager_module_css_default.itemInfo,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														className: McpSkillManager_module_css_default.itemTitleRow,
														children: [
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: McpSkillManager_module_css_default.itemName,
																children: skill.name
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: `${McpSkillManager_module_css_default.itemBadge} ${McpSkillManager_module_css_default.badgeProject}`,
																children: "项目级"
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: `${McpSkillManager_module_css_default.itemBadge} ${skill.enabled ? McpSkillManager_module_css_default.badgeActive : McpSkillManager_module_css_default.badgeInactive}`,
																children: skill.enabled ? "已激活" : "已停用"
															})
														]
													}),
													skill.description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														className: McpSkillManager_module_css_default.itemDesc,
														children: skill.description
													}) : null,
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														className: McpSkillManager_module_css_default.itemExtra,
														children: ["路径: ", skill.path]
													})
												]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: McpSkillManager_module_css_default.itemAction,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
													checked: skill.enabled,
													loading: isToggling,
													disabled: isToggling,
													ariaLabel: `切换技能 ${skill.name}`,
													onChange: () => handleToggleSkill(skill)
												})
											})]
										}, skill.id);
									})
								})]
							}), (activeTab === "all" || activeTab === "global") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: McpSkillManager_module_css_default.section,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: McpSkillManager_module_css_default.sectionHeader,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: McpSkillManager_module_css_default.sectionTitle,
											children: "🌐 全局级 (Global Level)"
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: { marginTop: "4px" },
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "12px",
												fontWeight: 600,
												color: "var(--dsw-alias-label-secondary, #94a3b8)",
												marginBottom: "8px",
												display: "flex",
												alignItems: "center",
												gap: "6px"
											},
											children: "🔌 全局 MCP 服务 (~/.dsh/cordis.patch.yml)"
										}), filteredGlobalMcps.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: McpSkillManager_module_css_default.emptyState,
											children: "~/.dsh/cordis.patch.yml 中未找到 MCP 配置"
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: McpSkillManager_module_css_default.cardList,
											children: filteredGlobalMcps.map((mcp) => {
												const isToggling = togglingIds.has(mcp.id);
												return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: `${McpSkillManager_module_css_default.itemCard} ${!mcp.enabled ? McpSkillManager_module_css_default.itemCardDisabled : ""}`,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														className: McpSkillManager_module_css_default.itemInfo,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															className: McpSkillManager_module_css_default.itemTitleRow,
															children: [
																/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: McpSkillManager_module_css_default.itemName,
																	children: mcp.serverName
																}),
																/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: `${McpSkillManager_module_css_default.itemBadge} ${McpSkillManager_module_css_default.badgeMcp}`,
																	children: "全局 MCP"
																}),
																/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: `${McpSkillManager_module_css_default.itemBadge} ${mcp.enabled ? McpSkillManager_module_css_default.badgeActive : McpSkillManager_module_css_default.badgeInactive}`,
																	children: mcp.enabled ? "已激活" : "已停用"
																})
															]
														}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															className: McpSkillManager_module_css_default.itemExtra,
															children: [
																"ID: ",
																mcp.id,
																" · 传输: ",
																mcp.transport,
																mcp.command ? ` · 命令: ${mcp.command} ${(mcp.args || []).join(" ")}` : "",
																mcp.url ? ` · URL: ${mcp.url}` : ""
															]
														})]
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														className: McpSkillManager_module_css_default.itemAction,
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
															checked: mcp.enabled,
															loading: isToggling,
															disabled: isToggling,
															ariaLabel: `切换 MCP ${mcp.serverName}`,
															onChange: () => handleToggleMcp(mcp)
														})
													})]
												}, mcp.id);
											})
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: { marginTop: "16px" },
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "12px",
												fontWeight: 600,
												color: "var(--dsw-alias-label-secondary, #94a3b8)",
												marginBottom: "8px",
												display: "flex",
												alignItems: "center",
												gap: "6px"
											},
											children: "⚡ 全局技能 (~/.agents/skills 或 ~/.dsh/skills)"
										}), filteredGlobalSkills.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: McpSkillManager_module_css_default.emptyState,
											children: "未找到全局技能"
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: McpSkillManager_module_css_default.cardList,
											children: filteredGlobalSkills.map((skill) => {
												const isToggling = togglingIds.has(skill.id);
												return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: `${McpSkillManager_module_css_default.itemCard} ${!skill.enabled ? McpSkillManager_module_css_default.itemCardDisabled : ""}`,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														className: McpSkillManager_module_css_default.itemInfo,
														children: [
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																className: McpSkillManager_module_css_default.itemTitleRow,
																children: [
																	/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																		className: McpSkillManager_module_css_default.itemName,
																		children: skill.name
																	}),
																	/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																		className: `${McpSkillManager_module_css_default.itemBadge} ${McpSkillManager_module_css_default.badgeGlobal}`,
																		children: "全局 Skill"
																	}),
																	/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																		className: `${McpSkillManager_module_css_default.itemBadge} ${skill.enabled ? McpSkillManager_module_css_default.badgeActive : McpSkillManager_module_css_default.badgeInactive}`,
																		children: skill.enabled ? "已激活" : "已停用"
																	})
																]
															}),
															skill.description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																className: McpSkillManager_module_css_default.itemDesc,
																children: skill.description
															}) : null,
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																className: McpSkillManager_module_css_default.itemExtra,
																children: ["路径: ", skill.path]
															})
														]
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
														className: McpSkillManager_module_css_default.itemAction,
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
															checked: skill.enabled,
															loading: isToggling,
															disabled: isToggling,
															ariaLabel: `切换技能 ${skill.name}`,
															onChange: () => handleToggleSkill(skill)
														})
													})]
												}, skill.id);
											})
										})]
									})
								]
							})] })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: McpSkillManager_module_css_default.footer,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: McpSkillManager_module_css_default.footerTip,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "💡 停用技能时移动至同级 skill-disable 目录；停用 MCP 则在 cordis.patch.yml 增加 disabled: true" })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: McpSkillManager_module_css_default.closeBtn,
								onClick: onClose,
								children: "完成"
							})]
						})
					]
				})
			});
			if (typeof document === "undefined") return null;
			return (0, react_dom.createPortal)(modalContent, document.body);
		}
		//#endregion
		//#region src/client/McpSkillButton.tsx
		function McpSkillButton({ rpc, sessionId }) {
			const [open, setOpen] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: `${McpSkillManager_module_css_default.inputBtn} ${open ? McpSkillManager_module_css_default.inputBtnActive : ""}`,
				onClick: () => setOpen((prev) => !prev),
				title: "MCP & Skill 管理",
				"aria-label": "MCP & Skill 管理",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					width: "15",
					height: "15",
					viewBox: "0 0 16 16",
					fill: "none",
					xmlns: "http://www.w3.org/2000/svg",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							x: "2",
							y: "2",
							width: "5",
							height: "5",
							rx: "1.5",
							stroke: "currentColor",
							strokeWidth: "1.2"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							x: "9",
							y: "2",
							width: "5",
							height: "5",
							rx: "1.5",
							stroke: "currentColor",
							strokeWidth: "1.2"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							x: "2",
							y: "9",
							width: "5",
							height: "5",
							rx: "1.5",
							stroke: "currentColor",
							strokeWidth: "1.2"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M9 11.5H14M11.5 9V14",
							stroke: "currentColor",
							strokeWidth: "1.2",
							strokeLinecap: "round"
						})
					]
				})
			}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(McpSkillModal, {
				rpc,
				sessionId,
				onClose: () => setOpen(false)
			})] });
		}
		//#endregion
		//#region src/client/index.ts
		const inject = ["slots", "connection"];
		function apply(ctx) {
			ctx.slots.register({
				name: "conversation.input.right",
				id: "mcp-skill-manager-button",
				order: 0,
				inject: (sessionId) => {
					return {
						sessionId,
						rpc: (ctx.connection ?? ctx.get("connection"))?.rpc
					};
				}
			}, McpSkillButton);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map