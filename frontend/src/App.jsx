// src/App.jsx
import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  TrendingUp,
  Radar,
  Radio,
  SlidersHorizontal,
  TableProperties,
  BookOpenCheck,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  nationalIndexSummary,
  indexTrend12Months,
  regionalContributions,
  routeSurveillance,
  airlineSources,
  otaSources,
  bookingWindowData,
  priceDrivers,
  rawObservations,
  methodologySteps,
} from "./data/mockData";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "index", label: "Airfare Index", icon: TrendingUp },
    { id: "monitoring", label: "Market Monitoring", icon: Radar },
    { id: "collection", label: "Data Collection", icon: Radio },
    { id: "dynamics", label: "Price Dynamics", icon: SlidersHorizontal },
    { id: "explorer", label: "Data Explorer", icon: TableProperties },
    { id: "methodology", label: "Methodology", icon: BookOpenCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                MoSPI / NSO DIID
              </span>
              <span className="text-xs text-slate-400">SIH PS-26056</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white">
              AIRFARE PRICE INDEX <span className="font-normal text-slate-400">| Real-Time Airfare Intelligence for India</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {nationalIndexSummary.systemStatus}
            </div>
            <div className="text-right text-slate-400 text-[11px]">
              <div>LIVE: <strong className="text-slate-200">{nationalIndexSummary.liveTimestamp}</strong></div>
              <div>Updated {nationalIndexSummary.lastUpdated}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 border-t border-slate-800/60 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? "border-sky-400 text-sky-400 bg-sky-500/5 font-semibold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">

        {/* 1. DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">NATIONAL AIRFARE INDEX</div>
                <div className="text-3xl font-extrabold text-white mt-1">{nationalIndexSummary.currentIndex}</div>
                <div className="text-[11px] text-slate-500 mt-2">Base Period: {nationalIndexSummary.basePeriod}</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">MONTHLY CHANGE</div>
                <div className="text-3xl font-extrabold text-rose-400 mt-1 flex items-center">
                  <ArrowUpRight className="w-6 h-6" /> {nationalIndexSummary.monthlyChange}
                </div>
                <div className="text-[11px] text-slate-500 mt-2">{nationalIndexSummary.vsPrevious}</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">OBSERVATIONS TODAY</div>
                <div className="text-3xl font-extrabold text-sky-400 mt-1">{nationalIndexSummary.observationsToday}</div>
                <div className="text-[11px] text-slate-500 mt-2">High-frequency collection</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">ROUTES TRACKED</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">{nationalIndexSummary.routesTracked}</div>
                <div className="text-[11px] text-slate-500 mt-2">14 Sources (9 Airlines, 5 OTAs)</div>
              </div>
            </div>

            {/* Middle Grid: Today's Movements + Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl lg:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-white">Top Route Movements (Today)</h3>
                <div className="divide-y divide-slate-800 text-xs">
                  {routeSurveillance.slice(0, 4).map((r, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between">
                      <div className="font-semibold text-slate-200">{r.origin} ➔ {r.destination}</div>
                      <div className="text-slate-300 font-bold">{r.fare}</div>
                      <div className={r.change.startsWith("+") ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                        {r.change}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.badge === "rose" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                        r.badge === "amber" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                        r.badge === "emerald" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                        "bg-slate-800 text-slate-300"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white">Index Summary</h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Current Index</span>
                    <span className="font-bold text-white">{nationalIndexSummary.currentIndex}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Monthly Change</span>
                    <span className="text-rose-400 font-bold">▲ {nationalIndexSummary.monthlyChange}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Quarterly Change</span>
                    <span className="text-rose-400 font-bold">▲ {nationalIndexSummary.quarterlyChange}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Yearly Change</span>
                    <span className="text-rose-400 font-bold">▲ {nationalIndexSummary.yearlyChange}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Frequency</span>
                    <span>{nationalIndexSummary.frequency}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Coverage</span>
                    <span>184 Routes, 9 Airlines, 5 OTAs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. AIRFARE INDEX TAB */}
        {activeTab === "index" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">National Airfare Index (12 Months Trend)</h2>
                  <p className="text-xs text-slate-400">Detailed index analysis at national, regional, route, and airline levels.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">128.6</span>
                  <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                    ▲ 4.8%
                  </span>
                </div>
              </div>

              {/* 12-Month Line Chart */}
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={indexTrend12Months}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[105, 140]} stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="index" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: "#38bdf8" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Regional Contribution Breakdown */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Regional Contribution to National Index</h3>
              <div className="space-y-3">
                {regionalContributions.map((r, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{r.region}</span>
                      <span>Index: <strong className="text-white">{r.index}</strong> • Contribution: <strong>{r.share}%</strong></span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: `${r.share * 2.5}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. MARKET MONITORING TAB */}
        {activeTab === "monitoring" && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white">Live Route Movement Surveillance</h2>
                <p className="text-xs text-slate-400">Monitor route-level airfare movements and significant dynamic surge alerts.</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 px-3 py-1.5 rounded border border-slate-700">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Feeds
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="p-3">ROUTE</th>
                    <th className="p-3">CURRENT FARE</th>
                    <th className="p-3">CHANGE</th>
                    <th className="p-3">INDEX</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {routeSurveillance.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-slate-200">{r.origin} ➔ {r.destination}</td>
                      <td className="p-3 font-bold text-white">{r.fare}</td>
                      <td className={`p-3 font-semibold ${r.change.startsWith("+") ? "text-rose-400" : "text-emerald-400"}`}>
                        {r.change}
                      </td>
                      <td className="p-3 text-slate-300">{r.index}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.badge === "rose" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                          r.badge === "amber" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                          r.badge === "emerald" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                          "bg-slate-800 text-slate-300"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. DATA COLLECTION TAB */}
        {activeTab === "collection" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Airlines */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> AIRLINE SOURCES (DIRECT)
                </h3>
                <div className="divide-y divide-slate-800 text-xs">
                  {airlineSources.map((s, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <span className="font-semibold text-slate-200">{s.name}</span>
                      <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {s.status}
                      </span>
                      <span className="text-slate-400 font-mono">{s.time}</span>
                      <span className="font-bold text-white">{s.count} quotes</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* OTAs */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> OTA SOURCES (AGGREGATORS)
                </h3>
                <div className="divide-y divide-slate-800 text-xs">
                  {otaSources.map((s, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <span className="font-semibold text-slate-200">{s.name}</span>
                      <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {s.status}
                      </span>
                      <span className="text-slate-400 font-mono">{s.time}</span>
                      <span className="font-bold text-white">{s.count} quotes</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Collection KPI Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap justify-between items-center gap-4 text-xs">
              <div><strong>48,621</strong> <span className="text-slate-400">Observations Today</span></div>
              <div><strong>184</strong> <span className="text-slate-400">Routes Covered</span></div>
              <div><strong className="text-emerald-400">14 OPERATIONAL</strong> <span className="text-slate-400">Active Sources</span></div>
              <div><strong>2 mins</strong> <span className="text-slate-400">Last Synced</span></div>
            </div>
          </div>
        )}

        {/* 5. PRICE DYNAMICS TAB */}
        {activeTab === "dynamics" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">Average Fare vs. Booking Window</h2>
                <p className="text-xs text-slate-400">Analyze lead-time escalation from T+30 days down to T+1 day of travel.</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingWindowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="window" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="fare" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Booking Window Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {bookingWindowData.map((b, i) => (
                  <div key={i} className="p-3 bg-slate-800/40 rounded-lg border border-slate-700 text-center text-xs">
                    <div className="text-slate-400">{b.window}</div>
                    <div className="text-sm font-bold text-white my-1">₹{b.fare}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      b.category === "Higher" ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"
                    }`}>
                      {b.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Driver Badges */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-white">PRICE DRIVER SUMMARY</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {priceDrivers.map((d, i) => (
                  <div key={i} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/60 text-center">
                    <div className="text-xs text-slate-400 mb-1">{d.label}</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${d.color}`}>
                      {d.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. DATA EXPLORER TAB */}
        {activeTab === "explorer" && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-base font-bold text-white">Timestamped Fare Observations</h2>
                <p className="text-xs text-slate-400">Inspect raw scraped quotes fed into the Jevons/Laspeyres index computation engine.</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded font-medium transition">
                <Download className="w-3.5 h-3.5" /> Export Observations (CSV)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-800/80 text-slate-400 font-sans border-b border-slate-700">
                  <tr>
                    <th className="p-3">TIMESTAMP</th>
                    <th className="p-3">ROUTE</th>
                    <th className="p-3">SOURCE</th>
                    <th className="p-3">AIRLINE</th>
                    <th className="p-3">DEPARTURE</th>
                    <th className="p-3">BOOKING</th>
                    <th className="p-3">FARE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {rawObservations.map((o, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-slate-400">{o.time}</td>
                      <td className="p-3 font-semibold text-white">{o.route}</td>
                      <td className="p-3 text-sky-400">{o.source}</td>
                      <td className="p-3">{o.airline}</td>
                      <td className="p-3">{o.departure}</td>
                      <td className="p-3">{o.booking}</td>
                      <td className="p-3 font-bold text-emerald-400">{o.fare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right text-[11px] text-slate-500">Showing 1-20 of 48,621 records</div>
          </div>
        )}

        {/* 7. METHODOLOGY TAB */}
        {activeTab === "methodology" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h2 className="text-base font-bold text-white">Index Computation Pipeline (End-to-End)</h2>
              <p className="text-xs text-slate-400">From raw airline/OTA high-frequency observations to official CPI augmentation.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {methodologySteps.map((step) => (
                  <div key={step.num} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold">
                      {step.num}
                    </div>
                    <div className="text-sm font-bold text-white">{step.name}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-white">Key Methodology Points</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">• <strong>Base Period:</strong> Jan 2024 = 100</div>
                <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">• <strong>Frequency:</strong> Real-time (Every 15 mins)</div>
                <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">• <strong>Weights:</strong> DGCA passenger volume shares</div>
                <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">• <strong>Deduplication:</strong> Multi-source OTA aggregation</div>
                <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">• <strong>Cleaned Data:</strong> Automated outlier & sold-out filter</div>
                <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">• <strong>Target:</strong> Augments manual CPI transport index</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 text-center py-4 text-xs text-slate-500">
        MoSPI / NSO Data Informatics & Innovation Division (DIID) • Problem Statement ID: 26056 • SIH 2026
      </footer>
    </div>
  );
}