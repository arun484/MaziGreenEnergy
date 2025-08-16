import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart, TimeScale, TimeSeriesScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useAuth } from '../contexts/AuthContext';

Chart.register(TimeScale, TimeSeriesScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Home: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const powerChartRef = useRef<Chart | null>(null);
    const financialChartRef = useRef<Chart | null>(null);
    const powerCanvasRef = useRef<HTMLCanvasElement>(null);
    const financialCanvasRef = useRef<HTMLCanvasElement>(null);

    const setupCharts = () => {
        if (powerChartRef.current) powerChartRef.current.destroy();
        if (financialChartRef.current) financialChartRef.current.destroy();

        Chart.defaults.color = '#9ca3af';
        Chart.defaults.borderColor = 'rgba(107, 114, 128, 0.3)';

        const powerLabels: Date[] = [];
        const actualPower: number[] = [];
        const targetPower: number[] = [];
        let cumulativeActual = 0;
        let cumulativeTarget = 0;
        for (let i = 0; i < 24; i++) {
            const date = new Date(2023, i, 1);
            powerLabels.push(date);
            cumulativeTarget += 320;
            targetPower.push(cumulativeTarget);
            const randomFactor = 0.9 + Math.random() * 0.2;
            cumulativeActual += 320 * randomFactor;
            actualPower.push(cumulativeActual);
        }

        const financialLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
        const revenue = [45, 48, 52, 49, 55, 58, 60, 62];
        const omCosts = [5, 4.5, 5.2, 4.8, 5.5, 5.1, 5.3, 5.4];
        const netRevenue = revenue.map((r, i) => r - omCosts[i]);

        if (powerCanvasRef.current) {
            const powerCtx = powerCanvasRef.current.getContext('2d');
            if (powerCtx) {
                powerChartRef.current = new Chart(powerCtx, {
                    type: 'line',
                    data: { labels: powerLabels as any, datasets: [{ label: 'Actual Generation (MWh)', data: actualPower, borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)', fill: true, tension: 0.4, pointRadius: 0 }, { label: 'Target Generation (MWh)', data: targetPower, borderColor: '#6b7280', borderDash: [5, 5], fill: false, pointRadius: 0 }] },
                    options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'quarter' }, grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: (value: any) => `${value / 1000}k` } } }, plugins: { legend: { position: 'top' } } }
                });
            }
        }

        if (financialCanvasRef.current) {
            const financialCtx = financialCanvasRef.current.getContext('2d');
            if (financialCtx) {
                financialChartRef.current = new Chart(financialCtx, {
                    type: 'bar',
                    data: { labels: financialLabels, datasets: [{ label: 'Gross Revenue (Lakhs)', data: revenue, backgroundColor: 'rgba(74, 222, 128, 0.6)', borderColor: '#4ade80', borderWidth: 1 }, { label: 'Net Revenue (Lakhs)', data: netRevenue, type: 'line', borderColor: '#f87171', backgroundColor: '#f87171', tension: 0.4, pointRadius: 2 }] },
                    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: (value: any) => `₹${value}L` } } }, plugins: { legend: { position: 'top' } } }
                });
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            setTimeout(setupCharts, 100);
        }
    }, [isAuthenticated]);

    return (
        <div className="bg-gray-900 text-gray-300">
            <header className="bg-gray-900/70 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-700/50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="#home" className="flex items-center gap-3">
                        <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3V4M12 20V21M16.9497 7.05025L16.2426 7.75736M7.75736 16.2426L7.05025 16.9497M21 12H20M4 12H3M16.9497 16.9497L16.2426 16.2426M7.75736 7.75736L7.05025 7.05025" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM12 8.5C13.933 8.5 15.5 10.067 15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5Z" fill="currentColor" />
                            <path d="M12 12C12 12 14 10 15 9C16 8 17 8 17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="text-2xl font-bold text-gray-100">Mazi Green Energy</span>
                    </a>
                    {!isAuthenticated ? (
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#home" className="text-gray-300 hover:text-green-400 transition-all duration-300">Home</a>
                            <a href="#about" className="text-gray-300 hover:text-green-400 transition-all duration-300">About</a>
                            <a href="#technology" className="text-gray-300 hover:text-green-400 transition-all duration-300">Technology</a>
                            <a href="#impact" className="text-gray-300 hover:text-green-400 transition-all duration-300">Impact</a>
                            <a href="#contact" className="text-gray-300 hover:text-green-400 transition-all duration-300">Contact</a>
                            <Link to="/login" className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105">Login</Link>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/dashboard" className="text-gray-300 hover:text-green-400 transition-all duration-300">Dashboard</Link>
                            <button onClick={logout} className="bg-red-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-red-500 transition-all duration-300 transform hover:scale-105">Logout</button>
                        </div>
                    )}
                    <div className="md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                    </div>
                </nav>
                <div className={`${isMobileMenuOpen ? '' : 'hidden'} md:hidden bg-gray-900 border-t border-gray-700`}>
                    {!isAuthenticated ? (
                        <div>
                            <a href="#home" className="block px-6 py-3 text-gray-300 hover:bg-gray-800">Home</a>
                            <a href="#about" className="block px-6 py-3 text-gray-300 hover:bg-gray-800">About</a>
                            <a href="#technology" className="block px-6 py-3 text-gray-300 hover:bg-gray-800">Technology</a>
                            <a href="#impact" className="block px-6 py-3 text-gray-300 hover:bg-gray-800">Impact</a>
                            <a href="#contact" className="block px-6 py-3 text-gray-300 hover:bg-gray-800">Contact</a>
                            <Link to="/login" className="block px-6 py-3 text-green-400 font-bold hover:bg-gray-800">Login</Link>
                        </div>
                    ) : (
                        <div>
                            <Link to="/dashboard" className="block px-6 py-3 text-gray-300 hover:bg-gray-800">Dashboard</Link>
                            <a href="/" onClick={logout} className="block px-6 py-3 text-red-400 font-bold hover:bg-gray-800">Logout</a>
                        </div>
                    )}
                </div>
            </header>

            {!isAuthenticated && (
                <main>
                    <section id="home" className="hero-bg text-white min-h-[70vh] md:min-h-[85vh] flex items-center justify-center" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('solar-background.png')" }}>
                        <div className="container mx-auto px-6 text-center">
                        <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">Powering a Brighter Tomorrow: Mazi Green Energy - A 2 MW Solar Initiative in India</h1>
                        <p className="text-lg md:text-xl font-light max-w-4xl mx-auto text-gray-200 mt-6">
                            Harnessing the sun's energy to provide clean, sustainable power and drive India's renewable energy revolution.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <a href="#impact" className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-500 transition-all duration-300">Learn More About Our Impact</a>
                            <a href="#contact" className="bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300">Connect with Us</a>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gray-800">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                            <div className="flex flex-col items-center">
                                <i className="fas fa-bolt text-4xl text-green-400 mb-4"></i>
                                <h3 className="text-xl font-bold text-white">2 MW Capacity</h3>
                                <p className="text-gray-400 mt-2">Generating enough electricity to power ~4,000 homes.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <i className="fas fa-leaf text-4xl text-green-400 mb-4"></i>
                                <h3 className="text-xl font-bold text-white">Clean Energy</h3>
                                <p className="text-gray-400 mt-2">Offsetting ~2,800 tons of carbon emissions annually.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <i className="fas fa-industry text-4xl text-green-400 mb-4"></i>
                                <h3 className="text-xl font-bold text-white">Made in India</h3>
                                <p className="text-gray-400 mt-2">Supporting local manufacturing and the "Make in India" initiative.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <i className="fas fa-globe-asia text-4xl text-green-400 mb-4"></i>
                                <h3 className="text-xl font-bold text-white">Sustainable Future</h3>
                                <p className="text-gray-400 mt-2">Contributing to a cleaner, greener India for generations to come.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="py-24 bg-gray-900">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white">Our Vision: A Sustainable Future, Powered by the Sun</h2>
                        </div>
                        <div className="max-w-4xl mx-auto text-lg text-center text-gray-300 space-y-4">
                            <p>Mazi Green Energy is a 2 MW solar power plant located in Mississauga. We are a testament to the power of renewable energy and a significant step towards India's ambitious clean energy goals. Our journey began with a simple belief: that a sustainable future is not just a possibility, but a necessity.</p>
                            <p>Our state-of-the-art facility uses cutting-edge photovoltaic technology to convert sunlight directly into electricity. We are proud to be a part of India's vibrant renewable energy sector, contributing to the country's energy security and environmental sustainability.</p>
                            <p className="text-xl font-semibold text-green-400 mt-6">Our Mission: To generate reliable, clean power while fostering a deeper understanding and adoption of renewable energy technologies.</p>
                        </div>
                    </div>
                </section>

                <section id="technology" className="py-24 bg-gray-800">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white">The Science of Sunshine: How We Generate Clean Power</h2>
                            <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">Our 2 MW plant is built with the highest quality components and advanced technology to ensure maximum efficiency and reliability.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-10 items-center">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-green-400 mb-2">Solar Panels</h3>
                                    <p>We use high-efficiency monocrystalline silicon panels, designed to perform optimally in India's unique climate conditions.</p>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-green-400 mb-2">Inverters</h3>
                                    <p>Our advanced inverters convert DC electricity from the panels into grid-compatible AC power with a high conversion efficiency rate.</p>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-green-400 mb-2">Mounting Structure</h3>
                                    <p>Robust mounting structures are engineered to withstand extreme weather, ensuring the longevity and stability of the plant.</p>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-green-400 mb-2">Monitoring System</h3>
                                    <p>A 24/7 remote monitoring system allows us to track performance, identify issues, and ensure a continuous and optimal power output.</p>
                                </div>
                            </div>
                            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                                <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <style>
                                        {`.label { font-family: 'Roboto', sans-serif; font-size: 18px; fill: #d1d5db; font-weight: 600; }
                                        .sublabel { font-size: 14px; fill: #9ca3af; }
                                        .flow-arrow { marker-end: url(#arrowhead); stroke: #4ade80; stroke-width: 2.5; stroke-dasharray: 10 5; animation: flow 2s linear infinite; }
                                        @keyframes flow { to { stroke-dashoffset: -15; } }`}
                                    </style>
                                    <defs>
                                        <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80" />
                                        </marker>
                                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <g transform="translate(100, 100)">
                                        <circle cx="0" cy="0" r="40" fill="#facc15" filter="url(#glow)" />
                                        <text x="0" y="75" textAnchor="middle" className="label">1. Sunlight</text>
                                    </g>
                                    <g transform="translate(100, 300)">
                                        <rect x="-60" y="-40" width="120" height="80" rx="10" fill="#374151" stroke="#4b5563" />
                                        <path d="M-50 -30 h100 M-50 -10 h100 M-50 10 h100 M-50 30 h100" stroke="#1f2937" strokeWidth="8" />
                                        <text x="0" y="75" textAnchor="middle" className="label">2. Solar Panels</text>
                                        <text x="0" y="95" textAnchor="middle" className="sublabel">(Generates DC)</text>
                                    </g>
                                    <g transform="translate(400, 300)">
                                        <rect x="-50" y="-40" width="100" height="80" rx="10" fill="#374151" stroke="#4b5563" />
                                        <text x="0" y="0" fontSize="24" fill="#4ade80" textAnchor="middle" dominantBaseline="middle">DC → AC</text>
                                        <text x="0" y="75" textAnchor="middle" className="label">3. Inverter</text>
                                    </g>
                                    <g transform="translate(700, 300)">
                                        <rect x="-60" y="-40" width="120" height="80" rx="10" fill="#374151" stroke="#4b5563" />
                                        <circle cx="-25" cy="0" r="15" stroke="#4b5563" strokeWidth="4" fill="none" />
                                        <circle cx="25" cy="0" r="15" stroke="#4b5563" strokeWidth="4" fill="none" />
                                        <text x="0" y="75" textAnchor="middle" className="label">4. Transformer</text>
                                        <text x="0" y="95" textAnchor="middle" className="sublabel">(Steps up Voltage)</text>
                                    </g>
                                    <g transform="translate(400, 500)">
                                        <path d="M-60 40 L -40 -40 L 0 40 L 20 -40 L 60 40" stroke="#4b5563" strokeWidth="4" fill="none" />
                                        <text x="0" y="75" textAnchor="middle" className="label">5. Power Grid</text>
                                    </g>
                                    <g transform="translate(700, 500)">
                                        <path d="M-30 40 V 0 L 0 -20 L 30 0 V 40 Z" fill="#374151" stroke="#4b5563" />
                                        <rect x="-15" y="10" width="30" height="30" fill="#facc15" />
                                        <text x="0" y="75" textAnchor="middle" className="label">6. Homes</text>
                                    </g>
                                    <path d="M100 140 V 260" className="flow-arrow" />
                                    <path d="M160 300 H 350" className="flow-arrow" />
                                    <path d="M450 300 H 640" className="flow-arrow" />
                                    <path d="M700 340 V 460" className="flow-arrow" />
                                    <path d="M640 500 H 460" className="flow-arrow" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="impact" className="py-24 bg-gray-900">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white">More Than Just Power: Our Contribution to a Greener India</h2>
                            <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">Our 2 MW solar plant's impact extends far beyond electricity generation. We are a force for positive change, contributing to a better environment and a stronger economy.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 className="text-2xl font-bold text-green-400 mb-3">Environmental Impact</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li><strong>Carbon Offset:</strong> Prevents ~2,800 tons of CO₂ emissions annually.</li>
                                    <li><strong>Equivalent to:</strong> Planting ~7,500 trees each year.</li>
                                    <li><strong>Water Conservation:</strong> Requires virtually no water for power production.</li>
                                </ul>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 className="text-2xl font-bold text-green-400 mb-3">Economic Impact</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li><strong>Energy Security:</strong> Reduces reliance on imported fossil fuels.</li>
                                    <li><strong>Job Creation:</strong> Creates local jobs in construction and maintenance.</li>
                                    <li><strong>Stimulates Economy:</strong> Boosts the regional green technology sector.</li>
                                </ul>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 className="text-2xl font-bold text-green-400 mb-3">Social Impact</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li><strong>Community Engagement:</strong> Promoting the benefits of renewable energy.</li>
                                    <li><strong>Educational Opportunities:</strong> Hosting tours and workshops for students.</li>
                                    <li><strong>Inspiring Change:</strong> Leading by example for a sustainable future.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-xl mt-16">
                            <h3 className="text-3xl font-bold text-white text-center mb-8">Facts and Figures</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                                <div><p className="text-4xl font-extrabold text-green-400">2 MW</p><p className="text-gray-400 mt-1">Total Capacity</p></div>
                                <div><p className="text-4xl font-extrabold text-green-400">3,800 MWh</p><p className="text-gray-400 mt-1">Annual Generation</p></div>
                                <div><p className="text-4xl font-extrabold text-green-400">2,800 tons</p><p className="text-gray-400 mt-1">CO2 Saved Annually</p></div>
                                <div><p className="text-4xl font-extrabold text-green-400">25 Years</p><p className="text-gray-400 mt-1">Operational Lifetime</p></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="contact" className="py-24 bg-gray-800">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white">Get in Touch With Us</h2>
                            <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">We are always open to questions, collaboration opportunities, and partnerships. We'd love to hear from you.</p>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-12">
                            <div>
                                <form className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-gray-400 mb-2">Name</label>
                                        <input type="text" id="name" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-700 text-white border-gray-600" />
                                    </div>
                                    <div>
                                        <label htmlFor="contact-email" className="block text-gray-400 mb-2">Email</label>
                                        <input type="email" id="contact-email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-700 text-white border-gray-600" />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-gray-400 mb-2">Subject</label>
                                        <input type="text" id="subject" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-700 text-white border-gray-600" />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-gray-400 mb-2">Message</label>
                                        <textarea id="message" rows={5} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-700 text-white border-gray-600"></textarea>
                                    </div>
                                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-500 transition-colors">Send Message</button>
                                </form>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Contact Information</h3>
                                    <p><i className="fas fa-map-marker-alt w-6 text-green-400"></i> 123 Solar Drive, Mississauga, ON, Canada</p>
                                    <p><i className="fas fa-phone w-6 text-green-400"></i> (123) 456-7890</p>
                                    <p><i className="fas fa-envelope w-6 text-green-400"></i> contact@mazigreen.energy</p>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Follow Us</h3>
                                    <div className="flex space-x-4">
                                        <a href="/" className="text-gray-400 hover:text-green-400"><i className="fab fa-twitter fa-2x"></i></a>
                                        <a href="/" className="text-gray-400 hover:text-green-400"><i className="fab fa-linkedin-in fa-2x"></i></a>
                                        <a href="/" className="text-gray-400 hover:text-green-400"><i className="fab fa-instagram fa-2x"></i></a>
                                    </div>
                                </div>
                                <div className="h-64 rounded-xl overflow-hidden border border-gray-700">
                                    <iframe
                                        title="Mazi Green Energy Location"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92437.58315365547!2d-79.75549714342426!3d43.62156193758233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b402be28c8a85%3A0x19447353554e7c56!2sMississauga%2C%2ON!5e0!3m2!1sen!2sca!4v1660426756306!5m2!1sen!2sca&style=dark"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                                        allowFullScreen={true}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade">
                                    </iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                </main>
            )}

            {isAuthenticated && (
                <div className="bg-gray-900">
                    <section id="investor-dashboard-private" className="py-24">
                        <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white">Investor Dashboard</h2>
                            <p className="text-lg text-gray-400 mt-4">Transparent insights into your investment and our collective impact.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"><h4 className="text-sm font-semibold text-gray-400">YTD Net Revenue</h4><p className="text-3xl font-bold text-white mt-2">₹ 1.2 Cr</p></div>
                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"><h4 className="text-sm font-semibold text-gray-400">Lifetime Generation</h4><p className="text-3xl font-bold text-white mt-2">8,250 MWh</p></div>
                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"><h4 className="text-sm font-semibold text-gray-400">Plant Availability</h4><p className="text-3xl font-bold text-white mt-2">99.2%</p></div>
                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"><h4 className="text-sm font-semibold text-gray-400">CO₂ Reduction</h4><p className="text-3xl font-bold text-white mt-2">5,775 Tonnes</p></div>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                                <h3 className="text-2xl font-bold text-white mb-4">Power Generation vs. Target (MWh)</h3>
                                <div className="h-80">
                                    <canvas ref={powerCanvasRef}></canvas>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                                <h3 className="text-2xl font-bold text-white mb-4">Financial Performance (YTD)</h3>
                                <div className="h-80">
                                    <canvas ref={financialCanvasRef}></canvas>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                                <h3 className="text-2xl font-bold text-white mb-4">Live Video Monitoring</h3>
                                <div className="h-80 bg-black flex items-center justify-center">
                                    <p className="text-gray-500">Live video feed coming soon.</p>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                                <h3 className="text-2xl font-bold text-white mb-4">SCADA System Integration</h3>
                                <div className="h-80 bg-black flex items-center justify-center">
                                    <p className="text-gray-500">SCADA system data coming soon.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                </div>
            )}
        </div>
    );
};

export default Home;
