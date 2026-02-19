import Head from "next/head";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentWindow, setCurrentWindow] = useState("1d");
  const [usernameInput, setUsernameInput] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const WINDOWS = {
    "1h": { label: "1 Hour", slots: 12 },
    "1d": { label: "1 Day", slots: 24 },
    "7d": { label: "7 Days", slots: 7 },
    "30d": { label: "30 Days", slots: 30 },
    "1y": { label: "1 Year", slots: 12 },
  };

  const handleSearch = async () => {
    const raw = usernameInput.trim().replace(/^@/, "");
    if (!raw) return;
    setCurrentUser(raw);
    await loadStats(raw, currentWindow);
  };

  const loadStats = async (user, window) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/stats?user=${encodeURIComponent(user)}&window=${window}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWindowChange = (win) => {
    setCurrentWindow(win);
    if (currentUser) {
      loadStats(currentUser, win);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GitHub Profile Views Tracker</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #070b13;
          --surface:  #0c1422;
          --border:   #162035;
          --accent:   #38bdf8;
          --accent2:  #0ea5e9;
          --text:     #cbd5e1;
          --muted:    #334155;
          --dim:      #1e3050;
          --green:    #4ade80;
          --purple:   #818cf8;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'IBM Plex Mono', monospace;
          min-height: 100vh;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        header {
          border-bottom: 1px solid var(--border);
          padding: 16px 28px;
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .logo { font-family: 'Bebas Neue', cursive; font-size: 22px; letter-spacing: 3px; }
        .logo span { color: var(--accent); }

        main { max-width: 1100px; margin: 0 auto; padding: 28px 24px; }

        .search-row { display: flex; gap: 10px; margin-bottom: 32px; }
        .search-wrap { flex: 1; position: relative; }
        .search-prefix {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: var(--dim); font-size: 12px; pointer-events: none; user-select: none;
        }

        input[type=text] {
          width: 100%; padding: 10px 16px 10px 116px;
          background: var(--surface); border: 1px solid var(--border);
          color: #e2e8f0; border-radius: 10px;
          font-family: 'IBM Plex Mono', monospace; font-size: 13px;
          outline: none; transition: border .2s;
        }
        input[type=text]:focus { border-color: rgba(56,189,248,.5); }

        .btn {
          cursor: pointer; border: none; border-radius: 8px;
          font-family: 'IBM Plex Mono', monospace; font-size: 11px;
          padding: 8px 16px; transition: all .2s;
        }
        .btn-primary { background: rgba(56,189,248,.1); color: var(--accent); border: 1px solid rgba(56,189,248,.2); }
        .btn-primary:hover { background: rgba(56,189,248,.2); }
        .btn-lg { padding: 10px 28px; font-size: 13px; border-radius: 10px; white-space: nowrap; }

        #empty { text-align: center; padding: 100px 0; }
        .empty-big { font-family: 'Bebas Neue', cursive; font-size: 72px; letter-spacing: 5px; line-height: 1; }

        .win-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; flex-wrap: wrap; gap: 10px;
        }
        .win-label { font-size: 10px; color: var(--dim); letter-spacing: .12em; }
        .win-buttons { display: flex; gap: 6px; flex-wrap: wrap; }

        .wbtn {
          cursor: pointer; border-radius: 8px;
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 600;
          padding: 7px 14px; transition: all .2s; border: 1px solid transparent;
        }
        .wbtn.on  { background: var(--accent); color: #060c18; }
        .wbtn.off { background: transparent; color: var(--muted); border-color: var(--border); }
        .wbtn.off:hover { border-color: var(--accent); color: var(--accent); }

        .card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
        }

        .stat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 14px; margin-bottom: 18px;
        }
        @media (max-width: 700px) { .stat-grid { grid-template-columns: repeat(2,1fr); } }

        .stat-card { padding: 18px 20px; }
        .stat-label { font-size: 9px; color: var(--dim); letter-spacing: .12em; margin-bottom: 8px; }
        .stat-val {
          font-family: 'Bebas Neue', cursive; font-size: 38px; color: #f1f5f9;
          line-height: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .stat-val.small { font-size: 20px; }

        .two-col { display: grid; grid-template-columns: 1fr 270px; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 800px) { .two-col { grid-template-columns: 1fr; } }

        .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .chart-title-label { font-size: 9px; color: var(--dim); letter-spacing: .12em; }
        .chart-subtitle { font-size: 11px; color: var(--muted); margin-top: 3px; }
        .chart-window-label { font-family: 'Bebas Neue', cursive; font-size: 28px; color: var(--accent); letter-spacing: 2px; }

        .bar-chart { display: flex; align-items: flex-end; gap: 3px; height: 80px; margin-top: 8px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 0; }
        .bar-fill { width: 100%; border-radius: 3px 3px 0 0; transition: height .5s cubic-bezier(.4,0,.2,1); }
        .bar-lbl { font-size: 8px; color: var(--dim); white-space: nowrap; overflow: hidden; max-width: 100%; text-align: center; }

        .country-row { margin-bottom: 13px; }
        .country-meta { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .country-name { font-size: 12px; color: #94a3b8; }
        .country-count { font-size: 12px; color: var(--accent); }
        .progress-bg { background: #0a1525; border-radius: 3px; height: 5px; }
        .progress-fill { height: 5px; border-radius: 3px; background: linear-gradient(90deg, var(--accent), var(--accent2)); transition: width .5s ease; }

        .ref-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .ref-card {
          background: rgba(56,189,248,.05); border: 1px solid rgba(56,189,248,.1);
          border-radius: 10px; padding: 10px 16px;
        }
        .ref-name { font-size: 11px; color: #64748b; margin-bottom: 4px; }
        .ref-count { font-family: 'Bebas Neue', cursive; font-size: 28px; color: var(--accent); }

        .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .log-scroll { max-height: 340px; overflow-y: auto; }

        table { width: 100%; border-collapse: collapse; }
        th {
          text-align: left; padding: 5px 10px; font-size: 9px;
          color: var(--dim); letter-spacing: .1em; font-weight: normal;
          border-bottom: 1px solid #0f1e35;
        }
        td { padding: 8px 10px; border-bottom: 1px solid #0c1220; font-size: 11px; }
        .td-num { color: #1a2a40; }
        .td-time { color: var(--accent); font-size: 12px; }
        .td-date { color: var(--muted); }
        .td-ref  { color: var(--muted); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .badge {
          display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px;
        }
        .badge-country { background: #0a1525; border: 1px solid var(--border); color: #94a3b8; }

        .code-block {
          background: #060a10; border: 1px solid var(--border); border-radius: 8px;
          padding: 10px 14px; font-size: 11px; color: var(--accent);
          word-break: break-all;
        }

        .no-data { text-align: center; padding: 40px 0; color: #1a2a40; font-size: 13px; }

        .fade-up { animation: fadeUp .4s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <header>
        <div className="logo">
          <span>GITHUB</span> PROFILE VIEWS
        </div>
      </header>

      <main>
        <div className="search-row">
          <div className="search-wrap">
            <span className="search-prefix">github.com /</span>
            <input
              type="text"
              placeholder="enter username…"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleSearch}>
            View Stats →
          </button>
        </div>

        {!currentUser ? (
          <div id="empty">
            <div className="empty-big" style={{ color: "#0c1830" }}>
              ENTER A
            </div>
            <div className="empty-big" style={{ color: "#0f2240" }}>
              USERNAME
            </div>
            <div
              style={{
                marginTop: "20px",
                fontSize: "12px",
                color: "#1a2a40",
              }}
            >
              Type any GitHub username above to see their real-time profile
              visit stats
            </div>
          </div>
        ) : (
          <div className="fade-up">
            <div className="win-row">
              <div className="win-label">TIME WINDOW</div>
              <div className="win-buttons">
                {Object.entries(WINDOWS).map(([key, val]) => (
                  <button
                    key={key}
                    className={`wbtn ${key === currentWindow ? "on" : "off"}`}
                    onClick={() => handleWindowChange(key)}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 0",
                  color: "#1a2a40",
                }}
              >
                Loading...
              </div>
            ) : stats ? (
              <>
                <div className="stat-grid">
                  <div className="card stat-card">
                    <div className="stat-label">PROFILE VIEWS</div>
                    <div className="stat-val">
                      {stats.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-label">ALL TIME</div>
                    <div className="stat-val">
                      {(stats.allTime || stats.total).toLocaleString()}
                    </div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-label">COUNTRIES</div>
                    <div className="stat-val">{stats.topCountries.length}</div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-label">TOP SOURCE</div>
                    <div
                      className="stat-val"
                      style={{
                        fontSize:
                          stats.topReferrers[0]?.ref.length > 8
                            ? "20px"
                            : "38px",
                      }}
                    >
                      {stats.topReferrers[0]?.ref || "—"}
                    </div>
                  </div>
                </div>

                <div className="two-col">
                  <div className="card" style={{ padding: "22px 24px" }}>
                    <div className="chart-header">
                      <div>
                        <div className="chart-title-label">VISIT ACTIVITY</div>
                        <div className="chart-subtitle">
                          {stats.total.toLocaleString()} visit
                          {stats.total !== 1 ? "s" : ""} · last {currentWindow}
                        </div>
                      </div>
                      <div className="chart-window-label">
                        {currentWindow.toUpperCase()}
                      </div>
                    </div>
                    <div className="bar-chart">
                      {stats.chart.map((v, i) => {
                        const max = Math.max(...stats.chart, 1);
                        const height = Math.max(4, (v / max) * 58);
                        return (
                          <div key={i} className="bar-col">
                            <div
                              className="bar-fill"
                              style={{
                                height: `${height}px`,
                                background:
                                  v > 0
                                    ? "linear-gradient(180deg,#38bdf8,#0ea5e9aa)"
                                    : "#0f1e35",
                                border: v > 0 ? "none" : "1px solid #1a2540",
                              }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card" style={{ padding: "22px 20px" }}>
                    <div
                      className="stat-label"
                      style={{ marginBottom: "16px" }}
                    >
                      TOP COUNTRIES
                    </div>
                    <div>
                      {stats.topCountries.length === 0 ? (
                        <div className="no-data">No data yet</div>
                      ) : (
                        stats.topCountries.map((c) => (
                          <div key={c.country} className="country-row">
                            <div className="country-meta">
                              <span className="country-name">{c.country}</span>
                              <span className="country-count">{c.count}</span>
                            </div>
                            <div className="progress-bg">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${
                                    stats.total > 0
                                      ? (c.count / stats.total) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="two-col">
                  <div className="card" style={{ padding: "22px 24px" }}>
                    <div
                      className="stat-label"
                      style={{ marginBottom: "16px" }}
                    >
                      REFERRER SOURCES
                    </div>
                    <div className="ref-grid">
                      {stats.topReferrers.length === 0 ? (
                        <div className="no-data">No referrer data</div>
                      ) : (
                        stats.topReferrers.map((r) => (
                          <div key={r.ref} className="ref-card">
                            <div className="ref-name">{r.ref}</div>
                            <div className="ref-count">{r.count}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="card" style={{ padding: "22px 20px" }}>
                    <div
                      className="stat-label"
                      style={{ marginBottom: "14px" }}
                    >
                      README BADGE
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        marginBottom: "10px",
                        lineHeight: "1.6",
                      }}
                    >
                      Add this to your GitHub README to start tracking real
                      visits:
                    </div>
                    <div className="code-block">
                      ![](api/track?user={currentUser})
                    </div>
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "10px",
                        color: "var(--dim)",
                        lineHeight: "1.7",
                      }}
                    >
                      Replace domain with your Vercel URL after deploying.
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
