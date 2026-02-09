/* ============================================================
   CERVEAU DE TERROIR DE L'EST (LOGIQUE MÉTIER)
   ============================================================ */

// 1. CONFIGURATION SUPABASE
// ------------------------------------------------------------
// NOTE DE SÉCURITÉ : La clé 'anon' est publique par design.
// La sécurité des données est assurée par les règles RLS (Row Level Security)
// configurées directement dans la base de données Supabase.
// NE JAMAIS METTRE LA CLÉ 'SERVICE_ROLE' ICI (Celle-ci doit rester secrète).
// ------------------------------------------------------------

const SUPABASE_URL = 'https://afzjgisyaoyygoijizpq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmempnaXN5YW95eWdvaWppenBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDYxODIsImV4cCI6MjA4NjIyMjE4Mn0.l2VchnS-LzkD34M7dnM9MAEzvoVgewEuTuvS7Kxlo04';

// Initialisation
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. FONCTIONS DE CHARGEMENT (LECTURE)
// ------------------------------------------------------------

// Charger les Produits
async function loadProducts() {
    const container = document.getElementById('products-container');
    
    try {
        const { data: produits, error } = await supabase
            .from('produits')
            .select('*')
            .eq('est_disponible', true); // On ne charge que ce qui est dispo (Sécurité logique)

        if (error) throw error;

        container.innerHTML = ''; // Nettoyage

        produits.forEach(p => {
            const carte = document.createElement('div');
            carte.className = 'product-card';
            carte.setAttribute('data-cat', p.categorie);
            
            carte.innerHTML = `
                <span class="card-badge">${p.categorie}</span>
                <div class="card-image-wrapper">
                    <img src="${p.image_url}" alt="${p.nom}" onerror="this.src='https://via.placeholder.com/300?text=Image+Non+Dispo'">
                </div>
                <div class="card-details">
                    <h3>${p.nom}</h3>
                    <span class="card-price">${p.prix}</span>
                </div>
            `;
            container.appendChild(carte);
        });

    } catch (err) {
        console.error("Erreur sécurité/réseau :", err.message);
        container.innerHTML = '<p class="error-msg">Impossible de charger le marché. Vérifiez votre connexion.</p>';
    }
}

// Charger les Producteurs
async function loadProducers() {
    const container = document.getElementById('producers-container');
    const { data: pros, error } = await supabase.from('producteurs').select('*');

    if (!error && pros.length > 0) {
        container.innerHTML = '';
        pros.forEach(pro => {
            container.innerHTML += `
            <div class="producer-item">
                <img src="${pro.image_url}" class="producer-face" onerror="this.src='https://via.placeholder.com/60'">
                <div class="producer-info">
                    <h4>${pro.nom}</h4>
                    <p>${pro.ville}</p>
                </div>
            </div>`;
        });
    }
}

// 3. FONCTIONS D'ÉCRITURE (INTERACTION)
// ------------------------------------------------------------

// Gestion de la Newsletter
async function handleNewsletter() {
    const emailInput = document.getElementById('emailInput');
    const msgBox = document.getElementById('msg-newsletter');
    const email = emailInput.value.trim();

    // Validation basique
    if (!email.includes('@') || email.length < 5) {
        msgBox.innerText = "Adresse email invalide.";
        msgBox.style.color = "#e74c3c";
        return;
    }

    // Envoi sécurisé à Supabase
    const { error } = await supabase.from('contacts').insert([{ email: email, message: 'Inscription Newsletter' }]);

    if (error) {
        msgBox.innerText = "Erreur technique. Réessayez.";
        msgBox.style.color = "#e74c3c";
        console.error(error);
    } else {
        msgBox.innerText = "Bienvenue dans la communauté !";
        msgBox.style.color = "#27ae60";
        emailInput.value = "";
    }
}

// 4. GESTION DES ÉVÉNEMENTS (INTERACTIONS UTILISATEUR)
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Lancement au démarrage
    loadProducts();
    loadProducers();

    // Écouteur bouton newsletter
    document.getElementById('btnNewsletter').addEventListener('click', handleNewsletter);

    // Écouteurs filtres
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Gestion visuelle des boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Logique de tri
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

    // Écouteur Recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const val = e.target.value.toLowerCase();
            const allCards = document.querySelectorAll('.product-card');
            
            allCards.forEach(card => {
                const title = card.querySelector('h3').innerText.toLowerCase();
                if (title.includes(val)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});