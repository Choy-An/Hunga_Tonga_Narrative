document.addEventListener("DOMContentLoaded", () => {
  const sequenceImage = document.getElementById("sequenceImage");
  const locationText = document.getElementById("locationText");
  const hungaText = document.querySelector(".hunga-text");
  const container = document.getElementById("imageSequenceContainer");

  // New: Select video section elements
  const eventText = document.querySelector(".event-text");
  const videoTrigger = document.getElementById("videoTriggerMarker");
  const eventVideoWrapper = document.getElementById("eventVideoWrapper");
  const eventVideo = document.getElementById("eventVideo");

  const frameCount = 456; // 0–455
  const framePath = index =>
    `assets/zoom-sequence/hunga-zoom_${String(index).padStart(3, '0')}.jpeg`;

  // Preload images
  const preloadImages = () => {
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = framePath(i);
    }
  };
  preloadImages();

  let hasPlayed = false;

  // Scroll handler
  window.addEventListener("scroll", () => {
    // ===== Scene 2: Image Sequence Scroll Logic =====
    const rect = document.querySelector(".scroll-space").getBoundingClientRect();
    let scrollProgress = Math.min(
      Math.max((window.innerHeight - rect.top) / rect.height, 0),
      1
    );

    // Fade out scroll-down text
    if (scrollProgress > 0 && window.getComputedStyle(locationText).opacity !== "0") {
      locationText.style.transition = "opacity 0.8s ease";
      locationText.style.opacity = "0";
    }

    // Slow cinematic effect for last frames
    const slowStartFrame = 445;
    const slowEndFrame = 455;
    const slowStart = slowStartFrame / frameCount;
    const slowEnd = slowEndFrame / frameCount;

    if (scrollProgress >= slowStart && scrollProgress < slowEnd) {
      const t = (scrollProgress - slowStart) / (slowEnd - slowStart);
      const eased = 1 - Math.pow(1 - t, 3);
      scrollProgress = Math.min(
        slowEnd,
        slowStart + eased * (slowEnd - slowStart)
      );
    }

    const frameIndex = Math.max(
      0,
      Math.min(frameCount - 1, Math.round(scrollProgress * (frameCount - 1)))
    );

    sequenceImage.src = framePath(frameIndex);

    if (frameIndex >= 453) {
      hungaText.style.opacity = "1";
      hungaText.style.transform = "scale(1)";
    } else {
      hungaText.style.opacity = "0";
      hungaText.style.transform = "scale(0.95)";
    }

    // ===== Scene 3: Trigger Video Section =====
    const triggerRect = videoTrigger.getBoundingClientRect();
    const isTriggered = triggerRect.top < window.innerHeight * 0.6;

    if (isTriggered) {
      eventText.style.opacity = '0';
      eventVideoWrapper.style.opacity = '1';

      if (!hasPlayed) {
        eventVideo.play();
        hasPlayed = true;
      }
    } else {
      eventText.style.opacity = '1';
      eventVideoWrapper.style.opacity = '0';
      eventVideo.pause();
      eventVideo.currentTime = 0;
      hasPlayed = false;
    }
  });

const factLines = document.querySelectorAll(".fact-line");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !entry.target.classList.contains("show")) {
      const index = [...factLines].indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add("show");
      }, index * 400); // Staggered delay
    }
  });
}, { threshold: 0.1 });

factLines.forEach((line) => {
  observer.observe(line);
});

// Load and draw the chart
// Load CSV from assets
async function loadTemperatureData() {
  const response = await fetch('assets/monthly_chart.csv');
  const text = await response.text();
  const lines = text.trim().split('\n').slice(1);

  const labels = [];
  const dataPoints = [];
  const reasons = [];

  lines.forEach(line => {
    const [month, temp, reason] = line.split(',');
    labels.push(month);
    dataPoints.push(parseFloat(temp));
    reasons.push(reason.replace(/^"|"$/g, '')); // remove quotes
  });

  return { labels, dataPoints, reasons };
}

async function createTemperatureChart() {
  const { labels, dataPoints, reasons } = await loadTemperatureData();

  const ctx = document.getElementById('tempChart').getContext('2d');

  const tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature Rise (°C)',
        data: dataPoints,
        fill: false,
        borderColor: 'red',
        borderWidth: 2,
        pointBackgroundColor: 'white',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              return `Reason: ${reasons[context.dataIndex]}`;
            }
          }
        },
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

createTemperatureChart();

// Watch when chart section is out of view
const chartSection = document.getElementById('chartContainer');
const isotypeSection = document.getElementById('isotypeSection');
const planeContainer = document.getElementById('planeContainer');

let hasAnimatedPlanes = false;

function isChartOutOfView() {
  const rect = chartSection.getBoundingClientRect();
  return rect.bottom < 0;
}

function showIsotypeSection() {
  isotypeSection.style.display = 'block';
  setTimeout(() => {
    isotypeSection.style.opacity = 1;
  }, 50);
}

function animatePlanes() {
  if (hasAnimatedPlanes) return;
  hasAnimatedPlanes = true;

  for (let i = 0; i < 30; i++) {
    const plane = document.createElement('img');
    plane.src = 'plane_isotype.png';
    plane.classList.add('plane-icon');
    planeContainer.appendChild(plane);

    setTimeout(() => {
      plane.style.opacity = 1;
    }, i * 200); // 200ms delay between each plane
  }
}

window.addEventListener('scroll', () => {
  if (isChartOutOfView()) {
    showIsotypeSection();
    animatePlanes();
  }
});


  // Set initial frame
  sequenceImage.src = framePath(0);
});
