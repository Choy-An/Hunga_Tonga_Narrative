document.addEventListener("DOMContentLoaded", () => {
  const sequenceImage = document.getElementById("sequenceImage");
  const locationText = document.getElementById("locationText");
  const hungaText = document.querySelector(".hunga-text");
  const container = document.getElementById("imageSequenceContainer");

  const eventText = document.querySelector(".event-text");
  const videoTrigger = document.getElementById("videoTriggerMarker");
  const eventVideoWrapper = document.getElementById("eventVideoWrapper");
  const eventVideo = document.getElementById("eventVideo");

  const frameCount = 456;
  const framePath = index =>
    `assets/zoom-sequence/hunga-zoom_${String(index).padStart(3, '0')}.jpeg`;

  const preloadImages = () => {
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = framePath(i);
    }
  };
  preloadImages();

  let hasPlayed = false;

  window.addEventListener("scroll", () => {
    const rect = document.querySelector(".scroll-space").getBoundingClientRect();
    let scrollProgress = Math.min(
      Math.max((window.innerHeight - rect.top) / rect.height, 0),
      1
    );

    if (scrollProgress > 0 && window.getComputedStyle(locationText).opacity !== "0") {
      locationText.style.transition = "opacity 0.8s ease";
      locationText.style.opacity = "0";
    }

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
        }, index * 400);
      }
    });
  }, { threshold: 0.1 });

  factLines.forEach((line) => {
    observer.observe(line);
  });

  // ========== CHART SECTION LOGIC ==========

  Papa.parse('assets/monthly_chart.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      const labels = [];
      const temperatureData = [];
      const baselineData = [];
      const animatedData = [];
      const reasons = [];

      results.data.forEach(row => {
        if (
          row['Month'] &&
          !isNaN(row['Temperature']) &&
          !isNaN(row['Baseline_Temperature'])
        ) {
          labels.push(row['Month']);
          temperatureData.push(row['Temperature']);
          baselineData.push(row['Baseline_Temperature']);
          animatedData.push(null);
          reasons.push(row['Reason'] || '');
        }
      });

      const ctx = document.getElementById('tempChart').getContext('2d');

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Temperature Rise (°C)',
              data: animatedData,
              borderColor: 'red',
              borderWidth: 2,
              tension: 0.4,
              pointBackgroundColor: 'white',
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Baseline Temperature (°C)',
              data: baselineData,
              borderColor: 'white',
              borderWidth: 1.5,
              borderDash: [4, 4],
              pointRadius: 0,
              tension: 0
            }
          ]
        },
        options: {
          responsive: true,
          animation: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const idx = context.dataIndex;
                  const reason = reasons[idx];
                  return reason ? reason : `${context.dataset.label}: ${context.formattedValue}`;
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
              title: {
                display: true,
                text: 'Month',
                color: 'white',
                font: {
                  weight: 'bold'
                }
              },
              ticks: {
                color: 'white'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Temperature Anomaly (°C)',
                color: 'white',
                font: {
                  weight: 'bold'
                }
              },
              ticks: {
                color: 'white'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      });

      let currentIndex = 0;

      function animateChart() {
        if (currentIndex < temperatureData.length) {
          animatedData[currentIndex] = temperatureData[currentIndex];
          chart.update();
          currentIndex++;
          requestAnimationFrame(animateChart);
        }
      }

      animateChart();
    }
  });

  sequenceImage.src = framePath(0);
});

