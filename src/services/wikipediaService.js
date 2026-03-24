import axios from "axios";

/**
 * Fetch thumbnail image for a Wikipedia article.
 */
export const getArticleImage = async (title, lang = 'ar') => {
    try {
        const response = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
            params: {
                action: "query",
                titles: title,
                prop: "pageimages",
                pithumbsize: 200,
                format: "json",
                origin: "*"
            }
        });
        const pages = response.data?.query?.pages;
        if (!pages) return null;
        const pageId = Object.keys(pages)[0];
        if (pages[pageId]?.thumbnail?.source) {
            return pages[pageId].thumbnail.source;
        }
        return null;
    } catch (e) {
        console.error("Error fetching article image:", e);
        return null;
    }
};

/**
 * Fetch a random Wikipedia article title.
 */
export const getRandomArticle = async () => {
    try {
        const response = await axios.get(API_BASE, {
            params: {
                action: "query",
                list: "random",
                rnnamespace: 0,
                rnlimit: 1,
                format: "json",
                origin: "*",
            },
        });
        const randomTitle = response.data.query.random[0].title;
        return randomTitle;
    } catch (error) {
        console.error("Error fetching random article:", error);
        throw error;
    }
};

/**
 * Fetch the HTML content of a Wikipedia article.
 * @param {string} title 
 * @param {string} lang 
 */
export const getArticleContent = async (title, lang = 'ar') => {
    try {
        const response = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
            params: {
                action: "parse",
                page: title,
                format: "json",
                origin: "*",
                utf8: 1,
                prop: "text|displaytitle",
                disableeditsection: 1,
            },
        });

        if (response.data.error) {
            throw new Error(response.data.error.info);
        }

        const rawHtml = response.data.parse.text["*"];
        const displayTitle = response.data.parse.displaytitle;
        const realTitle = response.data.parse.title; // Canonical title

        // Create a temporary DOM element to process the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, "text/html");

        // Remove unnecessary elements
        const selectorsToRemove = [
            ".mw-empty-elt",
            ".noparse",
            ".reference",
            ".reflist",
            ".metadata",
            ".ambox",
            ".catlinks",
            ".printfooter",
            ".mw-editsection",
            ".mw-indicators",
            ".sidebar",
            ".noprint",
            "table.ombox",
            "table.fmbox"
        ];

        selectorsToRemove.forEach((selector) => {
            const elements = doc.querySelectorAll(selector);
            elements.forEach((el) => el.remove());
        });

        // Optional: Filter links to ensure we only have internal /wiki/ links
        const allLinks = doc.querySelectorAll("a");
        allLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (!href || !href.startsWith("/wiki/")) {
                // If it's not a standard internal link (or if it's external, anchor, etc),
                // remove the link tag but keep the text, or just disable it.
                // For Wiki Game, we typically replace with a span to keep text but disable clicking.
                const span = doc.createElement("span");
                span.innerHTML = link.innerHTML;
                link.replaceWith(span);
            }
        });

        return {
            title: realTitle || title,
            displayTitle: displayTitle,
            html: doc.body.innerHTML,
        };
    } catch (error) {
        console.error("Error fetching article content:", error);
        throw error;
    }
};
