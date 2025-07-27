import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { getHistoricalData } from '../services/tokenService';
import { toast } from 'react-hot-toast';

// Dynamically import ApexCharts only on the client side
const ApexCharts = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);

const PriceChart = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [series, setSeries] = useState([{
    name: 'Price',
    data: []
  }]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Map time range to days for the API
  const getDaysFromTimeRange = useCallback(() => {
    switch(timeRange) {
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 7;
    }
  }, [timeRange]);

  // Format price for tooltip
  const formatPrice = useCallback((value) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '$0.00';
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(numValue);
    } catch (error) {
      console.error('Error formatting price:', error);
      return '$0.00';
    }
  }, []);

  // Fetch chart data from API
  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      
      const days = getDaysFromTimeRange();
      const historicalData = await getHistoricalData(days);
      
      if (!historicalData || historicalData.length === 0) {
        throw new Error('No data available');
      }
      
      // Process the data for the chart
      const processedData = historicalData.map(item => ({
        x: item.x, // timestamp
        y: item.y  // price
      }));
      
      setSeries([{ name: 'Price', data: processedData }]);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setLoading(false);
      toast.error('Failed to load chart data. Using cached data if available.');
    }
  }, [getDaysFromTimeRange]);

  // Initialize and fetch data
  useEffect(() => {
    setIsClient(true);
    fetchChartData();
    
    // Set up refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchChartData, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchChartData]);

  // Re-fetch data when time range changes
  useEffect(() => {
    if (isClient) {
      fetchChartData();
    }
  }, [timeRange, isClient, fetchChartData]);

  // Set isMounted to true on component mount
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Chart options
  const options = {
    chart: {
      type: 'area',
      height: 350,
      zoom: {
        enabled: true,
        autoScaleYaxis: true
      },
      toolbar: {
        show: true,
        tools: {
          download: '<span class="text-gray-700 dark:text-gray-300">Download</span>',
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        },
        export: {
          csv: {
            filename: `PGC-price-chart-${timeRange}`,
            headerCategory: 'Date',
            headerValue: 'Price (USD)'
          },
          svg: {
            filename: `PGC-price-chart-${timeRange}`
          },
          png: {
            filename: `PGC-price-chart-${timeRange}`
          }
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      foreColor: '#6b7280',
      fontFamily: 'Inter, sans-serif',
      background: 'transparent',
      id: 'pgc-price-chart',
      sparkline: {
        enabled: false
      },
      events: {
        mounted: function(chartContext, config) {
          chartContext.windowResizeHandler();
        }
      }
    },
    colors: ['#3b82f6'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      lineCap: 'round'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          [
            {
              offset: 0,
              color: '#3b82f6',
              opacity: 0.8
            },
            {
              offset: 100,
              color: '#3b82f6',
              opacity: 0.1
            }
          ]
        ]
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        format: timeRange === '24h' ? 'HH:mm' : 
               timeRange === '7d' ? 'ddd' :
               timeRange === '30d' ? 'MMM dd' : 'MMM yyyy',
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
          cssClass: 'apexcharts-xaxis-label'
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      tooltip: {
        enabled: false
      },
      crosshairs: {
        show: true,
        width: 1,
        position: 'back',
        opacity: 0.9,
        stroke: {
          color: '#4b5563',
          width: 1,
          dashArray: 0
        },
        fill: {
          type: 'solid',
          color: '#1f2937',
          gradient: {
            colorFrom: '#1f2937',
            colorTo: '#1f2937',
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5
          }
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => formatPrice(value),
        style: {
          colors: ['#9ca3af'],
          fontSize: '12px',
          cssClass: 'apexcharts-yaxis-label'
        }
      },
      tooltip: {
        enabled: false
      },
      forceNiceScale: true,
      floating: false,
      decimalsInFloat: 8,
      tickAmount: 6
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      x: {
        show: true,
        format: timeRange === '24h' ? 'HH:mm, MMM d' : 
               timeRange === '7d' ? 'EEE, MMM d' : 
               timeRange === '30d' ? 'MMM d, yyyy' : 'MMM d, yyyy',
        formatter: undefined
      },
      y: {
        formatter: (value) => formatPrice(value),
        title: {
          formatter: (seriesName) => `${seriesName}: `
        }
      },
      theme: 'dark',
      marker: {
        show: true,
        fillColors: ['#3b82f6']
      },
      fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      onDatasetHover: {
        highlightDataSeries: true,
      },
      fillSeriesColor: true
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 4,
      padding: {
        top: 10,
        right: 10,
        bottom: 0,
        left: 10
      },
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
            toolbar: {
              show: true,
              tools: {
                download: false
              }
            }
          },
          xaxis: {
            labels: {
              format: timeRange === '24h' ? 'HH:mm' : 
                     timeRange === '7d' ? 'ddd' : 'MMM dd'
            }
          }
        }
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 250,
            toolbar: {
              show: false
            }
          },
          xaxis: {
            labels: {
              format: timeRange === '24h' ? 'HH:mm' : 
                     timeRange === '7d' ? 'dd' : 'MM/dd'
            }
          },
          yaxis: {
            labels: {
              formatter: (value) => formatPrice(value, 4)
            }
          },
          tooltip: {
            x: {
              format: timeRange === '24h' ? 'HH:mm, MMM d' : 'MMM d'
            }
          }
        }
      }
    ]
  };

  // Time range buttons
  const timeRanges = [
    { label: '24H', value: '24h' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' }
  ];

  if (!isMounted) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Time range selector */}
      <div className="flex justify-end mb-4 space-x-2">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === range.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      {/* Chart container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {isMounted && (
          <Chart
            ref={chartRef}
            options={{
              ...options,
              theme: {
                mode: 'light'
              }
            }}
            series={series}
            type="area"
            height={350}
            width="100%"
          />
        )}
      </div>
    </div>
  );
};

export default PriceChart;
