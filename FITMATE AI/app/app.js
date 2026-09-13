/**
 * FITMATE AI — Desktop Application Core Controller (app.js)
 */

// Application State Store
const AppState = {
  currentRole: 'student', // 'student' | 'coach'
  currentUser: {
    name: 'Alex Patel',
    email: 'alex.patel@campus.edu',
    dept: 'Computer Science & Engineering',
    id: 'CS-2024-8841',
    role: 'student'
  },
  coachUser: {
    name: 'Coach Martinez',
    email: 'martinez@athletics.campus.edu',
    dept: 'Campus Athletics & Recreation',
    id: 'COACH-014',
    role: 'coach'
  },
  isAuthenticated: false,
  activeView: 'view-student-dashboard',
  cameraMode: 'simulated', // 'live' | 'simulated'
  currentExercise: 'squats',
  repCount: 0,
  targetReps: 15,
  isTracking: false,
  cameraStream: null,
  
  // Student roster data for coach management
  roster: [
    { id: 'CS-2024-8841', name: 'Alex Patel', dept: 'Computer Science', streak: 14, formAvg: '94.2%', attended: true, timeIn: '11:15 AM', status: 'Completed 15/15 Squats' },
    { id: 'BIO-2024-1092', name: 'Sara Kim', dept: 'Biology', streak: 21, formAvg: '96.0%', attended: true, timeIn: '10:45 AM', status: 'Completed 45m Workout' },
    { id: 'ME-2023-4412', name: 'Ryan Miller', dept: 'Mechanical', streak: 6, formAvg: '88.5%', attended: false, timeIn: 'Pending', status: 'In Progress (Set 2/4)' },
    { id: 'EE-2025-0918', name: 'Ananya Sharma', dept: 'Electrical', streak: 19, formAvg: '95.1%', attended: true, timeIn: '09:30 AM', status: 'Completed Plank Holds' },
    { id: 'CE-2024-3321', name: 'David Chen', dept: 'Civil Eng', streak: 3, formAvg: '84.0%', attended: false, timeIn: 'Pending', status: 'Not Started' }
  ]
};

// Web Audio synthesizer for rep achievement chime
let audioCtx = null;
function playRepChime() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    // Audio optional
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initRoleSelection();
  initAuth();
  initNavigation();
  initCameraVisualizer();
  initCoachModules();
});

/* --------------------------------------------------------------------------
   1. SPLASH SCREEN SEQUENCE
   -------------------------------------------------------------------------- */
function initSplash() {
  const progressBar = document.getElementById('splashProgressBar');
  const statusText = document.getElementById('splashStatus');

  let progress = 0;
  const interval = setInterval(() => {
    progress += 25;
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    if (progress === 50) {
      if (statusText) statusText.textContent = 'Loading campus network configurations...';
    } else if (progress === 75) {
      if (statusText) statusText.textContent = 'Calibrating computer vision telemetry...';
    } else if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        showScreen('screenRole');
      }, 400);
    }
  }, 250);
}

function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

/* --------------------------------------------------------------------------
   2. ROLE SELECTION
   -------------------------------------------------------------------------- */
function initRoleSelection() {
  const roleCards = document.querySelectorAll('[data-select-role]');
  roleCards.forEach((card) => {
    card.addEventListener('click', () => {
      const role = card.getAttribute('data-select-role');
      setAppRole(role);
      showScreen('screenAuth');
    });
  });

  const btnBack = document.getElementById('btnBackToRole');
  if (btnBack) {
    btnBack.addEventListener('click', () => showScreen('screenRole'));
  }
}

function setAppRole(role) {
  AppState.currentRole = role;
  const roleTag = document.getElementById('authRoleTag');
  const appBadge = document.getElementById('appRoleBadge');
  const navStudent = document.getElementById('navStudent');
  const navCoach = document.getElementById('navCoach');
  const avatar = document.getElementById('appUserAvatar');
  const nameLabel = document.getElementById('appUserName');
  const emailInput = document.getElementById('inputEmail');

  if (role === 'coach') {
    if (roleTag) roleTag.textContent = 'Coach / Teacher Account';
    if (appBadge) {
      appBadge.textContent = 'Coach Mode';
      appBadge.style.color = 'var(--accent-coach)';
      appBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      appBadge.style.background = 'rgba(245, 158, 11, 0.1)';
    }
    if (navStudent) navStudent.style.display = 'none';
    if (navCoach) navCoach.style.display = 'flex';
    if (avatar) {
      avatar.textContent = 'CM';
      avatar.style.background = 'var(--accent-coach)';
      avatar.style.color = '#000';
    }
    if (nameLabel) nameLabel.textContent = AppState.coachUser.name;
    if (emailInput) emailInput.value = AppState.coachUser.email;
  } else {
    if (roleTag) roleTag.textContent = 'Student Account';
    if (appBadge) {
      appBadge.textContent = 'Student Mode';
      appBadge.style.color = 'var(--accent-primary)';
      appBadge.style.borderColor = 'rgba(0, 229, 153, 0.25)';
      appBadge.style.background = 'rgba(0, 229, 153, 0.1)';
    }
    if (navStudent) navStudent.style.display = 'flex';
    if (navCoach) navCoach.style.display = 'none';
    if (avatar) {
      avatar.textContent = 'AP';
      avatar.style.background = 'var(--accent-secondary)';
      avatar.style.color = '#fff';
    }
    if (nameLabel) nameLabel.textContent = AppState.currentUser.name;
    if (emailInput) emailInput.value = AppState.currentUser.email;
  }
}

