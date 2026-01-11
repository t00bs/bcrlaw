// =================================================================
// 1. Dynamic Copyright Year
// =================================================================
window.onload = function() {
    var e = (new Date).getFullYear(),
        n = document.getElementById("year");
    n && (n.innerHTML = e)
};

// =================================================================
// 2. Heading Formatting (Split words)
// =================================================================
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('h1.heading.xl').forEach(h1 => {
        const words = h1.textContent.trim().split(/\s+/);
        if (words.length < 3) return; // Skip short headings

        const half = Math.floor(words.length / 2);
        const firstHalf = words.slice(0, half).join(' ');
        const secondHalf = words.slice(half).join(' ');

        h1.innerHTML = `${firstHalf} <span class="alt-font">${secondHalf}</span>`;
    });
});

// =================================================================
// 3. Slick Slider Configuration
// =================================================================
$(document).ready(function() {
    // -- Primary Sliders --
    $('#cms-slider').slick({
        arrows: false,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 8000,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 1,
        responsive: [{ breakpoint: 1024, settings: { slidesToShow: 2 } }, { breakpoint: 768, settings: { slidesToShow: 1 } }]
    });

    $('#cms-slider-2').slick({
        arrows: false,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 8000,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 1,
        responsive: [{ breakpoint: 1024, settings: { slidesToShow: 2 } }, { breakpoint: 768, settings: { slidesToShow: 1 } }]
    });

    $('#cms-slider-1col').slick({
        arrows: false,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 4000,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [{ breakpoint: 1024, settings: { slidesToShow: 1 } }, { breakpoint: 768, settings: { slidesToShow: 1 } }]
    });

    $('#cms-slider-1col-auto').slick({
        arrows: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [{ breakpoint: 1024, settings: { slidesToShow: 1 } }, { breakpoint: 768, settings: { slidesToShow: 1 } }]
    });

    // -- Synced Sliders --
    $('#cms-slider-1col-main').slick({
        arrows: false,
        infinite: true,
        autoplay: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '#cms-slider-1col-secondary',
        responsive: [{ breakpoint: 1024, settings: { slidesToShow: 1 } }, { breakpoint: 768, settings: { slidesToShow: 1 } }]
    });

    $('#cms-slider-1col-secondary').slick({
        arrows: false,
        infinite: true,
        autoplay: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '#cms-slider-1col-main',
        responsive: [{ breakpoint: 1024, settings: { slidesToShow: 1 } }, { breakpoint: 768, settings: { slidesToShow: 1 } }]
    });

    // -- Filter Functionality --
    $(".dropdown-link").click(function() {
        var filter = $(this).find('.dropdown-link_slug').text();
        var filterClass = '.' + filter;

        if ($(this).hasClass("cc-selected")) {
            $('#cms-slider, #cms-slider-2').slick('slickUnfilter');
            $(this).removeClass("cc-selected");
        } else {
            $(".dropdown-link").removeClass("cc-selected");
            $(this).addClass("cc-selected");

            $('#cms-slider, #cms-slider-2').slick('slickUnfilter');
            $('#cms-slider, #cms-slider-2').slick('slickFilter', filterClass);
        }
    });

    // -- Navigation Controls --
    $('#cms-slider-right').click(function() { $('#cms-slider').slick('slickNext'); });
    $('#cms-slider-left').click(function() { $('#cms-slider').slick('slickPrev'); });

    $('#cms-slider-right-2').click(function() { $('#cms-slider-2').slick('slickNext'); });
    $('#cms-slider-left-2').click(function() { $('#cms-slider-2').slick('slickPrev'); });

    $('#cms-slider-1col-right').click(function() { $('#cms-slider-1col').slick('slickNext'); });
    $('#cms-slider-1col-left').click(function() { $('#cms-slider-1col').slick('slickPrev'); });

    // Note: You had duplicate IDs for 1col main in your original code, I assigned them here correctly based on context
    $('#cms-slider-1col-right').click(function() { $('#cms-slider-1col-main').slick('slickNext'); });
    $('#cms-slider-1col-left').click(function() { $('#cms-slider-1col-main').slick('slickPrev'); });
});

