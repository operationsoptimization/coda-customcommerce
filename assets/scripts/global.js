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

	// SEARCH RESULTS: "All topics" chip = the current search minus the category filter.
	const searchAll = document.getElementById("hc-search-all");
	if (searchAll) {
		const url = new URL(window.location.href);
		["category", "section", "page"].forEach((param) => url.searchParams.delete(param));
		searchAll.href = url.toString();
		if (!document.querySelector('.hc-chip[aria-current="true"]')) searchAll.setAttribute("aria-current", "true");
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
