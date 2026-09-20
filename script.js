(function () {
    'use strict';

    var IMG = 'https://cdn.zyrosite.com/cdn-ecommerce/store_01M27YS1FVSKZXMWHE8SCDDFYW/assets/';
    var WHATSAPP = '919311367564';

    var PRODUCTS = [
        { id: 'mango', name: 'Mango Magic Premium Protein Premix', price: 159, oldPrice: 179, badge: 'Best Seller', dateAdded: 4, img: IMG + '06f83700-a582-4f9e-916a-74e39209d7e8.png' },
        { id: 'banana', name: 'Banana Delight Premium Protein Premix', price: 159, oldPrice: 179, badge: 'No Added Sugar', dateAdded: 3, img: IMG + '1029421e-8a98-4e58-b7f4-3abce864382b.png' },
        { id: 'kulfi', name: 'Kulfi Masti Premium Protein Premix', price: 159, oldPrice: 179, badge: 'No Added Sugar', dateAdded: 2, img: IMG + '58b7a0d2-c16b-4c01-8018-5dd8aa41bbe7.png' },
        { id: 'combo', name: '3-Pack Variety Combo Premium Protein Premix', price: 399, oldPrice: 477, badge: 'Best Seller', dateAdded: 1, img: IMG + 'de3da0e3-ef99-48ef-8452-822df82d1282.png' }
    ];

    var cart = {};
    try { cart = JSON.parse(localStorage.getItem('ss-cart') || '{}') || {}; } catch (e) { cart = {}; }

    var $ = function (id) { return document.getElementById(id); };
    var money = function (n) { return '₹' + n.toLocaleString('en-IN'); };
    var find = function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; };

    function renderProductGrid(items) {
        var container = $('products');
        if (!container) return;
        container.innerHTML = items.map(function (p) {
            var badgeHtml = p.badge ? '<span class="product-badge">' + p.badge + '</span>' : '';
            var priceHtml = p.oldPrice ? '<span class="old-price">₹' + p.oldPrice.toFixed(2) + '</span><span class="new-price">₹' + p.price.toFixed(2) + '</span>' : money(p.price);
            return '<article class="product">' +
                '<div class="pic">' + badgeHtml + '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy"></div>' +
                '<h4>' + p.name + '</h4>' +
                '<div class="price">' + priceHtml + '</div>' +
                '<button class="btn white" data-add="' + p.id + '">Add to bag</button>' +
                '</article>';
        }).join('');
    }

    function sortProducts(val) {
        var items = PRODUCTS.slice();
        if (val === 'price-low') {
            items.sort(function (a, b) { return a.price - b.price; });
        } else if (val === 'price-high') {
            items.sort(function (a, b) { return b.price - a.price; });
        } else if (val === 'recent') {
            items.sort(function (a, b) { return b.dateAdded - a.dateAdded; });
        }
        return items;
    }

    // Initial render
    renderProductGrid(PRODUCTS);

    // Event listener for sort dropdown
    var sortSelect = $('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            renderProductGrid(sortProducts(this.value));
        });
    }

    function save() { try { localStorage.setItem('ss-cart', JSON.stringify(cart)); } catch (e) { } }

    function toast(msg) {
        var t = $('toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { t.classList.remove('show'); }, 1800);
    }

    function render() {
        var ids = Object.keys(cart).filter(function (id) { return cart[id] > 0 && find(id); });
        var count = 0, total = 0;

        if ($('cartItems')) {
            $('cartItems').innerHTML = ids.length ? ids.map(function (id) {
                var p = find(id), q = cart[id];
                count += q; total += q * p.price;
                return '<div class="item">' +
                    '<img src="' + p.img + '" alt="">' +
                    '<div><div class="name">' + p.name + '</div>' +
                    '<div class="qty"><button data-dec="' + id + '" aria-label="Decrease quantity">−</button><span>' + q + '</span><button data-inc="' + id + '" aria-label="Increase quantity">+</button></div></div>' +
                    '<div class="line-price">' + money(q * p.price) + '</div>' +
                    '</div>';
            }).join('') : '<div class="empty">Your bag is empty.<br>Add a flavour to get started.</div>';
        }

        if ($('subtotal')) $('subtotal').textContent = money(total);
        if ($('checkout')) {
            $('checkout').disabled = !ids.length;
            $('checkout').style.opacity = ids.length ? 1 : .5;
        }
        var badge = $('cartCount');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count ? 'flex' : 'none';
        }
        save();
    }

    // Initial cart render on load
    render();

    function openCart() {
        if ($('drawer')) $('drawer').classList.add('open');
        if ($('overlay')) $('overlay').classList.add('open');
        if ($('drawer')) $('drawer').setAttribute('aria-hidden', 'false');
    }
    function closeCart() {
        if ($('drawer')) $('drawer').classList.remove('open');
        if ($('overlay')) $('overlay').classList.remove('open');
        if ($('drawer')) $('drawer').setAttribute('aria-hidden', 'true');
    }

    document.addEventListener('click', function (e) {
        var add = e.target.closest('[data-add]');
        if (add) {
            var id = add.getAttribute('data-add');
            cart[id] = (cart[id] || 0) + 1;
            render();
            toast('Added to bag');
            return;
        }
        var inc = e.target.closest('[data-inc]');
        if (inc) { cart[inc.getAttribute('data-inc')]++; render(); return; }
        var dec = e.target.closest('[data-dec]');
        if (dec) {
            var d = dec.getAttribute('data-dec');
            cart[d] = Math.max(0, cart[d] - 1);
            if (!cart[d]) delete cart[d];
            render();
        }
    });

    if ($('openCart')) $('openCart').addEventListener('click', openCart);
    if ($('closeCart')) $('closeCart').addEventListener('click', closeCart);
    if ($('overlay')) $('overlay').addEventListener('click', closeCart);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

    // Checkout via WhatsApp
    if ($('checkout')) {
        $('checkout').addEventListener('click', function () {
            var lines = [], total = 0;
            Object.keys(cart).forEach(function (id) {
                var p = find(id); if (!p || !cart[id]) return;
                lines.push('• ' + p.name + ' × ' + cart[id] + ' = ' + money(p.price * cart[id]));
                total += p.price * cart[id];
            });
            if (!lines.length) return;
            var msg = 'Hi Scoop & Seeds! I would like to order:\n' + lines.join('\n') + '\n\nSubtotal: ' + money(total) + '\n\nMy name and delivery address:';
            window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        });
    }

    // Mobile menu
    var burger = $('burger'), menu = $('menu');
    if (burger && menu) {
        burger.addEventListener('click', function () {
            var open = menu.classList.toggle('open');
            burger.setAttribute('aria-expanded', open);
        });
        menu.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
        });
    }

    // Contact form -> opens the visitor's email app
    if ($('contactForm')) {
        $('contactForm').addEventListener('submit', function (e) {
            e.preventDefault();
            var f = e.target;
            var body = 'Name: ' + f.name.value + '\nEmail: ' + f.email.value + '\n\n' + f.message.value;
            window.location.href = 'mailto:scoopandseeds@gmail.com?subject=' + encodeURIComponent('Message from ' + f.name.value) + '&body=' + encodeURIComponent(body);
        });
    }

    // Instagram Feed Posts & Carousel Logic
    var INSTA_POSTS = [
        {
            id: 1,
            img: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/lCACfO20beddAweM/c92inj-cZLiL1kPkdEP8l3Z.png',
            likes: 84,
            comments: 12,
            caption: 'Kulfi Masti - High Protein Dessert Bowl 🍨 24g protein ready in minutes!',
            type: 'Reel 📹'
        },
        {
            id: 2,
            img: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/lCACfO20beddAweM/nvdcz2-cVkvVt9CCpTK8JGu.png',
            likes: 62,
            comments: 8,
            caption: 'Magic Mango Morning Oats 🥭 Refreshing & nutritious start to your day.',
            type: 'Post 📷'
        },
        {
            id: 3,
            img: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1024,fit=crop/lCACfO20beddAweM/8cthhy-9TvGrZn0m9gs69C6.png',
            likes: 110,
            comments: 19,
            caption: '24.6g Protein in under 2 minutes! ⚡ Just add milk & chill.',
            type: 'Carousel 📑'
        },
        {
            id: 4,
            img: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/lCACfO20beddAweM/vsqzdx-5EOt3WZMWpijMbM0.png',
            likes: 45,
            comments: 5,
            caption: 'Banana Delight Shake Bowl 🍌 Nutty, creamy perfection.',
            type: 'Post 📷'
        },
        {
            id: 5,
            img: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1024,fit=crop/lCACfO20beddAweM/1000176363-p31gWfteTJ7EB0k4.png',
            likes: 142,
            comments: 24,
            caption: 'Meet the founders: Vanita & Pooja 💚 Making everyday food do more for you.',
            type: 'Post 📷'
        },
        {
            id: 6,
            img: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1024,fit=crop/lCACfO20beddAweM/combo-of-3-pkt-DNfALjUrOCRAyvem.png',
            likes: 98,
            comments: 14,
            caption: '3-Pack Discovery Box Special Combo! Try all 3 nostalgic flavours ✨',
            type: 'Carousel 📑'
        },
        {
            id: 7,
            img: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/lCACfO20beddAweM/our-story-XmwVZsyAm4sx3lH2.jpg',
            likes: 156,
            comments: 28,
            caption: 'Sampling session at Cult.fit Gym! 🏋️‍♂️ Fueling active routines with Scoop & Seeds.',
            type: 'Reel 📹'
        },
        {
            id: 8,
            img: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/lCACfO20beddAweM/778340492_18087218720290340_2546592537192364654_n-4YKAH1YgZnkP4iZo.jpg',
            likes: 134,
            comments: 21,
            caption: 'Fresh strawberries, blueberries & 24.6g protein bowl 🍓 Ready in 3 mins!',
            type: 'Post 📷'
        }
    ];

    var instaTrack = $('instaTrack');
    if (instaTrack) {
        instaTrack.innerHTML = INSTA_POSTS.map(function (p) {
            return '<a class="insta-card" href="https://www.instagram.com/scoopandseeds/" target="_blank" rel="noopener">' +
                '<span class="insta-card-badge">' + p.type + '</span>' +
                '<img src="' + p.img + '" alt="' + p.caption + '" loading="lazy">' +
                '<div class="insta-card-overlay">' +
                '<div class="insta-card-metrics"><span>❤️ ' + p.likes + '</span><span>💬 ' + p.comments + '</span></div>' +
                '<p class="insta-card-caption">' + p.caption + '</p>' +
                '</div>' +
                '</a>';
        }).join('');

        var currentSlide = 0;
        function getVisibleCards() {
            var w = window.innerWidth;
            if (w <= 560) return 1;
            if (w <= 960) return 2;
            return 4;
        }

        function updateCarousel() {
            var visible = getVisibleCards();
            var maxSlide = Math.max(0, INSTA_POSTS.length - visible);
            if (currentSlide > maxSlide) currentSlide = 0;
            if (currentSlide < 0) currentSlide = maxSlide;

            var cardWidth = instaTrack.children[0] ? instaTrack.children[0].offsetWidth : 270;
            var gap = 18;
            var shift = currentSlide * (cardWidth + gap);
            instaTrack.style.transform = 'translateX(-' + shift + 'px)';
        }

        var autoSlideTimer = setInterval(function () {
            currentSlide++;
            updateCarousel();
        }, 3000);

        var carouselContainer = document.querySelector('.insta-carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', function () {
                clearInterval(autoSlideTimer);
            });
            carouselContainer.addEventListener('mouseleave', function () {
                clearInterval(autoSlideTimer);
                autoSlideTimer = setInterval(function () {
                    currentSlide++;
                    updateCarousel();
                }, 3000);
            });
        }

        var prevBtn = $('instaPrev');
        var nextBtn = $('instaNext');
        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                currentSlide--;
                updateCarousel();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                currentSlide++;
                updateCarousel();
            });
        }

        window.addEventListener('resize', updateCarousel);
    }

    render();
})();