/* --------------------------------------------------------------------------
   3. AUTHENTICATION (LOGIN / SIGNUP)
   -------------------------------------------------------------------------- */
function initAuth() {
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const groupName = document.getElementById('groupName');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');
  const btnAuthSubmit = document.getElementById('btnAuthSubmit');
  const formAuth = document.getElementById('formAuth');

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      groupName.style.display = 'none';
      authTitle.textContent = 'Sign In to FITMATE AI';
      authSubtitle.textContent = 'Access your fitness dashboard and synced records';
      btnAuthSubmit.textContent = 'Sign In';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      groupName.style.display = 'block';
      authTitle.textContent = 'Create FITMATE AI Account';
      authSubtitle.textContent = 'Register your institutional profile';
      btnAuthSubmit.textContent = 'Complete Registration';
    });
  }

  if (formAuth) {
    formAuth.addEventListener('submit', (e) => {
      e.preventDefault();
      AppState.isAuthenticated = true;
      showAppToast('Welcome', `Signed in successfully as ${AppState.currentRole === 'coach' ? 'Coach Martinez' : 'Alex Patel'}.`);
      showScreen('screenApp');
      switchView(AppState.currentRole === 'coach' ? 'view-coach-dashboard' : 'view-student-dashboard');
    });
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      AppState.isAuthenticated = false;
      showScreen('screenRole');
    });
  }
}

/* --------------------------------------------------------------------------
   4. NAVIGATION & VIEW ROUTING
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const viewId = btn.getAttribute('data-view');
      switchView(viewId);
    });
  });

  // Direct CTA triggers
  const btnStartToday = document.getElementById('btnStartTodaysWorkout');
  if (btnStartToday) {
    btnStartToday.addEventListener('click', () => switchView('view-student-aitrainer'));
  }
  const btnLaunchTrainer = document.getElementById('btnLaunchTrainerFromDash');
  if (btnLaunchTrainer) {
    btnLaunchTrainer.addEventListener('click', () => switchView('view-student-aitrainer'));
  }
}

function switchView(viewId) {
  AppState.activeView = viewId;

  // Update Nav selection
  document.querySelectorAll('.nav-item').forEach((btn) => {
    if (btn.getAttribute('data-view') === viewId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Show View
  document.querySelectorAll('.content-view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    if (viewId === 'view-student-aitrainer') {
      startCameraCanvas();
    }
  }
}

function startWorkoutSession(name) {
  showAppToast('Workout Started', `Loaded routine: ${name}. Camera AI connected.`);
  switchView('view-student-aitrainer');
}

/* --------------------------------------------------------------------------
   5. AI TRAINER & COMPUTER VISION CANVAS
   -------------------------------------------------------------------------- */
let canvasAnimationId = null;
let simulatedPhase = 0;

