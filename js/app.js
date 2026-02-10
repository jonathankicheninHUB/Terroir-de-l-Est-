/* ============================================================
   CERVEAU CLIENT (app.js)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    
    // ⚠️ REMETS TES CLES SUPABASE ICI (Copie-les depuis ton ancien fichier ou Supabase)
    const SUPABASE_URL = 'https://afzjgisyaoyygoijizpq.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmempnaXN5YW95eWdvaWppenBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDYxODIsImV4cCI6MjA4NjIyMjE4Mn0.l2VchnS-LzkD34M7dnM9MAEzvoVgewEuTuvS7Kxlo04';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. CHARGEMENT PRODUITS
    async function loadProducts() {
        const container = document.getElementById('products-container');
        try {
            const { data: produits, error } = await supabase
                .from('produits')
                .select('*')
                .eq('est_disponible', true);

            if (error) throw error;
            container.innerHTML = ''; 

            // Observateur pour l'animation au scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationDelay = `${index * 0.1}s`; // Délai en cascade
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            produits.forEach(p => {
                const carte = document.createElement('div');
                carte.className = 'product-card';
                carte.setAttribute('data-cat', p.categorie);
                
                carte.innerHTML = `
                    <span class="card-badge">${p.categorie}</span>
                    <div class="card-image-wrapper">
                        <img src="${p.image_url}" alt="${p.nom}" onerror="this.src='https://via.placeholder.com/300?text=Photo+Manquante'">
                    </div>
                    <div class="card-details">
                        <h3>${p.nom}</h3>
                        <span class="card-price">${p.prix}</span>
                    </div>
                `;
                container.appendChild(carte);
                observer.observe(carte); // On observe chaque carte
            });
        } catch (err) {
            console.error("Erreur:", err);
            container.innerHTML = '<p style="color:red">Erreur de chargement.</p>';
        }
    }

    // 2. CHARGEMENT PRODUCTEURS
    async function loadProducers() {
        const container = document.getElementById('producers-container');
        const { data: pros, error } = await supabase.from('producteurs').select('*');

        if (!error && pros.length > 0) {
            container.innerHTML = '';
            pros.forEach(pro => {
                const item = document.createElement('div');
                item.className = 'producer-item';
                item.innerHTML = `
                    <img src="${pro.image_url}" class="producer-face" onerror="this.src='https://via.placeholder.com/60'">
                    <div class="producer-info">
                        <h4>${pro.nom}</h4>
                        <p>${pro.ville}</p>
                    </div>`;
                container.appendChild(item);
            });
        }
    }

    // 3. NEWSLETTER
    const btnNews = document.getElementById('btnNewsletter');
    if (btnNews) {
        btnNews.addEventListener('click', async () => {
            const emailInput = document.getElementById('emailInput');
            const msgBox = document.getElementById('msg-newsletter');
            const email = emailInput.value.trim();

            if (!email.includes('@')) {
                msgBox.innerText = "Email invalide";
                msgBox.style.color = "red";
                return;
            }

            const { error } = await supabase.from('contacts').insert([{ email: email, message: 'Inscription Site' }]);

            if (error) {
                msgBox.innerText = "Erreur.";
                msgBox.style.color = "red";
            } else {
                msgBox.innerText = "Merci !";
                msgBox.style.color = "green";
                emailInput.value = "";
            }
        });
    }

    // 4. FILTRES
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const filterValue = e.target.getAttribute('data-filter');
            const allCards = document.querySelectorAll('.product-card');

            allCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-cat') === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 5. MENU BURGER MOBILE
    const burgerBtn = document.getElementById('burgerMenu');
    const navMenu = document.querySelector('.nav-menu');

    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = burgerBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    loadProducts();
    loadProducers();
});