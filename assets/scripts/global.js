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

	// Counts the template already knows (e.g. a section's article_count)
	document.querySelectorAll("[data-label][data-count]").forEach((el) => {
		el.textContent = fill(el.dataset.label, { count: el.dataset.count });
	});

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
				categories.forEach((cat) => {
					const link = document.createElement("a");
					link.href = cat.html_url;
					const name = document.createElement("span");
					name.textContent = cat.name;
					const n = document.createElement("span");
					n.textContent = cat.n;
					link.append(name, n);
					const item = document.createElement("li");
					item.append(link);
					list.append(item);
				});
				otherTopics.classList.remove("hidden");
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
