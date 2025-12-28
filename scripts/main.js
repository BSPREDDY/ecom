// Main Navigation and Header Functionality
document.addEventListener("DOMContentLoaded", () => {
    // Mobile Navigation Toggle
    const hamburgerMenu = document.getElementById("hamburgerMenu")
    const mobileNav = document.getElementById("mobileNav")
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")
    const searchBtn = document.getElementById("searchBtn")
    const searchInput = document.getElementById("searchInput")
    const shopNowBtn = document.getElementById("shopNowBtn")
    const viewSaleBtn = document.getElementById("viewSaleBtn")
    const startShoppingBtn = document.getElementById("startShoppingBtn")

    // Update active nav based on current page
    const currentPage = window.location.pathname.split("/").pop()

    // Set active navigation based on current page
    if (currentPage === "/categories.html") {
        // Update active state for categories page
        document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
            link.classList.remove("active")
            if (link.getAttribute("href") === "/categories.html" || link.getAttribute("href").includes("/categories.html")) {
                link.classList.add("active")
            }
        })
    } else if (currentPage === "index.html" || currentPage === "") {
        // For home page, set Products as active if on products section
        setTimeout(() => {
            const sections = document.querySelectorAll("section")
            const scrollPosition = window.scrollY + 100

            sections.forEach((section) => {
                const sectionTop = section.offsetTop
                const sectionHeight = section.clientHeight
                const sectionId = section.getAttribute("id")

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    // Update desktop nav links
                    document.querySelectorAll(".nav-link").forEach((link) => {
                        link.classList.remove("active")
                        if (link.getAttribute("href") === `#${sectionId}`) {
                            link.classList.add("active")
                        }
                    })

                    // Update mobile nav links
                    document.querySelectorAll(".mobile-nav-link").forEach((link) => {
                        link.classList.remove("active")
                        if (link.getAttribute("href") === `#${sectionId}`) {
                            link.classList.add("active")
                        }
                    })
                }
            })
        }, 100)
    }

    // Toggle mobile navigation
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener("click", () => {
            mobileNav.classList.toggle("active")
            hamburgerMenu.innerHTML = mobileNav.classList.contains("active")
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>'
        })
    }

    // Close mobile navigation when clicking on a link
    mobileNavLinks.forEach((link) => {
        link.addEventListener("click", function () {
            mobileNav.classList.remove("active")
            if (hamburgerMenu) {
                hamburgerMenu.innerHTML = '<i class="fas fa-bars"></i>'
            }

            // Update active state
            mobileNavLinks.forEach((l) => l.classList.remove("active"))
            this.classList.add("active")

            // If on home page and clicking anchor links
            if (this.getAttribute("href").startsWith("#")) {
                const targetId = this.getAttribute("href")
                const targetElement = document.querySelector(targetId)
                if (targetElement) {
                    // Prevent default and scroll smoothly
                    event.preventDefault()
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: "smooth",
                    })
                }
            }
        })
    })

    // Search functionality
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            if (searchInput.value.trim() !== "") {
                alert(`Searching for: "${searchInput.value}"`)
                searchInput.value = ""
            } else {
                searchInput.focus()
            }
        })

        // Search on Enter key
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                searchBtn.click()
            }
        })
    }

    // Shop Now button scroll to products (only on home page)
    if (shopNowBtn && (currentPage === "index.html" || currentPage === "")) {
        shopNowBtn.addEventListener("click", (e) => {
            e.preventDefault()
            document.getElementById("products").scrollIntoView({
                behavior: "smooth",
            })

            // Update active nav
            document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
                link.classList.remove("active")
                if (link.getAttribute("href") === "#products") {
                    link.classList.add("active")
                }
            })
        })
    }

    // View Sale button redirect to sale.html (only on home page)
    if (viewSaleBtn && (currentPage === "index.html" || currentPage === "")) {
        viewSaleBtn.addEventListener("click", (e) => {
            e.preventDefault()
            window.location.href = "sale.html"
        })
    }

    // Start Shopping button in empty cart
    if (startShoppingBtn) {
        startShoppingBtn.addEventListener("click", (e) => {
            e.preventDefault()

            // Navigate to products
            if (currentPage === "/categories.html") {
                window.location.href = "index.html#products"
            } else {
                document.getElementById("products").scrollIntoView({
                    behavior: "smooth",
                })
            }
        })
    }

    // Add smooth scrolling for anchor links on home page
    if (currentPage === "index.html" || currentPage === "") {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                const targetId = this.getAttribute("href")
                if (targetId === "#") return

                const targetElement = document.querySelector(targetId)
                if (targetElement) {
                    e.preventDefault()
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: "smooth",
                    })

                    // Update active nav
                    document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
                        link.classList.remove("active")
                        if (link.getAttribute("href") === targetId) {
                            link.classList.add("active")
                        }
                    })
                }
            })
        })
    }

    // Hero section animations on load (only on home page)
    if (currentPage === "index.html" || currentPage === "") {
        const heroElements = document.querySelectorAll(
            ".hero-subtitle, .hero-title, .hero-tagline, .hero-description, .hero-buttons, .hero-features",
        )

        // Add animation delay to each element
        heroElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`
        })

        // Initialize active section on page load
        setTimeout(() => {
            window.dispatchEvent(new Event("scroll"))
        }, 100)
    }

    // Update active nav on scroll (only on home page)
    if (currentPage === "index.html" || currentPage === "") {
        window.addEventListener("scroll", () => {
            const sections = document.querySelectorAll("section")
            const scrollPosition = window.scrollY + 100

            sections.forEach((section) => {
                const sectionTop = section.offsetTop
                const sectionHeight = section.clientHeight
                const sectionId = section.getAttribute("id")

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    // Update desktop nav links
                    document.querySelectorAll(".nav-link").forEach((link) => {
                        link.classList.remove("active")
                        if (link.getAttribute("href") === `#${sectionId}`) {
                            link.classList.add("active")
                        }
                    })

                    // Update mobile nav links
                    document.querySelectorAll(".mobile-nav-link").forEach((link) => {
                        link.classList.remove("active")
                        if (link.getAttribute("href") === `#${sectionId}`) {
                            link.classList.add("active")
                        }
                    })
                }
            })
        })
    }

    // Handle external links (to other pages)
    document.querySelectorAll('a[href^="/index.html"], a[href^="/categories.html"]').forEach((link) => {
        if (!link.getAttribute("href").startsWith("#")) {
            link.addEventListener("click", function (e) {
                // Remove active class from all links
                document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((l) => {
                    l.classList.remove("active")
                })

                // Add active class to clicked link
                this.classList.add("active")

                // Close mobile menu if open
                if (mobileNav && mobileNav.classList.contains("active")) {
                    mobileNav.classList.remove("active")
                    if (hamburgerMenu) {
                        hamburgerMenu.innerHTML = '<i class="fas fa-bars"></i>'
                    }
                }
            })
        }
    })
})
