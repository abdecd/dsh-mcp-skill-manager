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
		const css = ".VlMPOq_popoverMenu{background:var(--dsw-specific-menu,#1e1e24);width:340px;max-width:min(380px,92vw);max-height:min(460px,72vh);color:var(--dsw-alias-label-primary,#e2e8f0);border:1px solid var(--dsw-alias-border-l1,#ffffff1f);box-shadow:var(--dsw-elevation-prominent,0 16px 36px #00000080);z-index:1100;box-sizing:border-box;border-radius:14px;flex-direction:column;min-height:300px;animation:.12s cubic-bezier(.16,1,.3,1) VlMPOq_popoverFadeIn;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden}@media (width<=600px){.VlMPOq_popoverMenu{width:min(340px,100vw - 24px);max-width:calc(100vw - 24px);min-height:min(300px,100dvh - 24px);max-height:min(460px,100dvh - 24px)}}@keyframes VlMPOq_popoverFadeIn{0%{opacity:0;transform:translateY(6px)scale(.98)}to{opacity:1;transform:translateY(0)scale(1)}}.VlMPOq_header{border-bottom:1px solid var(--dsw-alias-border-l2,#ffffff14);background:var(--dsw-alias-bg-secondary,#ffffff05);flex:none;justify-content:space-between;align-items:center;padding:8px 12px 6px;display:flex}.VlMPOq_titleArea{align-items:center;gap:6px;display:flex}.VlMPOq_title{color:var(--dsw-alias-label-primary,inherit);margin:0;font-size:13px;font-weight:600}.VlMPOq_headerActions{align-items:center;gap:2px;display:flex}.VlMPOq_iconBtn{color:var(--dsw-alias-label-secondary,#94a3b8);cursor:pointer;background:0 0;border:none;border-radius:5px;justify-content:center;align-items:center;width:22px;height:22px;padding:0;transition:all .12s;display:flex}.VlMPOq_iconBtn:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff14);color:var(--dsw-alias-label-primary,inherit)}.VlMPOq_filterBar{border-bottom:1px solid var(--dsw-alias-border-l2,#ffffff0f);flex-direction:column;flex:none;gap:6px;padding:6px 10px;display:flex}.VlMPOq_searchInput{box-sizing:border-box;background:var(--dsw-alias-bg-tertiary,#ffffff0d);border:1px solid var(--dsw-alias-border-l2,#ffffff1a);width:100%;color:var(--dsw-alias-label-primary,inherit);border-radius:6px;outline:none;padding:4px 8px;font-size:11.5px;transition:border-color .15s}.VlMPOq_searchInput:focus{border-color:var(--dsw-alias-state-business-primary,#3b82f6)}.VlMPOq_searchInput::placeholder{color:var(--dsw-alias-label-tertiary,#64748b)}.VlMPOq_tabs{background:var(--dsw-alias-bg-tertiary,#ffffff0d);border-radius:5px;gap:2px;padding:2px;display:flex}.VlMPOq_tabBtn{color:var(--dsw-alias-label-secondary,#94a3b8);cursor:pointer;text-align:center;background:0 0;border:none;border-radius:4px;flex:1;padding:2px 4px;font-size:10.5px;font-weight:500;transition:all .12s}.VlMPOq_tabBtn:hover{color:var(--dsw-alias-label-primary,inherit)}.VlMPOq_tabBtnActive{background:var(--dsw-alias-interactive-bg-hover-solid,#ffffff24);font-weight:600;color:var(--dsw-alias-label-primary,inherit)!important}.VlMPOq_listContainer{flex-direction:column;flex:1;min-height:0;padding:4px 6px 8px;display:flex;overflow-y:auto}.VlMPOq_listContainer::-webkit-scrollbar{width:4px}.VlMPOq_listContainer::-webkit-scrollbar-thumb{background:#ffffff26;border-radius:999px}.VlMPOq_listContainer::-webkit-scrollbar-thumb:hover{background:#ffffff40}.VlMPOq_cardList{flex-direction:column;gap:2px;display:flex}.VlMPOq_itemCard{box-sizing:border-box;cursor:pointer;user-select:none;background:0 0;border:1px solid #0000;border-radius:6px;justify-content:space-between;align-items:center;gap:8px;width:100%;padding:6px 8px;transition:all .12s;display:flex}.VlMPOq_itemCard:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff0d);border-color:var(--dsw-alias-border-l2,#ffffff0f)}.VlMPOq_itemCardDisabled{opacity:.65}.VlMPOq_itemCardDisabled:hover{opacity:.85}.VlMPOq_itemInfo{flex-direction:column;flex:1;justify-content:center;gap:2px;min-width:0;display:flex}.VlMPOq_itemTitleRow{align-items:center;gap:5px;display:flex}.VlMPOq_itemName{color:var(--dsw-alias-label-primary,inherit);text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;font-weight:500;overflow:hidden}.VlMPOq_itemBadge{border-radius:4px;flex:none;padding:0 5px;font-size:9.5px;font-weight:500;line-height:15px}.VlMPOq_badgeSkill{color:#10b981;background:#10b98124;border:1px solid #10b98147}.VlMPOq_badgeMcp{color:#f59e0b;background:#f59e0b24;border:1px solid #f59e0b47}.VlMPOq_badgeProject{color:#60a5fa;background:#3b82f624;border:1px solid #3b82f647}.VlMPOq_badgeGlobal{color:#c084fc;background:#a855f724;border:1px solid #a855f747}.VlMPOq_itemDesc{color:var(--dsw-alias-label-secondary,#94a3b8);text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:15px;overflow:hidden}.VlMPOq_itemAction{flex:none;justify-content:center;align-self:center;align-items:center;padding-left:4px;display:flex}.VlMPOq_switchTrack{background:var(--dsw-alias-border-l3,#8c8c8c4d);border:1px solid var(--dsw-alias-border-l2,#8c8c8c66);cursor:pointer;box-sizing:border-box;border-radius:999px;flex:none;align-items:center;width:32px;height:18px;padding:0 2px;transition:all .2s cubic-bezier(.16,1,.3,1);display:flex;position:relative}.VlMPOq_switchTrackChecked{background:var(--dsw-alias-state-business-primary,#3b82f6);border-color:var(--dsw-alias-state-business-primary,#3b82f6)}.VlMPOq_switchTrackDisabled{cursor:not-allowed;opacity:.5}.VlMPOq_switchThumb{background:#fff;border-radius:50%;flex:none;width:12px;height:12px;transition:transform .2s cubic-bezier(.16,1,.3,1);transform:translate(0);box-shadow:0 1px 3px #0000004d}.VlMPOq_switchThumbChecked{transform:translate(14px)}.VlMPOq_loadingSpinner{border:1.5px solid #ffffff4d;border-top-color:#fff;border-radius:50%;width:8px;height:8px;animation:.6s linear infinite VlMPOq_spin}@keyframes VlMPOq_spin{to{transform:rotate(360deg)}}.VlMPOq_emptyState{text-align:center;color:var(--dsw-alias-label-tertiary,#64748b);padding:16px 10px;font-size:12px}";
		const tagId = "dsh-mcp-skill-manager/McpSkillManager.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mcp-skill-manager";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var McpSkillManager_module_css_default = {
			"tabBtn": "VlMPOq_tabBtn",
			"badgeSkill": "VlMPOq_badgeSkill",
			"spin": "VlMPOq_spin",
			"badgeMcp": "VlMPOq_badgeMcp",
			"cardList": "VlMPOq_cardList",
			"filterBar": "VlMPOq_filterBar",
			"itemName": "VlMPOq_itemName",
			"tabs": "VlMPOq_tabs",
			"itemBadge": "VlMPOq_itemBadge",
			"iconBtn": "VlMPOq_iconBtn",
			"badgeGlobal": "VlMPOq_badgeGlobal",
			"badgeProject": "VlMPOq_badgeProject",
			"loadingSpinner": "VlMPOq_loadingSpinner",
			"emptyState": "VlMPOq_emptyState",
			"titleArea": "VlMPOq_titleArea",
			"headerActions": "VlMPOq_headerActions",
			"itemTitleRow": "VlMPOq_itemTitleRow",
			"switchThumb": "VlMPOq_switchThumb",
			"itemCard": "VlMPOq_itemCard",
			"popoverMenu": "VlMPOq_popoverMenu",
			"searchInput": "VlMPOq_searchInput",
			"itemInfo": "VlMPOq_itemInfo",
			"itemDesc": "VlMPOq_itemDesc",
			"switchTrackChecked": "VlMPOq_switchTrackChecked",
			"switchTrackDisabled": "VlMPOq_switchTrackDisabled",
			"tabBtnActive": "VlMPOq_tabBtnActive",
			"listContainer": "VlMPOq_listContainer",
			"popoverFadeIn": "VlMPOq_popoverFadeIn",
			"itemAction": "VlMPOq_itemAction",
			"switchTrack": "VlMPOq_switchTrack",
			"title": "VlMPOq_title",
			"itemCardDisabled": "VlMPOq_itemCardDisabled",
			"header": "VlMPOq_header",
			"switchThumbChecked": "VlMPOq_switchThumbChecked"
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
		const VIEWPORT_MARGIN = 12;
		const POPOVER_GAP = 8;
		function clamp(value, min, max) {
			return Math.min(Math.max(value, min), max);
		}
		function McpSkillPopover({ rpc, sessionId, onClose, anchorRef, popoverRef, portal = false }) {
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
			const menuRef = (0, react.useRef)(null);
			const [portalPosition, setPortalPosition] = (0, react.useState)(null);
			(0, react.useLayoutEffect)(() => {
				if (!portal) {
					setPortalPosition(null);
					return;
				}
				const updatePosition = () => {
					const anchor = anchorRef?.current?.getBoundingClientRect();
					const menu = menuRef.current;
					if (!anchor || !menu) return;
					const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
					const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
					const menuWidth = menu.offsetWidth || 340;
					const computedMinHeight = Number.parseFloat(window.getComputedStyle(menu).minHeight) || 0;
					const minLeft = VIEWPORT_MARGIN;
					const maxLeft = Math.max(minLeft, viewportWidth - menuWidth - VIEWPORT_MARGIN);
					const left = clamp(anchor.right - menuWidth, minLeft, maxLeft);
					const spaceAbove = Math.max(0, anchor.top - POPOVER_GAP - VIEWPORT_MARGIN);
					const spaceBelow = Math.max(0, viewportHeight - anchor.bottom - POPOVER_GAP - VIEWPORT_MARGIN);
					const openAbove = spaceAbove >= spaceBelow;
					const maxHeight = Math.max(100, Math.min(460, openAbove ? spaceAbove : spaceBelow));
					const minHeight = Math.min(computedMinHeight || 280, maxHeight);
					let top = "auto";
					let bottom = "auto";
					if (openAbove) {
						bottom = Math.max(VIEWPORT_MARGIN, viewportHeight - anchor.top + POPOVER_GAP);
						top = "auto";
					} else {
						top = Math.max(VIEWPORT_MARGIN, anchor.bottom + POPOVER_GAP);
						bottom = "auto";
					}
					setPortalPosition((previous) => {
						if (previous && previous.left === left && previous.top === top && previous.bottom === bottom && previous.maxHeight === maxHeight && previous.minHeight === minHeight) return previous;
						return {
							left,
							top,
							bottom,
							maxHeight,
							minHeight
						};
					});
				};
				updatePosition();
				window.addEventListener("resize", updatePosition);
				window.addEventListener("scroll", updatePosition, true);
				const viewport = window.visualViewport;
				viewport?.addEventListener("resize", updatePosition);
				viewport?.addEventListener("scroll", updatePosition);
				const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updatePosition);
				if (resizeObserver) {
					const anchorElement = anchorRef?.current;
					if (anchorElement) {
						resizeObserver.observe(anchorElement);
						if (anchorElement.parentElement) resizeObserver.observe(anchorElement.parentElement);
					}
					if (menuRef.current) resizeObserver.observe(menuRef.current);
				}
				return () => {
					window.removeEventListener("resize", updatePosition);
					window.removeEventListener("scroll", updatePosition, true);
					viewport?.removeEventListener("resize", updatePosition);
					viewport?.removeEventListener("scroll", updatePosition);
					resizeObserver?.disconnect();
				};
			}, [
				anchorRef,
				portal,
				data,
				loading,
				error,
				searchQuery,
				activeTab
			]);
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
			const handleOpenFolder = async (targetPath) => {
				if (!targetPath) return;
				try {
					await rpc.call("/mcp-skill-manager", "open-folder", { path: targetPath });
				} catch (err) {
					console.warn("[dsh-mcp-skill-manager] 打开文件夹失败:", err);
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
				const enabled = [];
				const disabled = [];
				for (const entry of list) if (entry.item.enabled) enabled.push(entry);
				else disabled.push(entry);
				return [...enabled, ...disabled];
			}, [
				activeTab,
				filteredProjectSkills,
				filteredGlobalMcps,
				filteredGlobalSkills
			]);
			const menuStyle = portal ? {
				position: "fixed",
				left: portalPosition ? `${portalPosition.left}px` : 0,
				top: portalPosition?.top !== void 0 && portalPosition.top !== "auto" ? `${portalPosition.top}px` : "auto",
				bottom: portalPosition?.bottom !== void 0 && portalPosition.bottom !== "auto" ? `${portalPosition.bottom}px` : "auto",
				right: "auto",
				minHeight: portalPosition ? `${portalPosition.minHeight}px` : void 0,
				maxHeight: portalPosition ? `${portalPosition.maxHeight}px` : void 0,
				visibility: portalPosition ? "visible" : "hidden"
			} : void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: (node) => {
					menuRef.current = node;
					if (popoverRef) popoverRef.current = node;
				},
				className: McpSkillManager_module_css_default.popoverMenu,
				style: menuStyle,
				onClick: (e) => e.stopPropagation(),
				onMouseDown: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
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
										onClick: () => handleOpenFolder(skill.path),
										title: `点击打开对应文件夹:\n${skill.path}`,
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
														className: `${McpSkillManager_module_css_default.itemBadge} ${McpSkillManager_module_css_default.badgeSkill}`,
														children: "Skill"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: `${McpSkillManager_module_css_default.itemBadge} ${skill.scope === "project" ? McpSkillManager_module_css_default.badgeProject : McpSkillManager_module_css_default.badgeGlobal}`,
														children: skill.scope === "project" ? "项目" : "全局"
													})
												]
											}), skill.description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: McpSkillManager_module_css_default.itemDesc,
												title: skill.description,
												children: skill.description
											}) : null]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: McpSkillManager_module_css_default.itemAction,
											onClick: (e) => e.stopPropagation(),
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
										onClick: () => handleOpenFolder(mcp.configPath || void 0),
										title: `点击打开配置文件所在目录:\n${mcp.configPath || "~/.dsh/cordis.patch.yml"}`,
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
														className: `${McpSkillManager_module_css_default.itemBadge} ${McpSkillManager_module_css_default.badgeGlobal}`,
														children: "全局"
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
											onClick: (e) => e.stopPropagation(),
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
			const popoverRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!open) return;
				const handlePointerDown = (e) => {
					const target = e.target;
					if (target && (rootRef.current?.contains(target) || popoverRef.current?.contains(target))) return;
					setOpen(false);
				};
				const handleKeyDown = (e) => {
					if (e.key === "Escape") setOpen(false);
				};
				document.addEventListener("pointerdown", handlePointerDown);
				document.addEventListener("keydown", handleKeyDown);
				return () => {
					document.removeEventListener("pointerdown", handlePointerDown);
					document.removeEventListener("keydown", handleKeyDown);
				};
			}, [open]);
			const popover = open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(McpSkillPopover, {
				rpc,
				sessionId,
				onClose: () => setOpen(false),
				anchorRef: rootRef,
				popoverRef,
				portal: true
			}) : null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				ref: rootRef,
				onMouseEnter: () => setHovered(true),
				onMouseLeave: () => setHovered(false),
				style: {
					display: "inline-flex",
					position: "relative",
					flex: "0 0 30px",
					width: 30,
					minWidth: 30,
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
				}), typeof document === "undefined" ? popover : popover && (0, react_dom.createPortal)(popover, document.body)]
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