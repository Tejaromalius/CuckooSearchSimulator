export class StatsManager {
  constructor() {
    this.ctx = document.getElementById('fitness-chart').getContext('2d');
    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Best Fitness',
          data: [],
          borderColor: '#00f260',
          backgroundColor: 'rgba(0, 242, 96, 0.1)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: { display: false },
          y: {
            grid: { color: '#333' },
            ticks: { color: '#888', font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    this.updateInterval = 5; // Update chart every 5 gens
  }

  reset() {
    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.update();
  }

  update(gen, bestVal) {
    if (gen % this.updateInterval !== 0) return;

    // Cap data points to avoid slow down
    if (this.chart.data.labels.length > 100) {
      this.chart.data.labels.shift();
      this.chart.data.datasets[0].data.shift();
    }

    this.chart.data.labels.push(gen);
    this.chart.data.datasets[0].data.push(bestVal);
    this.chart.update('none'); // 'none' for performance
  }
}