function initCameraVisualizer() {
  const btnToggleCam = document.getElementById('btnToggleCameraSource');
  const btnStartTracking = document.getElementById('btnStartTracking');
  const exercisePills = document.querySelectorAll('[data-app-exercise]');

  exercisePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      exercisePills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      AppState.currentExercise = pill.getAttribute('data-app-exercise');
      AppState.repCount = 0;
      updateRepDisplay();
    });
  });

  if (btnToggleCam) {
    btnToggleCam.addEventListener('click', async () => {
      if (AppState.cameraMode === 'simulated') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 420 } });
          AppState.cameraStream = stream;
          const video = document.getElementById('webcamVideo');
          video.srcObject = stream;
          video.play();
          AppState.cameraMode = 'live';
          btnToggleCam.textContent = 'Use Simulated Feed';
          showAppToast('Webcam Connected', 'Live camera stream engaged with AI overlay.');
        } catch (err) {
          showAppToast('Camera Notice', 'Webcam not accessible. Using high-precision telemetry simulator.');
        }
      } else {
        if (AppState.cameraStream) {
          AppState.cameraStream.getTracks().forEach((t) => t.stop());
          AppState.cameraStream = null;
        }
        AppState.cameraMode = 'simulated';
        btnToggleCam.textContent = 'Use Live Webcam';
        showAppToast('Telemetry Mode', 'Running in high-precision simulated telemetry mode.');
      }
    });
  }

  if (btnStartTracking) {
    btnStartTracking.addEventListener('click', () => {
      AppState.isTracking = !AppState.isTracking;
      btnStartTracking.textContent = AppState.isTracking ? 'Pause Tracking' : 'Start AI Session';
      btnStartTracking.className = AppState.isTracking ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm';
      showAppToast(
        AppState.isTracking ? 'Tracking Engaged' : 'Tracking Paused',
        AppState.isTracking ? 'Counting repetitions and tracking joint angles.' : 'Session paused.'
      );
    });
  }
}

