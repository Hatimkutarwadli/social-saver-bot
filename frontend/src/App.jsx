import { useEffect, useState } from "react";

function App() {
  const [links, setLinks] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
  const fetchLinks = () => {
    fetch("http://localhost:8000/links")
      .then((res) => res.json())
      .then((data) => setLinks(data));
  };

  fetchLinks(); // initial load

  const interval = setInterval(fetchLinks, 5000); // refresh every 5 sec

  return () => clearInterval(interval);
}, []);

  const extractCategory = (text) => {
  if (!text) return "Other";

  const match = text.match(/Category:\s*(.*)/);

  if (match) return match[1].trim();

  return "Uncategorized";
};

  const filteredLinks = links.filter(
    (item) =>
      item.url.toLowerCase().includes(search.toLowerCase()) ||
      item.ai_result.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filteredLinks.reduce((acc, item) => {
    const cat = extractCategory(item.ai_result);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-12">Curator</h1>

        <nav className="space-y-4 text-gray-600">
          <p className="text-blue-600 font-semibold cursor-pointer">
            Dashboard
          </p>
          <p className="cursor-pointer hover:text-black">My Categories</p>
          <p className="cursor-pointer hover:text-black">Recent Saves</p>
          <p className="cursor-pointer hover:text-black">Settings</p>
        </nav>

        <div className="mt-16 text-sm text-green-600">
          WhatsApp Bot Connected
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-semibold">Dashboard Overview</h2>

          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-14">
          <StatCard title="Total Saves" value={links.length} />
          <StatCard
            title="Categories"
            value={Object.keys(grouped).length}
          />
          <StatCard title="Filtered Results" value={filteredLinks.length} />
        </div>

        {/* Category Sections */}
        {Object.keys(grouped).map((category) => (
          <div key={category} className="mb-16">
            <h3 className="text-xl font-semibold mb-6">
              {category}
            </h3>

            <div className="grid grid-cols-3 gap-6">
              {grouped[category].map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm break-all"
                  >
                    {item.url}
                  </a>

                  <p
                    className="mt-4 text-gray-700 text-sm overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.ai_result}
                  </p>

                  <p className="mt-4 text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

export default App;