// =================================================================
// 4. Custom Search Logic
// =================================================================
$("[tr-search-element='component']").each(function() {
    const componentEl = $(this);
    const inputEl = componentEl.find("[tr-search-element='input']");
    const clearButtonEl = componentEl.find("[tr-search-element='clear']");
    const resultsWrapperEl = componentEl.find("[tr-search-element='results-wrapper']");

    // --- helpers & state ---
    let lockOpen = false; // keep open whenever there is text
    const hasQuery = () => !!inputEl.val().trim().length;

    function assertOpen() {
        if (!hasQuery()) return;
        componentEl.addClass("is-open");
        resultsWrapperEl
            .attr("aria-hidden", "false")
            .removeAttr("hidden")
            .css({ display: "block", visibility: "visible", opacity: 1, pointerEvents: "auto" });
    }

    function assertClosed() {
        componentEl.removeClass("is-open");
        resultsWrapperEl.empty();
    }

    // --- typing / focus ---
    inputEl.on("input", function() {
        const q = $(this).val();
        if (q.length) {
            lockOpen = true;
            assertOpen();
            $.ajax({
                url: "/search?query=" + q.replaceAll(" ", "+"),
                success: function(response) {
                    const results = $(response).find("[tr-search-element='search-page-results']");
                    resultsWrapperEl.empty().append(results);
                }
            });
        } else {
            lockOpen = false;
            assertClosed();
        }
    });

    inputEl.on("focus", assertOpen);
    inputEl.on("blur", function() {
        // ignore blur entirely; keyboard close triggers this
    });

    // --- TAP navigation ---
    let tap = { active: false, x: 0, y: 0, t: 0, moved: false };
    const MOVE_THRESHOLD = 10, TIME_THRESHOLD = 700;

    resultsWrapperEl.on("pointerdown", "a, [href]", function(e) {
        if (e.button === 1 || e.button === 2) return;
        tap = { active: true, x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
    });

    resultsWrapperEl.on("pointermove", function(e) {
        if (!tap.active) return;
        if (Math.abs(e.clientX - tap.x) > MOVE_THRESHOLD || Math.abs(e.clientY - tap.y) > MOVE_THRESHOLD) tap.moved = true;
    });

    resultsWrapperEl.on("pointerup", "a, [href]", function(e) {
        if (!tap.active) return;
        e.preventDefault();
        const dt = performance.now() - tap.t;
        if (!tap.moved && dt < TIME_THRESHOLD) {
            const href = this.getAttribute("href");
            if (href) {
                const target = this.getAttribute("target");
                if (target === "_blank") window.open(href, "_blank");
                else window.location.assign(href);
            }
        }
        tap.active = false;
    });

    resultsWrapperEl.on("pointercancel pointerleave", () => { tap.active = false; });

    // --- CLEAR ---
    clearButtonEl.on("click", function() {
        inputEl.val("");
        lockOpen = false;
        assertClosed();
        inputEl.trigger("focus");
    });

    // --- KEYBOARD-CLOSE DEFENCE ---
    function afterKeyboardClose() {
        if (!hasQuery()) return;
        lockOpen = true;
        let ticks = 0;
        const id = setInterval(() => {
            assertOpen();
            if (++ticks >= 10) clearInterval(id);
        }, 50);
        setTimeout(assertOpen, 700);
    }

    if (window.visualViewport) {
        let last = visualViewport.height;
        visualViewport.addEventListener("resize", () => {
            const grew = visualViewport.height - last;
            last = visualViewport.height;
            if (grew > 30) afterKeyboardClose();
        });
    } else {
        let last = window.innerHeight;
        window.addEventListener("resize", () => {
            const grew = window.innerHeight - last;
            last = window.innerHeight;
            if (grew > 30) afterKeyboardClose();
        });
    }

    // --- WATCHDOG ---
    const mo = new MutationObserver(() => {
        if (!lockOpen || !hasQuery()) return;
        if (!componentEl.hasClass("is-open") || resultsWrapperEl.is(":hidden")) {
            assertOpen();
        }
    });
    mo.observe(componentEl[0], { attributes: true, attributeFilter: ["class"] });
    mo.observe(resultsWrapperEl[0], { attributes: true, attributeFilter: ["style", "hidden", "aria-hidden"] });

    // --- Mobile Touch Check ---
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        $(document).on("pointerdown touchstart mousedown", function(e) {
            if (!lockOpen || !hasQuery()) return;
            if (!componentEl.is(e.target) && componentEl.has(e.target).length === 0) {
                e.stopImmediatePropagation();
                e.stopPropagation();
            }
        });
    }
});

// =================================================================
// 5. Finsweet Nest Sorting
// =================================================================
document.addEventListener("DOMContentLoaded", function() {
    // Wait until Finsweet Nest has finished rendering
    setTimeout(() => {
        const nestedLists = document.querySelectorAll('[nested-list="destination"]');

        nestedLists.forEach(list => {
            const items = Array.from(list.children);

            items.sort((a, b) => {
                const textA = a.querySelector('.small-nav-menu-item-list')?.textContent.trim().toLowerCase() || '';
                const textB = b.querySelector('.small-nav-menu-item-list')?.textContent.trim().toLowerCase() || '';
                return textA.localeCompare(textB);
            });

            items.forEach(item => list.appendChild(item));
        });
    }, 500); // small delay to let CMS Nest populate
});
