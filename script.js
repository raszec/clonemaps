// 1. Inicializa o Mapa
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([-23.55052, -46.633308], 15); // Padrão SP

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    subdomains: 'abcd'
}).addTo(map);

// 2. Lógica de Busca (Geocoding)
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('keypress', function(e) {
    // Se apertar ENTER
    if (e.key === 'Enter') {
        const query = searchInput.value;
        if(query.length > 3) {
            searchLocation(query);
        }
    }
});

async function searchLocation(query) {
    // Usamos a API pública do OpenStreetMap (Nominatim)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            // 1. Move o mapa para o local encontrado (FlyTo = voo suave)
            map.flyTo([lat, lon], 17, {
                animate: true,
                duration: 2 // Duração do voo em segundos
            });

            // 2. Reseta a bolinha para o centro da tela
            // Como o mapa se centralizou no endereço, se a bolinha ficar no centro da tela,
            // ela visualmente estará "em cima" do endereço.
            blueDot.style.left = '50%';
            blueDot.style.top = '50%';
            blueDot.style.transform = 'translate(-50%, -50%)'; // Garante o centro exato

            // Fecha o teclado do celular
            searchInput.blur();

        } else {
            alert('Endereço não encontrado!');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao buscar. Tente novamente.');
    }
}


// 3. Lógica da Bolinha Móvel (Mantida e ajustada)
const blueDot = document.getElementById('blue-dot');
let isDraggingDot = false;
let startX, startY, initialLeft, initialTop;

// TOUCH (Celular)
blueDot.addEventListener('touchstart', function(e) {
    e.stopPropagation(); 
    map.dragging.disable();
    
    isDraggingDot = true;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    
    const rect = blueDot.getBoundingClientRect();
    // Cálculo centralizado
    initialLeft = rect.left + (rect.width / 2); 
    initialTop = rect.top + (rect.height / 2);

    blueDot.style.cursor = 'grabbing';
}, { passive: false });

window.addEventListener('touchmove', function(e) {
    if (!isDraggingDot) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    blueDot.style.left = `${initialLeft + deltaX}px`;
    blueDot.style.top = `${initialTop + deltaY}px`;
}, { passive: false });

window.addEventListener('touchend', function(e) {
    if (isDraggingDot) {
        isDraggingDot = false;
        blueDot.style.cursor = 'grab';
        map.dragging.enable();
    }
});

// MOUSE (Computador)
blueDot.addEventListener('mousedown', function(e) {
    e.stopPropagation();
    map.dragging.disable();
    
    isDraggingDot = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = blueDot.getBoundingClientRect();
    initialLeft = rect.left + (rect.width / 2); 
    initialTop = rect.top + (rect.height / 2);
    
    blueDot.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', function(e) {
    if (!isDraggingDot) return;
    e.preventDefault();
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    blueDot.style.left = `${initialLeft + deltaX}px`;
    blueDot.style.top = `${initialTop + deltaY}px`;
});

window.addEventListener('mouseup', function() {
    if (isDraggingDot) {
        isDraggingDot = false;
        blueDot.style.cursor = 'grab';
        map.dragging.enable();
    }
});
