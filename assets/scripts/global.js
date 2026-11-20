document.documentElement.setAttribute("data-theme", "light");
window.zendeskTranslations = {
	contactSupport: "{{dc 'hc_-_contact_support'}}",
};
document.addEventListener("DOMContentLoaded", () => {
	const hamburgBtn = document.getElementById("hamburger-btn");
	const mobileDrawer = document.getElementById("mobile-drawer");
	const infobars = document.querySelectorAll(".infobar-component");
	const searchInput = document.getElementById("query");
	const copyrightText = document.querySelector(".copyright");
	const askCodee = document.getElementById("ask-codee");

	const currentLocale = window.location.pathname.split("/")[2];

	hamburgBtn.addEventListener("click", () => {
		if (mobileDrawer.classList.contains("hidden")) {
			mobileDrawer.classList.remove("hidden");
			hamburgBtn.classList.add("open");
		} else {
			mobileDrawer.classList.add("hidden");
			hamburgBtn.classList.remove("open");
		}
	});

	// if (searchInput) {
	// 	searchInput.setAttribute("placeholder", searchInput.placeholder);
	// }

	if (copyrightText) {
		copyrightText.innerHTML = `&copy; ${new Date().getFullYear() + " "}`;
	}

	if (infobars) {
		infobars.forEach((bar) => {
			const closeButton = bar.querySelector(".infobar-dismiss");

			if (!closeButton) return;
			closeButton.addEventListener("click", () => {
				bar.classList.add("hidden");
			});
		});
	}

	// The {{search}} helper has no dynamic content placeholder, so copy it in from data-placeholder.
	document.querySelectorAll(".hc-search[data-placeholder]").forEach((wrapper) => {
		const input = wrapper.querySelector('input[type="search"]');
		if (input && wrapper.dataset.placeholder) input.placeholder = wrapper.dataset.placeholder;
	});

	// COUNTS — dynamic content labels carry {placeholders}; fill them with real numbers.
	// On any failure the server-rendered fallback text stays as is.
	const api = `/api/v2/help_center/${currentLocale}`;
	const getJson = (path) =>
		fetch(`${api}/${path}`).then((res) => (res.ok ? res.json() : Promise.reject(res.status)));
	const count = (path) => getJson(`${path}.json?per_page=1`).then((data) => data.count);
	const fill = (label, values) =>
		Object.keys(values).reduce((text, key) => text.split(`{${key}}`).join(values[key]), label);

	// Values the template already knows (a section's article_count, the search query…):
	// every data-* attribute is a placeholder, so data-count fills {count}, data-query fills {query}.
	document.querySelectorAll("[data-label][data-count]").forEach((el) => {
		el.textContent = fill(el.dataset.label, el.dataset);
	});

	// SEARCH RESULTS: topic chips. Uses Zendesk's subfilters when rendered, else one chip per category.
	const searchTopics = document.getElementById("hc-search-topics");
	if (searchTopics) {
		const here = new URL(window.location.href);
		const searchUrl = (categoryId) => {
			const url = new URL(here);
			url.searchParams.delete("page");
			url.searchParams.delete("section");
			if (categoryId) {
				url.searchParams.set("category", categoryId);
				url.searchParams.set("filter_by", "knowledge_base");
			} else {
				url.searchParams.delete("category");
			}
			return url.toString();
		};
		const serverChips = searchTopics.querySelectorAll(".hc-chip:not(#hc-search-all)").length > 0;
		const chips = serverChips
			? Promise.resolve()
			: getJson("categories.json?per_page=100").then(({ categories }) =>
					categories.forEach((cat) => {
						const chip = document.createElement("a");
						chip.className = "hc-chip";
						chip.href = searchUrl(cat.id);
						chip.textContent = cat.name;
						if (here.searchParams.get("category") === String(cat.id)) chip.setAttribute("aria-current", "true");
						searchTopics.append(chip);
					}),
				);
		chips
			.then(() => {
				const all = document.getElementById("hc-search-all");
				all.href = searchUrl(null);
				if (!searchTopics.querySelector('.hc-chip[aria-current="true"]')) all.setAttribute("aria-current", "true");
				if (searchTopics.children.length > 1) searchTopics.classList.replace("hidden", "flex");
			})
			.catch(() => {});
	}

	// Sidebar row: name on the left, article count on the right. textContent keeps API strings inert.
	const countItem = ({ html_url, name, n }, current = false) => {
		const link = document.createElement("a");
		link.href = html_url;
		if (current) link.setAttribute("aria-current", "page");
		const label = document.createElement("span");
		label.textContent = name;
		const number = document.createElement("span");
		number.textContent = n;
		link.append(label, number);
		const item = document.createElement("li");
		item.append(link);
		return item;
	};

	// CATEGORY PAGE
	const categoryStats = document.getElementById("hc-category-stats");
	if (categoryStats && categoryStats.dataset.label) {
		const counts = [...document.querySelectorAll(".hc-section-count")].map((el) => Number(el.dataset.count) || 0);
		categoryStats.textContent = fill(categoryStats.dataset.label, {
			sections: counts.length,
			articles: counts.reduce((sum, n) => sum + n, 0),
		});
	}

	const otherTopics = document.getElementById("hc-other-topics");
	if (otherTopics) {
		getJson("categories.json?per_page=100")
			.then(({ categories }) =>
				Promise.all(categories.map((cat) => count(`categories/${cat.id}/articles`).then((n) => ({ ...cat, n })))),
			)
			.then((categories) => {
				const list = otherTopics.querySelector("ul");
				categories.forEach((cat) => list.append(countItem(cat)));
				otherTopics.classList.remove("hidden");
			})
			.catch(() => {});
	}

	// SECTION PAGE: the template has no category data, so the sidebar comes from the API.
	const siblings = document.getElementById("hc-sibling-sections");
	if (siblings) {
		const sectionId = Number(siblings.dataset.sectionId);
		getJson(`sections/${sectionId}.json`)
			.then(({ section }) =>
				Promise.all([
					getJson(`categories/${section.category_id}.json`),
					getJson(`categories/${section.category_id}/sections.json?per_page=100`),
				]).then(([{ category }, { sections }]) => {
					// Siblings share a parent: top-level sections for a top-level section, else the parent's subsections.
					const peers = sections.filter((s) => s.parent_section_id === section.parent_section_id);
					return Promise.all(peers.map((s) => count(`sections/${s.id}/articles`).then((n) => ({ ...s, n })))).then(
						(withCounts) => ({ category, peers: withCounts }),
					);
				}),
			)
			.then(({ category, peers }) => {
				siblings.firstElementChild.textContent = fill(siblings.dataset.label, { category: category.name });
				const list = siblings.querySelector("ul");
				peers.forEach((s) => list.append(countItem(s, s.id === sectionId)));
				const back = siblings.querySelector("a.hc-see-all");
				back.href = category.html_url;
				back.textContent = fill(siblings.dataset.backLabel, { category: category.name });
				siblings.classList.remove("hidden");
			})
			.catch(() => {});
	}

	// ARTICLE PAGE: "Updated {date} · {minutes} min read", reading time at ~200 words a minute.
	const articleMeta = document.getElementById("hc-article-meta");
	const articleBody = document.querySelector("#hc-article .article-body");
	if (articleMeta && articleMeta.dataset.label && articleBody) {
		const words = articleBody.textContent.trim().split(/\s+/).length;
		articleMeta.textContent = fill(articleMeta.dataset.label, {
			date: articleMeta.textContent.trim(),
			minutes: Math.max(1, Math.round(words / 200)),
		});
	}

	// ARTICLE PAGE: show each image's alt text as a caption below it.
	// Skips images that already have a caption and alt text that is just a file name.
	if (articleBody) {
		articleBody.querySelectorAll("img[alt]").forEach((img) => {
			const alt = img.alt.trim();
			if (!alt || /\.(png|jpe?g|gif|webp|svg)$/i.test(alt) || img.closest("figure")?.querySelector("figcaption")) return;
			// Move a wrapping link along with the image; replace a paragraph that holds only the image.
			const link = img.parentElement.tagName === "A" && img.parentElement.children.length === 1 ? img.parentElement : img;
			const parent = link.parentElement;
			const replace = parent.tagName === "P" && parent.children.length === 1 && !parent.textContent.trim();
			const target = replace ? parent : link;
			const figure = img.closest("figure") || document.createElement("figure");
			if (!figure.isConnected) {
				target.replaceWith(figure);
				figure.append(link);
			}
			const caption = document.createElement("figcaption");
			caption.textContent = alt;
			figure.append(caption);
		});
	}

	// ALL TOPICS (custom page): every category, its top-level sections and their first four articles.
	const topics = document.getElementById("hc-topics");
	if (topics) {
		const articlesLabel = (n) => (topics.dataset.label ? fill(topics.dataset.label, { count: n }) : String(n));
		const fromTemplate = (id) => document.getElementById(id).content.firstElementChild.cloneNode(true);
		const slot = (el, name) => el.querySelector(`[data-slot="${name}"]`);

		Promise.all([getJson("categories.json?per_page=100"), getJson("sections.json?per_page=100")])
			.then(([{ categories }, { sections }]) =>
				Promise.all(
					sections
						.filter((s) => s.parent_section_id == null)
						.map((s) =>
							getJson(`sections/${s.id}/articles.json?per_page=4`).then((data) => ({
								...s,
								articles: data.articles,
								n: data.count,
							})),
						),
				).then((withArticles) => ({ categories, sections: withArticles })),
			)
			.then(({ categories, sections }) => {
				categories.forEach((cat) => {
					const own = sections.filter((s) => s.category_id === cat.id);
					if (!own.length) return;

					const block = fromTemplate("hc-topic-template");
					slot(block, "name").href = cat.html_url;
					slot(block, "name").textContent = cat.name;
					slot(block, "count").href = cat.html_url;
					slot(block, "count").textContent = articlesLabel(own.reduce((sum, s) => sum + s.n, 0));

					own.forEach((sec) => {
						const column = fromTemplate("hc-topic-section-template");
						slot(column, "name").href = sec.html_url;
						slot(column, "name").textContent = sec.name;
						slot(column, "count").textContent = articlesLabel(sec.n);
						sec.articles.forEach((article) => {
							const link = document.createElement("a");
							link.className = "hc-row hc-row--sm";
							link.href = article.html_url;
							const title = document.createElement("span");
							title.textContent = article.title;
							const arrow = document.createElement("i");
							arrow.className = "ph ph-arrow-right";
							link.append(title, arrow);
							const item = document.createElement("li");
							item.append(link);
							slot(column, "articles").append(item);
						});
						slot(block, "sections").append(column);
					});
					topics.append(block);
				});
			})
			.catch(() => {});
	}

	// ERROR PAGE: up to three promoted articles under "Most read articles"; stays hidden if there are none.
	const errorArticles = document.getElementById("hc-error-articles");
	if (errorArticles) {
		getJson("articles.json?per_page=100")
			.then(({ articles }) => {
				const promoted = articles.filter((a) => a.promoted).slice(0, 3);
				const row = errorArticles.querySelector("template");
				promoted.forEach((article) => {
					const item = row.content.firstElementChild.cloneNode(true);
					item.querySelector("a").href = article.html_url;
					item.querySelector("span").textContent = article.title;
					errorArticles.querySelector("ul").append(item);
				});
				if (promoted.length) errorArticles.classList.remove("hidden");
			})
			.catch(() => {});
	}

	// HOMEPAGE
	const seeAllLinks = document.querySelectorAll(".hc-see-all[data-category-id]");
	const stats = document.getElementById("hc-stats");

	if (seeAllLinks.length || stats) {
		seeAllLinks.forEach((link) => {
			if (!link.dataset.label) return;
			count(`categories/${link.dataset.categoryId}/articles`)
				.then((n) => {
					link.textContent = fill(link.dataset.label, { count: n });
				})
				.catch(() => {});
		});

		if (stats && stats.dataset.label) {
			Promise.all([count("categories"), count("sections"), count("articles")])
				.then(([topics, sections, articles]) => {
					stats.textContent = fill(stats.dataset.label, { topics, sections, articles });
				})
				.catch(() => {});
		}
	}

	// FORMS
	const inquirySelect = document.getElementById(
		"request_custom_fields_10519906052751",
	);
	const warningText = document.getElementById("ingame-warning");
	const submitButton = document.querySelector(
		'input[type="submit"][name="commit"]',
	);

	if (inquirySelect) {
		inquirySelect.addEventListener("change", () => {
			if (
				inquirySelect.value === "inquiry_type_cc_in-game_inquiry_" ||
				inquirySelect.value === "inquiry_type_cc_in-game_txn_"
			) {
				submitButton.disabled = true;
				warningText.classList.remove("hidden");
			} else {
				submitButton.disabled = false;
				warningText.classList.add("hidden");
			}
		});
	}
});
