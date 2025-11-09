	  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
	  import { getDatabase, ref, push, onValue, remove, set, get } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
		import {
		  getAuth,
		  signInWithEmailAndPassword,
		  onAuthStateChanged,
		  signOut
		} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
	
	    // Deine Firebase-Konfiguration einfügen:
	    const firebaseConfig = {
	      apiKey: "AIzaSyAs1lsiuxJGcHFKn9uF8vGlREKlBQYwXnM",
	      authDomain: "lunara-f250c.firebaseapp.com",
	      databaseURL: "https://lunara-f250c-default-rtdb.europe-west1.firebasedatabase.app/",
	      projectId: "lunara-f250c",
	      storageBucket: "lunara-f250c.firebasestorage.app",
	      messagingSenderId: "275886306511",
	      appId: "1:275886306511:web:2154e63e557a09109233ba",
	      measurementId: "G-4TH4YWWB4X"
	    };
	
	    // Firebase initialisieren
	    const app = initializeApp(firebaseConfig);
	    const db =  getDatabase(app);
		const auth = getAuth(app);

		document.getElementById("login-btn").addEventListener("click", () => {
		  const email = document.getElementById("email").value;
		  const password = document.getElementById("password").value;
		
		  signInWithEmailAndPassword(auth, email, password)
		    .then(() => {
		      document.getElementById("login-container").style.display = "none";
		      document.getElementById("main-content").style.display = "block";
		    })
		    .catch((error) => {
		      document.getElementById("login-error").textContent = error.message;
		    });
		});
		
		onAuthStateChanged(auth, (user) => {
		  document.getElementById("loading-screen").style.display = "none";
		
		  if (user) {
		    // Benutzer eingeloggt → Hauptinhalt zeigen
		    document.getElementById("main-content").style.display = "block";
		  } else {
		    // Nicht eingeloggt → Login zeigen
		    document.getElementById("login-container").style.display = "block";
		  }
		});
		document.getElementById("password").addEventListener("keyup", function (event) {
		  if (event.key === "Enter") {
		    document.getElementById("login-btn").click();
		  }
		});
		window.logout = function () {
		  signOut(auth);
		}			
			
		const form = document.getElementById('trackerForm');
		const entriesDiv = document.getElementById('entries');
		const dateInput = document.getElementById('date');
		const editIndexInput = document.getElementById('editIndex');
		const ctx = document.getElementById('chart').getContext('2d');
		let chart;

		function setToday() {
		  const today = new Date().toISOString().split('T')[0];
		  if (!dateInput.value) dateInput.value = today;
		}

		function loadEntries() {
			const entries = ref(db, 'entries');
			const yearSelect = document.getElementById("yearSelect");
			const monthSelect = document.getElementById("monthSelect");
			const m = monthSelect.value;
       		const y = yearSelect.value;
			console.log(m + ' ' + y);
			onValue(entries, (snapshot) => {
				entriesDiv.innerHTML = '';
			 	if (snapshot.exists()) {
					const data = snapshot.val(); 
    				const entriesArray = Object.entries(data).map(([key, entry]) => ({id: key, ...entry}));
					entriesArray.sort((a, b) => new Date(b.date) - new Date(a.date));
					
					entriesArray.forEach((entry) => {
						const div = document.createElement('div');
						const date = new Date(entry.date);
						const dateFormated = date.toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'});
						div.className = 'bg-white rounded-xl shadow-md p-4';
						div.innerHTML = `
						<div class="font-bold text-pink-600">${dateFormated}</div>
						<div>😊 Stimmung: <strong>${entry.mood || '—'}</strong></div>
						<div>⚡ Energie: <strong>${entry.energy || '—'}</strong></div>
						<div>🩺 Symptome: ${entry.symptoms && entry.symptoms.length ? entry.symptoms.join(', ') : 'Keine'}</div>
						<div class="mt-2 text-gray-600">📝 ${entry.notes || '—'}</div>
						<div class="mt-3 flex space-x-2">
						<button onclick="editEntry('${entry.id}')" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg">Bearbeiten</button>
						<button onclick="deleteEntry('${entry.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">Löschen</button>
						</div>
						`;
						entriesDiv.appendChild(div);
			          });
			
					 updateChart(entriesArray.sort((a, b) => new Date(a.date) - new Date(b.date)));
				} else {
					entriesDiv.innerHTML = '<div class="text-gray-600">Noch keine Einträge — lege los! ✨</div>';
					if (chart) chart.destroy();
					return;
				}
			});
		}

		function updateChart(sortedEntries) {
		  const labels = sortedEntries.map((e) => e.date);
		  const moodData = sortedEntries.map(e => e.mood || null);
		  const energyData = sortedEntries.map(e => e.energy || null);
		  if (chart) chart.destroy();
		  chart = new Chart(ctx, {
			type: 'line',
			data: {
			  labels,
			  datasets: [
				{ label: 'Stimmung', data: moodData, borderColor: '#ec4899', backgroundColor: '#f9a8d4', tension: 0.3 },
				{ label: 'Energie', data: energyData, borderColor: '#3b82f6', backgroundColor: '#93c5fd', tension: 0.3 }
			  ]
			},
			options: {
			  responsive: true,
			  scales: {
				y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } }
			  }
			}
		  });
		}

		form.addEventListener('submit', e => {
			e.preventDefault();

			const date = dateInput.value;
			const mood = document.querySelector('input[name="mood"]:checked').value;
			const energy = document.querySelector('input[name="energy"]:checked').value;
		  
			const notes = document.getElementById('notes').value;
			const symptoms = Array.from(form.querySelectorAll('input[name="symptom"]:checked')).map(cb => cb.value);
			const entryToSave = {date, mood, energy, symptoms, notes};
			console.log(editIndexInput.value);
			if (editIndexInput.value) {
				set(ref(db, "entries/" + editIndexInput.value), entryToSave);
				editIndexInput.value = '';
			} else {
				push(ref(db, "entries/"), entryToSave);
			}
			form.reset();
			setToday();
			loadEntries();			
		});

		window.editEntry = function(id) {
			const object = ref(db, 'entries/' + id);
			
			onValue(object, (snapshot) => {
				const entry = snapshot.val(); 
				if (entry) {
					dateInput.value = entry.date;
					form.querySelectorAll('input[name="mood"]').forEach(cb => cb.checked = entry.mood.includes(cb.value));
					form.querySelectorAll('input[name="energy"]').forEach(cb => cb.checked = entry.energy.includes(cb.value));
					document.getElementById('notes').value = entry.notes;
					if (entry?.symptoms) {
					  form.querySelectorAll('input[name="symptom"]').forEach(cb => cb.checked = entry.symptoms.includes(cb.value));
					}				
					editIndexInput.value = id;
					window.scrollTo({
					  top: 0,
					  behavior: 'smooth'
					});
				}
			});
			
		}

		window.deleteEntry = function(id) {
			const object = ref(db, 'entries/' + id);
			remove(object);
			window.scrollTo({
			  top: 0,
			  behavior: 'smooth'
			});
			form.reset();
			setToday();
			loadEntries();
		}
		setToday();
		loadEntries();

	const yearSelect = document.getElementById("yearSelect");
	const monthSelect = document.getElementById("monthSelect");
	monthSelect.addEventListener("change", loadEntries);
	yearSelect.addEventListener("change", loadEntries);

document.getElementById("analyseBtn").addEventListener("click", async () => {
  const entriesRef = ref(db, 'entries');
  const snapshot = await get(entriesRef);  // ✅ await hier erlaubt
  if (snapshot.exists()) {
    const entries = snapshot.val();
    const res = await fetch("/.netlify/functions/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries })
    });
    const data = await res.json();
    document.getElementById("result").textContent = data.summary;
  } else {
    document.getElementById("result").textContent = "Keine Einträge gefunden";
  }
});
