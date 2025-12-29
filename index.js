import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Paste YOUR Firebase Config here
const firebaseConfig = {
    apiKey: "AIzaSyBKAZAl2me2RQ46_VOm9mC21N7KDjoHzvA",
    authDomain: "campus-carbon-intelligen-dcb19.firebaseapp.com",
    projectId: "campus-carbon-intelligen-dcb19",
    storageBucket: "campus-carbon-intelligen-dcb19.firebasestorage.app",
    messagingSenderId: "695843844022",
    appId: "1:695843844022:web:7172b33f79a7183b98db17"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Initialize Map
const map = L.map('map').setView([51.505, -0.09], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 3. Carbon Factors
const ELEC_FACTOR = 0.475; // 0.475kg CO2 per kWh
const WATER_FACTOR = 0.0003; // 0.0003kg CO2 per Liter

async function initCCI() {
    const querySnapshot = await getDocs(collection(db, "buildings"));
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const eImpact = data.elec_kwh * ELEC_FACTOR;
        const wImpact = data.water_L * WATER_FACTOR;
        const total = eImpact + wImpact;

        // Add Marker
        const marker = L.circle([data.lat, data.lng], {
            color: total > 1000 ? 'red' : '#2ecc71',
            fillOpacity: 0.6,
            radius: 40
        }).addTo(map);

        // Click Logic
        marker.on('click', () => {
            document.getElementById('b-name').innerText = data.name;
            document.getElementById('elec-val').innerHTML = `${eImpact.toFixed(1)} <small>kg</small>`;
            document.getElementById('water-val').innerHTML = `${wImpact.toFixed(1)} <small>kg</small>`;
            document.getElementById('total-val').innerText = total.toFixed(1);

            // Simulation Link
            const slider = document.getElementById('sim-slider');
            slider.oninput = () => {
                const savings = (slider.value / 100) * (eImpact * 0.35); // 35% saving for LED
                document.getElementById('save-val').innerText = savings.toFixed(1);
            };
        });
    });
}

initCCI();