function startCameraCanvas() {
  const canvas = document.getElementById('cameraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const video = document.getElementById('webcamVideo');

  if (canvasAnimationId) cancelAnimationFrame(canvasAnimationId);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (AppState.cameraMode === 'live' && video.readyState >= 2) {
      // Draw live video feed
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Draw simulated camera backdrop
      const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, 300);
      grad.addColorStop(0, '#0f1725');
      grad.addColorStop(1, '#05080c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    }

    // Dynamic Skeleton Pose Simulation
    simulatedPhase += 0.035;
    const osc = (Math.sin(simulatedPhase) + 1) / 2; // 0.0 to 1.0

    // Coordinates based on exercise
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    let headY = 90 + osc * 50;
    let hipY = 220 + osc * 70;
    let kneeY = 300 + osc * 20;
    let kneeXSpread = 50 + osc * 25;
    let angleDeg = Math.round(170 - osc * 80);

    if (AppState.isTracking && osc > 0.96 && !AppState.repTriggered) {
      AppState.repTriggered = true;
      AppState.repCount += 1;
      playRepChime();
      updateRepDisplay();
    } else if (osc < 0.2) {
      AppState.repTriggered = false;
    }

    // Draw Skeleton Bones
    ctx.strokeStyle = '#00E599';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Spine
    ctx.beginPath(); ctx.moveTo(cx, headY + 30); ctx.lineTo(cx, hipY); ctx.stroke();
    // Left Leg
    ctx.beginPath(); ctx.moveTo(cx, hipY); ctx.lineTo(cx - kneeXSpread, kneeY); ctx.lineTo(cx - 45, 380); ctx.stroke();
    // Right Leg
    ctx.beginPath(); ctx.moveTo(cx, hipY); ctx.lineTo(cx + kneeXSpread, kneeY); ctx.lineTo(cx + 45, 380); ctx.stroke();
    // Shoulders & Arms
    ctx.beginPath(); ctx.moveTo(cx - 50, headY + 40); ctx.lineTo(cx + 50, headY + 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 50, headY + 40); ctx.lineTo(cx - 70, headY + 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 50, headY + 40); ctx.lineTo(cx + 70, headY + 100); ctx.stroke();

    // Draw Joint Landmarks
    const joints = [
      { x: cx, y: headY },
      { x: cx, y: headY + 40 },
      { x: cx, y: hipY },
      { x: cx - kneeXSpread, y: kneeY },
      { x: cx + kneeXSpread, y: kneeY },
      { x: cx - 45, y: 380 },
      { x: cx + 45, y: 380 },
      { x: cx - 50, y: headY + 40 },
      { x: cx + 50, y: headY + 40 },
      { x: cx - 70, y: headY + 100 },
      { x: cx + 70, y: headY + 100 }
    ];

    ctx.fillStyle = '#00E599';
    joints.forEach((j) => {
      ctx.beginPath();
      ctx.arc(j.x, j.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Update Telemetry HUD text
    const anglePill = document.getElementById('hudAnglePill');
    const feedbackPill = document.getElementById('hudFeedbackPill');
    if (anglePill) anglePill.textContent = `Joint Angle: ${angleDeg}°`;
    if (feedbackPill) {
      if (angleDeg <= 95) {
        feedbackPill.textContent = 'Depth: Excellent (Passes Parallel)';
        feedbackPill.style.color = '#00E599';
        feedbackPill.style.borderColor = '#00E599';
      } else {
        feedbackPill.textContent = 'Descend to 90° for full repetition';
        feedbackPill.style.color = '#38bdf8';
        feedbackPill.style.borderColor = '#38bdf8';
      }
    }

    canvasAnimationId = requestAnimationFrame(render);
  }

  render();
}

function updateRepDisplay() {
  const repNum = document.getElementById('hudRepCount');
  const progressFill = document.getElementById('sessionProgressFill');
  if (repNum) repNum.textContent = AppState.repCount;
  if (progressFill) {
    const pct = Math.min(100, Math.round((AppState.repCount / AppState.targetReps) * 100));
    progressFill.style.width = `${pct}%`;
  }
}

/* --------------------------------------------------------------------------
   6. COACH MODULES (MEMBERS, ATTENDANCE, ASSIGNMENT, AI INSIGHTS)
   -------------------------------------------------------------------------- */
function initCoachModules() {
  renderCoachRoster();
  renderCoachAttendance();

  // Search filter
  const searchInput = document.getElementById('inputMemberSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      renderCoachRoster(q);
    });
  }

  // Verify all attendance button
  const btnVerifyAll = document.getElementById('btnVerifyAllAttendance');
  if (btnVerifyAll) {
    btnVerifyAll.addEventListener('click', () => {
      AppState.roster.forEach((m) => { m.attended = true; m.timeIn = '11:30 AM'; });
      renderCoachAttendance();
      showAppToast('Attendance Updated', 'All 128 campus trainees verified for today.');
    });
  }

  // Assign workout form
  const formAssign = document.getElementById('formAssignWorkout');
  if (formAssign) {
    formAssign.addEventListener('submit', (e) => {
      e.preventDefault();
      const exercise = document.getElementById('assignExercise').value;
      const sets = document.getElementById('assignSets').value;
      const reps = document.getElementById('assignReps').value;
      showAppToast('Plan Broadcast', `Assigned ${sets} sets of ${reps} ${exercise} to student accounts.`);
      switchView('view-coach-dashboard');
    });
  }
}

function renderCoachRoster(query = '') {
  const tbody = document.getElementById('coachRosterTableBody');
  if (!tbody) return;

  const filtered = AppState.roster.filter((m) => 
    m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query) || m.dept.toLowerCase().includes(query)
  );

  tbody.innerHTML = filtered.map((m) => `
    <tr>
      <td style="font-weight: 600; color: #fff;">${m.name}</td>
      <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${m.id}</td>
      <td>${m.dept}</td>
      <td><span class="badge badge-mint">${m.streak} Days</span></td>
      <td><span class="badge badge-cyan">${m.formAvg}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="showAppToast('Trainee Selected', 'Viewing logs for ${m.name}')">View Telemetry</button>
      </td>
    </tr>
  `).join('');
}

function renderCoachAttendance() {
  const tbody = document.getElementById('coachAttendanceTableBody');
  const feed = document.getElementById('quickAttendanceFeed');

  if (tbody) {
    tbody.innerHTML = AppState.roster.map((m, idx) => `
      <tr>
        <td style="font-weight: 600; color: #fff;">${m.name} (${m.id})</td>
        <td style="font-family: var(--font-mono);">${m.timeIn}</td>
        <td>${m.status}</td>
        <td>
          <span class="badge ${m.attended ? 'badge-mint' : 'badge-dim'}">${m.attended ? 'Verified Present' : 'Pending'}</span>
        </td>
        <td>
          <button class="btn ${m.attended ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleAttendance(${idx})">
            ${m.attended ? 'Revoke' : 'Confirm'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  if (feed) {
    feed.innerHTML = AppState.roster.slice(0, 3).map((m) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-subtle);">
        <div>
          <div style="font-weight: 600; color: #ffffff;">${m.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${m.dept} • ${m.status}</div>
        </div>
        <span class="badge ${m.attended ? 'badge-mint' : 'badge-dim'}">${m.attended ? 'Confirmed' : 'Pending'}</span>
      </div>
    `).join('');
  }
}

function toggleAttendance(index) {
  AppState.roster[index].attended = !AppState.roster[index].attended;
  AppState.roster[index].timeIn = AppState.roster[index].attended ? '11:45 AM' : 'Pending';
  renderCoachAttendance();
  showAppToast('Attendance Updated', `Trainee record for ${AppState.roster[index].name} updated.`);
}

function applyAiRecommendation(trainee, recommendation) {
  showAppToast('AI Plan Applied', `Updated workout parameters for ${trainee}: ${recommendation}.`);
}

/* --------------------------------------------------------------------------
   7. IN-APP TOAST NOTIFICATIONS
   -------------------------------------------------------------------------- */
function showAppToast(title, message) {
  const container = document.getElementById('appToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.innerHTML = `<h5>${title}</h5><p>${message}</p>`;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 4000);
}
