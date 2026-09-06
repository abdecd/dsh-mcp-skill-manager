window.__ModuleLoader__.load({
	id: "dsh-mcp-skill-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/run/media/user1/78E6859DE6855BEE/code/js/dsh-mcp-skill-manager/src/client/McpSkillManager.module.css.mjs
		const css = ".VlMPOq_popoverMenu{background:var(--dsw-specific-menu,#1e1e24);width:320px;max-width:min(360px,92vw);max-height:min(440px,72vh);color:var(--dsw-alias-label-primary,#e2e8f0);border:1px solid var(--dsw-alias-border-l1,#ffffff1f);box-shadow:var(--dsw-elevation-prominent,0 16px 36px #00000080);z-index:1000;box-sizing:border-box;border-radius:14px;flex-direction:column;animation:.12s cubic-bezier(.16,1,.3,1) VlMPOq_popoverFadeIn;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden}@keyframes VlMPOq_popoverFadeIn{0%{opacity:0;transform:translateY(6px)scale(.98)}to{opacity:1;transform:translateY(0)scale(1)}}.VlMPOq_header{border-bottom:1px solid var(--dsw-alias-border-l2,#ffffff14);background:var(--dsw-alias-bg-secondary,#ffffff05);flex:none;justify-content:space-between;align-items:center;padding:8px 12px 6px;display:flex}.VlMPOq_titleArea{align-items:center;gap:6px;display:flex}.VlMPOq_title{color:var(--dsw-alias-label-primary,#fff);margin:0;font-size:13px;font-weight:600}.VlMPOq_headerActions{align-items:center;gap:2px;display:flex}.VlMPOq_iconBtn{color:var(--dsw-alias-label-secondary,#94a3b8);cursor:pointer;background:0 0;border:none;border-radius:5px;justify-content:center;align-items:center;width:22px;height:22px;padding:0;transition:all .12s;display:flex}.VlMPOq_iconBtn:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff14);color:var(--dsw-alias-label-primary,#fff)}.VlMPOq_filterBar{border-bottom:1px solid var(--dsw-alias-border-l2,#ffffff0f);flex-direction:column;flex:none;gap:6px;padding:6px 10px;display:flex}.VlMPOq_searchInput{box-sizing:border-box;background:var(--dsw-alias-bg-tertiary,#ffffff0d);border:1px solid var(--dsw-alias-border-l2,#ffffff1a);width:100%;color:var(--dsw-alias-label-primary,#fff);border-radius:6px;outline:none;padding:4px 8px;font-size:11.5px;transition:border-color .15s}.VlMPOq_searchInput:focus{border-color:var(--dsw-alias-state-business-primary,#3b82f6)}.VlMPOq_searchInput::placeholder{color:var(--dsw-alias-label-tertiary,#64748b)}.VlMPOq_tabs{background:var(--dsw-alias-bg-tertiary,#ffffff0d);border-radius:5px;gap:2px;padding:2px;display:flex}.VlMPOq_tabBtn{color:var(--dsw-alias-label-secondary,#94a3b8);cursor:pointer;text-align:center;background:0 0;border:none;border-radius:4px;flex:1;padding:2px 4px;font-size:10.5px;font-weight:500;transition:all .12s}.VlMPOq_tabBtn:hover{color:var(--dsw-alias-label-primary,#fff)}.VlMPOq_tabBtnActive{background:var(--dsw-alias-interactive-bg-hover-solid,#ffffff24);font-weight:600;color:#fff!important}.VlMPOq_listContainer{flex-direction:column;flex:1;min-height:0;padding:4px 6px 8px;display:flex;overflow-y:auto}.VlMPOq_listContainer::-webkit-scrollbar{width:4px}.VlMPOq_listContainer::-webkit-scrollbar-thumb{background:#ffffff26;border-radius:999px}.VlMPOq_listContainer::-webkit-scrollbar-thumb:hover{background:#ffffff40}.VlMPOq_cardList{flex-direction:column;gap:2px;display:flex}.VlMPOq_itemCard{box-sizing:border-box;background:0 0;border:1px solid #0000;border-radius:6px;justify-content:space-between;align-items:center;gap:6px;width:100%;padding:4px 6px;transition:all .12s;display:flex}.VlMPOq_itemCard:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff0d);border-color:var(--dsw-alias-border-l2,#ffffff0f)}.VlMPOq_itemCardDisabled{opacity:.55}.VlMPOq_itemCardDisabled:hover{opacity:.8}.VlMPOq_itemInfo{flex-direction:column;flex:1;gap:1px;min-width:0;display:flex}.VlMPOq_itemTitleRow{align-items:center;gap:5px;display:flex}.VlMPOq_itemName{color:var(--dsw-alias-label-primary,#fff);text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;overflow:hidden}.VlMPOq_itemBadge{border-radius:3px;flex:none;padding:0 4px;font-size:9.5px;font-weight:500;line-height:14px}.VlMPOq_badgeProject{color:#60a5fa;background:#3b82f626}.VlMPOq_badgeGlobal{color:#c084fc;background:#a855f726}.VlMPOq_badgeMcp{color:#fbbf24;background:#f59e0b26}.VlMPOq_badgeActive{color:#4ade80;background:#22c55e26}.VlMPOq_badgeInactive{color:#94a3b8;background:#94a3b826}.VlMPOq_itemDesc{color:var(--dsw-alias-label-secondary,#94a3b8);text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;line-height:14px;overflow:hidden}.VlMPOq_itemAction{flex:none;align-items:center;display:flex}.VlMPOq_switchTrack{cursor:pointer;background:#ffffff2e;border:1px solid #0000;border-radius:999px;width:28px;height:16px;transition:background-color .2s cubic-bezier(.16,1,.3,1);position:relative}.VlMPOq_switchTrackChecked{background:var(--dsw-alias-state-business-primary,#3b82f6)}.VlMPOq_switchTrackDisabled{cursor:not-allowed;opacity:.5}.VlMPOq_switchThumb{background:#fff;border-radius:50%;width:12px;height:12px;transition:transform .2s cubic-bezier(.16,1,.3,1);position:absolute;top:1px;left:2px;box-shadow:0 1px 2px #0000004d}.VlMPOq_switchThumbChecked{transform:translate(12px)}.VlMPOq_loadingSpinner{border:1.5px solid #ffffff4d;border-top-color:#fff;border-radius:50%;width:8px;height:8px;animation:.6s linear infinite VlMPOq_spin}@keyframes VlMPOq_spin{to{transform:rotate(360deg)}}.VlMPOq_emptyState{text-align:center;color:var(--dsw-alias-label-tertiary,#64748b);padding:16px 10px;font-size:12px}";
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
			"switchTrack": "VlMPOq_switchTrack",
			"popoverMenu": "VlMPOq_popoverMenu",
			"tabs": "VlMPOq_tabs",
			"tabBtnActive": "VlMPOq_tabBtnActive",
			"itemCardDisabled": "VlMPOq_itemCardDisabled",
			"itemAction": "VlMPOq_itemAction",
			"header": "VlMPOq_header",
			"title": "VlMPOq_title",
			"itemInfo": "VlMPOq_itemInfo",
			"itemTitleRow": "VlMPOq_itemTitleRow",
			"badgeProject": "VlMPOq_badgeProject",
			"tabBtn": "VlMPOq_tabBtn",
			"switchTrackChecked": "VlMPOq_switchTrackChecked",
			"headerActions": "VlMPOq_headerActions",
			"switchTrackDisabled": "VlMPOq_switchTrackDisabled",
			"titleArea": "VlMPOq_titleArea",
			"filterBar": "VlMPOq_filterBar",
			"switchThumb": "VlMPOq_switchThumb",
			"spin": "VlMPOq_spin",
			"emptyState": "VlMPOq_emptyState",
			"cardList": "VlMPOq_cardList",
			"itemCard": "VlMPOq_itemCard",
			"badgeMcp": "VlMPOq_badgeMcp",
			"switchThumbChecked": "VlMPOq_switchThumbChecked",
			"badgeGlobal": "VlMPOq_badgeGlobal",
			"badgeActive": "VlMPOq_badgeActive",
			"badgeInactive": "VlMPOq_badgeInactive",
			"searchInput": "VlMPOq_searchInput",
			"loadingSpinner": "VlMPOq_loadingSpinner",
			"itemName": "VlMPOq_itemName",
			"itemBadge": "VlMPOq_itemBadge",
			"iconBtn": "VlMPOq_iconBtn",
			"popoverFadeIn": "VlMPOq_popoverFadeIn",
			"listContainer": "VlMPOq_listContainer"
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
		//#region src/client/McpSkillPopover.tsx
		function McpSkillPopover({ rpc, sessionId, onClose }) {
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
			const visibleItems = (0, react.useMemo)(() => {
				const list = [];
				if (activeTab === "all" || activeTab === "project") for (const skill of filteredProjectSkills) list.push({
					type: "skill",
					item: skill
				});
				if (activeTab === "all" || activeTab === "global") {
					for (const mcp of filteredGlobalMcps) list.push({
						type: "mcp",
						item: mcp
					});
					for (const skill of filteredGlobalSkills) list.push({
						type: "skill",
						item: skill
					});
				}
				return list;
			}, [
				activeTab,
				filteredProjectSkills,
				filteredGlobalMcps,
				filteredGlobalSkills
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: McpSkillManager_module_css_default.popoverMenu,
				onClick: (e) => e.stopPropagation(),
				onMouseDown: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: McpSkillManager_module_css_default.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: McpSkillManager_module_css_default.titleArea,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
								className: McpSkillManager_module_css_default.title,
								children: "MCP & Skills"
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: McpSkillManager_module_css_default.headerActions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: McpSkillManager_module_css_default.iconBtn,
								onClick: loadData,
								title: "刷新",
								"aria-label": "刷新",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
									width: "13",
									height: "13",
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
									width: "13",
									height: "13",
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
							placeholder: "搜索技能或 MCP 服务...",
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
										"项目 (",
										projectCount,
										")"
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `${McpSkillManager_module_css_default.tabBtn} ${activeTab === "global" ? McpSkillManager_module_css_default.tabBtnActive : ""}`,
									onClick: () => setActiveTab("global"),
									children: [
										"全局 (",
										globalSkillCount + globalMcpCount,
										")"
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: McpSkillManager_module_css_default.listContainer,
						children: loading && !data ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: McpSkillManager_module_css_default.emptyState,
							children: "加载中..."
						}) : error ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: McpSkillManager_module_css_default.emptyState,
							style: { color: "#ef4444" },
							children: ["加载失败: ", error]
						}) : visibleItems.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: McpSkillManager_module_css_default.emptyState,
							children: searchQuery ? "无匹配结果" : "暂无相关项"
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: McpSkillManager_module_css_default.cardList,
							children: visibleItems.map((entry) => {
								if (entry.type === "skill") {
									const skill = entry.item;
									const isToggling = togglingIds.has(skill.id);
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: `${McpSkillManager_module_css_default.itemCard} ${!skill.enabled ? McpSkillManager_module_css_default.itemCardDisabled : ""}`,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: McpSkillManager_module_css_default.itemInfo,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: McpSkillManager_module_css_default.itemTitleRow,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: McpSkillManager_module_css_default.itemName,
														title: skill.name,
														children: skill.name
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: `${McpSkillManager_module_css_default.itemBadge} ${skill.scope === "project" ? McpSkillManager_module_css_default.badgeProject : McpSkillManager_module_css_default.badgeGlobal}`,
														children: skill.scope === "project" ? "项目" : "全局"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: `${McpSkillManager_module_css_default.itemBadge} ${skill.enabled ? McpSkillManager_module_css_default.badgeActive : McpSkillManager_module_css_default.badgeInactive}`,
														children: skill.enabled ? "已激活" : "已停用"
													})
												]
											}), skill.description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: McpSkillManager_module_css_default.itemDesc,
												title: skill.description,
												children: skill.description
											}) : null]
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
								} else {
									const mcp = entry.item;
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
														title: mcp.serverName,
														children: mcp.serverName
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: `${McpSkillManager_module_css_default.itemBadge} ${McpSkillManager_module_css_default.badgeMcp}`,
														children: "MCP"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: `${McpSkillManager_module_css_default.itemBadge} ${mcp.enabled ? McpSkillManager_module_css_default.badgeActive : McpSkillManager_module_css_default.badgeInactive}`,
														children: mcp.enabled ? "已激活" : "已停用"
													})
												]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: McpSkillManager_module_css_default.itemDesc,
												title: (mcp.command ? `${mcp.command} ${(mcp.args || []).join(" ")}` : "") || mcp.url || mcp.transport,
												children: [
													mcp.transport,
													mcp.command ? ` · ${mcp.command} ${(mcp.args || []).join(" ")}` : "",
													mcp.url ? ` · ${mcp.url}` : ""
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
								}
							})
						})
					})
				]
			});
		}
		//#endregion
		//#region src/client/McpSkillButton.tsx
		function McpSkillButton({ rpc, sessionId }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [hovered, setHovered] = (0, react.useState)(false);
			const rootRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!open) return;
				const handleClickOutside = (e) => {
					if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
				};
				const handleKeyDown = (e) => {
					if (e.key === "Escape") setOpen(false);
				};
				document.addEventListener("mousedown", handleClickOutside);
				document.addEventListener("keydown", handleKeyDown);
				return () => {
					document.removeEventListener("mousedown", handleClickOutside);
					document.removeEventListener("keydown", handleKeyDown);
				};
			}, [open]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				ref: rootRef,
				onMouseEnter: () => setHovered(true),
				onMouseLeave: () => setHovered(false),
				style: {
					display: "inline-flex",
					position: "relative",
					width: 30,
					height: 30,
					alignItems: "center",
					justifyContent: "center"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "MCP & Skills 管理",
					"aria-haspopup": "true",
					"aria-expanded": open,
					onClick: () => setOpen((prev) => !prev),
					style: {
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						width: 30,
						height: 30,
						padding: 0,
						border: 0,
						borderRadius: 8,
						background: open ? "var(--dsw-alias-interactive-bg-hover-solid, rgba(255, 255, 255, 0.16))" : hovered ? "var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.08))" : "transparent",
						color: open ? "var(--dsw-alias-state-business-primary, #3b82f6)" : hovered ? "var(--dsw-alias-label-primary, #ffffff)" : "var(--dsw-alias-label-secondary, #94a3b8)",
						cursor: "pointer",
						transition: "all 0.15s ease"
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
						width: "16",
						height: "16",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.8",
						strokeLinecap: "round",
						strokeLinejoin: "round",
						"aria-hidden": "true",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
								x: "3",
								y: "3",
								width: "7",
								height: "7",
								rx: "1.5"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
								x: "14",
								y: "3",
								width: "7",
								height: "7",
								rx: "1.5"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
								x: "3",
								y: "14",
								width: "7",
								height: "7",
								rx: "1.5"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14 17.5h7M17.5 14v7" })
						]
					})
				}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(McpSkillPopover, {
					rpc,
					sessionId,
					onClose: () => setOpen(false)
				})]
			});
		}
		//#endregion
		//#region src/client/index.ts
		const name = "dsh-mcp-skill-manager-client";
		const inject = ["slots", "connection"];
		function apply(ctx) {
			ctx.inject(["slots", "modelDirectories"], (scope) => {
				scope.slots.inject("conversation.input.right", () => scope.slots.register({
					name: "conversation.input.right",
					id: "mcp-skill-manager-button",
					order: 0,
					inject: (sessionId) => {
						return {
							sessionId,
							rpc: (scope.connection ?? ctx.connection ?? scope.get("connection") ?? ctx.get("connection"))?.rpc
						};
					}
				}, McpSkillButton));
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map