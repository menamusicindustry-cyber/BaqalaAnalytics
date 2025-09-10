import React, { useMemo, useState } from "react";

// --- Utilities ---
const fmtUSD = (n) =>
  isFinite(n)
    ? n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })
    : "—";

const fmtNumber = (n) => (isFinite(n) ? n.toLocaleString() : "");

export default function App() {
  // --- Core Inputs --- (default values)
  const [costBasis, setCostBasis] = useState(2000);
  const [recoveryYears, setRecoveryYears] = useState(5);
  const [unitsPerYear, setUnitsPerYear] = useState(100);
  const [requiredMarkup, setRequiredMarkup] = useState(0.2);

  // Streaming inputs (default values)
  const [streamsPerYear, setStreamsPerYear] = useState(100000);
  const [payoutPerStream, setPayoutPerStream] = useState(0.0007);

  // Tabs
  const [activeTab, setActiveTab] = useState("calculator");

  // --- Derived values ---
  const annualStreamingCash = useMemo(
    () => streamsPerYear * payoutPerStream,
    [streamsPerYear, payoutPerStream]
  );

  const totalStreamingCashOverRecovery = useMemo(
    () => annualStreamingCash * recoveryYears,
    [annualStreamingCash, recoveryYears]
  );
  const totalUnitsOverRecovery = useMemo(
    () => unitsPerYear * recoveryYears,
    [unitsPerYear, recoveryYears]
  );

  const streamingEquivalentUnitPrice = useMemo(() => {
    if (!totalUnitsOverRecovery) return null;
    return totalStreamingCashOverRecovery / totalUnitsOverRecovery;
  }, [totalStreamingCashOverRecovery, totalUnitsOverRecovery]);

  const breakevenUnitPrice = useMemo(() => {
    const totalUnits = unitsPerYear * recoveryYears;
    if (!totalUnits) return null;
    return costBasis / totalUnits;
  }, [costBasis, unitsPerYear, recoveryYears]);

  const targetUnitPrice = useMemo(() => {
    if (breakevenUnitPrice == null) return null;
    return breakevenUnitPrice * (1 + requiredMarkup);
  }, [breakevenUnitPrice, requiredMarkup]);

  // --- Reactive Explanation ---
  const explanation = useMemo(() => {
    if (
      streamingEquivalentUnitPrice == null ||
      breakevenUnitPrice == null ||
      targetUnitPrice == null
    ) {
      return "Please provide all inputs to see interpretations.";
    }

    let message = "";

    if (streamingEquivalentUnitPrice > breakevenUnitPrice) {
      message += `Streaming-Equivalent (${fmtUSD(
        streamingEquivalentUnitPrice
      )}) is higher than Breakeven (${fmtUSD(
        breakevenUnitPrice
      )}). This means streaming generates more per unit than required to recover costs. `;
    } else if (streamingEquivalentUnitPrice < breakevenUnitPrice) {
      message += `Streaming-Equivalent (${fmtUSD(
        streamingEquivalentUnitPrice
      )}) is lower than Breakeven (${fmtUSD(
        breakevenUnitPrice
      )}). This means streaming alone would not cover cost recovery—you would need higher per-unit sales. `;
    } else {
      message += `Streaming-Equivalent equals Breakeven at ${fmtUSD(
        breakevenUnitPrice
      )}. Streaming exactly matches recovery requirements. `;
    }

    message += `Based on your expected unit sales per year (${unitsPerYear.toLocaleString()}), you would need to sell each unit at ${fmtUSD(
      breakevenUnitPrice
    )} to recover your investment over ${recoveryYears.toLocaleString()} years. To achieve your desired return, you would need to sell each unit for ${fmtUSD(
      targetUnitPrice
    )}.`;

    return message;
  }, [
    streamingEquivalentUnitPrice,
    breakevenUnitPrice,
    targetUnitPrice,
    unitsPerYear,
    recoveryYears,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Baqala Analytics
          </h1>
          <p className="text-sm text-gray-600">
            by the idiots at{" "}
            <a
              href="https://www.instagram.com/menamusicindustry"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              menamusicindustry
            </a>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Turning your catalog into corner-store economics, one unit at a
            time.
          </p>

          {/* Tabs */}
          <div className="mt-4 flex gap-4">
            <button
              className={`px-3 py-2 rounded-xl border ${
                activeTab === "calculator"
                  ? "bg-gray-900 text-white"
                  : "bg-white"
              }`}
              onClick={() => setActiveTab("calculator")}
            >
              Calculator
            </button>
            <button
              className={`px-3 py-2 rounded-xl border ${
                activeTab === "about" ? "bg-gray-900 text-white" : "bg-white"
              }`}
              onClick={() => setActiveTab("about")}
            >
              About
            </button>
          </div>
        </header>

        {activeTab === "about" && (
          <div className="bg-white rounded-2xl shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-sm text-gray-700 mb-2">
              Baqala Analytics is like your neighborhood{" "}
              <em>baqala</em> (corner store), but instead of deciding between
              chips and chocolate, you’re deciding how to price your catalog.
              It’s a playful tool that translates streaming pennies into unit
              economics, helps you figure out what price keeps the lights on,
              and tells you what margin makes your investors (or your mom)
              proud. Think of it as a calculator that wears a tarboosh —
              serious math, but with a wink.
            </p>
            <p className="text-base text-gray-700 font-semibold">
              Legal Disclaimer: Baqala Analytics is for educational and
              entertainment purposes only. It is not financial advice, not
              audited by any accountant who charges more than shawarma money,
              and not legally binding in any jurisdiction (including but not
              limited to actual baqalas). Use at your own risk, and maybe keep a
              real accountant on speed dial.
            </p>
          </div>
        )}

        {activeTab === "calculator" && (
          <>
            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow p-4">
                <h2 className="text-lg font-semibold mb-3">
                  Cost Recovery Plan
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    Total Cost Basis ($)
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border p-2"
                      value={fmtNumber(costBasis)}
                      onChange={(e) =>
                        setCostBasis(Number(e.target.value.replace(/,/g, "")))
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Recovery Years
                    <input
                      type="text"
                      min={1}
                      className="mt-1 w-full rounded-xl border p-2"
                      value={fmtNumber(recoveryYears)}
                      onChange={(e) =>
                        setRecoveryYears(
                          Number(e.target.value.replace(/,/g, ""))
                        )
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Expected # of Unit Sales per Year
                    <input
                      type="text"
                      min={1}
                      className="mt-1 w-full rounded-xl border p-2"
                      value={fmtNumber(unitsPerYear)}
                      onChange={(e) =>
                        setUnitsPerYear(
                          Number(e.target.value.replace(/,/g, ""))
                        )
                      }
                    />
                  </label>
                  <label className="text-sm col-span-2">
                    Required Return on Price (% above breakeven)
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 w-full rounded-xl border p-2"
                      value={(requiredMarkup * 100).toString()}
                      onChange={(e) =>
                        setRequiredMarkup(Number(e.target.value) / 100)
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-4">
                <h2 className="text-lg font-semibold mb-3">
                  Streaming Inputs
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    Streams / Year
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border p-2"
                      value={fmtNumber(streamsPerYear)}
                      onChange={(e) =>
                        setStreamsPerYear(
                          Number(e.target.value.replace(/,/g, ""))
                        )
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Payout / Stream ($)
                    <input
                      type="number"
                      step="0.0001"
                      className="mt-1 w-full rounded-xl border p-2"
                      value={payoutPerStream}
                      onChange={(e) => setPayoutPerStream(Number(e.target.value))}
                    />
                  </label>
                </div>
                <div className="text-sm space-y-1 mt-3">
                  <div>
                    Annual Streaming Cash Flow:{" "}
                    <span className="font-mono">
                      {fmtUSD(annualStreamingCash)}
                    </span>
                  </div>
                  <div>
                    Total Streaming Cash over Recovery (
                    {recoveryYears.toLocaleString()} yrs):{" "}
                    <span className="font-mono">
                      {fmtUSD(totalStreamingCashOverRecovery)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow p-4">
                <h3 className="text-base font-semibold">
                  Streaming-Equivalent Price / Unit
                </h3>
                <p className="text-2xl font-mono mt-2">
                  {streamingEquivalentUnitPrice != null
                    ? fmtUSD(streamingEquivalentUnitPrice)
                    : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  = Total Streaming Cash over Recovery / Total Units over
                  Recovery
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <h3 className="text-base font-semibold">
                  Breakeven Price / Unit
                </h3>
                <p className="text-2xl font-mono mt-2">
                  {breakevenUnitPrice != null ? fmtUSD(breakevenUnitPrice) : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  = Total Cost Basis / (Expected # of Unit Sales per Year ×
                  Recovery Years)
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <h3 className="text-base font-semibold">
                  Target Price / Unit (Breakeven + Return)
                </h3>
                <p className="text-2xl font-mono mt-2">
                  {targetUnitPrice != null ? fmtUSD(targetUnitPrice) : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  = Breakeven × (1 + Required Return %)
                </p>
              </div>
            </div>

            {/* Interpretations */}
            <div className="bg-white rounded-2xl shadow p-4 mt-6">
              <h4 className="text-sm font-semibold mb-2">What does this mean?</h4>
              <p className="text-sm text-gray-700">{explanation}</p>
            </div>

            {/* Definitions */}
            <div className="bg-white rounded-2xl shadow p-4 mt-6">
              <h4 className="text-sm font-semibold mb-2">Definitions</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>
                  <strong>Total Cost Basis</strong> — the total investment made
                  in acquiring or producing the catalog.
                </li>
                <li>
                  <strong>Recovery Years</strong> — the timeframe you want to
                  fully recover your cost basis.
                </li>
                <li>
                  <strong>Expected # of Unit Sales per Year</strong> — expected
                  number of consumer units sold per year.
                </li>
                <li>
                  <strong>Required Return</strong> — the profit margin you want
                  to achieve above breakeven.
                </li>
                <li>
                  <strong>Streams / Year</strong> — annual streaming volume used
                  to estimate streaming revenues.
                </li>
                <li>
                  <strong>Payout / Stream</strong> — expected revenue per stream
                  from platforms.
                </li>
                <li>
                  <strong>Annual Streaming Cash Flow</strong> — total yearly
                  cash inflow from streaming (streams × payout).
                </li>
                <li>
                  <strong>Total Streaming Cash over Recovery</strong> — annual
                  streaming cash × recovery years.
                </li>
                <li>
                  <strong>Streaming-Equivalent Price / Unit</strong> — total
                  streaming cash over the recovery period divided by total units
                  over the same period.
                </li>
                <li>
                  <strong>Breakeven Price / Unit</strong> — unit price needed to
                  exactly recover cost basis over the recovery period.
                </li>
                <li>
                  <strong>Target Price / Unit</strong> — breakeven price plus
                  your required return percentage.
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
