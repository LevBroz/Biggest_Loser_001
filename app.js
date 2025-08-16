// app.js

// --- 1. CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://fnaxtjodyrjzijgxildi.supabase.co'; // Pega tu URL aquí
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYXh0am9keXJqemlqZ3hpbGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNzk5NDksImV4cCI6MjA3MDk1NTk0OX0.sUBqz3g7F_i2fOQLy8yh_qA-n369wZUMQr6eshh0GjY'; // Pega tu clave Anon aquí

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 2. SELECTORES DEL DOM ---
const form = document.getElementById('participant-form');
const participantsList = document.getElementById('participants-list');

// --- 3. FUNCIONES ---

/**
 * Carga todos los participantes desde la base de datos y los muestra en la página.
  */
  async function fetchParticipants() {
      const { data, error } = await supabase
              .from('participants')
                      .select('*')
                              .order('created_at', { ascending: true });

                                  if (error) {
                                          console.error('Error cargando participantes:', error);
                                                  return;
                                                      }

                                                          // Limpia la lista actual antes de añadir los nuevos
                                                              participantsList.innerHTML = ''; 
                                                                  data.forEach(participant => {
                                                                          displayParticipant(participant);
                                                                              });
                                                                              }

                                                                              /**
                                                                               * Crea la tarjeta HTML para un participante y la añade a la lista.
                                                                                */
                                                                                function displayParticipant(participant) {
                                                                                    const percentageLoss = ((participant.initial_weight - participant.current_weight) / participant.initial_weight * 100).toFixed(2);
                                                                                        
                                                                                            const card = document.createElement('div');
                                                                                                card.classList.add('participant-card');
                                                                                                    card.innerHTML = `
                                                                                                            <img src="${participant.before_photo_url || 'https://via.placeholder.com/120'}" alt="Foto de ${participant.name}">
                                                                                                                    <h3>${participant.name}</h3>
                                                                                                                            <p class="weight-info">Inicial: ${participant.initial_weight} kg | Actual: ${participant.current_weight} kg</p>
                                                                                                                                    <p class="percentage-loss">${percentageLoss}%</p>
                                                                                                                                            <p>Pérdida de peso</p>
                                                                                                                                                `;
                                                                                                                                                    participantsList.appendChild(card);
                                                                                                                                                    }

                                                                                                                                                    /**
                                                                                                                                                     * Maneja el envío del formulario para añadir un nuevo participante.
                                                                                                                                                      */
                                                                                                                                                      form.addEventListener('submit', async (e) => {
                                                                                                                                                          e.preventDefault(); // Evita que la página se recargue

                                                                                                                                                              const nameInput = document.getElementById('name').value;
                                                                                                                                                                  const weightInput = parseFloat(document.getElementById('weight').value);
                                                                                                                                                                      const photoInput = document.getElementById('before-photo').files[0];
                                                                                                                                                                          let photoUrl = null;

                                                                                                                                                                              // Subir la foto si se seleccionó una
                                                                                                                                                                                  if (photoInput) {
                                                                                                                                                                                          const { data: photoData, error: photoError } = await supabase.storage
                                                                                                                                                                                                      .from('photos')
                                                                                                                                                                                                                  .upload(`${Date.now()}_${photoInput.name}`, photoInput);

                                                                                                                                                                                                                          if (photoError) {
                                                                                                                                                                                                                                      alert('Error al subir la foto: ' + photoError.message);
                                                                                                                                                                                                                                                  return;
                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                  // Obtenemos la URL pública de la foto subida
                                                                                                                                                                                                                                                                          const { data: publicUrlData } = supabase.storage
                                                                                                                                                                                                                                                                                      .from('photos')
                                                                                                                                                                                                                                                                                                  .getPublicUrl(photoData.path);
                                                                                                                                                                                                                                                                                                          photoUrl = publicUrlData.publicUrl;
                                                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                                                  // Insertar el participante en la base de datos
                                                                                                                                                                                                                                                                                                                      const { data, error } = await supabase
                                                                                                                                                                                                                                                                                                                              .from('participants')
                                                                                                                                                                                                                                                                                                                                      .insert({
                                                                                                                                                                                                                                                                                                                                                  name: nameInput,
                                                                                                                                                                                                                                                                                                                                                              initial_weight: weightInput,
                                                                                                                                                                                                                                                                                                                                                                          current_weight: weightInput, // El peso actual es el mismo que el inicial al principio
                                                                                                                                                                                                                                                                                                                                                                                      before_photo_url: photoUrl
                                                                                                                                                                                                                                                                                                                                                                                              })
                                                                                                                                                                                                                                                                                                                                                                                                      .select()
                                                                                                                                                                                                                                                                                                                                                                                                              .single(); // .single() para que nos devuelva el objeto creado

                                                                                                                                                                                                                                                                                                                                                                                                                  if (error) {
                                                                                                                                                                                                                                                                                                                                                                                                                          alert('Error al añadir participante: ' + error.message);
                                                                                                                                                                                                                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                      displayParticipant(data); // Muestra el nuevo participante inmediatamente
                                                                                                                                                                                                                                                                                                                                                                                                                                              form.reset(); // Limpia el formulario
                                                                                                                                                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                                                                                                                                                  });


                                                                                                                                                                                                                                                                                                                                                                                                                                                  // --- 4. CARGA INICIAL ---
                                                                                                                                                                                                                                                                                                                                                                                                                                                  // Llama a la función para cargar los participantes cuando la página se abre por primera vez.
                                                                                                                                                                                                                                                                                                                                                                                                                                                  fetchParticipants();
